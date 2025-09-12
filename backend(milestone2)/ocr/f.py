

# field_extractor.py
import re

def extract_details(text):
    """Parse OCR text and extract Aadhaar details"""
    details = {}

    # Extract Name (everything after 'Name:' until newline or next key)
    name_match = re.search(r"Name:\s*(.+?)(?:\n|DOB:|Gender:|Address:|$)", text, re.IGNORECASE)
    if name_match:
        details["Name"] = name_match.group(1).strip()

    # Extract DOB
    dob_match = re.search(r"DOB:\s*([\d-]+)", text, re.IGNORECASE)
    if dob_match:
        details["DOB"] = dob_match.group(1).strip()

    # Extract Gender
    gender_match = re.search(r"Gender:\s*(Male|Female|Other)", text, re.IGNORECASE)
    if gender_match:
        details["Gender"] = gender_match.group(1).capitalize()
    else:
        details["Gender"] = None

    # Extract Address (everything until end of line or next key)
    address_match = re.search(r"Address:\s*(.+?)(?:\n|$)", text, re.IGNORECASE)
    if address_match:
        details["Address"] = address_match.group(1).strip()
    else:
        details["Address"] = None

    # Match exactly 12 digits, optionally with spaces in between every 4 digits
    aadhaar_match = re.search(r'\b(\d{4}\s\d{4}\s\d{4}|\d{12})\b', text)
    if aadhaar_match:
        details["AadhaarNumber"] = aadhaar_match.group()
    else:
        details["AadhaarNumber"] = None

    # Extract Aadhaar Number (12 digits with spaces) # not working
   # aadhaar_match = re.search(r"\b\d{4}\s\d{4}\s\d{4}\b", text)
   # if aadhaar_match:
   #     details["AadhaarNumber"] = aadhaar_match.group(0)

    #aadhaar = re.search(r"(\d{4}\s?\d{4}\s?\d{4})", text)

    #if aadhaar:
        # normalize Aadhaar format with spaces
        #details["AadhaarNumber"] = ' '.join(aadhaar.group(1).strip().split())

    # Extract Aadhaar Number (4-4-4 format)
    #aadhaar_match = re.search(r'\b(\d{4})\s*(\d{4})\s*(\d{4})\b', text)
    #if aadhaar_match:
    #    details["AadhaarNumber"] = " ".join(aadhaar_match.groups())

    return details







def pan_details(text):
    data = {}

    # --- PAN Number ---
    pan_match = re.search(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", text)
    if pan_match:
        data["PANNumber"] = pan_match.group()

    # --- Split text into lines ---
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    # --- Extract Name (after line containing 'Name') ---
    for i, line in enumerate(lines):
        if re.search(r"Name", line, re.IGNORECASE):
            if i + 1 < len(lines):
                data["Name"] = lines[i + 1].strip()
            if i + 3 < len(lines):  # father’s name usually 2 lines after
                data["FatherName"] = lines[i + 3].strip()
            break

    return data


