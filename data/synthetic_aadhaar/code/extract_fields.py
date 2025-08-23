import os
import re
import csv
import json

def parse_aadhaar_text(text):
    """Extract name, Aadhaar number, and address from OCR text."""
    data = {}

    # Extract Name
    name_match = re.search(r"Name:\s*(.+)", text)
    data["name"] = name_match.group(1).strip() if name_match else None

    # Extract Aadhaar Number
    aadhaar_match = re.search(r"Aadhaar No:\s*(\d{4}\s?\d{4}\s?\d{4})", text)
    data["aadhaar_number"] = aadhaar_match.group(1).strip() if aadhaar_match else None

    # Extract Address (everything after "Address:")
    address_match = re.search(r"Address:\s*(.+)", text, re.DOTALL)
    data["address"] = address_match.group(1).replace("\n", " ").strip() if address_match else None

    return data


def process_text_folder(txt_dir, out_csv, out_json):
    """Process all text files and save structured data to CSV + JSON."""
    results = []
    txt_files = [f for f in os.listdir(txt_dir) if f.endswith(".txt")]

    for txt_file in txt_files:
        with open(os.path.join(txt_dir, txt_file), "r", encoding="utf-8") as f:
            text = f.read()

        parsed = parse_aadhaar_text(text)
        parsed["file_name"] = txt_file
        results.append(parsed)

    # Save to CSV
    with open(out_csv, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=["file_name", "name", "aadhaar_number", "address"])
        writer.writeheader()
        writer.writerows(results)

    # Save to JSON
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4)

    print(f"[INFO] Saved structured data → {out_csv} and {out_json}")


if __name__ == "__main__":
    txt_dir = r"C:\Users\burra\OneDrive\Desktop\Infosys\KYC_FRONTEND_TEAM-A\data\synthetic_aadhaar\texts"   
    out_csv = r"C:\Users\burra\OneDrive\Desktop\Infosys\KYC_FRONTEND_TEAM-A\data\synthetic_aadhaar\metadata\parsed_aadhaar.csv"
    out_json = r"C:\Users\burra\OneDrive\Desktop\Infosys\KYC_FRONTEND_TEAM-A\data\synthetic_aadhaar\metadata\parsed_aadhaar.json"

    process_text_folder(txt_dir, out_csv, out_json)