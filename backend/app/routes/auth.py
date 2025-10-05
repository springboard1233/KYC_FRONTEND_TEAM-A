# FILE: backend/app/routes/auth.py

import random
from datetime import timedelta, datetime
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from ..utils.audit_logger import log_audit_event

# Blueprint for authentication-related endpoints
auth_bp = Blueprint('auth', __name__)

def _send_otp(user: User):
    """
    Generates a 6-digit OTP, stores it in the user document with a 10-minute expiry,
    and simulates sending it by printing to the console.
    """
    otp_code = f"{random.randint(100000, 999999):06d}"
    user.otp = otp_code
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    user.save()
    
    # --- DEVELOPMENT NOTE ---
    # In a production environment, this would integrate with an email service
    # (e.g., SendGrid, AWS SES) to send the OTP to the user's email.
    # For local development, printing to the console is sufficient for testing.
    print(f"--- OTP for {user.email}: {otp_code} (Expires in 10 minutes) ---")

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Handles user login.
    Requires email and password.
    Returns a JWT access token and user data upon successful authentication.
    Returns a 403 error if the user's email is not yet verified.
    """
    try:
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Missing email or password"}), 400

        user = User.find_by_email(data['email'])

        if not user or not user.check_password(data['password']):
            # Use a generic message to prevent leaking information about which field was incorrect.
            return jsonify({"error": "Invalid email or password"}), 401

        if not user.is_verified:
            # If the account isn't verified, send a new OTP and inform the user.
            _send_otp(user)
            log_audit_event(str(user._id), "USER_LOGIN_FAILED_UNVERIFIED")
            return jsonify({
                "error": "Account not verified. A new OTP has been sent.",
                "verification_required": True,
                "email": user.email
            }), 403

        # On successful login, update the last_login timestamp
        user.update_last_login()
        log_audit_event(str(user._id), "USER_LOGIN_SUCCESS")

        # Create the JSON Web Token with the user's ID and role.
        access_token = create_access_token(
            identity=str(user._id),
            additional_claims={"role": user.role}
        )

        return jsonify({
            "access_token": access_token,
            "user": user.to_dict()
        }), 200
    except Exception as e:
        import traceback
        print("[LOGIN ERROR]", e)
        traceback.print_exc()
        current_app.logger.error(f"[LOGIN ERROR] {e}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Handles new user registration.
    Requires name, email, and password.
    Creates a new, unverified user and sends an OTP.
    """
    data = request.get_json()
    if not data or not all(k in data for k in ['name', 'email', 'password']):
        return jsonify({"error": "Missing required fields: name, email, password"}), 400
    
    if User.find_by_email(data['email']):
        # Return a 409 Conflict status code if the email is already in use.
        return jsonify({"error": "Email already registered"}), 409
    
    try:
        # Create a new user instance (password will be hashed by the model).
        user = User(
            name=data['name'],
            email=data['email'],
            password=data['password'],
            is_verified=False # New users must verify their email via OTP
        )
        user.save()
        _send_otp(user)
        log_audit_event(str(user._id), "USER_SIGNUP_INITIATED")
        
        return jsonify({
            "message": "User registered successfully. Please check your console for an OTP.",
            "email": user.email
        }), 201 # 201 Created is the appropriate status code here.
        
    except Exception as e:
        current_app.logger.error(f"Error during user creation: {e}")
        return jsonify({"error": "Registration failed due to a server error."}), 500

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """
    Verifies an OTP sent to a user's email to activate their account.
    On success, logs the user in immediately by returning a JWT.
    """
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')

    if not email or not otp:
        return jsonify({"error": "Email and OTP are required"}), 400

    user = User.find_by_email(email)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if OTP matches and has not expired.
    if user.otp != otp or (user.otp_expires_at and user.otp_expires_at < datetime.utcnow()):
        log_audit_event(str(user._id), "USER_OTP_VERIFY_FAILED")
        return jsonify({"error": "Invalid or expired OTP"}), 400

    # On successful verification, update the user's status.
    user.is_verified = True
    user.otp = None
    user.otp_expires_at = None
    user.save()
    log_audit_event(str(user._id), "USER_VERIFIED_SUCCESS")
    
    # Convenience: Log the user in immediately by issuing a token.
    access_token = create_access_token(identity=str(user._id), additional_claims={"role": user.role})
    
    return jsonify({
        "message": "Account verified successfully!", 
        "access_token": access_token, 
        "user": user.to_dict()
    }), 200

@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    """Allows a user to request a new OTP if the previous one expired."""
    data = request.get_json()
    email = data.get('email')

    user = User.find_by_email(email)
    if user and not user.is_verified:
        _send_otp(user)
        log_audit_event(str(user._id), "USER_OTP_RESEND_REQUEST")
        return jsonify({"message": "A new OTP has been sent."}), 200
        
    return jsonify({"error": "Invalid request or user is already verified"}), 400

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Fetches the profile of the currently authenticated user."""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify(user.to_dict()), 200