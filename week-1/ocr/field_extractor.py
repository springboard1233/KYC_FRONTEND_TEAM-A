

# field_extractor.py
import re

def parse_aadhar_details(text):
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

    # Extract Address (everything until end of line or next key)
    address_match = re.search(r"Address:\s*(.+?)(?:\n|$)", text, re.IGNORECASE)
    if address_match:
        details["Address"] = address_match.group(1).strip()

    # Extract Aadhaar Number (12 digits with spaces)
    aadhaar_match = re.search(r"\b\d{4}\s\d{4}\s\d{4}\b", text)
    if aadhaar_match:
        details["Aadhaar_Number"] = aadhaar_match.group(0)

    return details




