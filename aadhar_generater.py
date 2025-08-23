from fpdf import FPDF
from faker import Faker
import random
import os

faker = Faker("en_IN")

# Create output folders
os.makedirs("data/raw_docs/aadhar", exist_ok=True)


# ---------------- AADHAAR GENERATOR ----------------
def create_aadhar(path):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.cell(200, 10, txt="Government of India", ln=1, align="C")
    pdf.cell(200, 10, txt="AADHAAR CARD", ln=1, align="C")
    pdf.ln(10)

    pdf.cell(0, 10, f"Name: {faker.name()}", ln=1)
    pdf.cell(0, 10, f"DOB: {faker.date_of_birth()}", ln=1)
    pdf.cell(0, 10, f"Gender: {random.choice(['Male','Female'])}", ln=1)
    pdf.cell(0, 10, f"AADHAAR No: {random.randint(1000,9999)} "
                     f"{random.randint(1000,9999)} "
                     f"{random.randint(1000,9999)}", ln=1)
    addr = faker.address().replace('\n', ', ')
    pdf.multi_cell(0, 10, f"Address: {addr}")

    pdf.output(path)

# ---------------- UTILITY BILL GENERATOR ----------------


# ---------------- GENERATE SAMPLE DOCS ----------------
for i in range(1,21):  # generate 20 Aadhaar
    create_aadhar(f"data/raw_docs/aadhar/aadhar_{i}.pdf")


print("Synthetic Aadhaar PDFs generated in raw_docs")
