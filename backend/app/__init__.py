# Standard library imports
import os
import logging
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import get_config
from .routes import register_blueprints
from .utils.database import init_app as init_db_app, close_db

def create_app(config_name=None):
    """
    Creates and configures a Flask application instance.
    """
    app = Flask(__name__, instance_relative_config=True)

    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    # Load configuration from environment or default
    if config_name is None:
        config_name = os.getenv('FLASK_CONFIG', 'default')
    
    config = get_config(config_name)
    app.config.from_object(config)
    app.logger.info(f"Application configured with '{config_name}' settings.")

    # Configure CORS for the frontend
    frontend_url = app.config.get("FRONTEND_URL", "http://localhost:5173")
    CORS(app, resources={r"/api/*": {"origins": frontend_url}}, supports_credentials=True)

    # Initialize database
    init_db_app(app)

    # Initialize JWTManager
    JWTManager(app)

    # Register all blueprints
    register_blueprints(app)

    # Register teardown function to close DB connection
    app.teardown_appcontext(close_db)

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
        app.logger.info(f"Instance path created at: {app.instance_path}")
    except OSError:
        pass  # Already exists

    # Create upload folder if it doesn't exist
    upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads')
    if not os.path.isabs(upload_folder):
        upload_folder = os.path.join(app.instance_path, upload_folder)
    
    if not os.path.exists(upload_folder):
        try:
            os.makedirs(upload_folder)
            app.logger.info(f"Upload folder created at: {upload_folder}")
        except OSError as e:
            app.logger.error(f"Error creating upload folder: {e}")

    return app