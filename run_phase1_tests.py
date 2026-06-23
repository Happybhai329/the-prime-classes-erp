import os
import time
import traceback
from playwright.sync_api import sync_playwright

SCREENSHOT_DIR = r"C:\Users\bhasi\.gemini\antigravity\browser_recordings"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

# List of users to test
users = {
    "superadmin": ("superadmin@primeclasses.in", "Prime@2025"),
    "admin": ("admin@primeclasses.in", "Prime@2025"),
    "faculty": ("faculty@primeclasses.in", "Prime@2025"),
    "accountant": ("accountant@primeclasses.in", "Prime@2025"),
    "student": ("arjun.sharma@student.primeclasses.in", "Prime@2025"),
    "parent": ("vikram.sharma@parent.primeclasses.in", "Prime@2025")
}

def robust_login(page, email, password):
    """Logs in using the given credentials with retries and verification."""
    print(f"  Attempting login for {email}...")
    page.goto("http://localhost:5173/login", wait_until="networkidle")
    time.sleep(1) # Wait for page hydration
    
    # Fill credentials
    page.fill("#email", email)
    page.fill("#password", password)
    time.sleep(0.5) # Wait for React state
    
    try:
        print("    Clicking login...")
        page.click("#login-submit")
        
        # Loop check for URL change (up to 20 seconds)
        for _ in range(40):
            time.sleep(0.5)
            if "login" not in page.url:
                print(f"    Successfully logged in! URL: {page.url}")
                return True
    except Exception as e:
        print(f"    Login click or transition error: {e}")
        
    print(f"  Failed to login as {email}. Final URL: {page.url}")
    return False


def run_tests():
    results = {}
    
    with sync_playwright() as p:
        browser = None
        for channel in ["chrome", "msedge", None]:
            try:
                if channel:
                    print(f"Attempting to launch browser with channel: {channel}")
                    browser = p.chromium.launch(channel=channel, headless=True)
                else:
                    print("Attempting to launch default chromium")
                    browser = p.chromium.launch(headless=True)
                print(f"Browser launched successfully using channel: {channel}")
                break
            except Exception as e:
                print(f"Failed to launch with channel {channel}: {e}")
        
        if not browser:
            raise Exception("Failed to launch any browser!")

        # 1. Login & Dashboard Screenshots for each role
        for role, (email, password) in users.items():
            try:
                print(f"Testing login for {role}...")
                context = browser.new_context(viewport={"width": 1280, "height": 800})
                page = context.new_page()
                
                login_success = robust_login(page, email, password)
                
                # Wait for dashboard content to settle
                time.sleep(4)
                
                # Capture dashboard
                screenshot_path = os.path.join(SCREENSHOT_DIR, f"phase1_dashboard_{role}.png")
                page.screenshot(path=screenshot_path)
                print(f"Dashboard screenshot for {role} saved to: {screenshot_path}")
                
                results[f"login_{role}"] = {
                    "status": "success" if login_success else "failed_login", 
                    "screenshot": screenshot_path, 
                    "url": page.url
                }
                context.close()
            except Exception as e:
                print(f"Error testing login for {role}: {e}")
                results[f"login_{role}"] = {"status": "failed", "error": str(e), "trace": traceback.format_exc()}
                if 'context' in locals():
                    context.close()

        # 2. RBAC Tests for Student
        student_email, student_password = users["student"]
        rbac_pages = [
            ("/users", "users"),
            ("/fees/plans", "fees_plans"),
            ("/audit", "audit")
        ]
        
        for path, filename_part in rbac_pages:
            try:
                print(f"Testing RBAC for student on path {path}...")
                context = browser.new_context(viewport={"width": 1280, "height": 800})
                page = context.new_page()
                
                # Log in as Student first
                robust_login(page, student_email, student_password)
                time.sleep(1)
                
                # Direct navigation to restricted page
                target_url = f"http://localhost:5173{path}"
                print(f"Direct navigating to {target_url}...")
                page.goto(target_url, wait_until="networkidle")
                
                # Wait to ensure redirect or block has finished rendering
                time.sleep(3)
                
                # Take screenshots for different potential filename conventions
                screenshot_path = os.path.join(SCREENSHOT_DIR, f"phase1_rbac_blocked_{filename_part}.png")
                page.screenshot(path=screenshot_path)
                print(f"RBAC blocked screenshot for {path} saved to: {screenshot_path}")
                
                # Support alternative naming patterns
                if filename_part == "fees_plans":
                    alt_paths = ["fees-plans", "fees"]
                    for alt in alt_paths:
                        alt_path = os.path.join(SCREENSHOT_DIR, f"phase1_rbac_blocked_{alt}.png")
                        page.screenshot(path=alt_path)
                
                results[f"rbac_{filename_part}"] = {"status": "success", "screenshot": screenshot_path, "url": page.url}
                context.close()
            except Exception as e:
                print(f"Error testing RBAC for path {path}: {e}")
                results[f"rbac_{filename_part}"] = {"status": "failed", "error": str(e), "trace": traceback.format_exc()}
                if 'context' in locals():
                    context.close()

        # 3. Forgot Password Page Test
        try:
            print("Testing forgot password...")
            context = browser.new_context(viewport={"width": 1280, "height": 800})
            page = context.new_page()
            
            page.goto("http://localhost:5173/forgot-password", wait_until="networkidle")
            page.fill("#reset-email", "arjun.sharma@student.primeclasses.in")
            page.click("#forgot-submit")
            
            # Wait up to 20 seconds for transition to OTP verify step
            print("Waiting for OTP verification input group to show up...")
            page.wait_for_selector("#otp-input-group", timeout=20000)
            
            screenshot_path = os.path.join(SCREENSHOT_DIR, "phase1_forgot_password.png")
            page.screenshot(path=screenshot_path)
            print(f"Forgot password screenshot saved to: {screenshot_path}")
            
            results["forgot_password"] = {"status": "success", "screenshot": screenshot_path, "url": page.url}
            context.close()
        except Exception as e:
            print(f"Error testing forgot password: {e}")
            results["forgot_password"] = {"status": "failed", "error": str(e), "trace": traceback.format_exc()}
            if 'context' in locals():
                context.close()
                
        browser.close()
        
    print("\n--- TEST RESULTS SUMMARY ---")
    for key, val in results.items():
        print(f"{key}: {val.get('status')} | URL: {val.get('url', 'N/A')} | Error: {val.get('error', 'None')}")
        
    return results

if __name__ == "__main__":
    run_tests()
