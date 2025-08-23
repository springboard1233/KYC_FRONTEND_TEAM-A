# 📑 Synthetic Aadhaar OCR Project

## 📌 Project Overview
This project demonstrates an **AI-powered document processing pipeline** for **KYC compliance**.  
It focuses on creating and processing **synthetic Aadhaar documents** (not real IDs).

The pipeline covers:
1. **Synthetic Data Generation** → Create fake Aadhaar-like PDFs using `Faker` in Python.  
2. **OCR Processing** → Convert PDFs → images and extract raw text using `pytesseract` with OpenCV.  
3. **Structured Field Extraction** → Parse raw OCR text to extract important fields:  
   - **Name**  
   - **Aadhaar Number**  
   - **Address**  
   Results are saved in both **CSV** and **JSON** formats.

⚠️ **Note:**  
All Aadhaar numbers and personal details are **synthetic** (randomly generated).  
They are intended **only for testing and research purposes**.

---
Also install Tesseract OCR engine

## 📂 Project Structure

project-root/
├─ data/
│  └─ synthetic_aadhaar/
│     ├─ pdfs/                       # Synthetic Aadhaar PDFs (generated with Faker)
│     ├─ images/                     # PDFs converted into images for OCR
│     ├─ metadata/
│     │  ├─ synthetic_aadhaar_metadata.csv   # Metadata used to generate PDFs
│     │  ├─ parsed_aadhaar.csv              # Extracted fields (CSV)
│     │  └─ parsed_aadhaar.json             # Extracted fields (JSON)
│     ├─ code/
│     │  ├─ generate_synthetic_ids.py       # Script to generate synthetic PDFs
│     │  ├─ pdf_to_images.py                # Convert PDFs → images
│     │  ├─ run_ocr.py                      # OCR raw text extraction
│     │  └─ extract_fields.py               # Extract Name, Aadhaar Number, Address
│     └─ README.md
