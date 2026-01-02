import re
import json
import os

INPUT_FILE = "data/ocr_raw.json"
OUTPUT_FILE = "data/ocr_results.json"

def parse_text(record):
    """
    Parse structured fields from raw OCR text.
    """
    text = record["text"]
    lines = [re.sub(r"\s+", " ", line).strip() for line in text.split("\n") if line.strip()]

    parsed = {
        "file": record["file"],
        "document_type": record["document_type"],
        "name": "",
        "aadhaar_number": "",
        "dob": "",
        "gender": "",
        "address": "",
        "bill_date": ""
    }

    address_parts = []
    capturing_address = False

    for line in lines:
        lower_line = line.lower()

        if "name" in lower_line and not parsed["name"]:
            parsed["name"] = re.sub(r"(?i)name[:\-]?", "", line).strip()

        aadhaar_match = re.search(r"\b\d{4}\s?\d{4}\s?\d{4}\b", line)
        if aadhaar_match:
            parsed["aadhaar_number"] = aadhaar_match.group().replace(" ", "")

        dob_match = re.search(r"\b(dob|date of birth)[:\-]?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b", line, re.I)
        if dob_match:
            parsed["dob"] = dob_match.group(2)

        if "gender" in lower_line and not parsed["gender"]:
            parsed["gender"] = re.sub(r"(?i)gender[:\-]?", "", line).strip()

        
        date_match = re.search(r"\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b", line)
        if date_match and parsed["document_type"].lower() == "utility bill":
            parsed["bill_date"] = date_match.group(1)

        
        if line.strip().lower().startswith("house no") or "address" in lower_line:
            capturing_address = True

        if capturing_address:
            address_parts.append(line.strip())
            if re.search(r"\b\d{6}\b", line):  
                capturing_address = False

    if address_parts:
        parsed["address"] = " ".join(address_parts)

    return parsed


def main():
    if not os.path.exists(INPUT_FILE):
        print(f" Input file not found: {INPUT_FILE}")
        return

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    structured_data = [parse_text(record) for record in raw_data]

    os.makedirs("data", exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(structured_data, f, indent=4, ensure_ascii=False)

    print(f"Field extraction complete. Results saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
