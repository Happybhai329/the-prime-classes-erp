import time
import os
from playwright.sync_api import sync_playwright

SCREENSHOT_DIR = r"C:\Users\bhasi\.gemini\antigravity\browser_recordings"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        page = browser.new_page()
        
        print("Navigating to login page...")
        page.goto("http://localhost:5173/login", wait_until="networkidle")
        time.sleep(2)
        
        # Take an initial screenshot
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "debug_login_initial.png"))
        print("Saved initial login page screenshot.")
        
        # Try to locate the elements
        email_loc = page.locator("#email")
        password_loc = page.locator("#password")
        submit_loc = page.locator("#login-submit")
        
        print(f"Email input visible: {email_loc.is_visible()}")
        print(f"Password input visible: {password_loc.is_visible()}")
        print(f"Submit button visible: {submit_loc.is_visible()}")
        
        try:
            print("Filling email...")
            email_loc.fill("admin@primeclasses.in")
            print("Filling password...")
            password_loc.fill("Prime@2025")
            
            print("Clicking submit button...")
            submit_loc.click(timeout=5000)
            print("Click completed!")
        except Exception as e:
            print(f"Click failed: {e}")
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "debug_login_click_failed.png"))
            print("Saved click failure screenshot.")
            
        print(f"Final URL: {page.url}")
        browser.close()

if __name__ == "__main__":
    run()
