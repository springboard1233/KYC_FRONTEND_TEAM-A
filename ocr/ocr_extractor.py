import os
import pytesseract
from PIL import Image
import json

INPUT_DIRS = {
    "Aadhaar": "data/raw_docs/aadhaar_samples",
    "Utility Bill": "data/raw_docs/utility_samples"
}
OUTPUT_FILE = "data/ocr_raw.json"

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def ocr_image(file_path, doc_type):
    text = pytesseract.image_to_string(Image.open(file_path))
    return {
        "file": os.path.basename(file_path),
        "document_type": doc_type,
        "text": text
    }

def main():
    dataset = []
    for doc_type, folder in INPUT_DIRS.items():
        for file in os.listdir(folder):
            if file.lower().endswith((".jpg", ".png")):
                dataset.append(ocr_image(os.path.join(folder, file), doc_type))

    os.makedirs("data", exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=4, ensure_ascii=False)

    print(f" OCR complete. Raw text saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
