import requests
import re

def scrape_amazon_grocery(query):
    url = f"https://www.amazon.in/s?k={query.replace(' ', '+')}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Device-Memory': '8',
    }
    
    print(f"Searching Amazon for: {query}")
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            html = response.text
            # Use regex to find price whole and product names
            # Price: <span class="a-price-whole">68<span class="a-price-decimal">.</span></span>
            prices = re.findall(r'class="a-price-whole">(\d+)', html)
            # Names: <span class="a-size-base-plus a-color-base a-text-normal">Amul Taaza Toned Milk</span>
            names = re.findall(r'class="a-size-base-plus a-color-base a-text-normal">(.*?)</span>', html)
            
            if not prices:
                # Try fallback price pattern
                prices = re.findall(r'₹(\d+)', html)
            
            results = []
            for i in range(min(10, len(prices), len(names))):
                results.append({
                    'name': names[i],
                    'price': int(prices[i])
                })
            return results
        else:
            print(f"Amazon Error: {response.status_code}")
            return None
    except Exception as e:
        print(f"Request Error: {e}")
        return None

if __name__ == "__main__":
    res = scrape_amazon_grocery("amul milk 1l")
    if res:
        print(f"Found {len(res)} items:")
        for item in res:
            print(f"  {item['name'][:40]}...: ₹{item['price']}")
    else:
        print("Failed to get results from Amazon.")
