# pdf_to_images.py
import os
from pdf2image import convert_from_path
import pytesseract

def pdfs_to_images_and_text(pdf_dir, out_dir, text_dir):
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(text_dir, exist_ok=True)
    pdf_files = [f for f in os.listdir(pdf_dir) if f.endswith(".pdf")]

    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_dir, pdf_file)
        images = convert_from_path(pdf_path)

        for i, img in enumerate(images):
            img_name = f"{os.path.splitext(pdf_file)[0]}_page{i+1}.png"
            out_path = os.path.join(out_dir, img_name)
            img.save(out_path, "PNG")
            print(f"[INFO] Saved image: {out_path}")

            # OCR: extract text from image
            text = pytesseract.image_to_string(img)
            text_name = f"{os.path.splitext(pdf_file)[0]}_page{i+1}.txt"
            text_path = os.path.join(text_dir, text_name)
            with open(text_path, "w", encoding="utf-8") as f:
                f.write(text)
            print(f"[INFO] Saved text: {text_path}")

if __name__ == "__main__":
    pdf_dir = r"C:\Users\burra\OneDrive\Desktop\Infosys\KYC_FRONTEND_TEAM-A\data\synthetic_aadhaar\pdfs"          
    out_dir = r"C:\Users\burra\OneDrive\Desktop\Infosys\KYC_FRONTEND_TEAM-A\data\synthetic_aadhaar\images"
    text_dir = r"C:\Users\burra\OneDrive\Desktop\Infosys\KYC_FRONTEND_TEAM-A\data\synthetic_aadhaar\texts"
    pdfs_to_images_and_text(pdf_dir, out_dir, text_dir)