import os
import random
from faker import Faker
import qrcode
from PIL import Image, ImageDraw, ImageFont
import barcode
from barcode.writer import ImageWriter

def generate_barcode(aadhaar_number, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)   
    code128 = barcode.get('code128', aadhaar_number, writer=ImageWriter())
    filename = code128.save(path)
    return filename

import requests
from io import BytesIO
from PIL import Image, ImageDraw

def generate_photo(filename):

    gender = random.choice(["men", "women"])
    pic_id = random.randint(0, 99)
    avatar_url = f"https://randomuser.me/api/portraits/{gender}/{pic_id}.jpg"

    response = requests.get(avatar_url)
    img = Image.open(BytesIO(response.content))

    img = img.convert("RGB")

    img = img.resize((200, 250))

    photo_path = os.path.join(OUTPUT_PHOTOS, filename)
    img.save(photo_path, "JPEG")
    return photo_path



fake = Faker("en_IN")

OUTPUT_AADHAAR = "data/raw_docs/aadhaar_samples"
OUTPUT_UTILITY = "data/raw_docs/utility_samples"
OUTPUT_PHOTOS = "data/raw_docs/photos"
os.makedirs(OUTPUT_PHOTOS, exist_ok=True)

try:
    FONT_BOLD = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 32)
    FONT = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 28)
    SMALL_FONT = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 24)
    LARGE_BOLD = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 44)
except:
    FONT_BOLD = ImageFont.load_default()
    FONT = ImageFont.load_default()
    SMALL_FONT = ImageFont.load_default()

def generate_aadhaar_template(name, dob, gender, aadhaar_number, address, mobile, enroll_no, output_path):
    img = Image.new("RGB", (1000, 1400), "white")
    draw = ImageDraw.Draw(img)

    draw.rectangle([0, 0, 1000, 70], fill=(255, 153, 51))   # orange band
    draw.text((380, 15), "Government of India", font=FONT_BOLD, fill="black")

    draw.rectangle([0, 70, 1000, 120], fill=(19, 136, 8))   # green band
    draw.text((250, 80), "Unique Identification Authority of India", font=FONT_BOLD, fill="white")

    y = 150
    draw.text((280, y), f"Enrollment No.: {enroll_no}", font=FONT_BOLD, fill="black"); y += 50
    draw.text((100, y), "To", font=FONT, fill="black"); y += 40
    draw.text((100, y), f"{name}", font=FONT, fill="black"); y += 50
    for line in address.split(", "):
        draw.text((100, y), line, font=SMALL_FONT, fill="black")
        y += 30
    draw.text((100, y), f"Mobile: {mobile}", font=SMALL_FONT, fill="black"); y += 50

    os.makedirs("data/barcode", exist_ok=True)

    barcode_path = os.path.join("data/raw_docs/barcode", "temp_barcode")
    barcode_file = generate_barcode(aadhaar_number.replace(" ", ""), barcode_path)
    barcode_img = Image.open(barcode_file).resize((350, 80))
    img.paste(barcode_img, (50, y))

    qr = qrcode.make(aadhaar_number)
    qr = qr.resize((180, 180))
    img.paste(qr, (750, y-20))

    y += 150

    draw.text((300, y+20), "Your Aadhaar No.:", font=FONT, fill="black")
    draw.text((280, y+70), aadhaar_number, font=LARGE_BOLD, fill="black")

    y += 200
    draw.line([50, y, 950, y], fill="black", width=2)
    y += 40

    photo_filename = f"temp_photo_{random.randint(1000,9999)}.jpg"
    photo_path = generate_photo(photo_filename)   # returns full path
    photo = Image.open(photo_path)
    img.paste(photo, (60, y))

    draw.text((300, y), f"Name: {name}", font=FONT, fill="black"); y += 50
    draw.text((300, y), f"DOB: {dob}", font=FONT, fill="black"); y += 50
    draw.text((300, y), f"Gender: {gender}", font=FONT, fill="black"); y += 250

    disclaimer = "Aadhaar is proof of identity, not of citizenship or date of birth."
    draw.text((50, y), disclaimer, font=FONT_BOLD, fill="black")

    y += 80
    draw.text((350, y), aadhaar_number, font=FONT_BOLD, fill="black")

    img.save(output_path)

def generate_utility_template(name, address, account_number, bill_number, bill_date, due_date, amount, output_path):
    img = Image.new("RGB", (1000, 700), "white")
    draw = ImageDraw.Draw(img)

    draw.rectangle([0, 0, 1000, 100], fill=(200, 200, 255))
    draw.text((350, 30), "Electricity Supply Board", font=FONT_BOLD, fill="black")

    y = 130
    draw.text((50, y), f"Name: {name}", font=FONT, fill="black"); y += 40
    draw.text((50, y), "Address:", font=FONT, fill="black"); y += 40
    for line in address.split(", "):
        draw.text((100, y), line, font=SMALL_FONT, fill="black")
        y += 30

    y += 20
    draw.line([50, y, 950, y], fill="black", width=2)
    y += 20
    draw.text((50, y), f"Account No: {account_number}", font=FONT, fill="black"); y += 40
    draw.text((50, y), f"Bill No: {bill_number}", font=FONT, fill="black"); y += 40
    draw.text((50, y), f"Bill Date: {bill_date}", font=FONT, fill="black"); y += 40
    draw.text((50, y), f"Due Date: {due_date}", font=FONT, fill="black"); y += 40
    draw.text((50, y), f"Amount Due: ₹{amount}", font=FONT_BOLD, fill="red")

    img.save(output_path)

def generate_person(idx):
    name = fake.name()
    dob = fake.date_of_birth(minimum_age=18, maximum_age=60).strftime("%d-%m-%Y")
    gender = random.choice(["Male", "Female"])

    aadhaar_number = " ".join([str(random.randint(1000, 9999)) for _ in range(3)])

    # Structured address
    house_no = f"House No. {random.randint(1, 200)}"
    road_no = f"Road No. {random.randint(1, 20)}"
    colony = fake.street_name()
    city = fake.city()
    state = fake.state()
    pincode = fake.postcode()
    address = f"{house_no}, {road_no}, {colony}, {city}, {state} - {pincode}"

    mobile = fake.phone_number()
    enroll_no = f"{random.randint(1000,9999)}/{random.randint(100000,999999)}/{random.randint(10000,99999)}"

    account_number = str(random.randint(10000000, 99999999))
    bill_number = str(random.randint(500000, 999999))
    bill_date = fake.date_this_year().strftime("%d-%m-%Y")
    due_date = fake.date_this_year().strftime("%d-%m-%Y")
    amount = random.randint(500, 5000)

    aadhaar_path = os.path.join(OUTPUT_AADHAAR, f"person_{idx}_aadhaar.jpg")
    generate_aadhaar_template(name, dob, gender, aadhaar_number, address, mobile, enroll_no, aadhaar_path)

    utility_path = os.path.join(OUTPUT_UTILITY, f"person_{idx}_utility.jpg")
    generate_utility_template(name, address, account_number, bill_number, bill_date, due_date, amount, utility_path)

    return {
        "person_id": idx,
        "name": name,
        "dob": dob,
        "gender": gender,
        "address": address,
        "aadhaar_number": aadhaar_number,
        "mobile": mobile,
        "enrollment_number": enroll_no,
        "account_number": account_number,
        "bill_number": bill_number,
        "bill_date": bill_date,
        "due_date": due_date,
        "amount_due": amount,
        "aadhaar_file": aadhaar_path,
        "utility_file": utility_path
    }



def main():
    os.makedirs(OUTPUT_AADHAAR, exist_ok=True)
    os.makedirs(OUTPUT_UTILITY, exist_ok=True)

    persons = []
    for i in range(1, 21): 
        person = generate_person(i)
        persons.append(person)

    print("Generated structured Aadhaar + Utility Bills for 20 people")


if __name__ == "__main__":
    main()