# ocr.py - OCR Processing Utilities
import os
import cv2
import numpy as np
import pytesseract
import fitz  # PyMuPDF
import re
import logging
from datetime import datetime

# Configure logging to display informative messages
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def validate_aadhaar_format(aadhaar):
    """Validate Aadhaar number format (12 digits, not all same digit)."""
    aadhaar_str = str(aadhaar).strip()
    if not re.match(r"^\d{12}$", aadhaar_str):
        return False
    if re.match(r"^(\d)\1{11}$", aadhaar_str):
        return False
    return True


def validate_pan_format(pan):
    """Validate PAN format (e.g., ABCDE1234F)."""
    pan_str = str(pan).strip().upper()
    return bool(re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]$", pan_str))


def validate_date_format(date_str):
    """Validate and normalize various date formats to DD-MM-YYYY."""
    # List of common date formats to check against
    date_formats = [
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%d.%m.%Y",
        "%Y/%m/%d",
        "%Y-%m-%d",
        "%Y.%m.%d",
        "%d/%m/%y",
        "%d-%m-%y",
        "%d.%m.%y",
    ]

    for fmt in date_formats:
        try:
            parsed_date = datetime.strptime(date_str, fmt)
            # Return date in a standardized format
            return parsed_date.strftime("%d-%m-%Y")
        except ValueError:
            continue

    return None


class OCRProcessor:
    """
    A class to handle OCR processing for documents like Aadhaar and PAN cards.
    """

    def __init__(self):
        self.supported_formats = [".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".pdf"]

    def calculate_document_hash(self, image_path):
        """Calculate a perceptual hash of a document for duplicate detection."""
        try:
            image = cv2.imread(image_path)
            if image is None:
                logger.warning(
                    f"Could not read image for hash calculation: {image_path}"
                )
                return None

            # Resize and convert to grayscale
            resized = cv2.resize(image, (64, 64))
            gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)

            # Calculate the average pixel value
            avg = gray.mean()

            # Create the hash by comparing each pixel to the average
            hash_bits = ["1" if pixel > avg else "0" for row in gray for pixel in row]

            # Convert binary hash to hexadecimal string
            hash_hex = hex(int("".join(hash_bits), 2))[2:]
            return hash_hex
        except Exception as e:
            logger.error(f"Hash calculation error for {image_path}: {e}")
            return None

    def enhanced_ocr_extraction(self, image_path):
        """
        Enhanced OCR with multiple preprocessing techniques and Tesseract configurations
        to maximize accuracy.
        """
        try:
            image = cv2.imread(image_path)
            if image is None:
                logger.warning(f"Could not read image for OCR: {image_path}")
                return ""

            # Create a list of preprocessed images to try OCR on
            preprocessed_images = []

            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            preprocessed_images.append(gray)  # 1. Standard grayscale

            enhanced = cv2.convertScaleAbs(gray, alpha=1.5, beta=0)
            preprocessed_images.append(enhanced)  # 2. Increased contrast

            blurred = cv2.GaussianBlur(gray, (3, 3), 0)
            preprocessed_images.append(blurred)  # 3. Slightly blurred to remove noise

            adaptive = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            preprocessed_images.append(adaptive)  # 4. Adaptive thresholding

            all_texts = []
            for img in preprocessed_images:
                # Upscale image for better OCR results
                scaled = cv2.resize(
                    img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC
                )

                # Different Page Segmentation Modes (PSM) for Tesseract
                psm_configs = ["--psm 6", "--psm 4", "--psm 3"]

                for config in psm_configs:
                    try:
                        text = pytesseract.image_to_string(scaled, config=config)
                        if text.strip():
                            all_texts.append(text.strip())
                    except Exception:
                        continue

            # Return the longest, most detailed text extracted
            if all_texts:
                return max(all_texts, key=len)
            return ""

        except Exception as e:
            logger.error(f"Enhanced OCR error for {image_path}: {e}")
            return ""

    def extract_text_from_pdf(self, pdf_path):
        """
        Extracts text from a PDF. If the PDF contains images, it performs OCR on them.
        """
        try:
            doc = fitz.open(pdf_path)
            text = ""

            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                page_text = page.get_text()

                if page_text.strip():
                    text += page_text + "\n"
                else:  # If no text, assume it's an image-based PDF page
                    logger.info(
                        f"Page {page_num + 1} in {pdf_path} has no text, attempting OCR."
                    )
                    try:
                        # Render page as a high-resolution image
                        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                        img_data = pix.tobytes("png")

                        temp_img_path = f"temp_page_{page_num}.png"
                        with open(temp_img_path, "wb") as f:
                            f.write(img_data)

                        ocr_text = self.enhanced_ocr_extraction(temp_img_path)
                        if ocr_text:
                            text += ocr_text + "\n"

                        os.remove(temp_img_path)
                    except Exception as ocr_error:
                        logger.warning(
                            f"OCR on PDF page {page_num + 1} failed: {ocr_error}"
                        )

            doc.close()
            return text.strip()

        except Exception as e:
            logger.error(f"PDF extraction error for {pdf_path}: {e}")
            return ""

    def enhanced_field_extraction(self, text, document_type):
        """
        Extracts specific fields from raw text using regex patterns and validation.
        """
        fields = {}
        text = re.sub(r"\s+", " ", text.strip())

        if document_type.lower() == "aadhaar":
            # Patterns for Aadhaar Number
            aadhaar_patterns = [r"\b(\d{4}[\s\-]*\d{4}[\s\-]*\d{4})\b"]
            for pattern in aadhaar_patterns:
                match = re.search(pattern, text)
                if match:
                    aadhaar_num = re.sub(r"[\s\-]", "", match.group(1))
                    if validate_aadhaar_format(aadhaar_num):
                        fields["aadhaar_number"] = aadhaar_num
                        break

            # Patterns for Name
            name_patterns = [r"Name[:\s]*([A-Za-z][A-Za-z\s\.]{2,40})"]
            for pattern in name_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    name = " ".join(match.group(1).strip().split())
                    if 2 < len(name) < 50:
                        fields["name"] = name
                        break

            # Patterns for Date of Birth
            dob_patterns = [
                r"(?:DOB|Date of Birth|जन्म)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})"
            ]
            for pattern in dob_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    normalized_date = validate_date_format(match.group(1))
                    if normalized_date:
                        fields["date_of_birth"] = normalized_date
                        break

            # Patterns for Gender
            gender_patterns = [
                r"(?:Gender|Sex|लिंग)[:\s]*(Male|Female|Other|पुरुष|महिला|अन्य|M|F)"
            ]
            for pattern in gender_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    gender = match.group(1).upper()
                    if gender.startswith("M") or gender == "पुरुष":
                        fields["gender"] = "Male"
                    elif gender.startswith("F") or gender == "महिला":
                        fields["gender"] = "Female"
                    elif gender.startswith("O") or gender == "अन्य":
                        fields["gender"] = "Other"
                    break

            # Patterns for Address
            address_patterns = [r"Address[:\s]*([\s\S]+?)(?=\d{6})"]
            for pattern in address_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    addr = (
                        match.group(1).strip().replace("\n", " ")
                        + " "
                        + text[match.end() : match.end() + 6]
                    )
                    if 10 < len(addr) < 200:
                        fields["address"] = " ".join(addr.split())
                        break

        elif document_type.lower() == "pan":
            # Patterns for PAN Number
            pan_patterns = [r"\b([A-Z]{5}\d{4}[A-Z])\b"]
            for pattern in pan_patterns:
                match = re.search(pattern, text.upper())
                if match:
                    pan_num = match.group(1)
                    if validate_pan_format(pan_num):
                        fields["pan_number"] = pan_num
                        break

            # Patterns for Name
            name_patterns = [r"Name\s+([A-Z\s\.]+)(?:\n|Father)"]
            for pattern in name_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    fields["name"] = " ".join(match.group(1).strip().split())
                    break

            # Patterns for Father's Name
            father_name_patterns = [r"Father's Name\s+([A-Z\s\.]+)(?:\n|Date)"]
            for pattern in father_name_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    fields["father_name"] = " ".join(match.group(1).strip().split())
                    break

            # Patterns for Date of Birth
            dob_patterns = [r"Date of Birth\s+(\d{2}/\d{2}/\d{4})"]
            for pattern in dob_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    normalized_date = validate_date_format(match.group(1))
                    if normalized_date:
                        fields["date_of_birth"] = normalized_date
                        break

        return fields

    def process_document(self, filepath, document_type):
        """Main document processing workflow."""
        start_time = datetime.now()
        result = {
            "success": True, # Assume success unless a critical error occurs
            "document_type": document_type,
            "extracted_fields": {},
            "confidence_score": 0,
            "raw_text": "",
            "processing_timestamp": None,
            "document_hash": None,
            "error": None,
            "status": "pending",
        }

        try:
            if not os.path.exists(filepath):
                result["error"] = "File not found"
                result["success"] = False
                return result

            file_ext = os.path.splitext(filepath)[1].lower()
            if file_ext not in self.supported_formats:
                result["error"] = f"Unsupported file format: {file_ext}"
                result["success"] = False
                return result

            if file_ext != ".pdf":
                result["document_hash"] = self.calculate_document_hash(filepath)

            if file_ext == ".pdf":
                extracted_text = self.extract_text_from_pdf(filepath)
            else:
                extracted_text = self.enhanced_ocr_extraction(filepath)

            result["raw_text"] = extracted_text

            if not extracted_text:
                result["error"] = "No text could be extracted from the document"
                # This is no longer a hard fail, just a note.
            
            extracted_fields = self.enhanced_field_extraction(
                extracted_text, document_type
            )
            result["extracted_fields"] = extracted_fields

            # Calculate confidence score based on how many expected fields were found
            expected_fields = {
                "aadhaar": ["name", "aadhaar_number", "date_of_birth", "gender"],
                "pan": ["name", "pan_number", "date_of_birth", "father_name"],
            }

            if document_type.lower() in expected_fields:
                doc_type_key = document_type.lower()
                fields_found = sum(
                    1
                    for field in expected_fields[doc_type_key]
                    if field in extracted_fields and extracted_fields[field]
                )
                total_fields = len(expected_fields[doc_type_key])
                result["confidence_score"] = (
                    round((fields_found / total_fields) * 100)
                    if total_fields > 0
                    else 0
                )

            # Note validation failures instead of returning an error
            critical_field = f"{document_type.lower()}_number"
            if not extracted_fields.get(critical_field):
                result["error"] = f"Could not extract valid {document_type} number."
            elif not extracted_fields.get("name"):
                result["error"] = "Could not extract name from the document."

        except Exception as e:
            logger.error(f"Document processing error for {filepath}: {e}")
            result["error"] = f"An unexpected error occurred: {e}"
            result["success"] = False
        finally:
            result["processing_timestamp"] = datetime.now().isoformat()
            processing_time = (datetime.now() - start_time).total_seconds()
            logger.info(
                f"Processed {filepath} in {processing_time:.2f}s with confidence {result['confidence_score']}%"
            )

        return result