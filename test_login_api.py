import urllib.request
import urllib.error
import json

def run():
    url = "http://localhost:5173/api/v1/auth/login"
    data = {
        "email": "admin@primeclasses.in",
        "password": "Prime@2025"
    }
    req_body = json.dumps(data).encode("utf-8")
    
    req = urllib.request.Request(
        url,
        data=req_body,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Sending POST to {url}...")
    try:
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            body = response.read().decode("utf-8")
            print(f"Response Status: {status}")
            print(f"Response Body: {body[:300]}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(f"Error Body: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run()
