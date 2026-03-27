(function () {
  // ─── Nutrition Advisor Module ───
  // Renders calorie tracking, protein intake, health score, and smart recommendations

  async function loadNutrition() {
    try {
      const data = await api.get('/insights/nutrition');
      renderHealthScore(data.health_score);
      renderCalorieTracker(data.calories);
      renderMacroBreakdown(data.macros);
      renderNutritionTable(data.items);
      renderRecommendations(data.recommendations);
    } catch (e) {
      console.error('Nutrition load error:', e);
    }
  }

  function renderHealthScore(score) {
    const el = document.getElementById('health-score');
    if (!el) return;

    const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
    const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement';
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (score / 100) * circumference;

    el.innerHTML = `
      <div class="text-center">
        <svg width="160" height="160" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" stroke-width="8"/>
          <circle cx="60" cy="60" r="54" fill="none" stroke="${color}" stroke-width="8"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
            stroke-linecap="round" transform="rotate(-90 60 60)"
            style="transition: stroke-dashoffset 1s ease-in-out;"/>
          <text x="60" y="55" text-anchor="middle" font-size="28" font-weight="700" fill="${color}">${score}</text>
          <text x="60" y="72" text-anchor="middle" font-size="10" fill="#6b7280">${label}</text>
        </svg>
        <p class="mt-2 mb-0 fw-semibold" style="color:${color}">Nutrition Health Score</p>
        <small class="text-muted">Based on your last 30 days of purchases</small>
      </div>`;
  }

  function renderCalorieTracker(cal) {
    const el = document.getElementById('calorie-tracker');
    if (!el || !cal) return;

    const pct = Math.min(100, Math.round((cal.consumed / cal.goal) * 100));
    const barColor = pct > 100 ? '#ef4444' : pct > 85 ? '#f59e0b' : '#10b981';

    el.innerHTML = `
      <h6 class="mb-3"><i class="fas fa-fire-alt me-2 text-warning"></i>Weekly Calorie Intake</h6>
      <div class="d-flex justify-content-between mb-1">
        <span class="fw-semibold">${cal.consumed.toLocaleString()} kcal consumed</span>
        <span class="text-muted">Goal: ${cal.goal.toLocaleString()} kcal</span>
      </div>
      <div class="progress mb-3" style="height:12px;border-radius:8px;">
        <div class="progress-bar" role="progressbar" style="width:${pct}%;background:${barColor};border-radius:8px;" 
          aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">${pct}%</div>
      </div>
      <div class="row text-center g-2">
        <div class="col-4">
          <div class="p-2 rounded-3" style="background:rgba(16,185,129,0.1)">
            <div class="fw-bold text-success">${cal.avg_daily}</div>
            <small class="text-muted">Avg Daily</small>
          </div>
        </div>
        <div class="col-4">
          <div class="p-2 rounded-3" style="background:rgba(245,158,11,0.1)">
            <div class="fw-bold text-warning">${cal.peak_day}</div>
            <small class="text-muted">Peak Day</small>
          </div>
        </div>
        <div class="col-4">
          <div class="p-2 rounded-3" style="background:rgba(59,130,246,0.1)">
            <div class="fw-bold text-primary">${cal.lowest_day}</div>
            <small class="text-muted">Lowest Day</small>
          </div>
        </div>
      </div>`;
  }

  function renderMacroBreakdown(macros) {
    const el = document.getElementById('macro-breakdown');
    if (!el || !macros) return;

    // Clear previous content
    el.innerHTML = '<h6 class="mb-4"><i class="fas fa-chart-pie me-2 text-info"></i>Macronutrient Distribution</h6>';

    const chartContainer = document.createElement('div');
    chartContainer.className = 'row align-items-center';
    chartContainer.innerHTML = '<div class="col-md-5" id="macro-chart"></div><div class="col-md-7" id="macro-legend"></div>';
    el.appendChild(chartContainer);

    const data = macros.map(m => ({ name: m.name, value: m.current, color: m.color }));
    const width = 160, height = 160, margin = 10;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select('#macro-chart')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value(d => d.value).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius);

    svg.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', '#fff')
      .style('stroke-width', '2px')
      .style('opacity', 0.8)
      .on('mouseover', function () { d3.select(this).style('opacity', 1); })
      .on('mouseout', function () { d3.select(this).style('opacity', 0.8); });

    // Legend
    const legend = document.getElementById('macro-legend');
    legend.innerHTML = macros.map(m => `
          <div class="mb-3">
            <div class="d-flex justify-content-between mb-1">
              <span class="small fw-bold"><i class="fas fa-circle me-1" style="color:${m.color}"></i>${m.name}</span>
              <span class="small text-muted">${m.current}${m.unit}</span>
            </div>
            <div class="progress" style="height:6px;">
              <div class="progress-bar" style="width:${Math.min(100, Math.round((m.current / m.goal) * 100))}%;background:${m.color};"></div>
            </div>
          </div>`).join('');
  }

  function renderNutritionTable(items) {
    const el = document.getElementById('nutrition-items');
    if (!el || !items) return;

    let html = `
      <h6 class="mb-3"><i class="fas fa-utensils me-2 text-primary"></i>Item-wise Nutritional Analysis</h6>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Calories</th>
              <th>Protein</th>
              <th>Carbs</th>
              <th>Fat</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>`;

    items.forEach(item => {
      const ratingColor = item.rating === 'Healthy' ? 'success' : item.rating === 'Moderate' ? 'warning' : 'danger';
      const ratingIcon = item.rating === 'Healthy' ? 'check-circle' : item.rating === 'Moderate' ? 'exclamation-circle' : 'times-circle';
      html += `
            <tr>
              <td><strong>${item.name}</strong><br><small class="text-muted">${item.category}</small></td>
              <td>${item.quantity}</td>
              <td>${item.calories} kcal</td>
              <td>${item.protein}g</td>
              <td>${item.carbs}g</td>
              <td>${item.fat}g</td>
              <td><span class="badge bg-${ratingColor}"><i class="fas fa-${ratingIcon} me-1"></i>${item.rating}</span></td>
            </tr>`;
    });

    html += '</tbody></table></div>';
    el.innerHTML = html;
  }

  function renderRecommendations(recs) {
    const el = document.getElementById('nutrition-recs');
    if (!el || !recs) return;

    let html = '<h6 class="mb-3"><i class="fas fa-lightbulb me-2 text-warning"></i>Smart Nutrition Advice</h6>';
    recs.forEach(rec => {
      const iconMap = { tip: 'lightbulb', warning: 'exclamation-triangle', success: 'check-circle', info: 'info-circle' };
      const colorMap = { tip: 'warning', warning: 'danger', success: 'success', info: 'primary' };
      html += `
        <div class="d-flex align-items-start mb-3 p-3 rounded-3" style="background:rgba(${rec.type === 'warning' ? '239,68,68' : rec.type === 'success' ? '16,185,129' : rec.type === 'tip' ? '245,158,11' : '59,130,246'},0.08)">
          <i class="fas fa-${iconMap[rec.type]} text-${colorMap[rec.type]} me-3 mt-1 fa-lg"></i>
          <div>
            <strong class="d-block mb-1">${rec.title}</strong>
            <small class="text-muted">${rec.detail}</small>
          </div>
        </div>`;
    });
    el.innerHTML = html;
  }

  window.initNutrition = loadNutrition;
})();
