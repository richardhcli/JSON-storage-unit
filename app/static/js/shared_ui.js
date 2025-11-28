
// Centralized UI init leveraging window.App refs and utils.
document.addEventListener('DOMContentLoaded', () => {
  try {
    const App = window.App || {};
    const els = (App && App.els) || {};

    // Restore saved user id
    try {
      const savedId = localStorage.getItem('incremental_user_id');
      if (els.userIdInput && savedId) els.userIdInput.value = savedId;
    } catch (e) {
      console.warn('Could not restore user id from localStorage', e);
    }

    // Persist user id on input
    if (els.userIdInput) {
      els.userIdInput.addEventListener('input', () => {
        try {
          localStorage.setItem('incremental_user_id', els.userIdInput.value);
        } catch (e) {}
      });
    }

    // Tab handling: show one tab panel at a time, persist selection
    const tabPanels = {
      dashboard: els['tab-dashboard'] || document.getElementById('tab-dashboard'),
      data: els['tab-data'] || document.getElementById('tab-data'),
      apigen: els['tab-apigen'] || document.getElementById('tab-apigen'),
      about: els['tab-about'] || document.getElementById('tab-about'),
    };

    function setActiveTab(tab) {
      try {
        localStorage.setItem('incremental_active_tab', tab);
      } catch (e) {}
      Object.entries(tabPanels).forEach(([name, el]) => {
        if (!el) return;
        if (name === tab) el.classList.add('active');
        else el.classList.remove('active');
      });
      const buttons = els.tabButtons || document.querySelectorAll('.tab-button');
      if (buttons && buttons.forEach) {
        buttons.forEach((btn) => {
          if (btn.dataset.tab === tab) btn.disabled = true;
          else btn.disabled = false;
        });
      }
      try {
        document.dispatchEvent(new CustomEvent('tabchange', { detail: { tab } }));
      } catch (_) {}
    }

    const buttons = els.tabButtons || document.querySelectorAll('.tab-button');
    if (buttons && buttons.length) {
      buttons.forEach((btn) => btn.addEventListener('click', () => setActiveTab(btn.dataset.tab)));
      const savedTab = localStorage.getItem('incremental_active_tab') || 'dashboard';
      setActiveTab(savedTab);

      // Banner title click handler - navigate to dashboard tab
      const bannerTitle = document.querySelector('.banner-title');
      if (bannerTitle) {
        bannerTitle.addEventListener('click', (e) => {
          e.preventDefault();
          setActiveTab('dashboard');
        });
      }

      // Allow in-panel nav links to switch tabs
      document
        .querySelectorAll('[data-action="show-dashboard"]')
        .forEach((a) => a.addEventListener('click', (e) => {
          e.preventDefault();
          setActiveTab('dashboard');
        }));
      document
        .querySelectorAll('[data-action="show-data"]')
        .forEach((a) => a.addEventListener('click', (e) => {
          e.preventDefault();
          setActiveTab('data');
        }));
      document
        .querySelectorAll('[data-action="show-apigen"]')
        .forEach((a) => a.addEventListener('click', (e) => {
          e.preventDefault();
          setActiveTab('apigen');
        }));
      document
        .querySelectorAll('[data-action="show-about"]')
        .forEach((a) => a.addEventListener('click', (e) => {
          e.preventDefault();
          setActiveTab('about');
        }));
    }
  } catch (err) {
    console.warn('shared_ui init failed', err);
  }
});
