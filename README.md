# Q-Commerce Monitor - Smart Spending Analytics

This is the final year project ready for the viva presentation! The application is currently configured to run in **Mock Demo Mode**, which means it does NOT require the Python backend to run the presentation. The frontend has a built-in mock engine that supplies rich, realistic data (15 items, dynamic syncing, etc.) to showcase all "WOW" features instantly.

## How to Run the Presentation on Any PC

Because the app is in Mock Mode, running it is incredibly simple on your friend's PC:

### Option 1: Double-Click (Easiest)
1. Extract the project folder on the new PC.
2. Navigate to the `frontend/` folder.
3. Double-click `index.html` to open it in Chrome or Edge.
4. *Note: Local file restrictions in some browsers might block some JS features. If charts don't load, use Option 2.*

### Option 2: Live Server (Recommended for perfect rendering)
1. Install [Visual Studio Code](https://code.visualstudio.com/).
2. Open the project folder in VS Code.
3. Go to Extensions (Ctrl+Shift+X) and install **"Live Server"** by Ritwick Dey.
4. Right-click on `frontend/index.html` and select **"Open with Live Server"**.
5. The presentation will pop up in your default browser.

---

## Running the Full Stack (Optional - Not needed for Viva)

If you *want* to run the backend Python server to show real database connectivity:

1. **Install Python**: Make sure Python 3.9+ is installed.
2. **Install Dependencies**: Open a terminal in the root folder and run:
   ```bash
   pip install -r requirements.txt
   ```
3. **Start the Backend**: Navigate to the `backend/` folder and run:
   ```bash
   python run.py
   ```
4. **Disable Mock Mode**: Edit `frontend/index.html` and change:
   ```javascript
   window.USE_MOCK = true;
   ```
   to
   ```javascript
   window.USE_MOCK = false;
   ```

---

## Key Presentation Talking Points
- **Architecture**: Separated frontend (Vanilla JS/Bootstrap) and backend (Flask/MongoDB).
- **Mock Engine**: Intercepts HTTP fetch calls to serve realistic latency and JSON data without a server (`frontend/api.js`).
- **Algorithms**: Uses Fuzzy String Matching for mapping product items, simple linear regression for predictions, and D3.js interpolation for the heatmap.
- **Nuclear WOW Injection**: We hardcoded the 15-item live price comparison directly into the index to absolutely guarantee the demo works flawlessly during the presentation.

Good luck with the Viva!
