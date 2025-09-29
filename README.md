# AI-Powered KYC Verification System

This is a full-stack web application for Know Your Customer (KYC) verification, featuring an AI-powered document processing and fraud detection pipeline. It includes a user-facing dashboard for document submission and an admin panel for review, compliance, and auditing.

## 🚀 Features

- **User Authentication**: Secure user registration and login with OTP email verification.
- **Document Upload**: Users can upload Aadhaar and PAN documents (PDF, JPG, PNG).
- **AI-Powered OCR**: Extracts data from documents using an advanced OCR engine.
- **Advanced Fraud Detection**:
  - Detects document tampering and manipulation using computer vision techniques.
  - Checks for duplicates and known fraudulent numbers against a database blacklist.
  - Provides a detailed fraud score and risk category (Low, Medium, High).
- **User Dashboard**:
  - View a list of all submitted documents and their current status (Pending, Approved, Rejected).
  - See detailed analytics and charts for personal verification history.
- **Admin Panel**:
  - Secure, role-protected dashboard for administrators.
  - Review queue for all pending user submissions.
  - Approve or reject documents with a single click.
  - Manage all users in the system and update their roles.
- **Compliance & Auditing**:
  - System-wide analytics dashboard for compliance officers.
  - Real-time fraud and compliance alerts.
  - Complete, paginated audit trail logging all critical user and admin actions.
  - Export all records to a CSV file for reporting.

## 🏛️ Architecture

The project is built on a modern microservices-oriented architecture:

- **Frontend**: A responsive single-page application built with **React** and **Vite**, using **Tailwind CSS** for styling and **Recharts** for data visualization.
- **Backend (Primary API)**: A **Flask** application that handles user authentication, document uploads, and core business logic.
- **Backend (Compliance Service)**: A standalone **FastAPI** service that runs the AI models, compliance rules engine, and fraud detection pipeline.
- **Database**: **MongoDB** is used as the primary data store for users, records, alerts, and audit logs.
- **Communication**: The frontend communicates with the backend services via two Vite server proxies for a seamless development experience.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Node.js** (v16 or later) and **npm**
- **Python** (v3.10 or later) and **pip**
- **MongoDB** (running locally or accessible via a connection URI)

---

## ⚙️ Setup & Installation

### 1. Backend Setup

Navigate to the `backend` directory and set up the Python environment.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
# On Windows
# python -m venv venv
# .\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create a .env file from the example
# (You can copy/paste the contents of .env.example into a new .env file)
# Make sure your MONGO_URI is correct if your database requires authentication.
2. Frontend Setup
In a separate terminal, navigate to the frontend directory and set up the Node.js environment.

Bash

# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# The project is pre-configured to use the backend proxy,
# so no .env file is strictly necessary for local development.
▶️ Running the Application
You will need three separate terminals running simultaneously.

Terminal 1: Start MongoDB
Ensure your MongoDB server is running. If it's not running as a background service, you may need to start it manually.

Bash

# Example command to start MongoDB
mongod
Terminal 2: Start Backend Services
Bash

# In the `backend` directory (with venv activated)
python start_services.py
This command starts both the Flask API (port 5000) and the FastAPI Compliance Service (port 8001).

Terminal 3: Start Frontend Server
Bash

# In the `frontend` directory
npm run dev
The application will be available at http://localhost:5173.

Default Admin Credentials
Email: admin@kyc.com

Password: admin123

