# Q-Commerce Monitor - Smart Spending Analytics

A smart spending analytics platform that compares prices across Q-Commerce platforms (Blinkit, Zepto, Swiggy Instamart), tracks purchases via Gmail sync, and provides nutrition insights.

> **Demo Mode is ON by default.** No backend/database needed for the presentation. Everything works out of the box.

---

## Quick Start — Run the Presentation

### Prerequisites
- A modern browser (Chrome / Edge recommended)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)
- [Git](https://git-scm.com/downloads) (to clone the repo)

### Step 1: Clone the Repository
```bash
git clone https://github.com/kanishka65/finalyr.git
```

### Step 2: Open in VS Code
```
Open VS Code → File → Open Folder → select the cloned "finalyr" folder
```

### Step 3: Install Live Server Extension
1. Press `Ctrl+Shift+X` to open Extensions.
2. Search for **"Live Server"** by Ritwick Dey.
3. Click **Install**.

### Step 4: Launch the App
1. In VS Code's file explorer, navigate to `frontend/index.html`.
2. Right-click on `index.html` → **"Open with Live Server"**.
3. The app opens in your browser automatically.

### Step 5: Use the App
1. **Login**: Enter any email/password (e.g., `test@example.com` / `password`) and click Sign In.
2. **Dashboard**: Shows 15-item live price comparison, KPI cards, and stock alerts.
3. **Spending Analytics**: View the spending heatmap, budget tracker, and category breakdown.
4. **Health & Nutrition**: See your nutrition health score (78), calorie tracker, macros, and smart advice.
5. **Purchases**: View order history and use the Gmail sync dropdown.

---

## Alternative: No VS Code Available

If VS Code is not available, you can also use Python's built-in server:
```bash
cd finalyr/frontend
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

Or with Node.js:
```bash
cd finalyr/frontend
npx -y http-server -p 8000
```

Or simply **double-click** `frontend/index.html` to open it directly (some chart features may not render due to browser file:// restrictions).

---

## Project Structure

```
finalyr/
├── README.md                 # This file
├── requirements.txt          # Python dependencies (for full stack only)
├── frontend/
│   ├── index.html            # Main entry point + Nuclear WOW Injection
│   ├── api.js                # Mock data engine (intercepts all API calls)
│   ├── dashboard.js          # Dashboard rendering (KPIs, comparisons, heatmap)
│   ├── purchases.js          # Purchase history view
│   ├── nutrition.js          # Health & Nutrition advisor
│   ├── heatmap.js            # D3.js heatmap visualization
│   ├── gmail_sync.js         # Gmail sync UI logic
│   ├── auth.js               # Authentication (mock login)
│   ├── state.js              # App state management
│   ├── app.css               # All styling (dark theme)
│   └── assets/               # Images and icons
├── backend/
│   ├── run.py                # Flask server entry point
│   ├── app/
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   └── models/           # MongoDB models
│   └── ...
└── technical_documentation.md
```

---

## Running the Full Stack (Optional — NOT needed for Viva)

Only if you want to demonstrate real backend connectivity:

1. **Install Python 3.9+**
2. **Install dependencies**:
   ```bash
   cd finalyr
   pip install -r requirements.txt
   ```
3. **Start MongoDB** (must be running on default port 27017)
4. **Start the backend**:
   ```bash
   cd backend
   python run.py
   ```
5. **Disable Mock Mode** — Edit `frontend/index.html`, find `window.USE_MOCK = true;` and change to `false`
6. **Edit** `frontend/api.js`, find `const USE_MOCK = true;` and change to `false`

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Vanilla JS, Bootstrap 5, D3.js     |
| Backend    | Python Flask, MongoDB               |
| Auth       | JWT Tokens, Google OAuth (Gmail)    |
| Algorithms | Fuzzy String Matching, Linear Regression |

---

## Key Features for Viva

- **Cross-Platform Price Comparison**: Compares 15 grocery items across Blinkit, Zepto, and Swiggy Instamart in real time
- **Mock Data Engine**: `api.js` intercepts all HTTP fetch calls and returns realistic JSON with simulated latency — no server required
- **Spending Heatmap**: D3.js-powered 7×24 grid showing spending intensity by day and hour
- **Nutrition Advisor**: Tracks calorie intake, macronutrient distribution, and provides smart dietary recommendations
- **Gmail Sync**: OAuth-based email parsing to auto-extract purchase orders from delivery confirmations
- **Budget Tracker**: Visual budget utilization with category-wise breakdown and trend analysis

---

Good luck with the Viva! 🎯
