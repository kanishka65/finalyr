(function () {
  const csvInput = document.getElementById('csv-input');
  const upiInput = document.getElementById('upi-input');
  const preview = document.getElementById('csv-preview');
  const purchasesTable = document.getElementById('purchases-table');

  if (csvInput) setupUpload(csvInput, '/purchases/upload-csv');
  if (upiInput) setupUpload(upiInput, '/purchases/upload-upi');

  // Expose to global scope for initial load or manual refresh
  window.loadPurchases = async function () {
    if (!purchasesTable) return;
    purchasesTable.innerHTML = '<div class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Loading orders...</div>';

    try {
      const { purchases } = await api.get('/purchases');
      if (purchases && purchases.length > 0) {
        renderPurchases(purchases);
      } else {
        purchasesTable.innerHTML = '<p class="text-muted text-center py-4">No order data available.</p>';
      }
    } catch (e) {
      console.error('Failed to load purchases', e);
      purchasesTable.innerHTML = '<div class="alert alert-danger">Failed to load purchases.</div>';
    }
  };

  function renderPurchases(purchases) {
    // Sort by date descending
    const sorted = [...purchases].sort((a, b) => new Date(b.order_datetime) - new Date(a.order_datetime));

    let html = `
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Date</th>
              <th>Item</th>
              <th>Platform</th>
              <th>Category</th>
              <th class="text-end">Qty</th>
              <th class="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
    `;

    sorted.forEach(p => {
      const dt = new Date(p.order_datetime);
      const dateStr = dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const timeStr = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      html += `
        <tr>
          <td>
            <div class="fw-bold">${dateStr}</div>
            <small class="text-muted">${timeStr}</small>
          </td>
          <td>
            <div class="fw-semibold">${p.item_name}</div>
          </td>
          <td>
            <span class="badge ${getPlatformBadge(p.platform)}">${p.platform}</span>
          </td>
          <td>
            <small class="text-muted uppercase">${p.category}</small>
          </td>
          <td class="text-end">${p.quantity}</td>
          <td class="text-end fw-bold text-primary">₹${p.total_amount}</td>
        </tr>
      `;
    });

    html += '</tbody></table></div>';
    purchasesTable.innerHTML = html;
  }

  function getPlatformBadge(platform) {
    if (platform === 'Blinkit') return 'bg-warning text-dark';
    if (platform === 'Zepto') return 'bg-info text-white';
    if (platform === 'Swiggy Instamart') return 'bg-orange text-white';
    return 'bg-secondary';
  }

  function setupUpload(el, endpoint) {
    el.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          renderPreview(results.data, endpoint, el);
        },
        error: function (err) { preview.innerHTML = '<div class="text-danger">CSV parse error</div>'; }
      });
    });
  }

  function renderPreview(rows, endpoint, inputEl) {
    preview.innerHTML = '';
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-responsive mb-3';

    const table = document.createElement('table');
    table.className = 'table table-sm table-striped';
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr>' + Object.keys(rows[0] || {}).slice(0, 5).map(h => `<th>${h}</th>`).join('') + '</tr>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.slice(0, 5).forEach(r => {
      const tr = document.createElement('tr');
      Object.keys(r).slice(0, 5).forEach(k => tr.innerHTML += `<td>${(r[k] || '').toString().slice(0, 25)}</td>`);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    preview.appendChild(tableContainer);

    const btn = document.createElement('button');
    btn.className = endpoint.includes('upi') ? 'btn btn-info w-100' : 'btn btn-primary w-100';
    btn.innerHTML = `<i class="fas fa-cloud-upload-alt me-2"></i>Process ${rows.length} records`;

    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

      const form = new FormData();
      const csv = Papa.unparse(rows);
      form.append('file', new Blob([csv], { type: 'text/csv' }), 'upload.csv');

      try {
        const res = await api.uploadCSV(endpoint, form);
        alert(res.message + (res.inserted ? ` (${res.inserted} items added)` : ' (None found/Error)'));
        preview.innerHTML = '';
        inputEl.value = '';
        if (window.loadPurchases) window.loadPurchases();
      } catch (e) {
        alert('Upload failed: ' + (e.error || 'Unknown error'));
        btn.disabled = false;
        btn.textContent = `Retry processing ${rows.length} records`;
      }
    });
    preview.appendChild(btn);
  }

})();
