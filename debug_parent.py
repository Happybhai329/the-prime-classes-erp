import time
import sys
from playwright.sync_api import sync_playwright

# Ensure stdout supports UTF-8 to prevent UnicodeEncodeError in console output
try:
    sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    pass

def log_console(msg):
    try:
        text = msg.text.encode('ascii', 'replace').decode('ascii')
        print(f"BROWSER CONSOLE: {msg.type}: {text}")
    except Exception:
        pass

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        page.on("console", log_console)
        page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err}"))
        
        print("Navigating to login...")
        page.goto("http://localhost:5173/login", wait_until="networkidle")
        
        print("Entering parent credentials...")
        page.fill("#email", "vikram.sharma@parent.primeclasses.in")
        page.fill("#password", "Prime@2025")
        
        print("Clicking login...")
        page.click("#login-submit")
        
        print("Waiting for response...")
        time.sleep(5)
        
        print(f"Final URL: {page.url}")
        
        # Check if there's any visible error message on the page
        error_text = page.locator(".text-danger-500").all_text_contents()
        if error_text:
            print(f"Input errors: {error_text}")
            
        # Get toast contents if any
        # Toast might be in standard react-hot-toast containers
        html = page.content()
        if "Invalid" in html or "error" in html.lower() or "fail" in html.lower() or "unauthorized" in html.lower():
            print("Found potential error strings in page HTML.")
            # Print a snippet containing those errors
            for line in html.splitlines():
                if any(x in line.lower() for x in ["invalid", "toast", "error", "alert"]):
                    print(f"HTML Line: {line.strip()[:150]}")
            
        browser.close()

if __name__ == "__main__":
    run()
