from flask import Flask

def register_blueprints(app: Flask):
    """
    Registers all blueprints for the Flask application.
    """
    # Import and register the authentication blueprint
    from .auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api')

    # Import and register the admin blueprint
    from .admin import admin_bp
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Import and register the documents blueprint
    from .documents import documents_bp
    app.register_blueprint(documents_bp, url_prefix='/api/documents')

    # Import and register the records blueprint
    from .records import records_bp
    app.register_blueprint(records_bp, url_prefix='/api')

    # Import and register the OCR blueprint
    from .ocr import ocr_bp
    app.register_blueprint(ocr_bp, url_prefix='/api')
    app.logger.info("All blueprints have been registered.")
