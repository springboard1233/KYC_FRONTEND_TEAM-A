# FILE: backend/run.py
from app import create_app
from app.models.user import User
import os

# Create the Flask app instance using the factory
app = create_app()

def initialize_default_users():
    """Initialize default users if they don't exist"""
    try:
        # Check if admin user exists
        admin_user = User.find_by_email("admin@kyc.com")
        if not admin_user:
            admin_user = User( 
                name="Admin User", 
                email="admin@kyc.com", 
                password="admin123", 
                role="admin", 
                is_verified=True
            )
            admin_user.save()
            app.logger.info(f"✅ Admin user created: {admin_user.to_dict()}")

        # Check if test user exists
        test_user = User.find_by_email("test@kyc.com")
        if not test_user:
            test_user = User( 
                name="Test User", 
                email="test@kyc.com", 
                password="test123", 
                role="user", 
                is_verified=True
            )
            test_user.save()
            app.logger.info("✅ Default test user created: test@kyc.com / test123")

    except Exception as e:
        app.logger.error(f"❌ Database initialization error: {e}")


if __name__ == "__main__":
    # Get configuration from environment or use defaults
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    
    # Initialize default users within the application context
    with app.app_context():
        initialize_default_users()
    
    # Print startup information
    print("=" * 50)
    print(f"🚀 KYC Fraud Detection API Server")
    print(f"🔗 URL: http://{host}:{port}")
    print(f"🛠️  Debug mode: {'ON' if debug else 'OFF'}")
    print("=" * 50)
    
    # Run the Flask app
    app.run(host=host, port=port, debug=debug)