
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from datetime import timedelta, datetime
import random
from ..utils.audit_logger import log_audit_event

auth_bp = Blueprint('auth', __name__)

def _send_otp(user: User):
    """Generates, stores, and 'sends' an OTP."""
    otp_code = f"{random.randint(100000, 999999)}"
    user.otp = otp_code
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    user.save()
    # In a real app, this would use an email service (e.g., SendGrid, AWS SES)
    # For this project, we print it to the console for easy testing.
    print(f"--- OTP for {user.email}: {otp_code} ---")

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    """User login endpoint"""
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing email or password"}), 400
    
    user = User.find_by_email(data['email'])
    
    if not user or not user.check_password(data['password']):
        return jsonify({"error": "Invalid email or password"}), 401
        
    if not user.is_verified:
        _send_otp(user)
        return jsonify({"error": "Account not verified. A new OTP has been sent to your email.", "verification_required": True, "email": user.email}), 403
    
    # Update last login time
    user.update_last_login()
    log_audit_event(str(user._id), "USER_LOGIN_SUCCESS")
    
    # Create access token
    expires = timedelta(days=1)
    access_token = create_access_token(
        identity=str(user._id),
        additional_claims={"role": user.role},
        expires_delta=expires
    )
    
    return jsonify({
        "access_token": access_token,
        "user": user.to_dict()
    }), 200

@auth_bp.route('/signup', methods=['POST', 'OPTIONS'])
def signup():
    """User registration endpoint"""
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Check if user already exists
    existing_user = User.find_by_email(data['email'])
    if existing_user:
        return jsonify({"error": "Email already registered"}), 409
    
    # Create new user
    try:
        role = data.get('role', 'user')
        # Only allow admin role if explicitly permitted
        if role == 'admin' and not current_app.config.get('ALLOW_ADMIN_SIGNUP', False):
            role = 'user'
            
        user = User(
            name=data['name'],
            email=data['email'],
            password=data['password'],
            role=role,
            is_verified=False
        )
        user.save()
        _send_otp(user)
        log_audit_event(str(user._id), "USER_SIGNUP_INITIATED")
        
        return jsonify({
            "message": "User registered successfully. Please check your email for an OTP.",
            "email": user.email
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Error creating user: {e}")
        return jsonify({"error": "Registration failed"}), 500

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Verify OTP and activate user account."""
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')

    if not email or not otp:
        return jsonify({"error": "Email and OTP are required"}), 400

    user = User.find_by_email(email)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.otp != otp or user.otp_expires_at < datetime.utcnow():
        log_audit_event(str(user._id), "USER_OTP_VERIFY_FAILED")
        return jsonify({"error": "Invalid or expired OTP"}), 400

    user.is_verified = True
    user.otp = None
    user.otp_expires_at = None
    user.save()
    log_audit_event(str(user._id), "USER_VERIFIED_SUCCESS")
    
    # Create access token upon successful verification
    expires = timedelta(days=1)
    access_token = create_access_token(identity=str(user._id), additional_claims={"role": user.role}, expires_delta=expires)
    
    return jsonify({"message": "Account verified successfully!", "access_token": access_token, "user": user.to_dict()}), 200

@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    """Resend OTP to user's email."""
    data = request.get_json()
    email = data.get('email')
    user = User.find_by_email(email)
    if user and not user.is_verified:
        _send_otp(user)
        log_audit_event(str(user._id), "USER_OTP_RESEND_REQUEST")
        return jsonify({"message": "A new OTP has been sent."}), 200
    return jsonify({"error": "Invalid request or user already verified"}), 400

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user profile"""
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify(user.to_dict()), 200