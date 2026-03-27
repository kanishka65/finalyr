import requests
import re
import json

def scrape_zepto_mobile(query):
    ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
    headers = {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
    }
    
    url = f"https://www.zeptonow.com/search?query={query.replace(' ', '+')}"
    print(f"Scraping Zepto Mobile for: {query}")
    
    try:
        r = requests.get(url, headers=headers, timeout=15)
        if r.status_code == 200:
            # Look for NEXT_DATA
            match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', r.text)
            if match:
                data = json.loads(match.group(1))
                # The product data is usually deep in the layout
                # Path: data -> props -> pageProps -> layout -> widgets -> data -> products
                products = []
                
                # Recursive search for 'products' key in the large JSON blob
                def find_products(obj):
                    if isinstance(obj, dict):
                        if 'products' in obj and isinstance(obj['products'], list):
                            for p in obj['products']:
                                item = p.get('productResponse', {}).get('productVariant', {})
                                if item:
                                    products.append({
                                        'name': item.get('name'),
                                        'price': item.get('sellingPrice'),
                                        'mrp': item.get('mrp'),
                                        'unit': item.get('packSize'),
                                        'in_stock': item.get('inStock', True)
                                    })
                        for v in obj.values():
                            find_products(v)
                    elif isinstance(obj, list):
                        for item in obj:
                            find_products(item)
                
                find_products(data)
                return products
            else:
                print("Could not find NEXT_DATA in page")
                return None
        else:
            print(f"Zepto error: {r.status_code}")
            return None
    except Exception as e:
        print(f"Request error: {e}")
        return None

if __name__ == "__main__":
    items = scrape_zepto_mobile("amul milk")
    if items:
        print(f"Found {len(items)} items:")
        for it in items[:5]:
            print(f"  {it['name']} ({it['unit']}): ₹{it['price']} (MRP: ₹{it['mrp']})")
    else:
        print("Scrape failed.")
