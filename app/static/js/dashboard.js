document.addEventListener('DOMContentLoaded', () => {
  const App = window.App || {};
  const els = (App && App.els) || {};
  const log = (App && App.utils && App.utils.log) ? App.utils.log : () => {};
  const getApiHeaders = (App && App.utils && App.utils.getApiHeaders) ? App.utils.getApiHeaders : (e=>e||{});

  function updateBannerSticky() {
    const leftPanel = els.tabWrapper || document.querySelector('.tab-wrapper');
    const rightPanel = els.rightPanel || document.querySelector('.right-panel');
    const banner = els.banner || document.querySelector('.banner');
    const container = els.container || document.querySelector('.container');
    const leftScrolled = leftPanel && leftPanel.scrollTop > 0;
    const rightScrolled = rightPanel && rightPanel.scrollTop > 0;

    if (!banner || !container) return;

    if (leftScrolled || rightScrolled) {
      if (!banner.classList.contains('sticky')) {
        banner.classList.add('sticky');
        container.style.marginTop = `${banner.offsetHeight}px`;
      }
    } else if (banner.classList.contains('sticky')) {
      banner.classList.remove('sticky');
      container.style.marginTop = '0';
    }
  }

  if (els.tabWrapper) els.tabWrapper.addEventListener('scroll', updateBannerSticky);
  if (els.rightPanel) els.rightPanel.addEventListener('scroll', updateBannerSticky);
  window.addEventListener('resize', updateBannerSticky);

  async function refreshJSON() {
    const userIdInput = els.userIdInput;
    if (!userIdInput || !userIdInput.value.trim()) {
      log('Cannot refresh — User ID is empty.', 'error');
      return;
    }
    try {
      const res = await fetch(`${App.api.base}/getall`, { headers: getApiHeaders() });
      if (!res.ok) {
        log('Failed to fetch JSON from backend.', 'error');
        return;
      }
      const json = await res.json();
      if (els.dataOutput) els.dataOutput.value = JSON.stringify(json, null, 2);
      log('Refreshed JSON.');
    } catch (err) {
      log('Refresh error: ' + err.message, 'error');
    }
  }

  async function updateJSON() {
    const userIdInput = els.userIdInput;
    if (!userIdInput || !userIdInput.value.trim()) {
      log('Cannot update — User ID is empty.', 'error');
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(els.dataOutput.value);
    } catch (err) {
      log('Update failed — invalid JSON.', 'error');
      return;
    }
    try {
      const res = await fetch(`${App.api.base}/setall`, {
        method: 'POST',
        headers: getApiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(parsed),
      });
      if (!res.ok) {
        log('Backend rejected update.', 'error');
        return;
      }
      log('Updated backend JSON successfully.');
    } catch (err) {
      log('Update request failed: ' + err.message, 'error');
    }
  }

  function performSearch() {
    const searchBox = els.searchBox;
    const searchResults = els.searchResults;
    const dataOutput = els.dataOutput;
    if (!searchBox || !searchResults || !dataOutput) return;

    const query = searchBox.value.trim().toLowerCase();
    let json;
    try {
      json = JSON.parse(dataOutput.value);
    } catch {
      searchResults.innerHTML = '<i>Invalid JSON in dataOutput</i>';
      log('Search aborted — invalid JSON in viewer.', 'error');
      return;
    }
    if (!query) {
      searchResults.innerHTML = '';
      return;
    }
    const matches = [];
    for (const key in json) {
      if (Object.prototype.hasOwnProperty.call(json, key) && key.toLowerCase().includes(query)) {
        matches.push(`<b>${key}</b>: ${JSON.stringify(json[key])}`);
      }
    }
    searchResults.innerHTML = matches.length ? matches.join('<br><br>') : '<i>No matches found</i>';
    log(matches.length ? `Search matched ${matches.length} key(s).` : 'Search found no matches.');
  }

  function bindDataTabOnce() {
    const refreshBtn = els.refreshBtn;
    const updateBtn = els.updateBtn;
    if (refreshBtn && !refreshBtn.__bound) {
      refreshBtn.addEventListener('click', refreshJSON);
      refreshBtn.__bound = true;
    }
    if (updateBtn && !updateBtn.__bound) {
      updateBtn.addEventListener('click', updateJSON);
      updateBtn.__bound = true;
    }
  }

  bindDataTabOnce();

  document.addEventListener('tabchange', (e) => {
    if (e && e.detail && e.detail.tab === 'data') {
      bindDataTabOnce();
      refreshJSON();
    }
  });
  if (els.searchBox) els.searchBox.addEventListener('input', performSearch);

  if (els.dataOutput) {
    try {
      const activeTab = localStorage.getItem('incremental_active_tab');
      if (activeTab === 'data') {
        refreshJSON();
      }
    } catch (e) {}
    log('Dashboard ready.');
    updateBannerSticky();
  }
});
