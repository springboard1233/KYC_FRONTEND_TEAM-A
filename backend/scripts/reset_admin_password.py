#!/usr/bin/env python3
"""
Reset the admin user's password in MongoDB for the KYC system.
Usage: python reset_admin_password.py <new_password>
"""
import sys
from getpass import getpass
from app.models.user import User
from app import create_app

def main():
    app = create_app()
    with app.app_context():
        admin_email = "admin@kyc.com"
        if len(sys.argv) > 1:
            new_password = sys.argv[1]
        else:
            new_password = getpass("Enter new admin password: ")
        user = User.find_by_email(admin_email)
        if not user:
            print(f"Admin user {admin_email} not found.")
            return
        user.password_hash = User(password=new_password).password_hash
        user.is_verified = True
        user.save()
        print(f"Admin password reset to: {new_password}")

if __name__ == "__main__":
    main()
