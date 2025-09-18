from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
import re
from datetime import timedelta

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

def create_app():
    app = Flask(__name__)

    # Config
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET", "change-me")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=6)

    # CORS
    frontend_origin = os.getenv("FRONTEND_URL", "http://localhost:5173")
    CORS(app, resources={r"/api/*": {"origins": frontend_origin}})
    jwt = JWTManager(app)

    # Temporary in-memory store (email->user)
    users = {}

    # Health
    @app.get("/health")
    def health():
        return jsonify({"status": "ok"}), 200

    # Validators
    def valid_email(email: str) -> bool:
        return re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email) is not None

    def valid_password(pw: str) -> bool:
        return len(pw) >= 6

    # Signup
    @app.post("/api/signup")
    def signup():
        data = request.get_json(silent=True) or {}
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").lower().strip()
        password = data.get("password") or ""

        if not name:
            return jsonify({"error": "Name is required"}), 400
        if not valid_email(email):
            return jsonify({"error": "Valid email is required"}), 400
        if not valid_password(password):
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        if email in users:
            return jsonify({"error": "Email already registered"}), 409

        users[email] = {
            "name": name,
            "email": email,
            "password_hash": generate_password_hash(password)
        }
        return jsonify({"message": "Signup successful"}), 201

    # Login
    @app.post("/api/login")
    def login():
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").lower().strip()
        password = data.get("password") or ""

        user = users.get(email)
        if not user or not check_password_hash(user["password_hash"], password):
            return jsonify({"error": "Invalid credentials"}), 401

        # token with identity = user email and claims
        access_token = create_access_token(identity=email, additional_claims={
            "name": user["name"]
        })
        return jsonify({"access_token": access_token, "user": {"name": user["name"], "email": email}}), 200

    # Example protected route (for verification)
    @app.get("/api/me")
    @jwt_required()
    def me():
        email = get_jwt_identity()
        user = users.get(email)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"email": email, "name": user["name"]}), 200

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
