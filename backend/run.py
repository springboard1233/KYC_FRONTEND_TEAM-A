# FILE: backend/run.py

import os
import sys
import errno
from dotenv import load_dotenv
from app import create_app
from app.models.user import User

# Load environment variables from .env file at the very beginning
load_dotenv()

app = None  

def initialize_database():
    """
    Initializes the database within the application context.
    Creates default admin and test users if they don't exist.
    """
    global app
    with app.app_context():
        try:
            admin_email = "admin@kyc.com"
            admin_password = os.getenv("ADMIN_DEFAULT_PASSWORD")
            if not admin_password:
                app.logger.warning("⚠️ ADMIN_DEFAULT_PASSWORD not set in .env. Skipping admin user creation.")
            elif not User.find_by_email(admin_email):
                admin_user = User(
                    name="Admin User", email=admin_email, password=admin_password,
                    role="admin", is_verified=True
                )
                admin_user.save()
                app.logger.info(f"✅ Admin user created: {admin_user.to_dict()}")

            test_email = "test@kyc.com"
            test_password = os.getenv("TEST_DEFAULT_PASSWORD")
            if not test_password:
                app.logger.warning("⚠️ TEST_DEFAULT_PASSWORD not set in .env. Skipping test user creation.")
            elif not User.find_by_email(test_email):
                test_user = User(
                    name="Test User", email=test_email, password=test_password,
                    role="user", is_verified=True
                )
                test_user.save()
                app.logger.info(f"✅ Default test user created: {test_email}")
        except Exception as e:
            app.logger.error(f"❌ Database initialization error: {e}")
            app.logger.error("Ensure your MongoDB server is running and accessible via MONGO_URI in your .env file.")

if __name__ == "__main__":
    app = create_app()  # Create Flask application instance
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", 5001)) # Default to 5001 as per your logs
    debug = os.getenv("FLASK_DEBUG", "False").lower() == "true"
    
    # Only initialize DB in the main serving process (not the reloader parent)
    if not debug or os.environ.get("WERKZEUG_RUN_MAIN") == "true":
# ... existing code
        initialize_database()
    
    print("=" * 60)
    print("🚀 KYC Fraud Detection API Server")
    print(f"🔗 URL: http://{host}:{port}")
    print(f"🛠️  Debug mode: {'ON' if debug else 'OFF'}")
    print("=" * 60)
    
    # FIX: Add specific error handling for port conflicts (Address already in use).
    try:
        app.run(host=host, port=port, debug=debug)
    except OSError as e:
        # Error numbers for "Address already in use" are 98 on Linux and 48 on macOS.
        if e.errno == 98 or e.errno == 48:
            print("\n" + "=" * 60)
            print(f"❌ ERROR: Port {port} is already in use.")
            print("Please take one of the following actions:")
            print(f"1. Stop the other program using port {port}.")
            if sys.platform == "darwin":
                print("   - On macOS, this is often the 'AirPlay Receiver' service.")
                print("   - You can disable it in System Settings > General > AirDrop & Handoff.")
            print(f"2. Or, specify a different port by adding a line to your .env file:")
            print(f"   FLASK_PORT=5001")
            print("=" * 60)
        else:
            # Re-raise the exception if it's not the one we're handling
            raise e