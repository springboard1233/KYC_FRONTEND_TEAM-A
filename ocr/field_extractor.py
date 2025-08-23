

# field_extractor.py


def parse_fields(text):
  # Sample OCR text
  # Split text into lines
  lines = text.split("\n")  # Splits text at every newline
  data = {}

  for line in lines:
      line = line.strip()  # Remove leading/trailing spaces
      if line.startswith("Name:"):
          data["Name"] = line.split("Name:")[1].strip().title()
      elif line.startswith("DOB:"):
          data["DOB"] = line.split("DOB:")[1].strip().title()
      elif line.startswith("Gender:"):
          data["Gender"] = line.split("Gender:")[1].strip().title()
      elif line.startswith("AADHAAR No:"):
          data["Aadhaar_No"] = line.split("AADHAAR No:")[1].strip().title()
      elif line.startswith("Address:"):
          data["Address"] = line.split("Address:")[1].strip().title()


  return data
