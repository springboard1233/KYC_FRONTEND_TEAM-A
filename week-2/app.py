from flask import Flask, request, jsonify, render_template
import os
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
# from pyngrok import ngrok

# Import your OCR functions
from ocr.ocr_ex import extract_rawtxt
from ocr.f import extract_details
from ocr.ocr_ex import extract_pantxt
from ocr.f import pan_details   # <-- create this for PAN

app = Flask(__name__)

UPLOAD_FOLDER = "./uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------------- MongoDB Setup ----------------
client = MongoClient("mongodb://localhost:27017/")
db = client['aadhaar_db']
aadhaar_collection = db['aadhaar_records']
pan_collection = db['pan_records']   # <-- separate collection for PAN
users_collection = db['users']       # collection for user authentication

# ---------- HTML Page Routes ----------
@app.route('/')
def index():
    return render_template('signup.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/home')
def home_page():
    return render_template('home.html')


# ---------- Aadhaar API 1: Upload & Extract ----------
@app.route('/api/extract', methods=['POST'])
def extract_aadhaar():
    file = request.files['file']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    text = extract_rawtxt(filepath)
    data = extract_details(text)

    return jsonify(data)

# ---------- Aadhaar API 2: Save to DB ----------
@app.route('/api/save', methods=['POST'])
def save_aadhaar():
    data = request.get_json()

    doc = {
        "Name": data.get("Name"),
        "DOB": data.get("DOB"),
        "AadhaarNumber": data.get("AadhaarNumber"),
        "Gender": data.get("Gender"),
        "Address": data.get("Address")
    }

    aadhaar_collection.insert_one(doc)
    return jsonify({"message": "Aadhaar details saved successfully!"})


# ---------- PAN API 1: Upload & Extract ----------
@app.route('/api/extract_pan', methods=['POST'])
def extract_pan():
    file = request.files['file']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    text = extract_pantxt(filepath)   # reuse same OCR function
    data = pan_details(text)  # custom parser for PAN

    return jsonify(data)

# ---------- PAN API 2: Save to DB ----------
@app.route('/api/save_pan', methods=['POST'])
def save_pan():
    data = request.get_json()

    doc = {
        "Name": data.get("Name"),
        "FatherName": data.get("FatherName"),
        #"DOB": data.get("DOB"),
        "PANNumber": data.get("PANNumber")
    }

    pan_collection.insert_one(doc)
    return jsonify({"message": "PAN details saved successfully!"})


# ---------- API 3: Fetch Aadhaar Records ----------
@app.route('/api/record', methods=['GET'])
def fetch_records():
    docs = list(aadhaar_collection.find({}, {"_id": 0}))  # exclude Mongo _id
    return jsonify(docs)


# ---------- API 4: Sign Up ----------
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if users_collection.find_one({"username": username}):
        return jsonify({"message": "Username already exists"}), 400

    hashed_password = generate_password_hash(password)

    user_doc = {
        "username": username,
        "email": email,
        "password": hashed_password
    }
    users_collection.insert_one(user_doc)
    return jsonify({"message": "User registered successfully!"})


# ---------- API 5: Login ----------
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = users_collection.find_one({"username": username})
    if not user:
        return jsonify({"message": "Wrong username or password"}), 401

    if check_password_hash(user["password"], password):
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"message": "Wrong username or password"}), 401


# ---------- Run Flask ----------
if __name__ == '__main__':
    app.run(debug=True)
