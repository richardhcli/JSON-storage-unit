// Text notes panel controller (dashboard tab)
(function () {
  const ensureRefs = () => {
    const App = window.App || {};
    App.els = App.els || {};
    App.utils = App.utils || {};
    App.api = App.api || { base: window.location.origin };
    return App;
  };

  async function fetchText(App) {
    const log = App.utils.log || ((msg) => console.log(msg));
    App.els.textNotes = App.els.textNotes || document.getElementById('textNotes');
    try {
      const res = await fetch(`${App.api.base}/getText`, { method: 'GET', cache: 'no-cache' });
      if (!res.ok) {
        log(`Failed to load notes (status ${res.status}).`, 'error');
        return;
      }
      const data = await res.json();
      if (App.els.textNotes) {
        App.els.textNotes.value = data && typeof data.text === 'string' ? data.text : '';
      }
      log('Loaded text notes.');
    } catch (err) {
      log(`Error fetching text notes: ${err.message}`, 'error');
    }
  }

  async function updateText(App) {
    const log = App.utils.log || ((msg) => console.log(msg));
    App.els.textNotes = App.els.textNotes || document.getElementById('textNotes');
    if (!App.els.textNotes) {
      log('Cannot update notes — textarea not found.', 'error');
      return;
    }
    try {
      const res = await fetch(`${App.api.base}/setText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: App.els.textNotes.value || '' }),
      });
      if (!res.ok) {
        log(`Failed to update notes (status ${res.status}).`, 'error');
        return;
      }
      const data = await res.json();
      if (data && typeof data.text === 'string' && App.els.textNotes) {
        App.els.textNotes.value = data.text;
      }
      log('Updated text notes.');
    } catch (err) {
      log(`Error updating text notes: ${err.message}`, 'error');
    }
  }

  function bindEvents() {
    const App = ensureRefs();
    const log = App.utils.log || ((msg) => console.log(msg));

    App.els.textNotes = App.els.textNotes || document.getElementById('textNotes');
    App.els.textRefreshBtn = App.els.textRefreshBtn || document.getElementById('textRefreshBtn');
    App.els.textUpdateBtn = App.els.textUpdateBtn || document.getElementById('textUpdateBtn');

    const bindButton = (btn, handler) => {
      if (btn && !btn.__bound) {
        btn.addEventListener('click', handler);
        btn.__bound = true;
      }
    };

    bindButton(App.els.textRefreshBtn, () => {
      fetchText(ensureRefs());
    });
    bindButton(App.els.textUpdateBtn, () => {
      updateText(ensureRefs());
    });

    if (!bindEvents._initialized) {
      document.addEventListener('tabchange', (e) => {
        if (e && e.detail && e.detail.tab === 'dashboard') {
          fetchText(ensureRefs());
        }
      });
      bindEvents._initialized = true;
    }

    // Auto-load if dashboard is active on load
    try {
      const activeTab = localStorage.getItem('incremental_active_tab') || 'dashboard';
      if (activeTab === 'dashboard') {
        fetchText(App);
      }
    } catch (err) {
      log(`Could not determine active tab: ${err.message}`, 'error');
      fetchText(App);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEvents);
  } else {
    bindEvents();
  }
})();
