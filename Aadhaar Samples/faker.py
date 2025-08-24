from faker import Faker
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
import random, os, csv

fake = Faker("en_IN")
os.makedirs("synthetic_aadhaar", exist_ok=True)

# CSV setup
csv_file = "synthetic_aadhaar/aadhaar_data.csv"
fields = ["Name", "DOB", "Gender", "Address", "Aadhaar_No"]
rows = []

def make_fake_aadhaar(filename):
    c = canvas.Canvas(filename, pagesize=A4)

    # Fake details
    name = fake.name()
    dob = fake.date_of_birth(minimum_age=18, maximum_age=60).strftime("%d-%m-%Y")
    gender = random.choice(["Male", "Female", "Other"])
    address = fake.address().replace("\n", ", ")
    aadhaar_no = " ".join([str(random.randint(1000, 9999)) for _ in range(3)])

    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(300, 800, "भारत सरकार / GOVERNMENT OF INDIA")

    # Insert placeholder photo
    c.rect(50, 650, 100, 120)  # photo box

    # User details
    c.setFont("Helvetica-Bold", 12)
    c.drawString(180, 730, f"Name: {name}")
    c.drawString(180, 710, f"DOB: {dob}")
    c.drawString(180, 690, f"Gender: {gender}")
    c.drawString(180, 670, f"Address: {address}")

    # Aadhaar Number
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(300, 620, aadhaar_no)

    # Footer
    c.setFont("Helvetica", 12)
    c.drawCentredString(300, 600, "मेरा आधार, मेरी पहचान")

    c.save()

    # Save record into CSV rows
    rows.append([name, dob, gender, address, aadhaar_no])


# Generate 20 Aadhaar PDFs
for i in range(1, 21):
    make_fake_aadhaar(f"synthetic_aadhaar/aadhaar_{i}.pdf")

# Write all data into CSV
with open(csv_file, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(fields)
    writer.writerows(rows)

print("✅ Generated 20 Aadhaar PDFs + aadhaar_data.csv")
