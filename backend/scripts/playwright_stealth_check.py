from playwright.sync_api import sync_playwright
import re, time

def test_stealth_scraping():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a high-quality real user agent
        user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        
        ctx = browser.new_context(
            user_agent=user_agent,
            viewport={'width': 1280, 'height': 720},
            locale='en-IN',
        )
        page = ctx.new_page()
        
        # Add stealth script
        page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        results = {}

        # ─── TEST JIOMART ───
        print("Testing JioMart...")
        try:
            page.goto('https://www.jiomart.com/search/amul%20milk', wait_until='domcontentloaded', timeout=20000)
            page.wait_for_timeout(5000)
            text = page.inner_text('body')
            if 'Access Denied' in text or 'blocked' in text:
                results['JioMart'] = 'BLOCKED'
            else:
                prices = re.findall(r'₹\s*\d+', text)
                results['JioMart'] = f"SUCCESS ({len(prices)} prices)" if prices else "NO PRICES FOUND"
        except Exception as e:
            results['JioMart'] = f"ERROR: {str(e)[:50]}"

        # ─── TEST BIGBASKET ───
        print("Testing BigBasket...")
        try:
            page.goto('https://www.bigbasket.com/ps/?q=amul+milk', wait_until='domcontentloaded', timeout=20000)
            page.wait_for_timeout(5000)
            text = page.inner_text('body')
            if 'blocked' in text.lower():
                results['BigBasket'] = 'BLOCKED'
            else:
                prices = re.findall(r'₹\s*\d+', text)
                results['BigBasket'] = f"SUCCESS ({len(prices)} prices)" if prices else "NO PRICES FOUND"
        except Exception as e:
            results['BigBasket'] = f"ERROR: {str(e)[:50]}"

        # ─── TEST AMAZON ───
        print("Testing Amazon...")
        try:
            page.goto('https://www.amazon.in/s?k=amul+milk', wait_until='domcontentloaded', timeout=20000)
            page.wait_for_timeout(5000)
            text = page.inner_text('body')
            if 'robot' in text.lower() or 'captcha' in text.lower():
                results['Amazon'] = 'CAPTCHA'
            else:
                prices = re.findall(r'₹\s*\d+', text)
                results['Amazon'] = f"SUCCESS ({len(prices)} prices)" if prices else "NO PRICES FOUND"
        except Exception as e:
            results['Amazon'] = f"ERROR: {str(e)[:50]}"

        browser.close()
        
        print("\n=== FINAL STEALTH RESULTS ===")
        for site, res in results.items():
            print(f"{site}: {res}")

if __name__ == "__main__":
    test_stealth_scraping()
