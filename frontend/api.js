window.api = (function () {
  const BASE = window.API_BASE_URL || 'http://127.0.0.1:5000';
  const USE_MOCK = true; // Force True for Demo

  async function request(path, opts = {}) {
    if (USE_MOCK) return mockHandler(path, opts);
    const tokens = localStorage.getItem('access_token');
    const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    if (tokens) headers['Authorization'] = 'Bearer ' + tokens;

    try {
      const res = await fetch(BASE + path, Object.assign({ headers }, opts));
      return handleResponse(res);
    } catch (error) { throw error; }
  }

  async function handleResponse(res) {
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
  }

  const demoOrders = [
    { item_name: 'Amul Toned Milk 1L', platform: 'Blinkit', category: 'Dairy', quantity: 2, unit_price: 75, total_amount: 150, order_datetime: '2026-03-26T10:30:00' },
    { item_name: 'Eggs (12 pack)', platform: 'Zepto', category: 'Dairy', quantity: 1, unit_price: 335, total_amount: 335, order_datetime: '2026-03-25T11:00:00' },
    { item_name: 'Chicken Breast 500g', platform: 'Swiggy Instamart', category: 'Meat', quantity: 1, unit_price: 260, total_amount: 260, order_datetime: '2026-03-24T19:15:00' },
    { item_name: 'Maggi Noodles 4 pack', platform: 'Blinkit', category: 'Snacks', quantity: 2, unit_price: 50, total_amount: 100, order_datetime: '2026-03-23T08:45:00' },
    { item_name: 'Surf Excel Liquid 1L', platform: 'Zepto', category: 'Household', quantity: 1, unit_price: 425, total_amount: 425, order_datetime: '2026-03-22T09:20:00' },
    { item_name: 'Bananas 6pc', platform: 'Zepto', category: 'Fruits', quantity: 1, unit_price: 52, total_amount: 52, order_datetime: '2026-03-21T09:25:00' },
    { item_name: 'Greek Yogurt 400g', platform: 'Blinkit', category: 'Dairy', quantity: 1, unit_price: 125, total_amount: 125, order_datetime: '2026-03-20T10:00:00' },
    { item_name: 'Coca-Cola 750ml', platform: 'Zepto', category: 'Beverages', quantity: 2, unit_price: 40, total_amount: 80, order_datetime: '2026-03-19T20:00:00' },
    { item_name: 'Aashirvaad Atta 5kg', platform: 'Swiggy Instamart', category: 'Grains', quantity: 1, unit_price: 310, total_amount: 310, order_datetime: '2026-03-18T14:30:00' }
  ];

  function mockHandler(path, opts) {
    console.log('[MOCK]', path);
    return new Promise(resolve => {
      setTimeout(() => {
        if (path.startsWith('/auth/login')) {
          resolve({ access_token: 'demo-token', user: { name: 'Demo User', email: 'test@example.com' } });
        } else if (path === '/insights/summary') {
          resolve({
            total_spend: 5536, avg_order_value: 150, total_orders: 37,
            budget: { spent: 5536, set: 10000, percent: 55 },
            by_category: [{ key: 'Dairy', total: 1250 }, { key: 'Meat', total: 980 }, { key: 'Grocery', total: 850 }]
          });
        } else if (path === '/insights/comparison') {
          console.log('MOCK: Returning 15 items');
          resolve({
            source: 'live',
            last_updated: new Date().toISOString(),
            comparisons: [
              { item: 'Amul Milk 1L', category: 'Dairy', prices: [{ platform: 'Blinkit', price: 68 }, { platform: 'Zepto', price: 65 }, { platform: 'Swiggy', price: 70 }], best_platform: 'Zepto', potential_savings: 5 },
              { item: 'Eggs (12)', category: 'Dairy', prices: [{ platform: 'Blinkit', price: 96 }, { platform: 'Zepto', price: 89 }, { platform: 'Swiggy', price: 99 }], best_platform: 'Zepto', potential_savings: 10 },
              { item: 'Chicken Breast', category: 'Meat', prices: [{ platform: 'Blinkit', price: 249 }, { platform: 'Zepto', price: 269 }, { platform: 'Swiggy', price: 239 }], best_platform: 'Swiggy', potential_savings: 30 },
              { item: 'Bread', category: 'Bakery', prices: [{ platform: 'Blinkit', price: 55 }, { platform: 'Zepto', price: 52 }, { platform: 'Swiggy', price: 55 }], best_platform: 'Zepto', potential_savings: 3 },
              { item: 'Atta 5kg', category: 'Grains', prices: [{ platform: 'Blinkit', price: 320 }, { platform: 'Zepto', price: 335 }, { platform: 'Swiggy', price: 310 }], best_platform: 'Swiggy', potential_savings: 25 },
              { item: 'Coke 750ml', category: 'Beverages', prices: [{ platform: 'Blinkit', price: 40 }, { platform: 'Zepto', price: 38 }, { platform: 'Swiggy', price: 42 }], best_platform: 'Zepto', potential_savings: 4 },
              { item: 'Butter 500g', category: 'Dairy', prices: [{ platform: 'Blinkit', price: 285 }, { platform: 'Zepto', price: 280 }, { platform: 'Swiggy', price: 290 }], best_platform: 'Zepto', potential_savings: 10 },
              { item: 'Bananas', category: 'Fruits', prices: [{ platform: 'Blinkit', price: 45 }, { platform: 'Zepto', price: 42 }, { platform: 'Swiggy', price: 48 }], best_platform: 'Zepto', potential_savings: 6 },
              { item: 'Maggi Pack', category: 'Snacks', prices: [{ platform: 'Blinkit', price: 56 }, { platform: 'Zepto', price: 52 }, { platform: 'Swiggy', price: 58 }], best_platform: 'Zepto', potential_savings: 6 },
              { item: 'Soap', category: 'Household', prices: [{ platform: 'Blinkit', price: 38 }, { platform: 'Zepto', price: 35 }, { platform: 'Swiggy', price: 40 }], best_platform: 'Zepto', potential_savings: 5 },
              { item: 'Oil 1L', category: 'Cooking', prices: [{ platform: 'Blinkit', price: 155 }, { platform: 'Zepto', price: 150 }, { platform: 'Swiggy', price: 158 }], best_platform: 'Zepto', potential_savings: 8 },
              { item: 'Rice 5kg', category: 'Grains', prices: [{ platform: 'Blinkit', price: 450 }, { platform: 'Zepto', price: 460 }, { platform: 'Swiggy', price: 440 }], best_platform: 'Swiggy', potential_savings: 20 },
              { item: 'Coffee 50g', category: 'Beverages', prices: [{ platform: 'Blinkit', price: 195 }, { platform: 'Zepto', price: 190 }, { platform: 'Swiggy', price: 200 }], best_platform: 'Zepto', potential_savings: 10 },
              { item: 'Yogurt', category: 'Dairy', prices: [{ platform: 'Blinkit', price: 120 }, { platform: 'Zepto', price: 115 }, { platform: 'Swiggy', price: 125 }], best_platform: 'Zepto', potential_savings: 10 },
              { item: 'Paneer 200g', category: 'Dairy', prices: [{ platform: 'Blinkit', price: 85 }, { platform: 'Zepto', price: 80 }, { platform: 'Swiggy', price: 89 }], best_platform: 'Zepto', potential_savings: 9 }
            ]
          });
        } else if (path === '/insights/heatmap') {
          // 7 days x 24 hours of spend density
          const matrix = Array(7).fill().map(() => Array(24).fill(0).map(() => Math.floor(Math.random() * 50)));
          // Add some fake peaks
          matrix[5][19] = 120; // Sat 7pm
          matrix[6][20] = 95;  // Sun 8pm
          matrix[1][14] = 80;  // Tue 2pm
          resolve({ matrix: matrix });
        } else if (path === '/insights/suggestions') {
          resolve({
            suggestions: [
               { id: 1, item_name: 'Amul Milk 1L', category: 'Dairy', last_bought: '2026-03-24', days_left: 2, status: 'warning' },
               { id: 2, item_name: 'Eggs (Pack of 12)', category: 'Dairy', last_bought: '2026-03-18', days_left: 0, status: 'critical' },
               { id: 3, item_name: 'Whole Wheat Bread', category: 'Bakery', last_bought: '2026-03-25', days_left: 4, status: 'good' }
            ]
          });
        } else if (path === '/insights/nutrition') {
          resolve({
            health_score: 78,
            calories: { consumed: 12450, goal: 14000, avg_daily: '1,780', peak_day: 'Sun (2,400)', lowest_day: 'Wed (1,200)' },
            macros: [
              { name: 'Carbs', current: 50, unit: '%', goal: 100, color: '#3b82f6' },
              { name: 'Protein', current: 30, unit: '%', goal: 100, color: '#10b981' },
              { name: 'Fat', current: 20, unit: '%', goal: 100, color: '#f59e0b' }
            ],
            items: [
              { name: 'Greek Yogurt', category: 'Dairy', quantity: 2, calories: 120, protein: 10, carbs: 8, fat: 0, rating: 'Healthy' },
              { name: 'Chicken Breast', category: 'Meat', quantity: 1, calories: 250, protein: 45, carbs: 0, fat: 4, rating: 'Healthy' },
              { name: 'Coca-Cola', category: 'Beverages', quantity: 1, calories: 300, protein: 0, carbs: 65, fat: 0, rating: 'Poor' },
              { name: 'Maggi Noodles', category: 'Snacks', quantity: 4, calories: 400, protein: 5, carbs: 55, fat: 18, rating: 'Moderate' },
              { name: 'Bananas', category: 'Fruits', quantity: 6, calories: 105, protein: 1, carbs: 27, fat: 0, rating: 'Healthy' }
            ],
            recommendations: [
              { title: 'Reduce Sugary Drinks', detail: 'Swap Coca-Cola for sparkling water to improve your score.', type: 'warning' },
              { title: 'Add More Fiber', detail: 'Consider adding oats or brown rice to your next order.', type: 'success' },
              { title: 'Great Protein Intake', detail: 'Your chicken and egg purchases align well with your goals.', type: 'info' }
            ]
          });
        } else if (path === '/email/sync') {
          resolve({ new_orders: 4 });
        } else if (path === '/email/status') {
          resolve({ connected: true });
        } else if (path === '/purchases') {
          resolve({ purchases: demoOrders });
        } else {
          resolve({ message: 'OK' });
        }
      }, 300);
    });
  }

  return {
    get: (path) => request(path, { method: 'GET' }),
    post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) })
  };
})();
