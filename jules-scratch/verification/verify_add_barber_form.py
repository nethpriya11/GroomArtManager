
from playwright.sync_api import sync_playwright, TimeoutError

def verify_add_barber_form():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Listen for all console events and print them
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

        try:
            print("Navigating to http://localhost:3000...")
            page.goto("http://localhost:3000", timeout=15000)
            print("Navigation complete.")

            print("Waiting for 'Manager' button...")
            page.wait_for_selector('button:has-text("Manager")', timeout=10000)
            print("Found 'Manager' button.")

            page.click('button:has-text("Manager")')
            print("Clicked 'Manager' button.")

            print("Waiting for 'Add Barber' button...")
            page.wait_for_selector('button:has-text("Add Barber")', timeout=10000)
            print("Found 'Add Barber' button.")

            page.click('button:has-text("Add Barber")')
            print("Clicked 'Add Barber' button.")

            print("Filling form...")
            page.fill('input[name="name"]', "Test Barber")
            print("Form filled.")

            print("Taking screenshot...")
            page.screenshot(path="jules-scratch/verification/add_barber_form.png")
            print("Screenshot successful!")

        except TimeoutError as e:
            print(f"Timeout error: {e}")
            print("Taking error screenshot...")
            page.screenshot(path="jules-scratch/verification/error_screenshot.png")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error_screenshot.png")
        finally:
            print("Closing browser.")
            browser.close()

if __name__ == "__main__":
    verify_add_barber_form()
