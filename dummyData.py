import random
from faker import Faker

fake = Faker('en_IN')

# for generating aadhaar numbers in groups of 4 separated by space
def generate_aadhaar_num():
    aadhaar = "".join([str(random.randint(0, 9)) for _ in range(12)])
    return f"{aadhaar[:4]} {aadhaar[4:8]} {aadhaar[8:]}"

# dummy aadhar data
for i in range(20):
    print(f"Name: {fake.name()}")
    address = fake.address()
    dob_object = fake.date_of_birth(minimum_age=10, maximum_age=60)
    dob = dob_object.strftime('%d-%m-%Y')
    print(f"DOB: {dob}")
    gender = fake.random_element(elements=("Male", "Female"))
    print(f"Gender: {gender}")
    cleaned = address.replace('\n', ', ')
    print(f"Address: {cleaned}")
    print(f"Aadhaar Number: {generate_aadhaar_num()}")
    print("-" *40)