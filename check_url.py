from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        page = browser.new_page()
        print("Visiting login page...")
        try:
            page.goto("http://localhost:5173/login", wait_until="networkidle")
            print("URL:", page.url)
            print("Title:", page.title())
            html = page.content()
            print("HTML Length:", len(html))
            if "login-submit" in html:
                print("Found login-submit in HTML!")
            else:
                print("Could NOT find login-submit in HTML!")
                print("First 500 chars of body:", page.locator("body").inner_text()[:500])
        except Exception as e:
            print("Error visiting login page:", e)
        browser.close()

if __name__ == "__main__":
    run()
