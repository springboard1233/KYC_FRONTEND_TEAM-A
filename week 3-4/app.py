from flask import Flask, request, jsonify, render_template ,send_from_directory
import os, random, time
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import smtplib, ssl
from fuzzywuzzy import fuzz
from dotenv import load_dotenv

load_dotenv()  # loads .env file

#from dotenv import load_dotenv
#from sendgrid import SendGridAPIClient
#from sendgrid.helpers.mail import Mail


# Import your OCR functions
from ocr.ocr_ex import extract_rawtxt
from ocr.f import extract_details
from ocr.ocr_ex import extract_pantxt
from ocr.f import pan_details   # <-- create this for PAN


from utils.utils import verhoeff_check, validate_pan, hash_value, check_document, compute_fraud_score
from utils.jwt_session import *
from utils.admin import *

# ---------------- Flask App ----------------
app = Flask(__name__)
UPLOAD_FOLDER = "./uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------------- Load ENV ----------------
#load_dotenv()

# ---------------- MongoDB Setup ----------------
client = MongoClient("mongodb://localhost:27017/")
db = client['aadhaar_db']
aadhaar_collection = db['aadhaar_records']
pan_collection = db['pan_records']
users_collection = db['users']
otp_collection = db['otp_store']  # new collection for OTPs
kyc_col = db["kyc_submissions"]


#db = client["kyc_db"]


# ---------- HTML Page Routes ----------
@app.route('/')
def index():
    return render_template('main.html')

#@app.route('/login')
#def login_page():
#    return render_template('login.html')

@app.route('/home')
def home_page():
    return render_template('home.html')

@app.route('/admin-dashboard')
def admin_page():
    return render_template('admin_dashboard.html')

@app.route("/api/logout", methods=["POST"])
def logout():
    # For stateless JWT, nothing to do on server
    return jsonify({"message": "Logged out successfully"})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)




# ---------- Helper: Send Email with SendGrid ----------
#def send_email1(receiver_email, otp):
#    message = Mail(
#        from_email="shubham.19jdai037@gmail.com",   # must be verified in SendGrid
#        to_emails=receiver_email,
#        subject="Your OTP Code",
#        html_content=f"<strong>Your OTP is {otp}. It is valid for 2 minutes.</strong>"
#    )
#    try:
#        sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
#        response = sg.send(message)
#        print("Email sent:", response.status_code)  # should be 202
#        return True
#    except Exception as e:
#        print("Error sending email:", e)
#        return False

# save files to upload
from werkzeug.utils import secure_filename

def save_user_file(file, user_id, doc_type):
    # doc_type = 'aadhaar' or 'pan'
    filename = secure_filename(f"{user_id}_{doc_type}.jpg")
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    return filename , filepath






#  helper function to send email
def send_email(receiver_email, otp):
    sender_email = "shubham.19jdai037@gmail.com"   # <-- change to yours
    password = os.getenv("GMAIL_PASSWORD")  #  load from env          # Gmail app password
    message = f"Subject: Login OTP\n\nYour OTP is {otp}. It is valid for 2 minutes."

    context = ssl.create_default_context()
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, message)
    except Exception as e:
        print("Error sending email:", e)
        return False

    return True

    #with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
     #   server.login(sender_email, password)
      #  server.sendmail(sender_email, receiver_email, message)

from bson import ObjectId

def serialize_doc(doc):
    """Convert MongoDB ObjectId to string for JSON response"""
    if not doc:
        return doc
    doc = dict(doc)  # make a copy so we don’t mutate the original
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc






@app.route("/api/admin/stats", methods=["GET"])
@admin_required
def admin_stats():
    # 1. Total KYC submissions
    total = kyc_col.count_documents({})

    # 2. Status counts for pie chart
    status_counts = {
        "Pending": kyc_col.count_documents({"status": "Pending"}),
        "Approved": kyc_col.count_documents({"status": "Approved"}),
        "Rejected": kyc_col.count_documents({"status": "Rejected"})
    }

    # 3. Risk level counts for bar chart
    risk_levels_raw = list(kyc_col.aggregate([
        {"$group": {"_id": "$risk_level", "count": {"$sum": 1}}}
    ]))
    # Convert to dict and ensure all three levels exist
    risk_levels = {"Low": 0, "Medium": 0, "High": 0}
    for item in risk_levels_raw:
        if item["_id"] in risk_levels:
            risk_levels[item["_id"]] = item["count"]

    return jsonify({
        "total": total,
        "status_counts": status_counts,  # pie chart data
        "risk_levels": risk_levels       # bar chart data
    })


@app.route("/api/admin/users", methods=["GET"])
@admin_required
def admin_users():
    # Admin token check
    #auth_header = request.headers.get("Authorization")
    #if not auth_header or not auth_header.startswith("Bearer "):
    #    return jsonify({"error": "Missing or invalid token"}), 401

    #token = auth_header.split(" ")[1]
    #user_id, role = decode_token(token)

    #if role != "admin":
    #    return jsonify({"error": "Unauthorized"}), 403

    users = list(kyc_col.find({}, {
        "_id": 0,
        "user_id": 1,
        "user_entered_name": 1,
        "status": 1,
        "risk_level": 1,
        "overall_score": 1
    }))

    return jsonify(users)

@app.route("/api/admin/user/<user_id>", methods=["GET"])
@admin_required
def admin_user_details(user_id):
    # Admin token check
    #auth_header = request.headers.get("Authorization")
    #if not auth_header or not auth_header.startswith("Bearer "):
    #    return jsonify({"error": "Missing or invalid token"}), 401

    #token = auth_header.split(" ")[1]
    #_, role = decode_token(token)

    #if role != "admin":
    #    return jsonify({"error": "Unauthorized"}), 403

    user = kyc_col.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(serialize_doc(user))


@app.route("/api/admin/update_status", methods=["POST"])
@admin_required
def update_status():
    data = request.get_json()
    user_id = data.get("user_id")
    status = data.get("status")
    if status not in ["Pending", "Approved", "Rejected"]:
        return jsonify({"error": "Invalid status"}), 400

    result = kyc_col.update_one({"user_id": user_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"message": f"Status updated to {status}"})




# =============== Aadhaar APIs ===============
@app.route('/api/extract', methods=['POST'])
def extract_aadhaar():


     #  Extract JWT from header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid token"}), 401

    token = auth_header.split(" ")[1]

    user_id, role, username = decode_token(token)

    if not user_id:
        return jsonify({"error": "Token expired or invalid"}), 401


    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file uploaded"}), 400
    #file.save(filepath)


    doc_type = 'aadhaar'# or 'pan'
    filename = secure_filename(f"{user_id}_{doc_type}.jpg")
    filepath = os.path.join(UPLOAD_FOLDER,filename)
    file.save(filepath)



    #file = request.files['file']
    #filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    #file.save(filepath)

    #from ocr.ocr_ex import extract_rawtxt
    #from ocr.f import extract_details

    text = extract_rawtxt(filepath)
    data = extract_details(text)

    # Save extracted data in DB
    kyc_col.update_one(
        {"user_id": user_id},
        {"$set": {
            "aadhaar": data,
            "aadhaar_file_path": filepath,
            #"aadhaar_manipulation": issues,
            "status": "Pending"
        }},
        upsert=True
    )
    return jsonify(data)




import uuid

@app.route("/save_aadhaar", methods=["POST"])
def save_aadhaar():

    #  Extract JWT from header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid token"}), 401

    token = auth_header.split(" ")[1]

    user_id, role, username = decode_token(token)

    if not user_id:
        return jsonify({"error": "Token expired or invalid"}), 401


    #payload = decode_token(token)  # your helper
    #if not payload:
    #    return jsonify({"error": "Token expired or invalid"}), 401

    #user_id = payload["user_id"]   # take user_id from token
    #role = payload.get("role", "user")

    data = request.get_json()

    # Generate unique user_id if not present
    #user_id = data.get("user_id") or str(uuid.uuid4())

    aadhaar_num = data.get("AadhaarNumber")

    aadhaar_num = "".join(filter(str.isdigit, aadhaar_num))


    # 1. Validate Aadhaar
    is_valid = verhoeff_check(aadhaar_num)

    # 2. Hash & Duplicate Check
    aadhaar_hash = hash_value(aadhaar_num)
    duplicate = kyc_col.find_one({"aadhaar.number_hash": aadhaar_hash})


    r = kyc_col.find_one(
        {"user_id": user_id},
        {"aadhaar_file_path": 1, "_id": 0}   # only return this field
    )

    if not r or "aadhaar_file_path" not in r:
        return jsonify({"error ! aadhaar filepath not found"}) , 404

    filepath = r["aadhaar_file_path"]

     # Run file quality/issue check
    valid, issues = check_document(filepath)
    # 3. Manipulation issues (optional: can be passed from extract API)
    #issues = data.get("issues", [])
    ok = len(issues) == 0


    WEIGHTS = {
    "invalid": 35,
    "duplicate": 35,      # assign appropriate score
    "manipulation": 10}


    # 4. Fraud Score with Weights
    fraud_score = 0
    if not is_valid:
        fraud_score += WEIGHTS["invalid"]
    if duplicate:
        fraud_score += WEIGHTS["duplicate"]
    if not ok:
        fraud_score += WEIGHTS["manipulation"]

    # 5. Build Aadhaar object
    aadhaar_obj = {
        "aadhaar_name": data.get("Name", ""),
        "dob": data.get("DOB", ""),
        "gender": data.get("Gender", ""),
        "address": data.get("Address", ""),
        "number_hash": aadhaar_hash,
        "aadhaar_number":"XXXX XXXX " + aadhaar_num[-4:],
        "valid": is_valid,
        "duplicate_found": bool(duplicate),
        "fraud_score": fraud_score,
        "aadhar_manipulation": issues
    }

    # 6. Record to save
    record = {
        "user_id": user_id,
        "user_entered_name": username, #data.get("Name", ""),
        "aadhaar": aadhaar_obj,
        #"pan": None,
    }

    # 7. Recompute fraud score
    score, risk, all_issues = compute_fraud_score(aadhaar_obj, None)
    record["overall_score"] = score
    record["risk_level"] = risk
    record["status"] = "Pending"

    kyc_col.update_one({"user_id": user_id}, {"$set": record}, upsert=True)


    # Generate JWT
    #token = generate_token(user_id)

    return jsonify({
        "message": "Aadhaar saved",
        #"data": record
    })




#@app.route('/api/extract_pan', methods=['POST'])
#def extract_pan():
#    file = request.files['file']
#    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
#    file.save(filepath)

    #from ocr.ocr_ex import extract_pantxt
    #from ocr.f import pan_details

#    text = extract_pantxt(filepath)
#    data = pan_details(text)
#    return jsonify(data)

@app.route('/api/extract_pan', methods=['POST'])
def extract_pan():
    # 1. Extract JWT from header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid token"}), 401

    token = auth_header.split(" ")[1]
    user_id, role, username = decode_token(token)

    if not user_id:
        return jsonify({"error": "Token expired or invalid"}), 401

    # 2. Get uploaded file
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    # 3. Save file with unique name
    doc_type = 'pan'
    filename = secure_filename(f"{user_id}_{doc_type}.jpg")
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)



    # 4. Extract details using OCR
    text = extract_pantxt(filepath)       # your OCR function
    data = pan_details(text)              # your parser

    # 5. Save extracted data in DB
    kyc_col.update_one(
        {"user_id": user_id},
        {"$set": {
            "pan": data,
            "pan_file_path": filepath,
            #"pan_manipulation": issues,
            "status": "Pending"
        }},
        upsert=True
    )

    # 6. Return response
    return jsonify(data)

# helper funtion for name matching
def match_label(score):
    if score >= 85:
        return "Match"
    elif score >= 60:
        return "Partial Match"
    else:
        return "Not Match"


@app.route("/save_pan", methods=["POST"])
def save_pan():
    # Extract JWT from header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid token"}), 401

    token = auth_header.split(" ")[1]
    user_id, role, username = decode_token(token)
    #user_id = decode_token(token)
    if not user_id:
        return jsonify({"error": "Token expired or invalid"}), 401

    data = request.get_json()
    pan_num = data.get("PANNumber")

     # 1. Validate PAN
    is_valid = validate_pan(pan_num)

    # 2. Hash & Duplicate Check
    pan_hash = hash_value(pan_num)
    duplicate = kyc_col.find_one({"pan.number_hash": pan_hash})

    r = kyc_col.find_one(
        {"user_id": user_id},
        {"pan_file_path": 1, "_id": 0}   # only return this field
    )

    if not r or "pan_file_path" not in r:
        return jsonify({"error": "pancard File path not found"}), 404

    filepath = r["pan_file_path"]

    valid, issues = check_document(filepath)
    # 3. Manipulation issues
    #issues = data.get("issues", [])
    ok = len(issues) == 0

    WEIGHTS = {
    "invalid": 35,
    "duplicate": 35,      # assign appropriate score
    "manipulation": 10}

    # 4. Fraud Score with Weights
    fraud_score = 0
    if not is_valid:
        fraud_score += WEIGHTS["invalid"]
    if duplicate:
        fraud_score += WEIGHTS["duplicate"]
    if not ok:
        fraud_score += WEIGHTS["manipulation"]

    # 5. PAN object
    pan_obj = {
        "pan_name": data.get("Name", ""),
        "father_name": data.get("FatherName", ""),
        "number_hash": pan_hash,
        "pan_number" : "xxxxxxxx"+ pan_num[-2:],
        "valid": is_valid,
        "duplicate_found": bool(duplicate),
        "fraud_score": fraud_score,
        "pan_manipulation": issues
    }



    existing = kyc_col.find_one({"user_id": user_id})
    if not existing:
        return jsonify({"error": "No Aadhaar record found"}), 400

    existing["pan"] = pan_obj

    # 7. Fuzzy Name Matching
    user_entered_name = existing.get("user_entered_name", "")
    aadhaar_name = existing.get("aadhaar", {}).get("aadhaar_name", "")
    pan_name = pan_obj.get("pan_name", "")

    name_match_aadhaar = fuzz.token_set_ratio(user_entered_name, aadhaar_name)
    name_match_pan = fuzz.token_set_ratio(user_entered_name, pan_name)

    existing["username_matchWith_aadhaar"] = match_label(name_match_aadhaar)
    existing["username_matchWith_pan"] = match_label(name_match_pan)

    score, risk, _ = compute_fraud_score(existing.get("aadhaar"), pan_obj)
    existing["overall_score"] = score
    existing["risk_level"] = risk
    existing["status"] = "Pending"

    kyc_col.update_one({"user_id": user_id}, {"$set": existing}, upsert=True)

    #return jsonify({"message": "PAN saved", "data": existing})
    # Serialize before returning
    return jsonify({"message": "PAN saved"}) #"data": serialize_doc(existing)})




@app.route("/api/user/result", methods=["GET"])
def get_user_result():
    # 1. Extract JWT from header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid token"}), 401

    token = auth_header.split(" ")[1]
    user_id, role, username = decode_token(token)

    if not user_id:
        return jsonify({"error": "Token expired or invalid"}), 401

    # 2. Fetch KYC record from DB
    record = kyc_col.find_one({"user_id": user_id})
    if not record:
        return jsonify({"message": "No KYC record found"}), 404

    # Selectively pick fields to show user
    user_result = {
        "Name": record.get("user_entered_name", username),
        "DOB": record.get("aadhaar", {}).get("dob", ""),
        "Gender": record.get("aadhaar", {}).get("gender", ""),
        #"PAN": record.get("pan", {}).get("pan_number", ""),
        "Status": record.get("status", "Pending")
    }

    return jsonify({"message": "KYC result fetched", "data": user_result})

    # 3. Serialize ObjectId before returning
    #return jsonify({"message": "KYC result fetched", "data": serialize_doc(record)})


@app.route('/api/record', methods=['GET'])
def fetch_records():
    docs = list(aadhaar_collection.find({}, {"_id": 0}))
    return jsonify(docs)

# =============== SIGNUP APIs ===============

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    firstname = data.get("firstname")
    lastname = data.get("lastname")
    email = data.get("email")
    password = data.get("password")

    # Check if user with the email already exists
    if users_collection.find_one({"email": email}):
        return jsonify({"message": "Email already exists"}), 400

    otp = str(random.randint(100000, 999999))
    otp_doc = {
        "email": email,
        "firstname": firstname,
        "lastname": lastname,
        "password": generate_password_hash(password),
        "otp": otp,
        "time": time.time()
    }
    otp_collection.update_one({"email": email}, {"$set": otp_doc}, upsert=True)

    send_email(email, otp)
    return jsonify({"message": "OTP sent to email. Please verify."})


@app.route('/api/verify-otp', methods=['POST'])
def verify_signup_otp():
    data = request.get_json()
    email = data.get("email")
    otp = data.get("otp")

    record = otp_collection.find_one({"email": email})
    if not record:
        return jsonify({"message": "No OTP found"}), 400

    # Check OTP and expiry (2 minutes)
    if record["otp"] == otp and time.time() - record["time"] <= 120:
        users_collection.insert_one({
            "firstname": record["firstname"],
            "lastname": record["lastname"],
            "email": email,
            "password": record["password"],
            "role":"user"
        })
        otp_collection.delete_one({"email": email})
        return jsonify({"message": "Signup successful!"})

    return jsonify({"message": "Invalid or expired OTP"}), 400


@app.route('/api/resend-otp', methods=['POST'])
def resend_signup_otp():
    data = request.get_json()
    email = data.get("email")

    record = otp_collection.find_one({"email": email})
    if not record:
        return jsonify({"message": "No signup found"}), 400

    otp = str(random.randint(100000, 999999))
    otp_collection.update_one({"email": email}, {"$set": {"otp": otp, "time": time.time()}})
    send_email(email, otp)
    return jsonify({"message": "OTP resent successfully!"})

# =============== LOGIN APIs ===============

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    # Find user by email
    user = users_collection.find_one({"email": email})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid credentials"}), 401

    # Generate OTP and save to OTP collection
    otp = str(random.randint(100000, 999999))
    otp_collection.update_one(
        {"email": user["email"]},
        {"$set": {"otp": otp, "time": time.time()}},
        upsert=True
    )
    send_email(user["email"], otp)
    return jsonify({"message": "OTP sent to email. Please verify."})


@app.route('/api/login-verify-otp', methods=['POST'])
def verify_login_otp():
    data = request.get_json()
    email = data.get("email")
    otp = data.get("otp")

    record = otp_collection.find_one({"email": email})
    user = users_collection.find_one({"email": email})

    username = user['firstname']  + ' ' + user['lastname']

    if record and record["otp"] == otp and time.time() - record["time"] <= 120:
        otp_collection.delete_one({"email": email})

        token = generate_token(str(user["_id"]), user["role"], username)

        return jsonify({
            "message": "Login successful!",
            "token": token,
            "role": user["role"] # "username": user['firstname'] + ' ' + user['lastname']
        })
        #return jsonify({"message": "Login successful!"})
    return jsonify({"message": "Invalid or expired OTP"}), 400

@app.route('/api/resend-login-otp', methods=['POST'])
def resend_login_otp():
    data = request.get_json()
    email = data.get("email")

    record = otp_collection.find_one({"email": email})
    if not record:
        return jsonify({"message": "No login session found"}), 400

    otp = str(random.randint(100000, 999999))
    otp_collection.update_one({"email": email}, {"$set": {"otp": otp, "time": time.time()}})
    send_email(email, otp)
    return jsonify({"message": "Login OTP resent successfully!"})

# ---------- Run Flask ----------
if __name__ == '__main__':
    app.run(debug=True)
