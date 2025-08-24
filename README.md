# 📑 Synthetic Aadhaar   
👤 By **THIRUPATHI**

## 📌 Task Overview  
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
✅ Also install **Tesseract OCR engine** for text extraction.

## 📂 Project Structure  
```
project-root/
├─ data/
│  └─ synthetic_aadhaar/
│     ├─ pdfs/
│     ├─ images/
│     ├─ metadata/
│     │  ├─ synthetic_aadhaar_metadata.csv
│     │  └─ parsed_aadhaar.csv
│     ├─ code/
│     │  ├─ generate_synthetic_ids.py
│     │  ├─ pdf_to_images.py
│     │  └─ extract_fields.py
│     └─ README.md
```    └─ README.md
