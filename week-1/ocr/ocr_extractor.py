
# ocr_extractor.py

import os
import cv2
import pytesseract
from PIL import Image
from pdf2image import convert_from_path

def convert_to_jpg(input_file):
    # Ensure output directory exists
    output_dir = "data/raw_docs/aadhar_img"
    os.makedirs(output_dir, exist_ok=True)

    filename, ext = os.path.splitext(os.path.basename(input_file))
    output_path = os.path.join(output_dir, f"{filename}.jpg")

    #filename, ext = os.path.splitext(os.path.basename(input_file))
    #output_path = f"{filename}.jpg"

    ext = ext.lower()
    if ext == ".pdf":
        pages = convert_from_path(input_file, dpi=300)
        pages[0].save(output_path, "JPEG")  # Save only first page
    elif ext in [".png", ".jpg", ".jpeg"]:
        img = Image.open(input_file)
        img.convert("RGB").save(output_path, "JPEG")
    else:
        raise ValueError("Unsupported file format. Use PDF, PNG, or JPG.")

    return output_path

def extract_text(output_path):
  # Sample OCR text

  img = cv2.imread(output_path)
  #print(img)
  gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
  text = pytesseract.image_to_string(gray)
  return text

