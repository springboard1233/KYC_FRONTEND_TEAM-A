
from flask_jwt_extended import JWTManager
from .routes.records import records_bp
from .routes.health import health_bp
from flask import Flask, jsonify, request
import os
from .config import config_map
import logging
from flask_cors import CORS
from .utils.database import db

from .routes.admin import admin_bp
from .routes.auth import auth_bp
from .routes.ocr import ocr_bp
from .routes.audit import audit_bp
# from .routes.compliance import compliance_bp  # <-- Disabled to prevent conflict with FastAPI service


def create_app(config_name=None):
    """
    Application factory function to create and configure the Flask app.
    """
    app = Flask(__name__)

    # 1. Load Configuration
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")
    app.config.from_object(config_map[config_name])

    # Load allowed extensions from config
    app.config.setdefault("ALLOWED_EXTENSIONS", {"png", "jpg", "jpeg", "pdf"})

    # 2. Configure Logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    logger = logging.getLogger(__name__)

    # 3. Initialize Extensions
    CORS(
        app,
        resources={
            r"/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://localhost:5174",
                    "http://127.0.0.1:5173",
                    "http://127.0.0.1:5174",
                ]
            }
        },
        supports_credentials=True,
        allow_headers=[
            "Content-Type",
            "Authorization",
            "Access-Control-Allow-Credentials",
        ],
        methods=["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    )

    jwt = JWTManager(app)
    db.init_app(app)  # Initialize the database with the app

    # 4. Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(ocr_bp, url_prefix="/api")
    app.register_blueprint(records_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(audit_bp, url_prefix="/api")
    # app.register_blueprint(compliance_bp)  # <-- Disabled to prevent conflict with FastAPI service
    app.register_blueprint(health_bp)
    logger.info("✅ All blueprints registered successfully.")

    # 5. Create upload directory if it's defined in config
    if "UPLOAD_FOLDER" in app.config and app.config["UPLOAD_FOLDER"]:
        try:
            os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
            logger.info(f"Upload folder '{app.config['UPLOAD_FOLDER']}' is ready.")
        except OSError as e:
            logger.error(f"Error creating upload folder: {e}")

    # 6. Define JWT Error Handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify(
            {"error": "Token has expired", "message": "Please login again"}
        ), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify(
            {"error": "Invalid token", "message": "Signature verification failed"}
        ), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify(
            {
                "error": "Authorization token required",
                "message": "Request does not contain an access token",
            }
        ), 401

    # 7. CORS is handled by flask-cors extension above

    # 8. Handle OPTIONS requests explicitly
    @app.route("/", defaults={"path": ""}, methods=["OPTIONS"])
    @app.route("/<path:path>", methods=["OPTIONS"])
    def options_handler(path):
        return "", 200

    return app