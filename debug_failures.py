import time
import os
from playwright.sync_api import sync_playwright

SCREENSHOT_DIR = r"C:\Users\bhasi\.gemini\antigravity\browser_recordings"

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        page.on("console", lambda msg: print(f"CONSOLE: {msg.type}: {msg.text.encode('ascii', 'replace').decode('ascii')}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))
        
        # 1. Test parent login
        print("\n--- Parent Login Debug ---")
        page.goto("http://localhost:5173/login", wait_until="networkidle")
        page.fill("#email", "vikram.sharma@parent.primeclasses.in")
        page.fill("#password", "Prime@2025")
        page.click("#login-submit")
        
        # Wait up to 10 seconds to see if it changes URL
        for i in range(10):
            time.sleep(1)
            print(f"  {i+1}s: URL={page.url}")
            if "login" not in page.url:
                print("  Success redirect!")
                break
                
        # 2. Test forgot password
        print("\n--- Forgot Password Debug ---")
        page.goto("http://localhost:5173/forgot-password", wait_until="networkidle")
        page.fill("#reset-email", "arjun.sharma@student.primeclasses.in")
        page.click("#forgot-submit")
        
        # Wait up to 10 seconds and print state
        for i in range(10):
            time.sleep(1)
            html = page.content()
            has_otp_group = "otp-input-group" in html
            print(f"  {i+1}s: URL={page.url} | Has OTP input: {has_otp_group}")
            if has_otp_group:
                print("  Found OTP group!")
                break
                
        browser.close()

if __name__ == "__main__":
    run()
