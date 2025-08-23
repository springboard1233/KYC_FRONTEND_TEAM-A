# AI Powered KYC Verification
## by shubham sharma (group-A)
## Overview
This project generates sample Aadhaar PDFs and processes them to extract information such as name, address, and Aadhaar number using OCR, then stores the results in CSV/JSON format.

## Pipeline
1. **Data Collection**
   - Synthetic Aadhaar PDFs are generated for testing using `aadhar_generator.py`.
2. **Preprocessing**
   - PDFs and images are converted to JPG.
   - Noise removal and image enhancement.
3. **OCR Extraction**
   - Tesseract OCR is used to extract text.
4. **Field Extraction**
   - Name, address, and Aadhaar number are parsed from the text.
5. **Output**
   - Extracted data saved as CSV .

## Folder Structure
```
project_root/
│
├─ data/
│  ├─ raw_docs/
│  │  ├─ aadhaar_pdf/
│  │  └─ aadhaar_img/
│  └─ processed_data.csv
├─ ocr/
│  ├─ ocr_extractor.py
│  └─ field_extractor.py
├─ utils/
│  └─ cleaning_utils.py
├─ main.py
|_ aadhar_generator.py
└─ README.md



## How to Run
```bash
python main.py


Dependencies

Python 3.x

pytesseract

pdf2image

PIL
opencv-python
faker
fpdf

