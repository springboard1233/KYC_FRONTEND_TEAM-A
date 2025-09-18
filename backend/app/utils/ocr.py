# utils/ocr.py - Enhanced AI-Powered OCR Processing Engine for KYC Documents

import os
import logging
import traceback
import re
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract
from pytesseract import Output
import fitz  # PyMuPDF
from datetime import datetime
from typing import Dict, List, Tuple, Any, Optional

# Configure logging
logger = logging.getLogger(__name__)

class EnhancedOCRProcessor:
    """
    🤖 Enhanced AI-Powered OCR Processor with Advanced Features
    
    Features:
    - Multi-stage image preprocessing
    - Advanced field extraction algorithms
    - Confidence scoring and validation
    - PDF and image support
    - Error recovery and fallback mechanisms
    - Performance optimization
    """
    
    def __init__(self):
        """Initialize OCR processor with optimized configurations"""
        
        # Tesseract OCR configurations for different scenarios
        self.ocr_configs = {
            'default': r'--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/-: ',
            'numbers_only': r'--oem 3 --psm 8 -c tessedit_char_whitelist=0123456789',
            'text_only': r'--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ',
            'mixed': r'--oem 3 --psm 4',
            'single_line': r'--oem 3 --psm 7',
            'single_word': r'--oem 3 --psm 8'
        }
        
        # Field extraction patterns for different document types
        self.extraction_patterns = {
            'aadhaar': {
                'aadhaar_number': [
                    r'\b(\d{4}[\s\-]*\d{4}[\s\-]*\d{4})\b',
                    r'AADHAAR[\s\S]*?(\d{4}[\s\-]*\d{4}[\s\-]*\d{4})',
                    r'UID[\s\S]*?(\d{4}[\s\-]*\d{4}[\s\-]*\d{4})'
                ],
                'name': [
                    r'Name[:\s]*([A-Za-z][A-Za-z\s]{2,40})',
                    r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
                    r'नाम[:\s]*([A-Za-z\s]+)'
                ],
                'date_of_birth': [
                    r'(?:DOB|Date of Birth|Birth|जन्म)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})',
                    r'(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})'
                ],
                'gender': [
                    r'(?:Gender|Sex|लिंग)[:\s]*(Male|Female|Other|पुरुष|महिला|अन्य|M|F)',
                    r'\b(Male|Female|Other|MALE|FEMALE|OTHER)\b'
                ],
                'address': [
                    r'Address[:\s]*([\s\S]+?)(?=\n(?:[A-Z][a-z]*\s*:|$))',
                    r'पता[:\s]*([\s\S]+?)(?=\n(?:[A-Z][a-z]*\s*:|$))'
                ]
            },
            'pan': {
                'pan_number': [
                    r'\b([A-Z]{5}\d{4}[A-Z])\b',
                    r'PAN[:\s]*([A-Z]{5}\d{4}[A-Z])',
                    r'Permanent Account Number[:\s]*([A-Z]{5}\d{4}[A-Z])'
                ],
                'name': [
                    r'Name[:\s]*([A-Za-z][A-Za-z\s]{2,40})',
                    r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
                    r'Assessee[:\s]*([A-Za-z\s]+)'
                ],
                'father_name': [
                    r"Father'?s?\s*Name[:\s]*([A-Za-z][A-Za-z\s]{2,40})",
                    r'S/O[:\s]*([A-Za-z][A-Za-z\s]{2,40})',
                    r'पिता[:\s]*([A-Za-z\s]+)'
                ],
                'date_of_birth': [
                    r'(?:DOB|Date of Birth)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})'
                ]
            }
        }
        
        logger.info("✅ Enhanced OCR Processor initialized")
    
    def preprocess_image(self, image_path: str) -> List[np.ndarray]:
        """
        🔧 Advanced multi-stage image preprocessing for optimal OCR
        
        Returns multiple preprocessed versions for best results
        """
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            preprocessed_images = []
            
            # 1. Original grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            preprocessed_images.append(("original_gray", gray))
            
            # 2. Enhanced contrast
            enhanced = cv2.convertScaleAbs(gray, alpha=2.0, beta=0)
            preprocessed_images.append(("enhanced_contrast", enhanced))
            
            # 3. Gaussian blur to remove noise
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            preprocessed_images.append(("gaussian_blur", blurred))
            
            # 4. Morphological operations
            kernel = np.ones((2, 2), np.uint8)
            morphed = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)
            preprocessed_images.append(("morphological", morphed))
            
            # 5. Adaptive threshold
            adaptive = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            preprocessed_images.append(("adaptive_threshold", adaptive))
            
            # 6. Bilateral filter (edge preserving)
            bilateral = cv2.bilateralFilter(gray, 9, 75, 75)
            preprocessed_images.append(("bilateral_filter", bilateral))
            
            # 7. Histogram equalization
            hist_eq = cv2.equalizeHist(gray)
            preprocessed_images.append(("histogram_equalized", hist_eq))
            
            # 8. Sharpening
            kernel_sharp = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
            sharpened = cv2.filter2D(gray, -1, kernel_sharp)
            preprocessed_images.append(("sharpened", sharpened))
            
            logger.info(f"✅ Created {len(preprocessed_images)} preprocessed versions")
            return preprocessed_images
            
        except Exception as e:
            logger.error(f"❌ Image preprocessing failed: {str(e)}")
            raise
    
    def extract_text_with_confidence(self, image: np.ndarray, config: str = 'default') -> Tuple[str, float, Dict]:
        """
        📝 Extract text with confidence scoring using multiple OCR configurations
        """
        try:
            # Scale up image for better OCR
            height, width = image.shape[:2]
            if height < 300 or width < 300:
                scale_factor = max(300/height, 300/width, 2.0)
                new_width = int(width * scale_factor)
                new_height = int(height * scale_factor)
                image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
            
            # Extract text with the specified configuration
            ocr_config = self.ocr_configs.get(config, self.ocr_configs['default'])
            
            # Get detailed OCR data
            ocr_data = pytesseract.image_to_data(
                image, 
                output_type=Output.DICT, 
                config=ocr_config
            )
            
            # Extract text
            text = pytesseract.image_to_string(image, config=ocr_config)
            
            # Calculate confidence score
            confidences = [int(conf) for conf in ocr_data['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            # Additional text quality metrics
            word_count = len([word for word in ocr_data['text'] if word.strip()])
            char_count = len([char for char in text if char.isalnum()])
            
            quality_metrics = {
                'avg_confidence': avg_confidence,
                'word_count': word_count,
                'char_count': char_count,
                'text_length': len(text.strip()),
                'confidence_scores': confidences[:10]  # First 10 scores for analysis
            }
            
            return text.strip(), avg_confidence, quality_metrics
            
        except Exception as e:
            logger.error(f"❌ OCR extraction failed: {str(e)}")
            return "", 0.0, {}
    
    def extract_text_from_pdf(self, pdf_path: str) -> Tuple[str, float]:
        """📄 Enhanced PDF text extraction with OCR fallback"""
        try:
            doc = fitz.open(pdf_path)
            full_text = ""
            total_confidence = 0.0
            page_count = 0
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                
                # First try direct text extraction
                page_text = page.get_text()
                
                if page_text.strip():
                    full_text += page_text + "\n"
                    total_confidence += 90.0  # High confidence for direct text
                else:
                    # Fallback to OCR on page image
                    try:
                        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom
                        img_data = pix.tobytes("png")
                        
                        # Save temporarily for OCR
                        temp_img_path = f"temp_page_{page_num}_{os.getpid()}.png"
                        with open(temp_img_path, "wb") as f:
                            f.write(img_data)
                        
                        # OCR the page image
                        preprocessed = self.preprocess_image(temp_img_path)
                        best_text = ""
                        best_confidence = 0.0
                        
                        for method_name, processed_img in preprocessed[:3]:  # Use top 3 methods
                            text, confidence, _ = self.extract_text_with_confidence(processed_img)
                            if confidence > best_confidence and len(text.strip()) > len(best_text):
                                best_text = text
                                best_confidence = confidence
                        
                        if best_text:
                            full_text += best_text + "\n"
                            total_confidence += best_confidence
                        
                        # Cleanup
                        if os.path.exists(temp_img_path):
                            os.remove(temp_img_path)
                            
                    except Exception as ocr_error:
                        logger.warning(f"OCR on PDF page {page_num} failed: {ocr_error}")
                
                page_count += 1
            
            doc.close()
            
            # Calculate average confidence
            avg_confidence = total_confidence / page_count if page_count > 0 else 0.0
            
            logger.info(f"✅ PDF extraction completed: {len(full_text)} characters, {avg_confidence:.1f}% confidence")
            return full_text.strip(), avg_confidence
            
        except Exception as e:
            logger.error(f"❌ PDF extraction failed: {str(e)}")
            return "", 0.0
    
    def extract_fields_from_text(self, text: str, document_type: str) -> Dict[str, Any]:
        """
        🎯 Advanced field extraction with pattern matching and validation
        """
        try:
            extracted_fields = {}
            text_upper = text.upper()
            text_clean = re.sub(r'\s+', ' ', text.strip())
            
            patterns = self.extraction_patterns.get(document_type, {})
            
            for field_name, field_patterns in patterns.items():
                field_value = None
                
                # Try each pattern for this field
                for pattern in field_patterns:
                    matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
                    if matches:
                        # Take the first valid match
                        candidate = matches[0].strip() if isinstance(matches[0], str) else matches[0]
                        
                        # Field-specific validation
                        if self._validate_field(field_name, candidate, document_type):
                            field_value = self._clean_field_value(field_name, candidate)
                            break
                
                if field_value:
                    extracted_fields[field_name] = field_value
            
            logger.info(f"✅ Extracted {len(extracted_fields)} fields from {document_type} document")
            return extracted_fields
            
        except Exception as e:
            logger.error(f"❌ Field extraction failed: {str(e)}")
            return {}
    
    def _validate_field(self, field_name: str, value: str, document_type: str) -> bool:
        """✅ Validate extracted field values"""
        try:
            value = value.strip()
            
            if field_name == 'aadhaar_number':
                # Remove spaces and check if it's exactly 12 digits
                digits_only = re.sub(r'\D', '', value)
                return len(digits_only) == 12 and digits_only.isdigit()
            
            elif field_name == 'pan_number':
                # PAN format: 5 letters, 4 digits, 1 letter
                return len(value) == 10 and re.match(r'^[A-Z]{5}\d{4}[A-Z]$', value.upper())
            
            elif field_name == 'name':
                # Name should be 2-50 characters, only letters and spaces
                return (2 <= len(value) <= 50 and 
                       re.match(r'^[A-Za-z\s]+$', value) and
                       not re.search(r'\d', value))
            
            elif field_name == 'father_name':
                # Similar to name validation
                return (2 <= len(value) <= 50 and 
                       re.match(r'^[A-Za-z\s]+$', value) and
                       not re.search(r'\d', value))
            
            elif field_name == 'date_of_birth':
                # Basic date format validation
                return re.match(r'^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$', value)
            
            elif field_name == 'gender':
                valid_genders = ['male', 'female', 'other', 'm', 'f', 'पुरुष', 'महिला', 'अन्य']
                return value.lower() in valid_genders
            
            elif field_name == 'address':
                # Address should be reasonable length
                return 10 <= len(value) <= 200
            
            return True  # Default to valid for unknown fields
            
        except Exception as e:
            logger.warning(f"Field validation error for {field_name}: {str(e)}")
            return False
    
    def _clean_field_value(self, field_name: str, value: str) -> str:
        """🧹 Clean and normalize field values"""
        try:
            value = value.strip()
            
            if field_name == 'aadhaar_number':
                # Remove all spaces and hyphens
                return re.sub(r'[\s\-]', '', value)
            
            elif field_name == 'pan_number':
                # Ensure uppercase
                return value.upper()
            
            elif field_name in ['name', 'father_name']:
                # Title case and remove extra spaces
                return ' '.join(word.capitalize() for word in value.split())
            
            elif field_name == 'gender':
                # Normalize gender
                value_lower = value.lower()
                if value_lower in ['male', 'm', 'पुरुष']:
                    return 'Male'
                elif value_lower in ['female', 'f', 'महिला']:
                    return 'Female'
                elif value_lower in ['other', 'अन्य']:
                    return 'Other'
                return value.title()
            
            elif field_name == 'address':
                # Clean up address formatting
                return ' '.join(value.split())
            
            return value
            
        except Exception as e:
            logger.warning(f"Field cleaning error for {field_name}: {str(e)}")
            return value
    
    def calculate_extraction_confidence(self, extracted_fields: Dict, required_fields: List[str], 
                                      ocr_confidence: float) -> float:
        """📊 Calculate overall extraction confidence score"""
        try:
            # Base confidence from OCR
            confidence = ocr_confidence * 0.6  # 60% weight for OCR confidence
            
            # Field extraction completeness (30% weight)
            field_score = 0.0
            if required_fields:
                found_fields = len([field for field in required_fields if field in extracted_fields])
                field_score = (found_fields / len(required_fields)) * 100
            
            confidence += field_score * 0.3
            
            # Field quality score (10% weight)
            quality_score = 0.0
            for field_name, field_value in extracted_fields.items():
                if field_value and isinstance(field_value, str):
                    # Basic quality indicators
                    if len(field_value.strip()) > 0:
                        quality_score += 10
            
            quality_score = min(100, quality_score)
            confidence += quality_score * 0.1
            
            return min(100.0, max(0.0, confidence))
            
        except Exception as e:
            logger.warning(f"Confidence calculation error: {str(e)}")
            return ocr_confidence
    
    def process_document(self, file_path: str, document_type: str) -> Dict[str, Any]:
        """
        🚀 Main document processing pipeline with comprehensive error handling
        """
        processing_start = datetime.utcnow()
        
        try:
            logger.info(f"🔄 Processing {document_type} document: {file_path}")
            
            # Validate inputs
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
            
            if document_type not in ['aadhaar', 'pan']:
                raise ValueError(f"Unsupported document type: {document_type}")
            
            # Initialize result structure
            result = {
                'success': False,
                'document_type': document_type,
                'file_path': file_path,
                'extracted_fields': {},
                'raw_text': '',
                'confidence_score': 0.0,
                'processing_time': 0.0,
                'extraction_method': 'unknown',
                'quality_metrics': {},
                'errors': []
            }
            
            # Determine required fields
            required_fields = {
                'aadhaar': ['name', 'aadhaar_number'],
                'pan': ['name', 'pan_number']
            }.get(document_type, [])
            
            try:
                # Check if it's a PDF file
                if file_path.lower().endswith('.pdf'):
                    logger.info("📄 Processing PDF document")
                    raw_text, ocr_confidence = self.extract_text_from_pdf(file_path)
                    result['extraction_method'] = 'pdf_extraction_with_ocr_fallback'
                else:
                    # Image processing
                    logger.info("🖼️ Processing image document")
                    preprocessed_images = self.preprocess_image(file_path)
                    
                    # Try different preprocessing methods and OCR configurations
                    best_text = ""
                    best_confidence = 0.0
                    best_quality = {}
                    best_method = "unknown"
                    
                    ocr_configs_to_try = ['default', 'mixed', 'text_only']
                    
                    for method_name, processed_img in preprocessed_images[:5]:  # Top 5 methods
                        for config_name in ocr_configs_to_try:
                            try:
                                text, confidence, quality = self.extract_text_with_confidence(
                                    processed_img, config_name
                                )
                                
                                # Score this attempt
                                attempt_score = (
                                    confidence * 0.7 +  # OCR confidence
                                    (len(text.strip()) / 1000) * 100 * 0.2 +  # Text length
                                    quality.get('word_count', 0) * 0.1  # Word count
                                )
                                
                                current_best_score = (
                                    best_confidence * 0.7 +
                                    (len(best_text.strip()) / 1000) * 100 * 0.2 +
                                    best_quality.get('word_count', 0) * 0.1
                                )
                                
                                if attempt_score > current_best_score:
                                    best_text = text
                                    best_confidence = confidence
                                    best_quality = quality
                                    best_method = f"{method_name}_{config_name}"
                                    
                            except Exception as ocr_error:
                                logger.warning(f"OCR attempt failed ({method_name}_{config_name}): {str(ocr_error)}")
                                continue
                    
                    raw_text = best_text
                    ocr_confidence = best_confidence
                    result['extraction_method'] = f'enhanced_ocr_{best_method}'
                    result['quality_metrics'] = best_quality
                
                # Store raw text
                result['raw_text'] = raw_text
                
                if not raw_text.strip():
                    result['errors'].append('No text could be extracted from the document')
                    return result
                
                # Extract structured fields
                logger.info("🎯 Extracting structured fields")
                extracted_fields = self.extract_fields_from_text(raw_text, document_type)
                result['extracted_fields'] = extracted_fields
                
                # Calculate final confidence score
                final_confidence = self.calculate_extraction_confidence(
                    extracted_fields, required_fields, ocr_confidence
                )
                result['confidence_score'] = round(final_confidence, 1)
                
                # Validate extraction success
                critical_fields_found = sum(1 for field in required_fields if field in extracted_fields)
                
                if critical_fields_found == 0:
                    result['errors'].append('No critical fields could be extracted')
                elif critical_fields_found < len(required_fields):
                    result['errors'].append(f'Only {critical_fields_found}/{len(required_fields)} critical fields extracted')
                
                # Success if we have at least one critical field and reasonable confidence
                result['success'] = (critical_fields_found > 0 and final_confidence > 30.0)
                
                # Calculate processing time
                processing_time = (datetime.utcnow() - processing_start).total_seconds()
                result['processing_time'] = round(processing_time, 2)
                
                if result['success']:
                    logger.info(f"✅ Document processing successful: {final_confidence:.1f}% confidence, {critical_fields_found}/{len(required_fields)} fields extracted")
                else:
                    logger.warning(f"⚠️ Document processing completed with issues: {'; '.join(result['errors'])}")
                
                return result
                
            except Exception as processing_error:
                logger.error(f"❌ Processing error: {str(processing_error)}")
                result['errors'].append(f"Processing failed: {str(processing_error)}")
                return result
                
        except Exception as e:
            logger.error(f"❌ Critical error in document processing: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                'success': False,
                'error': str(e),
                'document_type': document_type,
                'file_path': file_path,
                'extracted_fields': {},
                'raw_text': '',
                'confidence_score': 0.0,
                'processing_time': (datetime.utcnow() - processing_start).total_seconds()
            }

# Backward compatibility alias
OCRProcessor = EnhancedOCRProcessor

# Export for use in other modules
__all__ = ['EnhancedOCRProcessor', 'OCRProcessor']
