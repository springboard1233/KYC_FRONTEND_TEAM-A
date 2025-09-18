from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .config import config_map
from .utils.database import db
import os
import logging

def create_app(config_name=None):
    """Application factory pattern"""
    
    # Create Flask app
    app = Flask(__name__)
    
    # Load configuration
    config_name = config_name or os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config_map.get(config_name, config_map['default']))
    
    # Configure detailed logging
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Initialize extensions
    jwt = JWTManager(app)
    
    # Configure CORS
    CORS(app, 
         origins=["http://localhost:5173", "http://127.0.0.1:5173"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=True)
    
    # Initialize database
    with app.app_context():
        try:
            db.connect()
            print("✅ Database connected successfully")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
    
    # Handle preflight requests globally
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = jsonify({'message': 'OK'})
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
            response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization")
            response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
            return response
    
    # Root route
    @app.route('/')
    def index():
        """Root endpoint - API information"""
        return jsonify({
            'message': 'KYC Verification System API',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'health': '/health',
                'signup': '/api/signup',
                'login': '/api/login',
                'profile': '/api/me',
                'extract': '/api/extract',
                'records': '/api/records',
                'record_stats': '/api/records/stats'  # ← Make sure this is listed
            }
        })
    
    # Register blueprints - THIS IS CRITICAL
    from .routes.health import health_bp
    from .routes.auth import auth_bp, check_if_token_revoked
    from .routes.ocr import ocr_bp
    
    # ✅ MAKE SURE THIS LINE EXISTS:
    try:
        from .routes.records import records_bp
        app.register_blueprint(records_bp)
        print("✅ Records blueprint registered successfully")
    except ImportError as e:
        print(f"❌ Failed to import records blueprint: {e}")
        # Add temporary stats route to prevent 404
        @app.route('/api/records/stats', methods=['GET'])
        def temp_stats():
            return jsonify({
                'stats': {
                    'total_records': 0,
                    'aadhaar_count': 0,
                    'pan_count': 0,
                    'verified_count': 0,
                    'avg_confidence': 0
                }
            })
        print("✅ Temporary stats route added")
    
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(ocr_bp)
    
    # Create upload directory
    upload_folder = app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)
    
    # JWT configuration
    @jwt.token_in_blocklist_loader
    def check_if_token_is_revoked(jwt_header, jwt_payload):
        return check_if_token_revoked(jwt_header, jwt_payload)
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token has expired', 
            'message': 'Please login again',
            'code': 'TOKEN_EXPIRED'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'error': 'Invalid token', 
            'message': 'Please login again',
            'code': 'TOKEN_INVALID'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'error': 'Authorization token required', 
            'message': 'Please login to access this resource',
            'code': 'TOKEN_MISSING'
        }), 401
    
    return app
