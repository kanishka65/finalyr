# Technical Documentation: Q-Monitor Smart Analytics

## 🏗️ System Architecture
Q-Monitor is built on a modern **Flask + MongoDB** stack with a **Vanilla JavaScript** frontend designed for maximum performance and low-latency data visualization.

- **Frontend**: Single Page Application (SPA) using HTML5, CSS3 (Custom Design System), and D3.js for data visualization.
- **Backend**: Python Flask REST API.
- **Database**: MongoDB (NoSQL) for flexible schema storage of unstructured quick-commerce purchase data.
- **Auth**: JWT (JSON Web Tokens) with role-based access control.

---

## 🛰️ Data Acquisition Strategy

The project employs a **Hybrid Data Ingestion** model to balance accuracy, privacy, and real-time performance.

### 1. Gmail OAuth2 Parsing (Historical Data)
- **Mechanism**: Connects to the user's Gmail using Google's OAuth2 API.
- **Scraper Location**: [email_parser.py](file:///C:/Users/kanis/Desktop/final%20yr%20project/backend/services/email_parser.py)
- **Logic**: 
  - Filters for specific order confirmation headers (e.g., `from:no-reply@blinkit.com`).
  - Fetches the raw HTML body of the email.
  - Uses **BeautifulSoup4** to extract items, quantities, and prices from complex nested tables.
- **Why this way?** This bypasses the need to scrape thousands of user accounts directly and instead uses "Zero-Party Data" which is more reliable.

### 2. Market Price Scraper (Live Comparison)
- **Mechanism**: Real-time comparison engine.
- **Scraper Location**: [price_scraper.py](file:///C:/Users/kanis/Desktop/final%20yr%20project/backend/services/price_scraper.py)
- **Logic**: 
  - Maintains a "Verified Price Database" of frequently bought items.
  - Performs **Fuzzy String Matching** to identify the same product across different naming conventions used by Blinkit, Zepto, and Swiggy.
  - Calculates "Potential Savings" by comparing the user's last bought price with the current best platform price.

---

## 🛡️ Scraping Challenges & Solutions

If asked by examiners or stakeholders, here are the core technical hurdles we solved:

1.  **Anti-Bot Resilience**: Platforms like Swiggy use aggressive Cloudflare/Akamai headers.
    - **Solution**: We transitioned to **Gmail Table Extraction** for purchase history and used a **Proxied Header** approach for current price checks.
2.  **HTML Structure Drift**: Q-Commerce platforms update their UI/Email layouts weekly.
    - **Solution**: Implemented a **Schema-agnostic Parser** that looks for keywords and currency symbols rather than rigid CSS selectors.
3.  **Data Normalization**: One app says "Amul Gold 500ml", another says "Full Cream Milk 0.5L".
    - **Solution**: Developed a **Normalization Engine** that strips units and brands into a standard data structure for accurate comparisons.
4.  **Token Expiry**: APIs like Gmail have rolling tokens.
    - **Solution**: Built an **Auto-Refresher** in `api.js` to ensure the sync never breaks during a user session.

---

## 🎤 Demonstration Guide (The "Hero's Journey")

Follow these steps for a "WOW" demo:

### Step 1: The Identity (Branding)
- **Point out**: "We aren't just a dashboard; we are Q-Monitor."
- **Show**: The custom SVG logo and the Midnight theme. Explain that this represents a premium, state-of-the-art SaaS product.

### Step 2: The Ingestion (Gmail Sync)
- **Action**: Click "Sync with Gmail" or Upload a CSV.
- **Explain**: "We solve the manual entry problem. We ingest your data where it already lives—your inbox."

### Step 3: The Insights (Dashboard)
- **Point out**: The **Heatmap**. "Look at my spending density—I'm ordering late at night significantly more on weekends."
- **Show**: Category breakdown. "I'm spending 40% of my budget on Dairy."

### Step 4: The 'Killer Feature' (Price Savings)
- **Action**: Go to the **Price Savings Table**.
- **The Punchline**: "I bought milk on App A for ₹75, but Q-Monitor tells me App B had it for ₹68. Over a year, this saves me thousands."

### Step 5: The Health Advisor (Nutrition Score)
- **Explain**: "This isn't just about money; it's about health. We use your data to calculate actual protein and calorie goals."
- **Show**: The "Sugar Alert". "The system noticed I bought too many soft drinks this week and flagged it dynamically."

---

## 🧪 Algorithms Used
- **Fuzzy Wuzzy Matching**: For cross-platform product mapping.
- **D3.js Color Scaling**: For the Heatmap intensity visualization.
- **Weighted Health Scoring**: Calculating the '74 Good' score based on daily dietary guidelines.
- **Linear Regression (Conceptual)**: Used in the Replenishment engine to predict your "Days Left" for groceries.
