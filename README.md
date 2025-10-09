# AI-Powered KYC Verification System

An intelligent, full-stack application designed to automate the Know Your Customer (KYC) process using a microservices architecture and AI-powered fraud detection.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Project Vision

This project addresses the challenges of traditional, manual KYC processes—which are slow, error-prone, and vulnerable to fraud—by building an intelligent automation platform. Our system transforms the manual workflow into a fast, secure, and data-driven process, improving user onboarding and strengthening compliance.

---

## Key Features

* **Full-Stack Microservices Architecture:** Built with a React frontend, a Node.js server for user data & auth, and a specialized Python (FastAPI) server for all AI/OCR processing.

* **AI Verification Pipeline:** Developed an AI engine using `scikit-learn` and `Pytesseract` that performs OCR, fuzzy name matching, and duplicate checks to generate a real-time fraud risk score.

* **Real-Time Compliance Hub:** Created a compliance hub using WebSockets (Socket.IO) that instantly displays new submissions, visualizes data with charts, and allows for immediate approval or rejection of cases.

* **Dynamic User Lifecycle:** Implemented a user dashboard that tracks the full KYC workflow, allowing users to submit documents and view their live status (`Pending`, `Approved`, `Rejected`) and submission history.

---

## Technology Stack

| Category                      | Technologies                                                                                             |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Frontend** | React.js, Redux Toolkit, React Router, Socket.IO Client, Axios, Recharts, Tailwind CSS (implied)        |
| **Backend (Node.js)** | Express.js, MongoDB (with Mongoose), JSON Web Tokens (JWT), Bcrypt, Socket.IO, Multer                      |
| **Backend (Python)** | FastAPI, Pytesseract, OpenCV, Scikit-learn, FuzzyWuzzy, Joblib                                           |
| **Database** | MongoDB Atlas                                                                                            |

---

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

* Node.js (v18 or later)
* Python (v3.9 or later) & `pip`
* A MongoDB Atlas account and a connection URI
* Tesseract OCR Engine installed on your machine

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Setup the Backend:**
    * Navigate to the backend directory: `cd backend`
    * Create a `.env` file and add your environment variables:
        ```env
        DATABASE_CLOUD="your_mongodb_connection_string_goes_here"
        JWT_SECRET="a_very_strong_and_secret_key_for_jwt"
        PORT=5000
        ```
    * Install Node.js dependencies: `npm install`
    * Install Python dependencies: `pip install -r requirements.txt`
    * **Train the AI Model (one-time setup):**
        ```bash
        python create_dataset.py
        python train_model.py
        ```

3.  **Setup the Frontend:**
    * Navigate to the frontend directory: `cd ../frontend`
    * Install dependencies: `npm install`

### Running the Application

You will need to run the three parts of the application in **three separate terminals**.

* **Terminal 1: Start the Node.js Server**
    ```bash
    cd backend
    node server.js
    ```
    *(Should be running on http://localhost:5000)*

* **Terminal 2: Start the Python AI Server**
    ```bash
    cd backend
    python main.py
    ```
    *(Should be running on http://localhost:5001)*

* **Terminal 3: Start the React Frontend**
    ```bash
    cd frontend
    npm start
    ```
    *(Your application will open at http://localhost:3000)*

---

## Future Work

* **Train Advanced Models:** Replace the simulated CNN/NLP models with real deep learning models to detect physical document tampering.
* **Integrate AML Lists:** Connect to external Anti-Money Laundering (AML) watchlists to check names against global databases.
* **Enhance Admin Controls:** Add advanced filtering, searching, and report exporting (CSV/PDF) to the admin dashboard.
* **Expand Document Support:** Add OCR parsers for more document types like Driving Licenses and Passports.

---

## License

This project is licensed under the MIT License.
