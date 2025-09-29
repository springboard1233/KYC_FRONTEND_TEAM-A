#!/usr/bin/env python3
"""
Test script to debug login issues
"""

import requests
import json


def test_login():
    """Test login functionality"""
    base_url = "http://127.0.0.1:5000"

    # Test credentials
    test_credentials = [
        {"email": "admin@kyc.com", "password": "admin123"},
        {"email": "test@kyc.com", "password": "test123"},
        {"email": "admin@kyc.com", "password": "admin123"},  # Test twice
    ]

    print("🔍 Testing Login Functionality...")
    print("=" * 50)

    for i, creds in enumerate(test_credentials, 1):
        print(f"\n📝 Test {i}: {creds['email']}")

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
                print(f"   Access Token: {data.get('access_token', 'N/A')[:50]}...")
                print(f"   User: {data.get('user', {}).get('name', 'N/A')}")
            else:
                print(f"   ❌ Login Failed!")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data.get('error', 'Unknown error')}")
                except:
                    print(f"   Error: {response.text}")

        except requests.exceptions.ConnectionError:
            print(
                f"   ❌ Connection Error: Make sure the Flask server is running on {base_url}"
            )
        except requests.exceptions.Timeout:
            print(f"   ❌ Timeout Error: Server took too long to respond")
        except Exception as e:
            print(f"   ❌ Unexpected Error: {e}")

    print("\n" + "=" * 50)
    print("🔧 Troubleshooting Tips:")
    print("1. Make sure MongoDB is running: mongod")
    print("2. Make sure Flask server is running: python run.py")
    print("3. Check if default users were created during startup")
    print("4. Try creating a new user via signup endpoint")
    print("5. Check MongoDB collections for existing users")


def test_signup():
    """Test signup functionality"""
    base_url = "http://127.0.0.1:5000"

    print("\n🔍 Testing Signup Functionality...")
    print("=" * 50)

    test_user = {
        "name": "Test User",
        "email": "newuser@test.com",
        "password": "testpassword123",
    }

    try:
        response = requests.post(
            f"{base_url}/api/signup",
            json=test_user,
            headers={"Content-Type": "application/json"},
            timeout=10,
        )

        print(f"Status Code: {response.status_code}")

        if response.status_code == 201:
            data = response.json()
            print(f"✅ Signup Successful!")
            print(f"Access Token: {data.get('access_token', 'N/A')[:50]}...")
            print(f"User: {data.get('user', {}).get('name', 'N/A')}")
        else:
            print(f"❌ Signup Failed!")
            try:
                error_data = response.json()
                print(f"Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"Error: {response.text}")

    except requests.exceptions.ConnectionError:
        print(
            f"❌ Connection Error: Make sure the Flask server is running on {base_url}"
        )
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")


def test_health():
    """Test health endpoint"""
    base_url = "http://127.0.0.1:5000"

    print("\n🔍 Testing Health Endpoint...")
    print("=" * 50)

    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check Successful!")
            print(f"Status: {data.get('status', 'N/A')}")
            print(f"Message: {data.get('message', 'N/A')}")
        else:
            print(f"❌ Health Check Failed!")
            print(f"Response: {response.text}")

    except requests.exceptions.ConnectionError:
        print(
            f"❌ Connection Error: Make sure the Flask server is running on {base_url}"
        )
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")


if __name__ == "__main__":
    print("🚀 KYC Backend Login Test Script")
    print("=" * 50)

    # Test health first
    test_health()

    # Test signup
    test_signup()

    # Test login
    test_login()

    print("\n🎯 Next Steps:")
    print("1. If health check fails: Start Flask server with 'python run.py'")
    print("2. If signup fails: Check MongoDB connection")
    print("3. If login fails: Check if users exist in database")
    print("4. Check server logs for detailed error messages")

