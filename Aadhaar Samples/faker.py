from faker import Faker
from PIL import Image, ImageDraw
import random, os

fake = Faker("en_IN")
os.makedirs("synthetic_aadhaar_images", exist_ok=True)

def make_fake_aadhaar(filename):
    # Create blank white image
    img = Image.new("RGB", (600, 400), "white")
    draw = ImageDraw.Draw(img)

    # Fake details
    name = fake.name()
    dob = fake.date_of_birth(minimum_age=18, maximum_age=60).strftime("%d-%m-%Y")
    gender = random.choice(["Male", "Female", "Other"])
    address = fake.address().replace("\n", ", ")
    aadhaar_no = " ".join([str(random.randint(1000, 9999)) for _ in range(3)])

    # Header
    draw.text((150, 20), "भारत सरकार / GOVERNMENT OF INDIA", fill="black")

    # Placeholder photo box
    draw.rectangle([30, 100, 130, 220], outline="black", width=2)

    # User details
    draw.text((160, 100), f"Name: {name}", fill="black")
    draw.text((160, 130), f"DOB: {dob}", fill="black")
    draw.text((160, 160), f"Gender: {gender}", fill="black")
    draw.text((160, 190), f"Address: {address}", fill="black")

    # Aadhaar Number
    draw.text((200, 250), aadhaar_no, fill="black")

    # Footer
    draw.text((200, 300), "मेरा आधार, मेरी पहचान", fill="black")

    # Save as image
    img.save(filename)

# Generate 20 Aadhaar-style images
for i in range(1, 21):
    make_fake_aadhaar(f"synthetic_aadhaar_images/aadhaar_{i}.png")

print("✅ Generated 20 Aadhaar-style images in synthetic_aadhaar_images/")
from faker import Faker
from PIL import Image, ImageDraw
import random, os

fake = Faker("en_IN")
os.makedirs("synthetic_aadhaar_images", exist_ok=True)

def make_fake_aadhaar(filename):
    # Create blank white image
    img = Image.new("RGB", (600, 400), "white")
    draw = ImageDraw.Draw(img)

    # Fake details
    name = fake.name()
    dob = fake.date_of_birth(minimum_age=18, maximum_age=60).strftime("%d-%m-%Y")
    gender = random.choice(["Male", "Female", "Other"])
    address = fake.address().replace("\n", ", ")
    aadhaar_no = " ".join([str(random.randint(1000, 9999)) for _ in range(3)])

    # Header
    draw.text((150, 20), "भारत सरकार / GOVERNMENT OF INDIA", fill="black")

    # Placeholder photo box
    draw.rectangle([30, 100, 130, 220], outline="black", width=2)

    # User details
    draw.text((160, 100), f"Name: {name}", fill="black")
    draw.text((160, 130), f"DOB: {dob}", fill="black")
    draw.text((160, 160), f"Gender: {gender}", fill="black")
    draw.text((160, 190), f"Address: {address}", fill="black")

    # Aadhaar Number
    draw.text((200, 250), aadhaar_no, fill="black")

    # Footer
    draw.text((200, 300), "मेरा आधार, मेरी पहचान", fill="black")

    # Save as image
    img.save(filename)

# Generate 20 Aadhaar-style images
for i in range(1, 21):
    make_fake_aadhaar(f"synthetic_aadhaar_images/aadhaar_{i}.png")

print("✅ Generated 20 Aadhaar-style images in synthetic_aadhaar_images/")
