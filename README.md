# AI-Powered KYC Verification & Fraud Detection System

This is a full-stack web application designed to automate the Know Your Customer (KYC) process using a powerful AI pipeline. It analyzes uploaded identity documents (like Aadhaar and PAN cards) to extract information, detect fraud, and provide a comprehensive review dashboard for administrators.

## 🏛️ Project Architecture

The application uses a microservice-oriented architecture to separate concerns and ensure scalability.

* **Frontend:** A modern, responsive single-page application built with **React (Vite)** and styled with **Tailwind CSS**.
* **Backend (Primary API):** A **Flask** application that handles user authentication, core business logic, document uploads, and serves as the main gateway for the frontend.
* **Backend (AI/Compliance Service):** A high-performance **FastAPI** microservice dedicated to running the computationally intensive AI pipeline, including OCR, fraud detection, and compliance checks.
* **Database:** **MongoDB** is used as the primary database for storing user data, document records, audit logs, and analysis results.

## ✨ Key Features

* **Secure User Authentication:** Full signup, login, and session management with OTP email verification.
* **AI Document Processing:** An end-to-end pipeline that performs:
    * **OCR:** Extracts text from uploaded images and PDFs.
    * **AI Name Matching:** Compares the user-entered name against the name extracted from the document using fuzzy logic.
    * **Document Integrity Analysis:** Scans for signs of digital tampering and manipulation.
* **Advanced Fraud Scoring:** A dynamic risk engine that assigns a fraud score based on multiple vectors (manipulation, data mismatch, duplicate submissions).
* **User Dashboard:** Allows users to upload documents, view their submission history, and see the detailed results of the AI analysis and the final admin decision.
* **Admin & Compliance Dashboards:** A secure, role-based interface for administrators to:
    * Review and approve/reject pending submissions with comments.
    * View system-wide analytics on document processing and risk trends.
    * Monitor a real-time audit trail of all significant system events.

---

## 🚀 Local Setup and Installation

Follow these instructions to get the project running on your local machine.

### Prerequisites

* **Node.js** (v18 or later)
* **Python** (v3.10 or later)
* **MongoDB** (running locally or via Atlas)
* **Tesseract-OCR Engine:** The OCR service will not work without this.
    * On macOS: `brew install tesseract`
    * On Ubuntu/Debian: `sudo apt-get install tesseract-ocr`

### 1. Backend Setup

1.  **Navigate to the `backend` directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a Python virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Create the environment file:**
    * Create a file named `.env` in the `backend` directory.
    * Copy the content below into it and replace the placeholder values with your own secure keys.

    ```
    # backend/.env
    FLASK_ENV=development
    SECRET_KEY=a_very_strong_random_secret_key_for_flask
    JWT_SECRET_KEY=another_very_strong_random_jwt_secret
    MONGO_URI=mongodb://localhost:27017/kyc_database

    # Default user credentials (created on first run)
    ADMIN_DEFAULT_PASSWORD=your_secure_admin_password
    TEST_DEFAULT_PASSWORD=your_secure_test_password

    # Server Ports
    FLASK_HOST=127.0.0.1
    FLASK_PORT=5001
    FASTAPI_HOST=127.0.0.1
    FASTAPI_PORT=8001
    
    # Frontend URL for CORS
    FRONTEND_URL=http://localhost:5173
    ```

5.  **Run the backend services:**
    ```bash
    python start_services.py
    ```
    *This will start both the Flask API (on port 5001) and the FastAPI service (on port 8001).*

### 2. Frontend Setup

1.  **Open a new terminal** and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    *The frontend will be available at `http://localhost:5173`.*

### 3. Usage

* Open `http://localhost:5173` in your browser.
* You can sign up as a new user or log in with the default admin credentials:
    * **Email:** `admin@kyc.com`
    * **Password:** The value you set for `ADMIN_DEFAULT_PASSWORD` in your `.env` file.