import requests
import json

def test_export():
    # 1. Login to get token
    login_data = {"email": "minula@gmail.com", "password": "admin123"}
    r = requests.post("http://localhost:8080/api/v1/auth/login", json=login_data)
    if r.status_code != 200:
        print(f"Login failed: {r.status_code} {r.text}")
        return
        
    token = r.json().get("data", {}).get("token")
    if not token:
        print("No token in response")
        return
        
    print(f"Got token! Length: {len(token)}")
    
    # 2. Call export endpoint
    headers = {"Authorization": f"Bearer {token}"}
    r2 = requests.get("http://localhost:8080/api/v1/reports/export/sales", headers=headers)
    
    print(f"Export HTTP Status: {r2.status_code}")
    print(f"Export Headers: {r2.headers}")
    print(f"Content Length: {len(r2.content)}")
    print(f"Content preview: {r2.text[:200]}")

if __name__ == "__main__":
    test_export()
