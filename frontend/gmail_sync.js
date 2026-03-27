(function () {
    const btn = document.getElementById('btnConnectGmail');

    window.syncGmail = async function() {
        if (!btn) return;
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Syncing...';
        
        try {
            const res = await api.post('/email/sync', {});
            // Use a toast or small alert instead of blocking alert if possible, 
            // but for demo a small alert is fine.
            console.log(`Success! Found ${res.new_orders} new order(s).`);
            
            // Refresh dashboard and purchases if active
            if (window.initDashboard) window.initDashboard();
            if (window.initPurchases) window.initPurchases();
            
            btn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Synced Just Now';
            setTimeout(() => { btn.innerHTML = originalHtml; }, 3000);
        } catch (err) {
            console.error('Gmail sync error:', err);
            btn.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Sync Failed';
            setTimeout(() => { btn.innerHTML = originalHtml; }, 3000);
        }
    };

    window.reconnectGmail = function() {
        alert('Redirecting to Google OAuth... (Simulation)');
        window.syncGmail();
    };

    // Check initial status
    async function checkStatus() {
        try {
            const status = await api.get('/email/status');
            if (status.connected && btn) {
                btn.className = 'btn btn-success btn-sm dropdown-toggle shadow-sm';
                btn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Gmail Connected';
            }
        } catch (e) {}
    }

    if (btn) checkStatus();
})();
