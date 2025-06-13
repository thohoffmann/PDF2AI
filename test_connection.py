#!/usr/bin/env python3
"""
Test script to verify backend connectivity.
"""

import requests
import json
import time

def test_backend():
    """Test if backend is responding."""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing PDF2AI Backend Connection...")
    print("-" * 50)
    
    # Test endpoints
    endpoints = [
        "/",
        "/api/health",
        "/api/test"
    ]
    
    for endpoint in endpoints:
        url = f"{base_url}{endpoint}"
        try:
            print(f"📡 Testing: {url}")
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ SUCCESS: {response.status_code}")
                print(f"📄 Response: {json.dumps(data, indent=2)}")
            else:
                print(f"❌ ERROR: {response.status_code}")
                print(f"📄 Response: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ CONNECTION ERROR: Cannot connect to {url}")
            print("💡 Make sure the backend server is running on port 8000")
        except requests.exceptions.Timeout:
            print(f"⏰ TIMEOUT: Request to {url} timed out")
        except Exception as e:
            print(f"❌ UNEXPECTED ERROR: {e}")
        
        print("-" * 30)

if __name__ == "__main__":
    test_backend() 