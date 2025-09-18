# backend/ocr.py
import cv2
import pytesseract
import re
import json
import os
import numpy as np
import fitz  
from datetime import datetime

pytesseract.pytesseract.tesseract_cmd = 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'


# # --- Helper Functions (No Changes) ---
# def format_dob(date_str):
#     date_match = re.search(r'(\d{2})[-/.\s](\d{2})[-/.\s](\d{4})', date_str)
#     if date_match:
#         day, month, year = date_match.groups()
#         return f"{day}-{month}-{year}"
#     return date_str

# def preprocess_image(img):
#     gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
#     gray = cv2.medianBlur(gray, 3)
#     thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
#     return thresh

# # --- 1. REWRITTEN Aadhaar Parsing Logic ---
# def parse_aadhaar_text(raw_text):
#     """Parses raw text from newer Aadhaar card layouts."""
#     details = {
#         "Name": None, "DOB": None, "Gender": None, "AadhaarNumber": None, "Address": None
#     }
#     lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
    
#     # Find Aadhaar Number (most reliable pattern)
#     aadhaar_pattern = r'\b\d{4}\s?\d{4}\s?\d{4}\b'
#     aadhaar_match = re.search(aadhaar_pattern, raw_text)
#     if aadhaar_match:
#         details["AadhaarNumber"] = aadhaar_match.group(0).replace(" ", "")

#     # Find DOB and Gender, which have clear labels
#     dob_line_index = -1
#     for i, line in enumerate(lines):
#         if "DOB" in line or "Birth" in line:
#             dob_match = re.search(r'\d{2}/\d{2}/\d{4}', line)
#             if dob_match:
#                 details["DOB"] = format_dob(dob_match.group(0))
#                 dob_line_index = i # Save the line number where DOB was found
        
#         if "FEMALE" in line or "महिला" in line:
#             details["Gender"] = "Female"
#         elif "MALE" in line or "पुरुष" in line:
#             details["Gender"] = "Male"

#     # Find Name (often the line before DOB)
#     if dob_line_index > 0:
#         # The name is usually the line right before the DOB line
#         potential_name = lines[dob_line_index - 1]
#         # Avoid capturing Hindi text if English is available below it
#         if not re.search(r'[\u0900-\u097F]', potential_name):
#              details["Name"] = potential_name

#     # Find Address (which can be multi-line)
#     address_started = False
#     full_address = []
#     for line in lines:
#         if "Address" in line or "पता" in line:
#             address_started = True
#             # Capture text after the colon on the same line
#             address_part = line.split(':')[-1].strip()
#             if address_part:
#                 full_address.append(address_part)
#             continue # Move to the next line
        
#         if address_started:
#             # If we are in address-capture mode, add subsequent lines
#             # Stop if we hit a known keyword for another section
#             if "Aadhaar" in line or "पहचान" in line:
#                 address_started = False
#                 break
#             full_address.append(line)

#     if full_address:
#         details["Address"] = ", ".join(full_address)

#     return details

# # --- 2. PAN Card Parsing Logic (No Changes) ---
# def parse_pan_text(raw_text):
#     """Parses raw text extracted from a PAN card."""
#     # ... (Your existing PAN card logic remains here) ...
#     details = { "Name": None, "FathersName": None, "DOB": None, "PANNumber": None }
#     pan_pattern = r'[A-Z]{5}[0-9]{4}[A-Z]{1}'
#     pan_match = re.search(pan_pattern, raw_text)
#     if pan_match: details["PANNumber"] = pan_match.group(0)
#     lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
#     for i, line in enumerate(lines):
#         if "Name" in line and "Father" not in line and i + 1 < len(lines): details["Name"] = lines[i+1]
#         elif "Father" in line and i + 1 < len(lines): details["FathersName"] = lines[i+1]
#         elif "Birth" in line and i + 1 < len(lines): details["DOB"] = format_dob(lines[i+1])
#     return details

# # --- 3. Main Dispatcher Function (No Changes) ---
# def process_document(filepath):
#     """
#     Loads a document, runs OCR, detects the type, and calls the correct parser.
#     """
#     try:
#         file_extension = os.path.splitext(filepath)[1].lower()
#         img = None
#         if file_extension in ['.png', '.jpg', '.jpeg']: img = cv2.imread(filepath)
#         elif file_extension == '.pdf':
#             doc = fitz.open(filepath)
#             page = doc.load_page(0)
#             pix = page.get_pixmap(dpi=300)
#             img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
#             if img.shape[2] == 4: img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
#             doc.close()
#         if img is None: raise ValueError("Could not read file")
        
#         processed_img = preprocess_image(img)
#         raw_text = pytesseract.image_to_string(processed_img, lang='eng+hin') # Added Hindi language support
        
#         # --- Document Type Detection Logic ---
#         if "INCOME TAX DEPARTMENT" in raw_text or "Permanent Account Number" in raw_text:
#             print("PAN Card detected.")
#             return parse_pan_text(raw_text)
#         elif "GOVERNMENT OF INDIA" in raw_text and ("Address" in raw_text or "पता" in raw_text):
#             print("Aadhaar Card detected.")
#             return parse_aadhaar_text(raw_text)
#         else:
#             return {"error": "Unknown or unclear document type."}
#     except Exception as e:
#         print(f"An error occurred in OCR processing: {e}")
#         return {"error": "Failed to process the document."}


def format_dob(date_str):
    date_match = re.search(r'(\d{2})[-/.\s](\d{2})[-/.\s](\d{4})', date_str)
    if date_match:
        day, month, year = date_match.groups()
        return f"{day}-{month}-{year}"
    return date_str

def preprocess_image(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, 3)
    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    return thresh

def parse_aadhaar_text(raw_text):
    """Parses raw text extracted from an Aadhaar card."""
    details = {
        "Name": None, "DOB": None, "Gender": None, "AadhaarNumber": None
    }
    aadhaar_num_pattern = r'\b\d{4}\s?\d{4}\s?\d{4}\b'
    dob_pattern = r'(\d{2}[-/. ]\d{2}[-/. ]\d{4})'
    lines = raw_text.split('\n')
    
    aadhaar_match = re.search(aadhaar_num_pattern, raw_text)
    if aadhaar_match:
        details["AadhaarNumber"] = aadhaar_match.group(0).replace(" ", "")

    for i, line in enumerate(lines):
        line_lower = line.lower()
        if "name" in line_lower:
            details["Name"] = line.split(":")[-1].strip()
        elif "dob" in line_lower or "birth" in line_lower:
            dob_match = re.search(dob_pattern, line)
            if dob_match:
                details["DOB"] = format_dob(dob_match.group(1))
        elif "gender" in line_lower:
            gender_info = line.split(":")[-1].strip()
            if "female" in gender_info.lower(): details["Gender"] = "Female"
            elif "male" in gender_info.lower(): details["Gender"] = "Male"
    
    return details

# --- 2. NEW: PAN Card Parsing Logic ---
def parse_pan_text(raw_text):
    """Parses raw text extracted from a PAN card."""
    details = {
        "Name": None, "FathersName": None, "DOB": None, "PANNumber": None
    }
    pan_pattern = r'[A-Z]{5}[0-9]{4}[A-Z]{1}'
    pan_match = re.search(pan_pattern, raw_text)
    if pan_match:
        details["PANNumber"] = pan_match.group(0)

    lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
    for i, line in enumerate(lines):
        if "Name" in line and "Father" not in line and i + 1 < len(lines):
            details["Name"] = lines[i+1]
        elif "Father" in line and i + 1 < len(lines):
            details["FathersName"] = lines[i+1]
        elif "Birth" in line and i + 1 < len(lines):
            details["DOB"] = format_dob(lines[i+1])
            
    return details

def process_document(filepath):
    try:
        file_extension = os.path.splitext(filepath)[1].lower()
        img = None

        if file_extension in ['.png', '.jpg', '.jpeg']:
            img = cv2.imread(filepath)
        elif file_extension == '.pdf':
            doc = fitz.open(filepath)
            page = doc.load_page(0)
            pix = page.get_pixmap(dpi=300)
            img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
            if img.shape[2] == 4: img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
            elif img.shape[2] == 3: img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            doc.close()
        else:
            raise ValueError("Unsupported file type")
            
        if img is None:
            raise ValueError("Could not read the file as an image")

        processed_img = preprocess_image(img)
        raw_text = pytesseract.image_to_string(processed_img)
        
        # --- Document Type Detection Logic ---
        if "INCOME TAX DEPARTMENT" in raw_text or "Permanent Account Number" in raw_text:
            print("PAN Card detected.")
            return parse_pan_text(raw_text)
        elif "Aadhaar" in raw_text or re.search(r'\b\d{4}\s\d{4}\s\d{4}\b', raw_text):
            print("Aadhaar Card detected.")
            return parse_aadhaar_text(raw_text)
        else:
            # Fallback for unknown documents
            return {"error": "Unknown document type. Could not extract details."}

    except Exception as e:
        print(f"An error occurred in OCR processing: {e}")
        return {"error": "Failed to process the document."}