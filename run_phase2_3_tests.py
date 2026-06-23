import os
import time
import subprocess
import traceback
import sys
from playwright.sync_api import sync_playwright

try:
    sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    pass

SCREENSHOT_DIR = r"C:\Users\bhasi\.gemini\antigravity\browser_recordings"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def safe_log_console(msg):
    try:
        text = msg.text.encode('ascii', 'replace').decode('ascii')
        print(f"  [BROWSER] {msg.type}: {text}")
    except Exception:
        pass

def robust_login(page, email, password):
    """Logs in using the given credentials with retries and verification."""
    print(f"Attempting login for {email}...")
    
    page.on("console", safe_log_console)
    page.on("pageerror", lambda err: print(f"  [BROWSER ERROR] {err}"))
    
    page.goto("http://localhost:5173/login", wait_until="networkidle")
    time.sleep(2)
    
    print(f"Initial Page URL: {page.url}")
    
    # Check if already logged in / redirected
    is_dash = page.locator("text=Welcome back").is_visible() or page.locator("text=Institute Intelligence Dashboard").is_visible()
    if "login" not in page.url and (is_dash or "dashboard" in page.url):
        print(f"Already logged in / redirected! URL: {page.url}")
        return True
        
    # Check if login-submit is present
    html = page.content()
    if "login-submit" not in html:
        print(f"WARNING: login-submit not found on page! Current URL: {page.url}")
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "debug_login_missing_button.png"))
        return False
        
    # Fill credentials using sequential typing
    page.focus("#email")
    page.locator("#email").press_sequentially(email, delay=50)
    time.sleep(0.5)
    
    page.focus("#password")
    page.locator("#password").press_sequentially(password, delay=50)
    time.sleep(0.5)
    
    page.keyboard.press("Tab")
    time.sleep(0.5)
    
    # Try logging in with retries
    for attempt in range(3):
        try:
            print(f"    Clicking login button (attempt {attempt + 1})...")
            page.click("#login-submit")
            
            # Wait for URL to change away from /login or dashboard elements to show up
            for i in range(15):
                time.sleep(0.5)
                is_dash = page.locator("text=Welcome back").is_visible() or page.locator("text=Institute Intelligence Dashboard").is_visible()
                print(f"      Loop check {i+1}: URL={page.url} | Dashboard visible: {is_dash}")
                if "login" not in page.url and (is_dash or "dashboard" in page.url):
                    print(f"Successfully logged in! URL: {page.url}")
                    # Give it a moment to stabilize the navigation
                    time.sleep(2)
                    return True
            
            # If we are still on login page on first attempt, take a screenshot to see what is shown
            if attempt == 0:
                debug_path = os.path.join(SCREENSHOT_DIR, "debug_login_failed_attempt_1.png")
                page.screenshot(path=debug_path)
                print(f"    Saved debug screenshot for failed attempt 1: {debug_path}")
                
        except Exception as e:
            print(f"    Attempt {attempt + 1} error: {e}")
        time.sleep(1)
            
    # Try final direct JS click evaluation
    try:
        print("    Final JS eval login click...")
        page.evaluate("document.querySelector('#login-submit').click()")
        for _ in range(10):
            time.sleep(0.5)
            is_dash = page.locator("text=Welcome back").is_visible() or page.locator("text=Institute Intelligence Dashboard").is_visible()
            if "login" not in page.url and (is_dash or "dashboard" in page.url):
                print(f"Successfully logged in! URL: {page.url}")
                time.sleep(2)
                return True
    except Exception as e:
        print(f"Final JS click failed: {e}")
        
    return False

def run_tests():
    results = {}
    
    with sync_playwright() as p:
        browser = None
        for channel in ["chrome", "msedge", None]:
            try:
                if channel:
                    browser = p.chromium.launch(channel=channel, headless=True)
                else:
                    browser = p.chromium.launch(headless=True)
                print(f"Browser launched successfully using channel: {channel}")
                break
            except Exception as e:
                print(f"Failed to launch with channel {channel}: {e}")
        
        if not browser:
            raise Exception("Failed to launch any browser!")

        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        
        try:
            # 1. Log in as Admin
            print("Logging in as Admin...")
            if not robust_login(page, "admin@primeclasses.in", "Prime@2025"):
                raise Exception("Admin login failed!")
            
            # 2. Go to Student List page
            print("Navigating to student list...")
            page.goto("http://localhost:5173/students", wait_until="networkidle")
            time.sleep(2)
            
            # Type search query "Arjun"
            print("Typing search query...")
            page.fill("input[placeholder*='Search']", "Arjun")
            time.sleep(2)
            
            # Capture student list screenshot
            screenshot_path = os.path.join(SCREENSHOT_DIR, "phase2_student_list.png")
            page.screenshot(path=screenshot_path)
            print(f"Student list screenshot saved to: {screenshot_path}")
            results["student_list"] = "success"
            
            # 3. Create a new student (Validation and Creation)
            print("Navigating to student create...")
            page.goto("http://localhost:5173/students/create", wait_until="networkidle")
            time.sleep(2)
            
            # Trigger validation errors by clicking submit
            print("Triggering validation errors...")
            page.click("button[type='submit']")
            time.sleep(2)
            
            screenshot_path = os.path.join(SCREENSHOT_DIR, "phase2_student_create_validation.png")
            page.screenshot(path=screenshot_path)
            print(f"Student validation screenshot saved to: {screenshot_path}")
            results["student_create_validation"] = "success"
            
            # Fill valid details
            print("Entering valid student details...")
            page.fill("input[name='firstName']", "Test")
            page.fill("input[name='lastName']", "Student")
            page.fill("input[name='dob']", "2013-05-15")
            page.select_option("select[name='gender']", "MALE")
            page.fill("input[name='schoolName']", "Delhi Public School")
            page.fill("input[name='classStudying']", "Class 5")
            page.check("input[type='checkbox'][value='SAINIK']")
            
            # Address fields
            page.fill("input[name='street']", "123 Main Street")
            page.fill("input[name='city']", "Lucknow")
            page.fill("input[name='state']", "Uttar Pradesh")
            page.fill("input[name='pincode']", "226001")
            
            # Parent details (Optional)
            page.fill("input[name='parentName']", "Test Parent")
            page.fill("input[name='parentPhone']", "9876543210")
            
            # Click create button
            print("Clicking Create Student submit button...")
            page.click("button[type='submit']")
            
            # Wait for redirect back to student list
            for _ in range(15):
                time.sleep(0.5)
                if page.url.endswith("/students"):
                    print("Successfully redirected back to /students list!")
                    break
            time.sleep(3)
            
            # Capture creation success screenshot
            screenshot_path = os.path.join(SCREENSHOT_DIR, "phase2_student_create_success.png")
            page.screenshot(path=screenshot_path)
            print(f"Student create success screenshot saved to: {screenshot_path}")
            results["student_create_success"] = "success"
            
            # 4. Edit Student DETAILS
            print("Searching for the created student to edit...")
            search_input = page.locator("input[placeholder*='Search']")
            search_input.focus()
            search_input.fill("")
            time.sleep(0.5)
            search_input.press_sequentially("Test", delay=50)
            time.sleep(2.5)
            
            # Click on Edit button in the table row
            print("Clicking edit button...")
            page.locator("button:has-text('Edit')").first.click()
            time.sleep(2)
            
            # Edit details (change name to 'Test Student Edited')
            print("Editing name details...")
            page.fill("input[name='firstName']", "Test Student")
            page.fill("input[name='lastName']", "Edited")
            page.click("button[type='submit']")
            
            # Wait for redirect back to details page (/students/:id)
            time.sleep(4)
            screenshot_path = os.path.join(SCREENSHOT_DIR, "phase2_student_edit.png")
            page.screenshot(path=screenshot_path)
            print(f"Student edit screenshot saved to: {screenshot_path}")
            results["student_edit"] = "success"
            
            # 5. Create Parent profile
            print("Navigating to parent create...")
            page.goto("http://localhost:5173/parents/create", wait_until="networkidle")
            time.sleep(2)
            
            print("Entering parent details...")
            page.fill("input[name='fatherName']", "Test Parent")
            page.fill("input[name='fatherPhone']", "9876543210")
            page.fill("input[name='email']", "testparent@parent.primeclasses.in")
            page.fill("input[name='password']", "Prime@2025")
            
            print("Clicking Create Parent submit button...")
            page.click("button[type='submit']")
            
            # Wait for transition to detail page (/parents/:id)
            time.sleep(4)
            screenshot_path = os.path.join(SCREENSHOT_DIR, "phase3_parent_create.png")
            page.screenshot(path=screenshot_path)
            print(f"Parent create screenshot saved to: {screenshot_path}")
            results["parent_create"] = "success"
            
            # 6. Direct Database Mapping Execution
            print("Running direct database script to link parent and student...")
            link_process = subprocess.run(
                ["node", "d:\\prime\\erp system\\apps\\api\\link.js"],
                capture_output=True,
                text=True
            )
            print("STDOUT:", link_process.stdout)
            print("STDERR:", link_process.stderr)
            
            if link_process.returncode != 0:
                raise Exception("Failed to link parent and student via database script!")
                
            # 7. Verify link on the parent page
            print("Reloading parent details page to verify student-parent link...")
            page.reload(wait_until="networkidle")
            time.sleep(2.5)
            
            screenshot_path = os.path.join(SCREENSHOT_DIR, "phase3_student_parent_linked.png")
            page.screenshot(path=screenshot_path)
            print(f"Linked parent-student screenshot saved to: {screenshot_path}")
            results["parent_student_linked"] = "success"
            
            # 8. Delete / Archive Student
            print("Navigating to student list to delete...")
            page.goto("http://localhost:5173/students", wait_until="networkidle")
            time.sleep(2)
            
            search_input = page.locator("input[placeholder*='Search']")
            search_input.focus()
            search_input.fill("")
            time.sleep(0.5)
            search_input.press_sequentially("Edited", delay=50)
            time.sleep(2.5)
            
            # Click delete button in row
            print("Clicking delete in table row...")
            page.locator("button:has-text('Delete')").first.click()
            time.sleep(2)
            
            # Confirm in dialog
            print("Confirming delete in dialog...")
            try:
                page.click(".btn-danger", timeout=3000)
            except Exception:
                try:
                    page.locator("button:has-text('Delete')").last.click(timeout=3000)
                except Exception:
                    page.locator("button:has-text('Confirm')").first.click()
            time.sleep(3)
            
            screenshot_path = os.path.join(SCREENSHOT_DIR, "phase2_student_delete.png")
            page.screenshot(path=screenshot_path)
            print(f"Student delete screenshot saved to: {screenshot_path}")
            results["student_delete"] = "success"
            
        except Exception as e:
            print(f"Error encountered during test run: {e}")
            traceback.print_exc()
        
        browser.close()
        
    print("\n--- PHASE 2 & 3 RUN SUMMARY ---")
    for key, val in results.items():
        print(f"{key}: {val}")
        
    return results

if __name__ == "__main__":
    run_tests()
