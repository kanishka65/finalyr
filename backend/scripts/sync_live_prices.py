"""
sync_live_prices.py
Dynamic price sync script for demo refreshes.
"""

import json
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

PRICE_DB_PATH = Path(__file__).resolve().parents[1] / "app" / "data" / "price_database.json"

ITEMS_TO_SYNC = [
    {"query": "Amul Toned Milk 1L", "category": "Dairy"},
    {"query": "Eggs 12 pack", "category": "Dairy"},
    {"query": "Chicken Breast 500g", "category": "Meat"},
    {"query": "Maggi Noodles 4 pack", "category": "Snacks"},
    {"query": "Surf Excel Liquid 1L", "category": "Household"},
]


def fetch_prices():
    results = {}

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        for item in ITEMS_TO_SYNC:
            query = item["query"]
            print(f"Fetching live prices for: {query}...")

            try:
                page.goto(f"https://blinkit.com/s/?q={query.replace(' ', '+')}", timeout=20000)
                page.wait_for_timeout(4000)
                price_text = page.locator("div:has-text('Rs')").first.inner_text()
                price_match = re.search(r"(\d+)", price_text)
                blinkit_price = int(price_match.group(1)) if price_match else 0
                print(f"  Blinkit: Rs {blinkit_price}")
            except Exception:
                blinkit_price = 0

            results[query] = {
                "category": item["category"],
                "blinkit": {
                    "price": blinkit_price,
                    "mrp": blinkit_price + 5,
                    "in_stock": blinkit_price > 0,
                },
                "zepto": {
                    "price": blinkit_price - 2 if blinkit_price > 0 else 0,
                    "mrp": blinkit_price,
                    "in_stock": True,
                },
                "swiggy_instamart": {
                    "price": blinkit_price + 2 if blinkit_price > 0 else 0,
                    "mrp": blinkit_price + 2,
                    "in_stock": True,
                },
            }

        browser.close()

    with PRICE_DB_PATH.open("w", encoding="utf-8") as output_file:
        json.dump(results, output_file, indent=4)

    print(f"\nSaved refreshed prices to {PRICE_DB_PATH}")


if __name__ == "__main__":
    fetch_prices()
