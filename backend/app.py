from dotenv import load_dotenv
load_dotenv()

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.utils import secure_filename

from flask_bcrypt import Bcrypt
from auth import init_auth, register_user, login_user

from ocr import process_document
from verification import get_name_match_score, check_for_duplicates, is_valid_aadhaar, calculate_fraud_score

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

app.config['JSON_SORT_KEYS'] = False
CORS(app) 

app.config["MONGO_URI"] = os.environ.get("DATABASE_CLOUD")
app.config['SECRET_KEY'] = os.environ.get("JWT_SECRET", "default-secret-key")

mongo=PyMongo(app)

bcrypt=Bcrypt(app)
init_auth(mongo,bcrypt,app)

MOCK_KYC_SUBMISSIONS = [
    {"id": 1, "userName": "sneha", "docType": "Aadhaar", "status": "Pending", "fraudScore": 85},
    {"id": 2, "userName": "testuser", "docType": "PAN", "status": "Pending", "fraudScore": 15},
    {"id": 3, "userName": "admin", "docType": "Aadhaar", "status": "Approved", "fraudScore": 5},
    {"id": 4, "userName": "fraud_check", "docType": "Aadhaar", "status": "Rejected", "fraudScore": 95},
]

# Authentication Routes 
@app.route('/api/users/register', methods=['POST'])
def register_route():
    return register_user()

@app.route('/api/users/login', methods=['POST'])
def login_route():
    return login_user()


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# API Endpoint
@app.route('/api/extract', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
            
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            extracted_data = process_document(filepath)
            # print(jsonify(extracted_data),200)

            if not extracted_data:
                return jsonify({"error": "Could not extract details from the document"}), 500
            
            return jsonify(extracted_data), 200

        except Exception as e:
            return jsonify({"error": f"An internal error occurred: {e}"}), 500
        finally:
            if os.path.exists(filepath):
                os.remove(filepath)
    else:
        return jsonify({"error": "File type not allowed"}), 400
    

# Verification API for Users 

@app.route('/api/verify-document', methods=['POST'])
def verify_document_route():
    if 'file' not in request.files: return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    user_entered_name = request.form.get('userEnteredName')
    if not file or not user_entered_name: return jsonify({"error": "File or user name missing"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(app.config['UPLOAD_FOLDER']): os.makedirs(app.config['UPLOAD_FOLDER'])
    file.save(filepath)

    try:
        extracted_text = process_document(filepath)
        if "error" in extracted_text: return jsonify(extracted_text), 400
        
        doc_number = extracted_text.get("AadhaarNumber") or extracted_text.get("PANNumber")
        doc_status = "Valid" if is_valid_aadhaar(doc_number) else "Invalid"
        
        name_score = get_name_match_score(extracted_text.get("Name"), user_entered_name)
        is_duplicate = check_for_duplicates(doc_number)
        fraud_result = calculate_fraud_score(name_score, is_duplicate, doc_status)
        
        response = {
            "extractedText": extracted_text,
            "verification": {
                "documentStatus": doc_status, "nameMatchScore": name_score,
                "isDuplicate": is_duplicate, "fraudScore": fraud_result["score"],
                "reasons": fraud_result["reasons"]
            }
        }
        return jsonify(response), 200
    finally:
        if os.path.exists(filepath): os.remove(filepath)


# Admin Panel APIs
@app.route('/api/admin/submissions', methods=['GET'])
def get_submissions():
    return jsonify(MOCK_KYC_SUBMISSIONS)

@app.route('/api/admin/action', methods=['POST'])
def handle_action():
    data = request.json
    sub_id, action = data.get('id'), data.get('action')
    for sub in MOCK_KYC_SUBMISSIONS:
        if sub['id'] == sub_id:
            sub['status'] = 'Approved' if action == 'approve' else 'Rejected'
            return jsonify({"status": "success", "id": sub_id, "newStatus": sub['status']})
    return jsonify({"error": "Submission not found"}), 404


if __name__ == '__main__':
    app.run(debug=True, port=5001)