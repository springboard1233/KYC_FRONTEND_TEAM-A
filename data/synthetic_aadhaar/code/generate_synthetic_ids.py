import os
import csv
import random
from faker import Faker
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

fake = Faker("en_IN")  # Indian context

def generate_aadhaar_pdf(output_path, name, dob, aadhaar, address):
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4

    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(200, height - 100, "Aadhaar Card (Synthetic)")

    # Fake fields
    c.setFont("Helvetica", 12)
    c.drawString(100, height - 160, f"Name: {name}")
    c.drawString(100, height - 190, f"DOB: {dob}")
    c.drawString(100, height - 220, f"Aadhaar No: {aadhaar}")
    c.drawString(100, height - 250, f"Address: {address}")

    c.showPage()
    c.save()

def generate_dataset(out_dir, num_samples=20):
    pdf_dir = os.path.join(out_dir, "pdfs")
    metadata_dir = os.path.join(out_dir, "metadata")
    os.makedirs(pdf_dir, exist_ok=True)
    os.makedirs(metadata_dir, exist_ok=True)

    metadata_file = os.path.join(metadata_dir, "synthetic_aadhaar_metadata.csv")

    with open(metadata_file, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["filename", "name", "dob", "aadhaar", "address"])

        for i in range(num_samples):
            name = fake.name()
            dob = fake.date_of_birth(minimum_age=18, maximum_age=80).strftime("%d-%m-%Y")
            aadhaar = "".join([str(random.randint(0, 9)) for _ in range(12)])
            address = fake.address().replace("\n", ", ")

            filename = f"aadhaar_{i+1}.pdf"
            filepath = os.path.join(pdf_dir, filename)

            generate_aadhaar_pdf(filepath, name, dob, aadhaar, address)
            writer.writerow([filename, name, dob, aadhaar, address])

    print(f"✅ Generated {num_samples} synthetic Aadhaar PDFs in {pdf_dir}")
    print(f"✅ Metadata saved at {metadata_file}")

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="synthetic_aadhaar", help="Output directory")
    parser.add_argument("--num", type=int, default=20, help="Number of PDFs")
    args = parser.parse_args()

    generate_dataset(args.out, args.num)
