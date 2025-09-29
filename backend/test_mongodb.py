#!/usr/bin/env python3
"""
Test script for MongoDB integration
Run this script to verify that MongoDB connection and models work correctly
"""

import os
import sys
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.database import db
from models.user import EnhancedUser
from models.record import EnhancedRecord


def test_mongodb_connection():
    """Test MongoDB connection"""
    print("🔍 Testing MongoDB connection...")
    try:
        # Initialize the database
        from flask import Flask

        app = Flask(__name__)
        app.config["SECRET_KEY"] = "test-secret"
        db.init_app(app)

        # Test connection
        with app.app_context():
            # Try to ping the database
            db.client.admin.command("ping")
            print("✅ MongoDB connection successful!")
            return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {str(e)}")
        return False


def test_user_model():
    """Test User model operations"""
    print("\n🔍 Testing User model...")
    try:
        # Create a test user
        test_user = EnhancedUser(
            name="Test User", email="test@example.com", password="testpassword123"
        )

        # Save user
        if test_user.save():
            print("✅ User created and saved successfully!")

            # Test finding user by email
            found_user = EnhancedUser.find_by_email("test@example.com")
            if found_user:
                print("✅ User found by email successfully!")

                # Test password verification
                if found_user.check_password("testpassword123"):
                    print("✅ Password verification successful!")
                else:
                    print("❌ Password verification failed!")

                # Clean up - delete test user
                if found_user.delete():
                    print("✅ Test user deleted successfully!")
                else:
                    print("❌ Failed to delete test user!")
            else:
                print("❌ User not found by email!")
        else:
            print("❌ Failed to save user!")

    except Exception as e:
        print(f"❌ User model test failed: {str(e)}")


def test_record_model():
    """Test Record model operations"""
    print("\n🔍 Testing Record model...")
    try:
        # Create a test record
        test_record = EnhancedRecord(
            user_id="test_user_id",
            document_type="aadhaar",
            filename="test_document.jpg",
            extracted_fields={"name": "Test Name", "aadhaar_number": "123456789012"},
            fraud_analysis={"fraud_score": 25.0, "risk_category": "low"},
            confidence_score=85.0,
        )

        # Save record
        if test_record.save_pending():
            print("✅ Record created and saved successfully!")

            # Test finding record by ID
            found_record = EnhancedRecord.find_by_id(test_record._id)
            if found_record:
                print("✅ Record found by ID successfully!")

                # Clean up - delete test record
                if found_record.delete():
                    print("✅ Test record deleted successfully!")
                else:
                    print("❌ Failed to delete test record!")
            else:
                print("❌ Record not found by ID!")
        else:
            print("❌ Failed to save record!")

    except Exception as e:
        print(f"❌ Record model test failed: {str(e)}")


def main():
    """Main test function"""
    print("🚀 Starting MongoDB Integration Tests...")
    print("=" * 50)

    # Test MongoDB connection
    if not test_mongodb_connection():
        print("\n❌ MongoDB connection test failed. Please ensure MongoDB is running.")
        return

    # Test User model
    test_user_model()

    # Test Record model
    test_record_model()

    print("\n" + "=" * 50)
    print("🎉 MongoDB integration tests completed!")
    print("\n📋 Next steps:")
    print("1. Ensure MongoDB is running on localhost:27017")
    print("2. Install required dependencies: pip install -r requirements.txt")
    print("3. Run the main application: python run.py")


if __name__ == "__main__":
    main()
