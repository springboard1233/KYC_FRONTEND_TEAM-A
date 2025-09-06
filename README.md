🚀 AI-Powered KYC Verification System

A full-stack KYC verification platform using React.js (frontend) and Flask + MongoDB (backend). It leverages AI-powered OCR (Tesseract) to extract data from Aadhaar & PAN cards, with a secure JWT-authenticated dashboard for record management and analytics.

✨ Features
🔐 Security & Auth

JWT-based authentication

Password hashing (Werkzeug)

Protected API endpoints & session management

📄 Document Processing

OCR for Aadhaar & PAN cards

Image/PDF support (PNG, JPG, JPEG)

Confidence scoring

Real-time progress indicators

📊 Dashboard & Records

Interactive dashboard with statistics

CRUD for records (view, delete, download)

Export options (CSV, JSON)

Bulk operations, filtering, real-time updates

🗄️ Data Management

MongoDB with in-memory fallback

Data validation & error handling

🛠️ Tech Stack

Backend: Flask, PyMongo, JWT, Tesseract OCR
Frontend: React 18+, TailwindCSS, React Router, Lucide React
Database: MongoDB

🚀 Quick Start
Prerequisites

Python 3.8+

Node.js 16+

MongoDB 4.4+

Git

Backend Setup
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
mongod --dbpath /path/to/db
python run.py

Frontend Setup
cd frontend
npm install
npm run dev

Access

🌐 Frontend: http://localhost:5173

🔧 API: http://localhost:5000

📊 Health: http://localhost:5000/health

📁 Project Structure
kyc-verification-system/
├── backend/
│   ├── run.py
│   ├── requirements.txt
│   └── utils/ (auth.py, ocr.py)
├── frontend/
│   ├── src/ (components, utils, App.js, index.js)
│   ├── package.json
│   └── tailwind.config.js
└── README.md

🔗 API Endpoints

Auth

POST /api/signup → Register

POST /api/login → Login

GET /api/me → Current user

Document Processing

POST /api/extract → OCR extract

POST /api/records/save → Save result

Records

GET /api/records → List records

GET /api/records/stats → Stats

DELETE /api/records/<id> → Delete

GET /api/records/export/csv → Export CSV

🧪 Testing

Backend

cd backend
pytest
curl http://localhost:5000/health


Frontend

cd frontend
npm test
npm run build

🔒 Security

JWT auth & token expiration

Password hashing

CORS protection

Input validation & sanitization
