import time
import json
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        # Listen to requests/responses
        def handle_request(request):
            if "api" in request.url:
                print(f"--> REQUEST: {request.method} {request.url}")
                if request.post_data:
                    print(f"    Post Data: {request.post_data}")
                    
        def handle_response(response):
            if "api" in response.url:
                print(f"<-- RESPONSE: {response.status} {response.url}")
                try:
                    print(f"    Body: {response.text()[:200]}")
                except Exception:
                    pass

        page.on("request", handle_request)
        page.on("response", handle_response)
        
        print("Navigating to login...")
        page.goto("http://localhost:5173/login", wait_until="networkidle")
        
        print("Entering parent credentials...")
        page.fill("#email", "vikram.sharma@parent.primeclasses.in")
        page.fill("#password", "Prime@2025")
        
        print("Clicking login...")
        page.click("#login-submit")
        
        print("Waiting for response...")
        time.sleep(5)
        
        browser.close()

if __name__ == "__main__":
    run()
