README (shubham sharma  contribution to team A backend Part)



This README explains exactly how frontend developers can integrate and call APIs.

note:- please do not change code in my branch , copy it into your own branch then change it according to your frontend requirements.




This project provides backend APIs for Aadhaar KYC verification and user authentication using Flask and MongoDB.

 Frontend developers can use these endpoints to design the web pages (home.html,main.html,admin_dashboard.html).

Project Structure
kyc_project/
│- requirements.txt
├─ app.py               # Main Flask app
├─ uploads/             # Folder to store uploaded files
├─ templates/           # HTML templates
│   ├─ main.html
│   ├─ home.html
│   └─ admin_dashboard.html
├─ ocr/                 # OCR-related scripts
│   ├─ f.py
│   └─ ocr_ex.py
I _ utils
        I_admin.py
        I_jwt.py
        I_utils.py
└─ venv/                # Virtual environment (create your own)


for Running the App:

Install required packages:

from flask import Flask, request, jsonify, render_template ,send_from_directory
import os, random, time
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import smtplib, ssl
from fuzzywuzzy import fuzz
from dotenv import load_dotenv
import jwt
import datetime

If you use new login and sign api then you need to generate your own gmailAppPassword as GMAIL_PASSWORD to send mails .
for jwt session you need to generate random password as SECRET_KEY.


Run the Flask app:

Open in browser:

http://127.0.0.1:5000/
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
For Frontend Integration:
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Pages & API Endpoints-



  


KYC Verification Backend API:

This backend provides APIs for User Signup/Login with OTP verification, KYC Document Upload & Verification (Aadhaar + PAN), and an Admin Dashboard for monitoring and status updates.

All APIs return JSON responses.
Authentication is done using JWT tokens (sent via Authorization: Bearer <token> header).

Authentication & Tokens
After successful Login-OTP verification, a JWT token is issued.

Frontend must include the token in all secured API requests:

Authorization: Bearer <your_jwt_token>
User APIs
1. Signup - Send OTP
POST /api/signup
Send user details and get OTP on email.

Request Body:

{
  "firstname": "Shubham",
  "lastname": "Sharma",
  "email": "test@example.com",
  "password": "mypassword"
}
Response:

{ "message": "OTP sent to email. Please verify." }

2. Verify Signup OTP
POST /api/verify-otp

Request Body:

{
  "email": "test@example.com",
  "otp": "123456"
}
Response:

{ "message": "Signup successful!" }


3. Resend Signup OTP
POST /api/resend-otp

Request Body:

{ "email": "test@example.com" }
Response:

{ "message": "OTP resent successfully!" }


4. Login - Send OTP
POST /api/login

Request Body:

{
  "email": "test@example.com",
  "password": "mypassword"
}
Response:

{ "message": "OTP sent to email. Please verify." }

5. Verify Login OTP
POST /api/login-verify-otp

Request Body:

{
  "email": "test@example.com",
  "otp": "123456"
}
Response:

{
  "message": "Login successful!",
  "token": "<JWT_TOKEN>",
  "role": "user"
}

6. Resend Login OTP
POST /api/resend-login-otp

Request Body:

{ "email": "test@example.com" }
Response:

{ "message": "Login OTP resent successfully!" }


7. Logout
POST /api/logout
(Frontend should just clear the stored token.)

Response:

{ "message": "Logged out successfully" }


 Aadhaar APIs
8. Extract Aadhaar Data (OCR)
POST /api/extract
Upload Aadhaar image and extract details.

Headers:
Authorization: Bearer <token>

Form Data:

file: <aadhaar_image.jpg>
Response:

{
  "Name": "Sivraj  Sharma",
  "DOB": "01-01-1995",
  "Gender": "Male",
  "Address": "Delhi, India"
}


9. Save Aadhaar
POST /save_aadhaar

Headers:
Authorization: Bearer <token>

Request Body:

{
  "AadhaarNumber": "123412341234",
  "Name": "shivraj Sharma",
  "DOB": "01-01-1995",
  "Gender": "Male",
  "Address": "Delhi, India"
}
Response:

{ "message": "Aadhaar saved" }


PAN APIs

10. Extract PAN Data (OCR)
POST /api/extract_pan

Headers:
Authorization: Bearer <token>

Form Data:

file: <pan_image.jpg>
Response:

{
  "Name": "Shivraj Sharma",
  "FatherName": "Rakesh Sharma",
  "PANNumber": "ABCDE1234F"
}
11. Save PAN
POST /save_pan

Headers:
Authorization: Bearer <token>

Request Body:

{
  "PANNumber": "ABCDE1234F",
  "Name": "Shivraj Sharma",
  "FatherName": "Rakesh Sharma"
}
Response:

{ "message": "PAN saved" }


 User KYC Result:-

12. Get KYC Result
GET /api/user/result

Headers:
Authorization: Bearer <token>

Response:

{
  "message": "KYC result fetched",
  "data": {
    "Name": "Shivraj Sharma",
    "DOB": "01-01-1995",
    "Gender": "Male",
    "Status": "Pending"
  }
}

 Admin APIs
 These require Admin role JWT

13. Get Stats
GET /api/admin/stats

Response:

{
  "total": 5,
  "status_counts": { "Pending": 3, "Approved": 1, "Rejected": 1 },
  "risk_levels": { "Low": 2, "Medium": 2, "High": 1 }
}


14. Get All Users (Summary)
GET /api/admin/users

Response:

[
  {
    "user_id": "abc123",
    "user_entered_name": "Shubham Sharma",
    "status": "Pending",
    "risk_level": "Medium",
    "overall_score": 60
  }
]


15. Get individual User Details
GET /api/admin/user/<user_id>

Response:

{
  "user_id": "abc123",
  "aadhaar": { ... },
  "pan": { ... },
  "status": "Pending",
  "risk_level": "High",
  "overall_score": 75
}


16. Update User Status
POST /api/admin/update_status

Request Body:

{
  "user_id": "abc123",
  "status": "Approved"
}
Response:

{ "message": "Status updated to Approved" }


This README gives a clear outline for frontend developers to build the frontend pages and integrate with backend APIs.

please do not change code in my branch , copy it into your own branch then change it according to your frontend requirements.
