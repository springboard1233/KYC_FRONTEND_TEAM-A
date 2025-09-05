import cv2
import numpy as np
import pytesseract
import re
from PIL import Image
import logging
from datetime import datetime
import os

logger = logging.getLogger(__name__)

class OCRProcessor:
    """Enhanced OCR processing class with better preprocessing"""
    
    def __init__(self, tesseract_path=None):
        """Initialize OCR processor with better configuration"""
        
        # Set Tesseract path if provided
        if tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path
        elif os.name == 'nt':  # Windows
            # Try common Windows paths
            possible_paths = [
                r'C:\Program Files\Tesseract-OCR\tesseract.exe',
                r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
                r'C:\Users\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'
            ]
            for path in possible_paths:
                if os.path.exists(path):
                    pytesseract.pytesseract.tesseract_cmd = path
                    logger.info(f"Found Tesseract at: {path}")
                    break
        
        # Test Tesseract installation
        try:
            version = pytesseract.get_tesseract_version()
            logger.info(f"Tesseract version: {version}")
        except Exception as e:
            logger.error(f"Tesseract not found or not working: {e}")
            logger.error("Please install Tesseract OCR: https://github.com/UB-Mannheim/tesseract/wiki")
        
        # Patterns for field extraction
        self.aadhaar_pattern = re.compile(r'\b\d{4}\s*\d{4}\s*\d{4}\b')
        self.pan_pattern = re.compile(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b')
        self.date_patterns = [
            re.compile(r'\b(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})\b'),
            re.compile(r'\b(\d{1,2})[/\-](\d{1,2})[/\-](\d{2})\b'),
        ]

    def enhance_image_quality(self, image_path):
        """Enhanced image preprocessing for better OCR results"""
        try:
            logger.info(f"Enhancing image quality: {image_path}")
            
            # Read image
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Could not read image: {image_path}")
            
            # Get original dimensions
            height, width = img.shape[:2]
            logger.info(f"Original image dimensions: {width}x{height}")
            
            # Convert to RGB for PIL
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Multiple preprocessing approaches
            processed_images = []
            
            # 1. Original grayscale
            processed_images.append(('original_gray', gray))
            
            # 2. Resize image if too small (recommended: 300+ DPI equivalent)
            if width < 800 or height < 600:
                scale_factor = max(800/width, 600/height)
                new_width = int(width * scale_factor)
                new_height = int(height * scale_factor)
                
                resized = cv2.resize(gray, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
                processed_images.append(('resized', resized))
                logger.info(f"Resized image to: {new_width}x{new_height}")
            
            # 3. Noise removal
            denoised = cv2.medianBlur(gray, 3)
            processed_images.append(('denoised', denoised))
            
            # 4. Contrast enhancement
            enhanced = cv2.equalizeHist(gray)
            processed_images.append(('enhanced_contrast', enhanced))
            
            # 5. Binary thresholding with OTSU
            _, thresh_otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            processed_images.append(('threshold_otsu', thresh_otsu))
            
            # 6. Adaptive thresholding
            adaptive_thresh = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            processed_images.append(('adaptive_threshold', adaptive_thresh))
            
            # 7. Morphological operations on best threshold
            kernel = np.ones((2, 2), np.uint8)
            morphed = cv2.morphologyEx(thresh_otsu, cv2.MORPH_CLOSE, kernel)
            processed_images.append(('morphological', morphed))
            
            # 8. Invert if background is dark (common issue)
            if np.mean(gray) < 127:
                inverted = cv2.bitwise_not(gray)
                processed_images.append(('inverted', inverted))
                logger.info("Image appears to have dark background, added inverted version")
            
            return processed_images, img_rgb
            
        except Exception as e:
            logger.error(f"Image enhancement error: {str(e)}")
            raise

    def extract_text_with_multiple_configs(self, image_path):
        """Extract text using multiple preprocessing methods and OCR configurations"""
        try:
            processed_images, original = self.enhance_image_quality(image_path)
            
            # Multiple Tesseract configurations to try
            configs = [
                '--psm 6',  # Uniform block of text
                '--psm 7',  # Single text line
                '--psm 8',  # Single word
                '--psm 13', # Raw line. Treat as single text line, bypassing hacks
                '--psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz/:-., ',
                '--psm 3',  # Fully automatic page segmentation
            ]
            
            best_text = ""
            best_confidence = 0
            best_method = ""
            best_config = ""
            
            for method_name, processed_img in processed_images:
                for config in configs:
                    try:
                        logger.info(f"Trying method: {method_name} with config: {config}")
                        
                        # Save processed image for debugging
                        debug_path = f"debug_{method_name}.png"
                        cv2.imwrite(debug_path, processed_img)
                        
                        # Extract text with current config
                        text = pytesseract.image_to_string(processed_img, config=config)
                        
                        # Get confidence data
                        data = pytesseract.image_to_data(processed_img, config=config, output_type=pytesseract.Output.DICT)
                        confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
                        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
                        
                        logger.info(f"Method: {method_name}, Config: {config}, Confidence: {avg_confidence:.2f}")
                        logger.info(f"Extracted text length: {len(text.strip())}")
                        
                        # Check if this result is better
                        if (avg_confidence > best_confidence and len(text.strip()) > 0) or \
                           (len(text.strip()) > len(best_text.strip()) and avg_confidence > 30):
                            best_text = text
                            best_confidence = avg_confidence
                            best_method = method_name
                            best_config = config
                            logger.info(f"New best result! Method: {method_name}, Confidence: {avg_confidence:.2f}")
                        
                        # Clean up debug file
                        if os.path.exists(debug_path):
                            os.remove(debug_path)
                        
                    except Exception as e:
                        logger.warning(f"OCR failed for method {method_name} with config {config}: {str(e)}")
                        continue
            
            logger.info(f"Best OCR result - Method: {best_method}, Config: {best_config}, Confidence: {best_confidence:.2f}")
            logger.info(f"Best text preview: {best_text[:100]}...")
            
            return best_text, best_confidence
            
        except Exception as e:
            logger.error(f"Text extraction error: {str(e)}")
            raise

    def parse_aadhaar_fields(self, text):
        """Parse Aadhaar fields from extracted text"""
        try:
            logger.info("Parsing Aadhaar fields")
            
            # Clean and normalize text
            text = text.replace('\n', ' ').replace('\t', ' ')
            text = re.sub(r'\s+', ' ', text)
            
            fields = {
                'document_type': 'aadhaar',
                'aadhaar_number': None,
                'name': None,
                'date_of_birth': None,
                'gender': None,
                'address': None
            }
            
            # Extract Aadhaar number
            aadhaar_match = self.aadhaar_pattern.search(text)
            if aadhaar_match:
                fields['aadhaar_number'] = re.sub(r'\s+', '', aadhaar_match.group())
                logger.info(f"Found Aadhaar number: {fields['aadhaar_number']}")
            
            # Extract name (look for capitalized words after common keywords)
            name_patterns = [
                re.search(r'name[:\s]+([A-Z][a-z]+(?: [A-Z][a-z]+)*)', text, re.IGNORECASE),
                re.search(r'([A-Z][a-z]+(?: [A-Z][a-z]+){1,3})', text)
            ]
            
            for pattern in name_patterns:
                if pattern and not fields['name']:
                    potential_name = pattern.group(1)
                    # Avoid common false positives
                    if not any(keyword in potential_name.lower() for keyword in ['aadhaar', 'government', 'india']):
                        fields['name'] = potential_name.title()
                        logger.info(f"Found name: {fields['name']}")
                        break
            
            # Extract date of birth
            for pattern in self.date_patterns:
                date_match = pattern.search(text)
                if date_match:
                    fields['date_of_birth'] = date_match.group()
                    logger.info(f"Found DOB: {fields['date_of_birth']}")
                    break
            
            # Extract gender
            if re.search(r'\b(male|m)\b', text, re.IGNORECASE):
                fields['gender'] = 'Male'
            elif re.search(r'\b(female|f)\b', text, re.IGNORECASE):
                fields['gender'] = 'Female'
            
            if fields['gender']:
                logger.info(f"Found gender: {fields['gender']}")
            
            return fields
            
        except Exception as e:
            logger.error(f"Aadhaar parsing error: {str(e)}")
            raise

    def parse_pan_fields(self, text):
        """Parse PAN fields from extracted text"""
        try:
            logger.info("Parsing PAN fields")
            
            text = text.replace('\n', ' ').replace('\t', ' ')
            text = re.sub(r'\s+', ' ', text)
            
            fields = {
                'document_type': 'pan',
                'pan_number': None,
                'name': None,
                'date_of_birth': None,
                'father_name': None
            }
            
            # Extract PAN number
            pan_match = self.pan_pattern.search(text.upper())
            if pan_match:
                fields['pan_number'] = pan_match.group()
                logger.info(f"Found PAN number: {fields['pan_number']}")
            
            # Extract date of birth
            for pattern in self.date_patterns:
                date_match = pattern.search(text)
                if date_match:
                    fields['date_of_birth'] = date_match.group()
                    logger.info(f"Found DOB: {fields['date_of_birth']}")
                    break
            
            # Extract names
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            for line in lines:
                if (len(line) > 3 and 
                    not re.search(r'\d', line) and 
                    not any(keyword in line.lower() for keyword in ['pan', 'income', 'tax', 'government'])):
                    
                    if re.match(r'^[A-Za-z\s]+$', line):
                        if not fields['name'] and len(line.split()) >= 2:
                            fields['name'] = line.title()
                            logger.info(f"Found name: {fields['name']}")
                        elif not fields['father_name'] and len(line.split()) >= 2:
                            fields['father_name'] = line.title()
                            logger.info(f"Found father's name: {fields['father_name']}")
            
            return fields
            
        except Exception as e:
            logger.error(f"PAN parsing error: {str(e)}")
            raise

    def process_document(self, image_path, document_type):
        """Main function to process document with enhanced OCR"""
        try:
            logger.info(f"Processing {document_type} document: {image_path}")
            
            # Check if file exists
            if not os.path.exists(image_path):
                raise ValueError(f"Image file not found: {image_path}")
            
            # Extract text using enhanced method
            text, confidence = self.extract_text_with_multiple_configs(image_path)
            
            if not text.strip():
                # If still no text, provide detailed error info
                error_msg = f"No text could be extracted from the image. Please check:\n"
                error_msg += "1. Image quality (should be clear, high contrast)\n"
                error_msg += "2. Text should be horizontal and readable\n"
                error_msg += "3. Image resolution (minimum 300 DPI recommended)\n"
                error_msg += "4. Tesseract OCR installation"
                raise ValueError(error_msg)
            
            # Parse fields based on document type
            if document_type.lower() == 'aadhaar':
                fields = self.parse_aadhaar_fields(text)
            elif document_type.lower() == 'pan':
                fields = self.parse_pan_fields(text)
            else:
                raise ValueError(f"Unsupported document type: {document_type}")
            
            result = {
                'success': True,
                'document_type': document_type.lower(),
                'extracted_fields': fields,
                'confidence_score': round(confidence, 2),
                'raw_text': text,
                'processing_timestamp': datetime.now().isoformat(),
                'processing_notes': f"Enhanced OCR processing completed for {document_type}"
            }
            
            logger.info(f"OCR processing completed successfully for {document_type}")
            return result
            
        except Exception as e:
            logger.error(f"Document processing error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'document_type': document_type.lower(),
                'processing_timestamp': datetime.now().isoformat()
            }
