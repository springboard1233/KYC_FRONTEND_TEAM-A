
KYC Backend API - README (please do not change code in my branch , my contribution to team A backend Part)

This project provides backend APIs for Aadhaar KYC verification and user authentication using Flask and MongoDB. Frontend developers can use these endpoints to design the web pages (home.html, login.html, signup.html).

Project Structure
try/
│
├─ app.py               # Main Flask app
├─ uploads/             # Folder to store uploaded files
├─ templates/           # HTML templates
│   ├─ signup.html
│   ├─ login.html
│   └─ home.html
├─ ocr/                 # OCR-related scripts
│   ├─ f.py
│   └─ ocr_ex.py
└─ venv/                # Virtual environment (optional)


also Frontend Integration:

Pages & Endpoints

Signup Page (signup.html)

Form fields: username, email, password

API: POST /api/signup

On success → redirect to /login

Login Page (login.html)

Form fields: username, password

API: POST /api/login

On success → redirect to /home

Home Page (home.html)

Upload Aadhaar PDF/JPG

API to extract data: POST /api/extract

API to save data to database: POST /api/save

API to fetch all records (optional): GET /api/record # can be use  later in project

Notes for Frontend

Always send JSON data for signup/login and save API.

For file uploads, use multipart/form-data.

Redirect URLs should match the Flask routes:

Signup → /login

Login → /home

This README gives a clear outline for frontend developers to build the HTML pages and integrate with backend APIs.


dependecies :

Flask → for the web server and routing.

pymongo → to connect to MongoDB.

Werkzeug → for password hashing and security.

pdf2image → to convert PDF pages to images.

pytesseract → OCR engine to extract text from images.

Pillow → required by pdf2image and pytesseract for image handling.

cv2 .

Optional: If you used pyngrok for public demo then add it too.

please do not change code in my branch 
