#!/usr/bin/env python3
import os
import csv
import random
from datetime import datetime, timedelta
from pathlib import Path

from faker import Faker
from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm

OUTPUT_DIR = Path("data/synthetic")
PRACTICE_DIR = Path("data/practice_samples")
EXPORTS_DIR = Path("exports")
LABELS_CSV = OUTPUT_DIR / "synthetic_labels.csv"

# Try to find a TTF font; fallback to default
def load_font(size=24):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/Library/Fonts/Arial.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size=size)
            except Exception:
                pass
    return ImageFont.load_default()

fake = Faker("en_IN")

def ensure_dirs():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PRACTICE_DIR.mkdir(parents=True, exist_ok=True)
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)

def random_dob_age(min_age=18, max_age=70):
    age = random.randint(min_age, max_age)
    dob = datetime.today() - timedelta(days=age*365 + random.randint(0, 364))
    return dob.strftime("%d-%m-%Y"), age

def random_gender():
    return random.choice(["Male", "Female", "Other"])

def format_address():
    # Aadhaar addresses include detailed lines per UIDAI guidance (house, street, area, city, state, pincode). [1][3]
    lines = [
        f"{fake.building_number()} {fake.street_name()}",
        f"{fake.city()}",
        f"{fake.state()} - {fake.postcode()}",
    ]
    return ", ".join(lines)

def generate_aadhaar_identifier():
    # 12-digit numeric UID format (not validating checksum for simplicity). [2][8]
    return "".join([str(random.randint(0, 9)) for _ in range(12)])

def generate_pan_identifier():
    # PAN format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F). [6][9]
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    return "".join(random.choice(letters) for _ in range(5)) + \
           "".join(str(random.randint(0,9)) for _ in range(4)) + \
           random.choice(letters)

def draw_aadhaar_image(img_path, record):
    # Simple Aadhaar-like layout with key demographics (name, DOB, gender, address, Aadhaar No). [1][2]
    W, H = 1000, 650
    im = Image.new("RGB", (W, H), "white")
    draw = ImageDraw.Draw(im)
    font_h1 = load_font(36)
    font = load_font(28)
    font_small = load_font(22)

    # Header
    draw.rectangle([0,0,W,80], fill=(237,28,36))
    draw.text((20,20), "भारत सरकार | Government of India", fill="white", font=font)  # decorative header [2]
    # Title
    draw.text((20,100), "Aadhaar", fill="black", font=font_h1)  # [2]
    # Photo placeholder
    draw.rectangle([W-220,120,W-60,300], outline="black", width=2)
    draw.text((W-210,130), "PHOTO", fill="gray", font=font_small)

    y = 160
    draw.text((20,y), f"Name: {record['name']}", fill="black", font=font); y += 40
    draw.text((20,y), f"DOB: {record['dob']}", fill="black", font=font); y += 40
    draw.text((20,y), f"Gender: {record['gender']}", fill="black", font=font); y += 40
    draw.text((20,y), f"Address: {record['address']}", fill="black", font=font_small); y += 60
    draw.text((20,y), f"Aadhaar No: {record['identifier']}", fill="black", font=font_h1)  # [2]
    # Footer
    draw.rectangle([0,H-60,W,H], fill=(0,0,0))
    draw.text((20,H-50), "uidai.gov.in", fill="white", font=font_small)  # reference [2]
    im.save(img_path)

def draw_pan_image(img_path, record):
    # PAN-like layout with Name, Father's Name, DOB, PAN. [6][9]
    W, H = 1000, 600
    im = Image.new("RGB", (W, H), "#e8f0fe")
    draw = ImageDraw.Draw(im)
    font_h1 = load_font(36)
    font = load_font(28)
    font_small = load_font(22)

    # Header
    draw.rectangle([0,0,W,90], fill=(26,115,232))
    draw.text((20,22), "Income Tax Department - Permanent Account Number", fill="white", font=font_small)  # [9]
    draw.text((20,100), "PAN Card", fill="black", font=font_h1)

    # Photo placeholder
    draw.rectangle([W-220,120,W-60,300], outline="black", width=2)
    draw.text((W-210,130), "PHOTO", fill="gray", font=font_small)

    y = 160
    draw.text((20,y), f"Name: {record['name']}", fill="black", font=font); y += 40
    draw.text((20,y), f"Father's Name: {record['father_name']}", fill="black", font=font); y += 40  # [6]
    draw.text((20,y), f"DOB: {record['dob']}", fill="black", font=font); y += 40
    draw.text((20,y), f"PAN: {record['identifier']}", fill="black", font=font_h1)  # [6]
    draw.text((20,H-40), "Form 49A reference format", fill="black", font=font_small)  # [9]
    im.save(img_path)

def write_pdf(pdf_path, record, doctype):
    # Writes a simple one-page PDF mirroring the image content. [2][9]
    c = canvas.Canvas(str(pdf_path), pagesize=A4)
    width, height = A4
    c.setFont("Helvetica-Bold", 18)
    c.drawString(20*mm, (height - 20*mm), f"{doctype} Document")
    c.setFont("Helvetica", 12)
    y = height - 35*mm
    c.drawString(20*mm, y, f"Name: {record['name']}"); y -= 10*mm
    if doctype == "AADHAAR":
        c.drawString(20*mm, y, f"DOB: {record['dob']}"); y -= 10*mm
        c.drawString(20*mm, y, f"Gender: {record['gender']}"); y -= 10*mm
        c.drawString(20*mm, y, f"Address: {record['address']}"); y -= 10*mm
        c.drawString(20*mm, y, f"Aadhaar No: {record['identifier']}"); y -= 10*mm  # [2]
    else:
        c.drawString(20*mm, y, f"Father's Name: {record['father_name']}"); y -= 10*mm  # [6]
        c.drawString(20*mm, y, f"DOB: {record['dob']}"); y -= 10*mm
        c.drawString(20*mm, y, f"PAN: {record['identifier']}"); y -= 10*mm  # [6]
    c.showPage()
    c.save()

def create_record(doctype):
    name = fake.name()
    dob, age = random_dob_age()
    gender = random_gender()
    address = format_address()
    father_name = fake.name_male()
    if doctype == "AADHAAR":
        identifier = generate_aadhaar_identifier()  # [2]
    else:
        identifier = generate_pan_identifier()  # [6]
    return {
        "doctype": doctype,
        "name": name,
        "dob": dob,
        "age": age,
        "gender": gender,
        "identifier": identifier,
        "address": address,
        "father_name": father_name
    }

def save_labels(rows):
    fieldnames = ["filename","doctype","name","dob","age","gender","identifier","address","father_name"]
    with open(LABELS_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in rows:
            writer.writerow(r)

def generate_docs(count_per_type=9):
    ensure_dirs()
    rows = []
    types = ["AADHAAR", "PAN"]
    idx = 1
    for doctype in types:
        for i in range(count_per_type):
            rec = create_record(doctype)
            base = f"{doctype.lower()}_{idx}"
            img_name = f"{base}.png"
            pdf_name = f"{base}.pdf"
            img_path = OUTPUT_DIR / img_name
            pdf_path = OUTPUT_DIR / pdf_name

            if doctype == "AADHAAR":
                draw_aadhaar_image(img_path, rec)  # [2]
            else:
                draw_pan_image(img_path, rec)  # [6]
            write_pdf(pdf_path, rec, doctype)  # [2][9]

            rows.append({**rec, "filename": img_name})
            rows.append({**rec, "filename": pdf_name})
            idx += 1
    save_labels(rows)
    return rows

def create_practice_aadhaar_samples():
    # Create 3 images with varied formatting for OCR practice. [1]
    for i in range(1,4):
        rec = create_record("AADHAAR")
        img_path = PRACTICE_DIR / f"practice_aadhaar_{i}.png"
        draw_aadhaar_image(img_path, rec)  # [2]

def main():
    generate_docs(count_per_type=9)  # 18 docs total (9 per type), images+pdf variants labeled. [2]
    create_practice_aadhaar_samples()  # [1]
    print(f"Generated synthetic docs in {OUTPUT_DIR} and labels at {LABELS_CSV}")  # [2]

if __name__ == "__main__":
    main()

