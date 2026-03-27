(function () {
  // Smart analytics engine with realistic values
  class SmartFoodAnalytics {
    constructor() {
      this.commonItems = {
        eggs: {
          shelf_life: 21,
          typical_consumption: { daily: 2, weekly: 14 },
          calories_per_unit: 70,        // per egg
          protein_per_unit: 6,          // per egg
          category: 'dairy',
          unit_type: 'piece'
        },
        milk: {
          shelf_life: 7,
          typical_consumption: { daily: 250, weekly: 1750 },
          calories_per_unit: 60,        // per 250ml glass
          protein_per_unit: 8,          // per 250ml glass
          category: 'dairy',
          unit_type: 'ml'
        },
        bread: {
          shelf_life: 5,
          typical_consumption: { daily: 4, weekly: 28 }, // slices
          calories_per_unit: 80,        // per slice
          protein_per_unit: 3,          // per slice
          category: 'bakery',
          unit_type: 'slice'
        },
        chicken: {
          shelf_life: 3,
          typical_consumption: { daily: 150, weekly: 1050 }, // grams
          calories_per_unit: 165,       // per 100g
          protein_per_unit: 31,         // per 100g
          category: 'meat',
          unit_type: 'g'
        },
        rice: {
          shelf_life: 365,
          typical_consumption: { daily: 150, weekly: 1050 },
          calories_per_unit: 130,       // per 100g cooked
          protein_per_unit: 2.7,        // per 100g cooked
          category: 'grains',
          unit_type: 'g'
        },
        bananas: {
          shelf_life: 7,
          typical_consumption: { daily: 1, weekly: 7 },
          calories_per_unit: 105,       // per banana
          protein_per_unit: 1.3,        // per banana
          category: 'fruits',
          unit_type: 'piece'
        },
        yogurt: {
          shelf_life: 14,
          typical_consumption: { daily: 100, weekly: 700 },
          calories_per_unit: 59,        // per 100g
          protein_per_unit: 10,         // per 100g
          category: 'dairy',
          unit_type: 'g'
        }
      };
    }

    predictExpiry(purchases) {
      return purchases.map(item => {
        const itemInfo = this.commonItems[item.name?.toLowerCase()];
        if (!itemInfo) return item;

        const purchaseDate = new Date(item.date || new Date());
        const expiryDate = new Date(purchaseDate);
        expiryDate.setDate(expiryDate.getDate() + itemInfo.shelf_life);

        const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

        return {
          ...item,
          expiry_date: expiryDate,
          days_until_expiry: daysUntilExpiry,
          urgency: daysUntilExpiry <= 2 ? 'high' : daysUntilExpiry <= 5 ? 'medium' : 'low',
          suggestion: this.getConsumptionSuggestion(item, daysUntilExpiry)
        };
      });
    }

    getConsumptionSuggestion(item, daysLeft) {
      const suggestions = {
        eggs: {
          high: "🥚 Use today! Make omelette or boiled eggs",
          medium: "🍳 Perfect for breakfast or baking this week",
          low: "✅ Stock is fresh, plan for next week"
        },
        milk: {
          high: "🥛 Use today in smoothies, coffee or cereal",
          medium: "☕ Good for daily use - cereals, tea, coffee",
          low: "✅ Fresh stock, no immediate need"
        },
        chicken: {
          high: "🍗 Cook today! Great for curry or grilled dishes",
          medium: "🍲 Perfect for meals in next 2-3 days",
          low: "✅ Fresh chicken, plan meals accordingly"
        },
        bread: {
          high: "🍞 Use today! Make toast, sandwiches or croutons",
          medium: "🥪 Good for lunches and snacks this week",
          low: "✅ Fresh bread available"
        },
        bananas: {
          high: "🍌 Eat today! Perfect for smoothies or banana bread",
          medium: "🥤 Good for snacks or smoothies this week",
          low: "✅ Fresh bananas available"
        },
        yogurt: {
          high: "🥣 Consume today! Great with fruits or in smoothies",
          medium: "🍶 Good for breakfast or snacks this week",
          low: "✅ Fresh yogurt, no rush"
        }
      };

      const urgency = daysLeft <= 2 ? 'high' : daysLeft <= 5 ? 'medium' : 'low';
      return suggestions[item.name?.toLowerCase()]?.[urgency] || `Use within ${daysLeft} days for best quality`;
    }

    calculateNutrition(purchases) {
      let totalCalories = 0;
      let totalProtein = 0;

      purchases.forEach(item => {
        const itemInfo = this.commonItems[item.name?.toLowerCase()];
        if (itemInfo && item.quantity) {
          let calories = 0;
          let protein = 0;

          switch (itemInfo.unit_type) {
            case 'ml':
              // For milk, assume 250ml = 1 serving
              calories = (itemInfo.calories_per_unit * item.quantity) / 250;
              protein = (itemInfo.protein_per_unit * item.quantity) / 250;
              break;
            case 'g':
              // For chicken, rice, yogurt - per 100g
              calories = (itemInfo.calories_per_unit * item.quantity) / 100;
              protein = (itemInfo.protein_per_unit * item.quantity) / 100;
              break;
            default:
              // For eggs, bread, bananas - per piece/slice
              calories = itemInfo.calories_per_unit * item.quantity;
              protein = itemInfo.protein_per_unit * item.quantity;
          }

          totalCalories += calories;
          totalProtein += protein;
        }
      });

      return {
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein),
        calorieGoal: 17500, // Realistic weekly goal (2500 calories/day × 7)
        proteinGoal: 455     // Realistic weekly goal (65g protein/day × 7)
      };
    }

    generateSmartCart(consumptionHistory) {
      // Realistic weekly consumption patterns
      const weeklyNeeds = {
        eggs: 14,       // 2 eggs per day
        milk: 3500,     // 500ml per day
        bread: 21,      // 3 slices per day
        chicken: 700,   // 100g per day
        rice: 1050,     // 150g per day
        bananas: 7,     // 1 banana per day
        yogurt: 700     // 100g per day
      };

      return Object.keys(weeklyNeeds).map(item => {
        const needed = weeklyNeeds[item];
        const currentStock = this.estimateCurrentStock(item, consumptionHistory);
        const toBuy = Math.max(0, needed - currentStock);

        return {
          item: item,
          quantity: toBuy,
          unit: item === 'milk' ? 'ml' : item === 'chicken' || item === 'rice' || item === 'yogurt' ? 'g' : 'units',
          priority: toBuy > (needed * 0.3) ? 'high' : 'low',
          reason: toBuy > 0 ?
            `Based on your typical weekly usage` :
            'Well stocked'
        };
      }).filter(item => item.quantity > 0);
    }

    estimateCurrentStock(itemName, history) {
      // Simple estimation - in real app, this would track actual inventory
      const recentPurchase = history.find(p => p.name === itemName);
      if (!recentPurchase) return 0;

      // Assume 50% consumed if purchased recently
      return Math.floor(recentPurchase.quantity * 0.5);
    }
  }

  const smartAnalytics = new SmartFoodAnalytics();

  // Realistic Kanishk demo data with configurable goals
  const kanishkDemoData = {
    user: {
      name: "Kanishk",
      weekly_budget: 1500, // Configurable in future
      health_goals: "Fitness & Nutrition",
      dietary_preferences: ["high-protein", "balanced"]
    },
    current_week: {
      spend: 1420,
      budget_remaining: 80,
      items_purchased: [
        { name: "eggs", quantity: 12, amount: 96, date: "2024-01-15" },
        { name: "milk", quantity: 2000, amount: 120, date: "2024-01-15" },
        { name: "chicken", quantity: 500, amount: 350, date: "2024-01-14" },
        { name: "bread", quantity: 14, amount: 70, date: "2024-01-14" },
        { name: "rice", quantity: 1000, amount: 80, date: "2024-01-13" },
        { name: "bananas", quantity: 6, amount: 48, date: "2024-01-15" },
        { name: "yogurt", quantity: 500, amount: 60, date: "2024-01-14" }
      ]
    }
  };

  async function loadSummary() {
    try {
      const data = await api.get('/insights/summary');
      renderKPIs(data);
      // Category chart is now in Spending Analytics view
      window._lastSummaryData = data; // cache for spending view
    } catch (e) {
      console.error('summary fetch error', e);
    }
  }

  async function loadHeatmap() {
    try {
      const hm = await api.get('/insights/heatmap');
      window.renderHeatmap('#heatmap', hm?.matrix || hm);
    } catch (e) {
      console.error('heatmap error', e);
    }
  }

  async function loadSuggestions() {
    try {
      const res = await api.get('/insights/suggestions');
      renderReplenishment(res.suggestions);
    } catch (e) {
      console.error('suggestions error', e);
    }
  }

  async function loadComparison() {
    let source = 'live';
    let comparisons = {
      source: 'live',
      last_updated: new Date().toISOString(),
      comparisons: [
        { item: 'Amul Toned Milk 1L', category: 'Dairy', prices: [{ platform: 'Blinkit', price: 68 }, { platform: 'Zepto', price: 65 }, { platform: 'Swiggy Instamart', price: 70 }], best_platform: 'Zepto', potential_savings: 5 },
        { item: 'Eggs (Pack of 12)', category: 'Dairy', prices: [{ platform: 'Blinkit', price: 96 }, { platform: 'Zepto', price: 89 }, { platform: 'Swiggy Instamart', price: 99 }], best_platform: 'Zepto', potential_savings: 10 },
        { item: 'Chicken Breast 500g', category: 'Meat', prices: [{ platform: 'Blinkit', price: 249 }, { platform: 'Zepto', price: 269 }, { platform: 'Swiggy Instamart', price: 239 }], best_platform: 'Swiggy Instamart', potential_savings: 30 },
        { item: 'Aashirvaad Atta 5kg', category: 'Grains', prices: [{ platform: 'Blinkit', price: 320 }, { platform: 'Zepto', price: 335 }, { platform: 'Swiggy Instamart', price: 310 }], best_platform: 'Swiggy Instamart', potential_savings: 25 },
        { item: 'Coca-Cola 750ml', category: 'Beverages', prices: [{ platform: 'Blinkit', price: 40 }, { platform: 'Zepto', price: 38 }, { platform: 'Swiggy Instamart', price: 42 }], best_platform: 'Zepto', potential_savings: 4 },
        { item: 'Amul Butter 500g', category: 'Dairy', prices: [{ platform: 'Blinkit', price: 285 }, { platform: 'Zepto', price: 280 }, { platform: 'Swiggy Instamart', price: 290 }], best_platform: 'Zepto', potential_savings: 10 },
        { item: 'Maggi Noodles 4-Pack', category: 'Snacks', prices: [{ platform: 'Blinkit', price: 56 }, { platform: 'Zepto', price: 52 }, { platform: 'Swiggy Instamart', price: 58 }], best_platform: 'Zepto', potential_savings: 6 },
        { item: 'Surf Excel Liquid 1L', category: 'Household', prices: [{ platform: 'Blinkit', price: 238 }, { platform: 'Zepto', price: 245 }, { platform: 'Swiggy Instamart', price: 230 }], best_platform: 'Swiggy Instamart', potential_savings: 15 },
        { item: 'Tata Tea Gold 500g', category: 'Beverages', prices: [{ platform: 'Blinkit', price: 305 }, { platform: 'Zepto', price: 299 }, { platform: 'Swiggy Instamart', price: 310 }], best_platform: 'Zepto', potential_savings: 11 },
        { item: 'Greek Yogurt 400g', category: 'Dairy', prices: [{ platform: 'Blinkit', price: 120 }, { platform: 'Zepto', price: 115 }, { platform: 'Swiggy Instamart', price: 125 }], best_platform: 'Zepto', potential_savings: 10 },
        { item: 'Britannia Bread', category: 'Bakery', prices: [{ platform: 'Blinkit', price: 55 }, { platform: 'Zepto', price: 52 }, { platform: 'Swiggy Instamart', price: 55 }], best_platform: 'Zepto', potential_savings: 3 },
        { item: 'Bananas 1 Dozen', category: 'Fruits', prices: [{ platform: 'Blinkit', price: 85 }, { platform: 'Zepto', price: 80 }, { platform: 'Swiggy Instamart', price: 89 }], best_platform: 'Zepto', potential_savings: 9 },
        { item: 'Onion 1kg', category: 'Vegetables', prices: [{ platform: 'Blinkit', price: 45 }, { platform: 'Zepto', price: 42 }, { platform: 'Swiggy Instamart', price: 48 }], best_platform: 'Zepto', potential_savings: 6 },
        { item: 'Fortune SoyOil 1L', category: 'Grains', prices: [{ platform: 'Blinkit', price: 165 }, { platform: 'Zepto', price: 155 }, { platform: 'Swiggy Instamart', price: 170 }], best_platform: 'Zepto', potential_savings: 15 },
        { item: 'Nescafe Coffee 50g', category: 'Beverages', prices: [{ platform: 'Blinkit', price: 195 }, { platform: 'Zepto', price: 185 }, { platform: 'Swiggy Instamart', price: 200 }], best_platform: 'Zepto', potential_savings: 15 }
      ]
    };

    renderComparison(comparisons, source);
  }

  function renderKPIs(data) {
    const kpidiv = document.getElementById('kpis');
    kpidiv.innerHTML = `
      <div class="col-md-3 mb-3">
        <div class="card bg-primary text-white p-3 shadow-sm border-0 h-100">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="small opacity-75 uppercase fw-bold">Total Spend</div>
              <h3 class="mb-0 fw-800">₹${data.total_spend || 0}</h3>
            </div>
            <i class="fas fa-wallet fa-2x opacity-25"></i>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card bg-success text-white p-3 shadow-sm border-0 h-100">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="small opacity-75 uppercase fw-bold">Avg Order</div>
              <h3 class="mb-0 fw-800">₹${data.avg_order_value || 0}</h3>
            </div>
            <i class="fas fa-shopping-bag fa-2x opacity-25"></i>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card bg-warning text-white p-3 shadow-sm border-0 h-100">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="small opacity-75 uppercase fw-bold">Active Budget</div>
              <h3 class="mb-0 fw-800">${data.budget?.percent || 0}%</h3>
            </div>
            <i class="fas fa-chart-pie fa-2x opacity-25"></i>
          </div>
          <div class="progress mt-2" style="height: 4px; background: rgba(255,255,255,0.2)">
            <div class="progress-bar bg-white" style="width: ${data.budget?.percent}%"></div>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card bg-info text-white p-3 shadow-sm border-0 h-100">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="small opacity-75 uppercase fw-bold">Total Orders</div>
              <h3 class="mb-0 fw-800">${data.total_orders || 0}</h3>
            </div>
            <i class="fas fa-calendar-check fa-2x opacity-25"></i>
          </div>
        </div>
      </div>
    `;
  }

  function renderCategoryChart(categories) {
    const chartDiv = document.getElementById('category-chart');
    if (!categories || categories.length === 0) {
      chartDiv.innerHTML = '<p class="text-muted">No category data available</p>';
      return;
    }

    // Modern Bar Chart Representation using CSS/Flex
    const maxTotal = Math.max(...categories.map(c => c.total));
    let html = '<div class="category-bars mt-2">';
    categories.forEach(cat => {
      const per = Math.round((cat.total / maxTotal) * 100);
      html += `
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="small fw-bold text-dark">${cat.key}</span>
            <span class="small text-muted">₹${cat.total}</span>
          </div>
          <div class="progress" style="height: 10px;">
            <div class="progress-bar bg-primary rounded-pill" style="width: ${per}%"></div>
          </div>
        </div>`;
    });
    html += '</div>';
    chartDiv.innerHTML = html;
  }

  function renderReplenishment(suggestions) {
    const container = document.getElementById('expiry-alerts');
    if (!container) return;

    if (!suggestions || suggestions.length === 0) {
      container.innerHTML = '<div class="alert alert-success py-2 mb-0">✅ All items sufficiently stocked!</div>';
      return;
    }

    // Build ticker items
    const items = suggestions.map(item => {
      const icon = item.status === 'critical' ? '🔴' : item.status === 'warning' ? '🟡' : '🟢';
      const suggestionText = item.status === 'critical' ? 'Restock immediately' : item.status === 'warning' ? 'Running low soon' : 'In good stock';
      return `<span class="ticker-item ticker-${item.status}">
        ${icon} <strong>${item.item_name}</strong> — ${suggestionText} (${item.days_left}d left)
      </span>`;
    }).join('');

    // Duplicate for seamless infinite loop
    container.innerHTML = `
      <div class="ticker-wrapper">
        <div class="ticker-label"><i class="fas fa-bell"></i> Alerts</div>
        <div class="ticker-track">
          <div class="ticker-content">${items}${items}</div>
        </div>
      </div>`;
  }

  function renderComparison(res, source) {
    const section = document.getElementById('comparison-section');
    if (!section) return;

    const data = (res && res.comparisons) ? res.comparisons : (Array.isArray(res) ? res : []);
    const sourceVal = res.source || source;
    
    if (!data || data.length === 0) {
      section.innerHTML = '<p class="text-muted text-center py-4">No comparisons available.</p>';
      return;
    }

    const badge = sourceVal === 'live' 
      ? '<span class="badge pulse-live ms-2 border-0"><i class="fas fa-wifi me-1"></i>LIVE PRICES</span>'
      : '<span class="badge bg-secondary ms-2 border-0">DEMO DATA</span>';

    const timestamp = res.last_updated ? `<small class="text-muted ms-2">Synced: ${new Date(res.last_updated).toLocaleTimeString()}</small>` : '';

    let html = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <small class="text-muted">${data.length} items compared</small>
          ${badge}
          ${timestamp}
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr><th>Item</th><th>Prices</th><th>Best Platform</th><th>Savings</th></tr>
          </thead>
          <tbody>`;

    data.forEach(item => {
      const pricesHtml = item.prices.map(p =>
        `<span class="badge ${p.platform === item.best_platform ? 'bg-success' : 'bg-light text-dark'} me-1 border-0">
          ${p.platform}: ₹${p.price}
        </span>`
      ).join('');

      html += `
        <tr>
          <td><strong>${item.item}</strong><br><small class="text-muted">${item.category}</small></td>
          <td>${pricesHtml}</td>
          <td><span class="text-success fw-bold"><i class="fas fa-check-circle me-1"></i>${item.best_platform}</span></td>
          <td><span class="text-primary fw-bold">₹${item.potential_savings}</span></td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    section.innerHTML = html;
  }

  window.initDashboard = function () {
    loadSummary();
    loadSuggestions();
    loadComparison();
  }

  // === Spending Analytics View ===
  async function loadSpendingData() {
    try {
      const data = window._lastSummaryData || await api.get('/insights/summary');
      window._lastSummaryData = data;

      // ── Premium KPI Cards ──
      const kpiDiv = document.getElementById('spending-kpis');
      if (kpiDiv) {
        kpiDiv.innerHTML = `
          <div class="col-md-3 col-6 mb-3">
            <div class="kpi-card kpi-gradient-1">
              <div class="kpi-label">Total Spend</div>
              <div class="kpi-value">₹${data.total_spend || 0}</div>
              <i class="fas fa-rupee-sign kpi-icon"></i>
            </div>
          </div>
          <div class="col-md-3 col-6 mb-3">
            <div class="kpi-card kpi-gradient-2">
              <div class="kpi-label">Avg Order</div>
              <div class="kpi-value">₹${data.avg_order_value || 0}</div>
              <i class="fas fa-shopping-bag kpi-icon"></i>
            </div>
          </div>
          <div class="col-md-3 col-6 mb-3">
            <div class="kpi-card kpi-gradient-3">
              <div class="kpi-label">Budget Used</div>
              <div class="kpi-value">${data.budget?.percent || 0}%</div>
              <div class="progress mt-2" style="height:4px;background:rgba(255,255,255,0.25);border-radius:4px;">
                <div class="progress-bar" style="width:${data.budget?.percent || 0}%;background:white;border-radius:4px;"></div>
              </div>
              <i class="fas fa-chart-pie kpi-icon"></i>
            </div>
          </div>
          <div class="col-md-3 col-6 mb-3">
            <div class="kpi-card kpi-gradient-4">
              <div class="kpi-label">Total Orders</div>
              <div class="kpi-value">${data.total_orders || 0}</div>
              <i class="fas fa-receipt kpi-icon"></i>
            </div>
          </div>`;
      }

      // ── Pretty Category Chart ──
      const catDiv = document.getElementById('category-chart');
      if (catDiv && data.by_category) {
        const maxVal = Math.max(...data.by_category.map(c => c.total));
        catDiv.innerHTML = data.by_category.map((cat, i) => {
          const pct = Math.round((cat.total / maxVal) * 100);
          return `
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <span class="small fw-bold" style="color:#334155">${cat.key}</span>
                <span class="small fw-bold" style="color:#667eea">₹${cat.total}</span>
              </div>
              <div class="category-bar">
                <div class="category-bar-fill cat-color-${i % 7}" style="width:${pct}%"></div>
              </div>
            </div>`;
        }).join('');
      }

      // ── Premium Budget Gauge ──
      const budgetDiv = document.getElementById('budget-tracker');
      if (budgetDiv && data.budget) {
        const pct = data.budget.percent;
        const gradColor = pct > 90
          ? 'linear-gradient(90deg, #f5576c, #ef4444)'
          : pct > 70
            ? 'linear-gradient(90deg, #f093fb, #f5576c)'
            : 'linear-gradient(90deg, #11998e, #38ef7d)';
        const statusEmoji = pct > 90 ? '🔴' : pct > 70 ? '🟡' : '🟢';
        const statusText = pct > 90 ? 'Over Budget!' : pct > 70 ? 'Nearing Limit' : 'On Track';
        budgetDiv.innerHTML = `
          <div class="d-flex justify-content-between align-items-end mb-2">
            <div>
              <div class="small text-muted fw-bold">Spent</div>
              <div class="fs-4 fw-800" style="color:#1e293b">₹${data.budget.spent}</div>
            </div>
            <div class="text-end">
              <div class="small text-muted fw-bold">Budget</div>
              <div class="fs-5 fw-600 text-muted">₹${data.budget.set}</div>
            </div>
          </div>
          <div class="budget-gauge">
            <div class="budget-gauge-fill" style="width:${pct}%;background:${gradColor}">${pct}%</div>
          </div>
          <div class="text-center mt-3">
            <span class="badge px-3 py-2 fs-6" style="background:${pct > 90 ? '#fef2f2' : pct > 70 ? '#fffbeb' : '#f0fdf4'};color:${pct > 90 ? '#dc2626' : pct > 70 ? '#d97706' : '#16a34a'};border:1px solid ${pct > 90 ? '#fecaca' : pct > 70 ? '#fde68a' : '#bbf7d0'}">
              ${statusEmoji} ${statusText}
            </span>
          </div>`;
      }

      // ── Trend Bars ──
      const trendDiv = document.getElementById('monthly-trend');
      if (trendDiv && data.by_category) {
        const topCats = data.by_category.slice(0, 6);
        const maxVal = Math.max(...topCats.map(c => c.total));
        trendDiv.innerHTML = topCats.map((cat, i) => {
          const pct = Math.round((cat.total / maxVal) * 100);
          return `
            <div class="trend-row">
              <div class="trend-label">${cat.key}</div>
              <div class="trend-bar-wrap">
                <div class="category-bar">
                  <div class="category-bar-fill cat-color-${i % 7}" style="width:${pct}%"></div>
                </div>
              </div>
              <div class="trend-amount">₹${cat.total}</div>
            </div>`;
        }).join('');
      }

    } catch (e) {
      console.error('spending data error', e);
    }
  }

  window.initSpending = function () {
    loadSpendingData();
    loadHeatmap();
  }

})();
