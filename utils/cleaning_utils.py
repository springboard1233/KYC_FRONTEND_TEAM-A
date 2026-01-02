import json
import csv
import os
from collections import defaultdict

def load_ocr_results(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def merge_records(records):
    merged = defaultdict(lambda: {
        "name": "",
        "address": "",
        "aadhaar_number": ""
    })
    
    for rec in records:
        key = (rec["name"], rec["address"]) 
        person = merged[key]
        person["name"] = rec["name"]
        person["address"] = rec["address"]

        if rec.get("aadhaar_number"):
            person["aadhaar_number"] = rec["aadhaar_number"]

    return list(merged.values())

def ensure_dir(path):
    """Make sure the parent folder exists before saving files."""
    os.makedirs(os.path.dirname(path), exist_ok=True)

def save_json(dataset, output_file):
    ensure_dir(output_file)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=4, ensure_ascii=False)

def save_csv(dataset, output_file):
    ensure_dir(output_file)
    fieldnames = ["name", "address", "aadhaar_number"]
    with open(output_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in dataset:
            row_copy = row.copy()
  
            if row_copy.get("aadhaar_number"):
                row_copy["aadhaar_number"] = "\t" + str(row_copy["aadhaar_number"])
            writer.writerow(row_copy)

def main():
    input_file = "data/ocr_results.json"
    output_json = "data/processed/final_dataset.json"
    output_csv = "data/processed/final_dataset.csv"

    if not os.path.exists(input_file):
        print(f"❌ Input file not found: {input_file}")
        return

    records = load_ocr_results(input_file)
    merged_data = merge_records(records)

    cleaned_data = [rec for rec in merged_data if rec.get("aadhaar_number", "").strip() != ""]

    save_json(cleaned_data, output_json)
    save_csv(cleaned_data, output_csv)
    print(f" Final dataset saved in:\n- {output_json}\n- {output_csv}")

if __name__ == "__main__":
    main()
