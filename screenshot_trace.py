import time
import os
from playwright.sync_api import sync_playwright

SCREENSHOT_DIR = r"C:\Users\bhasi\.gemini\antigravity\browser_recordings"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        print("Navigating to login...")
        page.goto("http://localhost:5173/login", wait_until="networkidle")
        
        print("Entering parent credentials...")
        page.fill("#email", "vikram.sharma@parent.primeclasses.in")
        page.fill("#password", "Prime@2025")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "parent_trace_1_before_click.png"))
        
        print("Clicking login...")
        page.click("#login-submit")
        
        for i in range(1, 8):
            time.sleep(1)
            path = os.path.join(SCREENSHOT_DIR, f"parent_trace_{i+1}_after_click_{i}s.png")
            page.screenshot(path=path)
            print(f"Captured screenshot at {i}s: {path} | URL: {page.url}")
            
        browser.close()

if __name__ == "__main__":
    run()
