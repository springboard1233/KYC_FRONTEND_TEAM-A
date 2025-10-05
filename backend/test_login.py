#!/usr/bin/env python3
"""
Test script to debug login, signup, and health endpoints.
This script now reads the server configuration from environment variables.
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def get_base_url():
    """Constructs the base URL from environment variables with defaults."""
    host = os.getenv("FLASK_HOST", "127.0.0.1")
    port = os.getenv("FLASK_PORT", 5000)
    return f"http://{host}:{port}"

def test_login():
    """Test login functionality."""
    base_url = get_base_url()

    # Test credentials (passwords will be read from .env by the server)
    test_credentials = [
        {"email": "admin@kyc.com", "password": os.getenv("ADMIN_DEFAULT_PASSWORD", "admin123")},
        {"email": "test@kyc.com", "password": os.getenv("TEST_DEFAULT_PASSWORD", "test123")},
    ]

    print("🔍 Testing Login Functionality...")
    print("=" * 50)

    for i, creds in enumerate(test_credentials, 1):
        print(f"\n📝 Test {i}: Logging in as {creds['email']}")
        try:
            response = requests.post(
                f"{base_url}/api/login",
                json=creds,
                headers={"Content-Type": "application/json"},
                timeout=10,
            )
            print(f"   Status Code: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Login Successful!")
                print(f"   Access Token: {data.get('access_token', 'N/A')[:20]}...")
            else:
                print(f"   ❌ Login Failed!")
                try:
                    print(f"   Error: {response.json().get('error', 'Unknown error')}")
                except json.JSONDecodeError:
                    print(f"   Error: Could not decode JSON from response. Response text: {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Connection Error: {e}")
            print(f"      Is the Flask server running on {base_url}?")

    print("\n" + "=" * 50)

def test_signup():
    """Test signup functionality with a new, temporary user."""
    base_url = get_base_url()
    print("\n🔍 Testing Signup Functionality...")
    print("=" * 50)

    # Use a unique email for each test run to avoid "Email already registered" errors
    from time import time
    test_user = {
        "name": "Temp Test User",
        "email": f"newuser_{int(time())}@test.com",
        "password": "testpassword123",
    }
    print(f"📝 Attempting to sign up new user: {test_user['email']}")

    try:
        response = requests.post(
            f"{base_url}/api/signup",
            json=test_user,
            headers={"Content-Type": "application/json"},
            timeout=10,
        )
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 201:
            print(f"   ✅ Signup Successful!")
            print(f"   Message: {response.json().get('message', 'N/A')}")
        else:
            print(f"   ❌ Signup Failed!")
            try:
                print(f"   Error: {response.json().get('error', 'Unknown error')}")
            except json.JSONDecodeError:
                print(f"   Error: Could not decode JSON. Response text: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Connection Error: {e}")

def test_health():
    """Test health endpoint."""
    base_url = get_base_url()
    print("\n🔍 Testing Health Endpoint...")
    print("=" * 50)

    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"   ✅ Health Check Successful!")
            print(f"   Status: {response.json().get('status', 'N/A')}")
        else:
            print(f"   ❌ Health Check Failed!")
            print(f"   Response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Connection Error: {e}")

if __name__ == "__main__":
    print("🚀 KYC Backend Test Script")
    print("=" * 50)
    
    # It's crucial to test the health endpoint first to ensure the server is reachable.
    test_health()
    test_signup()
    test_login()

    print("\n🎯 Next Steps:")
    print("1. If health check fails, ensure 'python run.py' is running in another terminal.")
    print("2. If signup/login fails, check the Flask server's console for detailed error messages.")
    print("3. Verify your MongoDB connection and that default users were created.")