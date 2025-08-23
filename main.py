# main.py

import os
import csv
from ocr.ocr_extractor import convert_to_jpg, extract_text
from ocr.field_extractor import parse_fields
from utils.cleaning_utils import standardize_indian_address

DATA_DIR = "data/raw_docs/aadhar"
OUTPUT_FILE = "data/processed_data.csv"

def process_documents():
    rows = []

    # Loop through all documents in raw_docs
    for filename in os.listdir(DATA_DIR):
        filepath = os.path.join(DATA_DIR, filename)
        #print(filepath)

        try:
            # Step 1: OCR
            jpg_path = convert_to_jpg(filepath)
            text = extract_text(jpg_path)

            # Step 2: Field Extraction
            fields = parse_fields(text)

            # Step 3: Cleaning (standardize address & PIN)
            if "Address" in fields:
                fields["Address"] = standardize_indian_address(fields["Address"])

            rows.append(fields)

        except Exception as e:
            print(f"Error processing {filename}: {e}")

    # Step 4: Save to CSV
    if rows:
      keys = rows[0].keys()
      write_header = not os.path.exists(OUTPUT_FILE)

      with open(OUTPUT_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        if write_header:
            writer.writeheader()
        writer.writerows(rows)

    print(f"Processed data saved to {OUTPUT_FILE}")





if __name__ == "__main__":
    process_documents()
