// Persist userIdInput and activity log across page loads using localStorage.
document.addEventListener('DOMContentLoaded', () => {
  try {
    const userIdInput = document.getElementById('userIdInput');
    const logBox = document.getElementById('logBox');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = {
      dashboard: document.getElementById('tab-dashboard'),
      data: document.getElementById('tab-data'),
      apigen: document.getElementById('tab-apigen'),
    };

    // Restore saved user id
    try {
      const savedId = localStorage.getItem('incremental_user_id');
      if (userIdInput && savedId) userIdInput.value = savedId;
    } catch (e) {
      console.warn('Could not restore user id from localStorage', e);
    }

    // Persist user id on input
    if (userIdInput) {
      userIdInput.addEventListener('input', () => {
        try { localStorage.setItem('incremental_user_id', userIdInput.value); } catch (e) { }
      });
    }

    // Restore log contents
    try {
      const savedLog = localStorage.getItem('incremental_log');
      if (logBox && savedLog) logBox.textContent = savedLog;
    } catch (e) {
      console.warn('Could not restore log from localStorage', e);
    }

    // Watch for changes to the log box and persist them
    if (logBox) {
      const observer = new MutationObserver(() => {
        try { localStorage.setItem('incremental_log', logBox.textContent); } catch (e) { }
      });

      observer.observe(logBox, { childList: true, characterData: true, subtree: true });

      // Also persist periodically in case scripts overwrite textContent directly
      const intervalId = setInterval(() => {
        try { localStorage.setItem('incremental_log', logBox.textContent); } catch (e) { }
      }, 1000);

      // Stop interval when page unloads
      window.addEventListener('beforeunload', () => {
        clearInterval(intervalId);
        observer.disconnect();
      });
    }

    // Tab handling: show one left-panel section at a time, persist selection
    function setActiveTab(tab) {
      try { localStorage.setItem('incremental_active_tab', tab); } catch (e) {}
      Object.entries(tabPanels).forEach(([name, el]) => {
        if (!el) return;
        if (name === tab) el.classList.add('active');
        else el.classList.remove('active');
      });
      tabButtons.forEach(btn => {
        if (btn.dataset.tab === tab) btn.disabled = true; else btn.disabled = false;
      });
    }

    if (tabButtons && tabButtons.length) {
      tabButtons.forEach(btn => btn.addEventListener('click', () => setActiveTab(btn.dataset.tab)));
      const savedTab = localStorage.getItem('incremental_active_tab') || 'dashboard';
      setActiveTab(savedTab);

      // Allow in-panel nav links to switch tabs
      document.querySelectorAll('[data-action="show-dashboard"]').forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); setActiveTab('dashboard'); }));
      document.querySelectorAll('[data-action="show-data"]').forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); setActiveTab('data'); }));
      document.querySelectorAll('[data-action="show-apigen"]').forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); setActiveTab('apigen'); }));
    }
  } catch (err) {
    console.warn('shared_ui init failed', err);
  }
});
