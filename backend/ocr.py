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

def format_dob(date_str):
    for fmt in ('%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y', '%d.%m.%Y'):
        try:
            cleaned_str = re.sub(r'\s', '', date_str)
            date_obj = datetime.strptime(cleaned_str, fmt)
            return date_obj.strftime('%d-%m-%Y')
        except ValueError:
            pass
    return re.sub(r'\s', '', date_str)

def preprocess_image(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # reduce noise
    gray = cv2.medianBlur(gray, 3)
    
    # clean b&w img
    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
                                   
    return thresh


def extract_aadhaar_details(filepath):
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
            
            if img.shape[2] == 4:
                img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)
            elif img.shape[2] == 3:
                img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

            doc.close()
        else:
            raise ValueError("Unsupported file type")
            
        if img is None:
            raise ValueError("Could not read the file as an image")

        processed_img = preprocess_image(img)
        raw_text = pytesseract.image_to_string(processed_img)
    
        
        details = {
            "Name": None,
            "DOB": None,
            "Gender": None,
            "Address": None,
            "AadhaarNumber": None
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
            # Search for DOB 
            elif "dob" in line_lower or "birth" in line_lower:
                dob_match = re.search(dob_pattern, line)
                if dob_match:
                    dob = dob_match.group(1).replace(" ", "")
                    details["DOB"] = format_dob(dob)
            elif "gender" in line_lower:
                gender_info = line.split(":")[-1].strip()
                if "female" in gender_info.lower():
                    details["Gender"] = "Female"
                elif "male" in gender_info.lower():
                    details["Gender"] = "Male"
            elif "address" in line_lower:
                address_line = line.split(":")[-1].strip()
                if i + 1 < len(lines) and not re.search(r'name|dob|gender|address', lines[i+1].lower()):
                     address_line += " " + lines[i+1].strip()
                details["Address"] = address_line
        
        if not details["DOB"]:
            dob_match = re.search(dob_pattern, raw_text)
            if dob_match:
                dob = dob_match.group(1).replace(" ", "")
                details["DOB"] = format_dob(dob)

        return details

    except Exception as e:
        print(f"An error occurred in OCR processing: {e}")
        return None

if __name__ == "__main__":
    # image file
    image_file = r'KYC_FRONTEND_TEAM-A\backend\images\aadhaar4.png' 
    if os.path.exists(image_file):
        print(f"--- Processing Image: {image_file} ---")
        extracted_data_img = extract_aadhaar_details(image_file)
        if extracted_data_img:
            print("Text Extracted!")
            print(json.dumps(extracted_data_img, indent=4))
    else:
        print(f"Image file not found: {image_file}")
    
    print("\n" + "="*40 + "\n")
    
    # PDF file 
    pdf_file = r'KYC_FRONTEND_TEAM-A\backend\images\aadhar.pdf' 
    if os.path.exists(pdf_file):
        print(f"--- Processing PDF: {pdf_file} ---")
        extracted_data_pdf = extract_aadhaar_details(pdf_file)
        if extracted_data_pdf:
            print("Text Extracted!")
            print(json.dumps(extracted_data_pdf, indent=4))
    else:
        print(f"PDF file not found: {pdf_file}")