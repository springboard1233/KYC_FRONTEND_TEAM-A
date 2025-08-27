

import re

# cleaning_utils.py
def clean_pincode(pincode):
    # Keep only digits
    digits_only = re.sub(r"\D", "", pincode)  # Remove non-digit characters
    # Check length
    if len(digits_only) == 6:
        return digits_only
    else:
        return None  # Invalid PIN

def standardize_indian_address(address):
    #address = data["Address"]
    # Abbreviations
    abbreviations = {"Rd":"Road","St":"Street","Ln":"Lane","Ave":"Avenue","Bldg":"Building","Fl":"Floor","Apt":"Apartment","Soc":"Society","Sec":"Sector","PO":"Post Office","Ind":"Industrial","Pvt":"Private","Hsg":"Housing","Stn":"Station","Jn":"Junction","Marg":"Marg","Bazar":"Bazar"}

    # Replace abbreviations
    words = address.split()
    words = [abbreviations.get(w, w) for w in words]
    address = " ".join(words)

    # Remove extra spaces
    address = " ".join(address.split())

    # Extract PIN code
    # Clean the last word (assumed PIN code) and append back
    parts = address.split()
    if parts:
        cleaned_pin = clean_pincode(parts[-1])
        if cleaned_pin:
            parts[-1] = cleaned_pin  # Replace old PIN with cleaned one
        address = " ".join(parts)


    return  address


