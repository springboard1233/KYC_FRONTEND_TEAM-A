from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from datetime import timedelta
from ..models.user import User
from ..utils.database import db
import logging
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

# Store blacklisted tokens (in production, use Redis)
blacklisted_tokens = set()

@auth_bp.route('/api/signup', methods=['POST', 'OPTIONS'])
def signup():
    """User registration endpoint"""
    
    # Handle preflight requests
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        # Get request data
        data = request.get_json()
        logger.info(f"Signup request received: {data}")
        
        if not data:
            return jsonify({
                'error': 'Request body must be JSON',
                'message': 'Please provide user data'
            }), 400
        
        # Validate required fields
        required_fields = ['email', 'password']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'missing_fields': missing_fields,
                'message': f'Please provide: {", ".join(missing_fields)}'
            }), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip() or email.split('@')[0]
        
        # Validate email and password
        if not email:
            return jsonify({
                'error': 'Email is required',
                'message': 'Please provide a valid email address'
            }), 400
        
        if not password:
            return jsonify({
                'error': 'Password is required',
                'message': 'Please provide a password'
            }), 400
        
        # Create user
        try:
            user = User.create_user(db, email, password, name)
            logger.info(f"New user created: {email}")
            
            # Create JWT token
            access_token = create_access_token(
                identity=str(user._id),
                expires_delta=current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
            )
            
            return jsonify({
                'message': 'User created successfully',
                'user': user.to_dict(),
                'access_token': access_token,
                'token_type': 'Bearer'
            }), 201
            
        except ValueError as e:
            logger.warning(f"Signup validation error: {str(e)}")
            return jsonify({
                'error': str(e),
                'message': 'Please check your input and try again'
            }), 400
        except Exception as e:
            logger.error(f"Signup database error: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({
                'error': 'Failed to create user',
                'message': 'Database error occurred'
            }), 500
    
    except Exception as e:
        logger.error(f"Signup exception: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Internal server error',
            'message': 'Something went wrong'
        }), 500

@auth_bp.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    """User login endpoint"""
    
    # Handle preflight requests
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        # Get request data
        data = request.get_json()
        logger.info(f"Login request received for: {data.get('email', 'unknown')}")
        
        if not data:
            return jsonify({
                'error': 'Request body must be JSON',
                'message': 'Please provide login credentials'
            }), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validate inputs
        if not email or not password:
            return jsonify({
                'error': 'Email and password are required',
                'message': 'Please provide both email and password'
            }), 400
        
        # Find user
        user = User.find_by_email(db, email)
        
        if not user:
            logger.warning(f"Login failed - user not found: {email}")
            return jsonify({
                'error': 'Invalid email or password',
                'message': 'Please check your credentials'
            }), 401
        
        if not user.check_password(password):
            logger.warning(f"Login failed - wrong password: {email}")
            return jsonify({
                'error': 'Invalid email or password',
                'message': 'Please check your credentials'
            }), 401
        
        # Check if user is active
        if not user.is_active:
            return jsonify({
                'error': 'Account is deactivated',
                'message': 'Please contact support'
            }), 401
        
        # Update login info
        user.update_login_info()
        user.save(db)
        
        # Create JWT token
        access_token = create_access_token(
            identity=str(user._id),
            expires_delta=current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
        )
        
        logger.info(f"Successful login for user: {email}")
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'token_type': 'Bearer'
        }), 200
        
    except Exception as e:
        logger.error(f"Login exception: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Internal server error',
            'message': 'Something went wrong'
        }), 500

@auth_bp.route('/api/logout', methods=['POST', 'OPTIONS'])
@jwt_required()
def logout():
    """User logout endpoint"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        # Get JWT token ID and add to blacklist
        jti = get_jwt()['jti']
        blacklisted_tokens.add(jti)
        
        logger.info(f"User logged out: {get_jwt_identity()}")
        
        return jsonify({'message': 'Logout successful'}), 200
        
    except Exception as e:
        logger.error(f"Logout exception: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Logout failed'
        }), 500

@auth_bp.route('/api/me', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_current_user():
    """Get current user profile"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        user_id = get_jwt_identity()
        
        # Find user
        user = User.find_by_id(db, user_id)
        
        if not user:
            return jsonify({
                'error': 'User not found',
                'message': 'Please login again'
            }), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Get user exception: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Failed to get user info'
        }), 500

# JWT token blacklist check
def check_if_token_revoked(jwt_header, jwt_payload):
    """Check if JWT token is blacklisted"""
    jti = jwt_payload['jti']
    return jti in blacklisted_tokens
