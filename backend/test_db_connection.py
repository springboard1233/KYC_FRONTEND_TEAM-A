#!/usr/bin/env python3
"""
Test MongoDB connection and database initialization
"""

import os
import sys
from datetime import datetime

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from utils.database import db
from models.user import EnhancedUser
from models.record import EnhancedRecord


def test_mongodb_connection():
    """Test MongoDB connection"""
    print("🔍 Testing MongoDB Connection...")
    print("=" * 50)

    try:
        from flask import Flask

        app = Flask(__name__)
        app.config["MONGO_URI"] = os.getenv(
            "MONGO_URI", "mongodb://localhost:27017/kyc_database"
        )
        app.config["SECRET_KEY"] = "test-secret-key"

        with app.app_context():
            db.init_app(app)

            # Test connection
            db.client.admin.command("ping")
            print("✅ MongoDB connection successful!")

            # Test database operations
            users_collection = db.get_collection("users")
            print(f"✅ Users collection accessible: {users_collection.name}")

            # Count existing users
            user_count = users_collection.count_documents({})
            print(f"📊 Existing users in database: {user_count}")

            return True

    except Exception as e:
        print(f"❌ MongoDB connection failed: {str(e)}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure MongoDB is running: mongod")
        print("2. Check if MongoDB is accessible on localhost:27017")
        print("3. Verify database name: kyc_database")
        return False


def test_user_operations():
    """Test user model operations"""
    print("\n🔍 Testing User Model Operations...")
    print("=" * 50)

    try:
        from flask import Flask

        app = Flask(__name__)
        app.config["MONGO_URI"] = os.getenv(
            "MONGO_URI", "mongodb://localhost:27017/kyc_database"
        )
        app.config["SECRET_KEY"] = "test-secret-key"

        with app.app_context():
            db.init_app(app)

            # Test creating a user
            test_user = EnhancedUser(
                name="Test User", email="test@example.com", password="testpassword123"
            )

            # Save user
            test_user.save()
            print("✅ User creation successful!")

            # Test finding user by email
            found_user = EnhancedUser.find_by_email("test@example.com")
            if found_user:
                print("✅ User retrieval by email successful!")
                print(f"   User ID: {found_user._id}")
                print(f"   User Name: {found_user.name}")
                print(f"   User Email: {found_user.email}")
                print(f"   User Role: {found_user.role}")

                # Test password verification
                if found_user.check_password("testpassword123"):
                    print("✅ Password verification successful!")
                else:
                    print("❌ Password verification failed!")
            else:
                print("❌ User retrieval by email failed!")

            # Clean up test user
            users_collection = db.get_collection("users")
            users_collection.delete_one({"email": "test@example.com"})
            print("✅ Test user cleaned up!")

            return True

    except Exception as e:
        print(f"❌ User operations failed: {str(e)}")
        return False


def create_default_users():
    """Create default users for testing"""
    print("\n🔍 Creating Default Users...")
    print("=" * 50)

    try:
        from flask import Flask

        app = Flask(__name__)
        app.config["MONGO_URI"] = os.getenv(
            "MONGO_URI", "mongodb://localhost:27017/kyc_database"
        )
        app.config["SECRET_KEY"] = "test-secret-key"

        with app.app_context():
            db.init_app(app)

            # Create admin user
            admin_user = EnhancedUser.find_by_email("admin@kyc.com")
            if not admin_user:
                admin_user = EnhancedUser(
                    name="Admin User",
                    email="admin@kyc.com",
                    password="admin123",
                    role="admin",
                )
                admin_user.save()
                print("✅ Admin user created: admin@kyc.com / admin123")
            else:
                print("ℹ️ Admin user already exists")

            # Create test user
            test_user = EnhancedUser.find_by_email("test@kyc.com")
            if not test_user:
                test_user = EnhancedUser(
                    name="Test User",
                    email="test@kyc.com",
                    password="test123",
                    role="user",
                )
                test_user.save()
                print("✅ Test user created: test@kyc.com / test123")
            else:
                print("ℹ️ Test user already exists")

            # List all users
            users_collection = db.get_collection("users")
            all_users = list(
                users_collection.find({}, {"name": 1, "email": 1, "role": 1})
            )
            print(f"\n📊 All users in database ({len(all_users)}):")
            for user in all_users:
                print(
                    f"   - {user.get('name', 'N/A')} ({user.get('email', 'N/A')}) - {user.get('role', 'N/A')}"
                )

            return True

    except Exception as e:
        print(f"❌ Default user creation failed: {str(e)}")
        return False


def main():
    """Main test function"""
    print("🚀 MongoDB Connection and User Model Test")
    print("=" * 50)

    # Test MongoDB connection
    if not test_mongodb_connection():
        print(
            "\n❌ MongoDB connection test failed. Please fix MongoDB connection first."
        )
        return

    # Test user operations
    if not test_user_operations():
        print("\n❌ User operations test failed.")
        return

    # Create default users
    if not create_default_users():
        print("\n❌ Default user creation failed.")
        return

    print("\n🎉 All tests passed!")
    print("\n🔑 Default credentials available:")
    print("   👨‍💼 Admin: admin@kyc.com / admin123")
    print("   👤 Test User: test@kyc.com / test123")
    print("\n🚀 You can now start the Flask server and test login!")


if __name__ == "__main__":
    main()

