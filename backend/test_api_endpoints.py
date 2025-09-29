
import requests
import json

def test_api_endpoints():
    """Test critical API endpoints"""
    base_url = "http://127.0.0.1:5000/api"
    
    print("\n🔍 Testing API Endpoints...")
    print("=" * 50)
    
    # Test login endpoint
    print("\n📝 Testing /login endpoint")
    try:
        login_response = requests.post(
            f"{base_url}/login",
            json={"email": "admin@kyc.com", "password": "admin123"},
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {login_response.status_code}")
        if login_response.status_code == 200:
            print("✅ Login endpoint working correctly")
            token = login_response.json().get('access_token')
            print(f"Token received: {token[:20]}...")
            
            # Test authenticated endpoint
            print("\n📝 Testing /me endpoint (authenticated)")
            me_response = requests.get(
                f"{base_url}/me",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            )
            print(f"Status Code: {me_response.status_code}")
            if me_response.status_code == 200:
                print("✅ Authenticated endpoint working correctly")
                print(f"User data: {json.dumps(me_response.json(), indent=2)}")
            else:
                print("❌ Authenticated endpoint failed")
                print(f"Error: {me_response.text}")
        else:
            print("❌ Login endpoint failed")
            print(f"Error: {login_response.text}")
    
    except Exception as e:
        print(f"❌ Error testing endpoints: {str(e)}")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    test_api_endpoints()
