(function () {
  const App = (window.App = window.App || {});

  // API info
  App.api = App.api || { base: window.location.origin };

  // Element references bucket
  App.els = App.els || {};

  // Utilities shared across modules
  App.utils = App.utils || {};

  App.utils.log = function log(message, type = 'info') {
    try {
      const lb = App.els.logBox || document.getElementById('logBox');
      const time = new Date().toLocaleTimeString();
      const prefix = type === 'error' ? '[ERROR]' : '[OK]';
      if (lb) {
        lb.textContent += `${time} ${prefix} ${message}\n`;
        lb.scrollTop = lb.scrollHeight;
      } else {
        if (type === 'error') console.error(message);
        else console.log(message);
      }
    } catch (e) {
      console.warn('App.utils.log failed', e);
    }
  };

  App.utils.getApiHeaders = function getApiHeaders(extra = {}) {
    const headers = Object.assign({}, extra);
    const userIdInput = App.els.userIdInput || document.getElementById('userIdInput');
    const apiKey = userIdInput && userIdInput.value && userIdInput.value.trim();
    if (apiKey) headers['X-API-KEY'] = apiKey;
    return headers;
  };

  function loadElements() {
    // Gather all IDs used across modules
    const ids = [
      'dataOutput',
      'refreshBtn',
      'updateBtn',
      'searchBox',
      'searchResults',
      'logBox',
      'userIdInput',
      'rootLevelKeySelect',
      'childLevelKeySelect',
      'amount',
      'generateBtn',
      'refreshKeysBtn',
      'headersOut',
      'bodyOut',
      'jsOut',
      'tab-dashboard',
      'tab-data',
      'tab-apigen'
    ];
    ids.forEach((id) => {
      App.els[id] = document.getElementById(id);
    });

    // Common class-based references
    App.els.tabWrapper = document.querySelector('.tab-wrapper');
    App.els.rightPanel = document.querySelector('.right-panel');
    App.els.banner = document.querySelector('.banner');
    App.els.container = document.querySelector('.container');
    App.els.tabButtons = document.querySelectorAll('.tab-button');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadElements);
  } else {
    loadElements();
  }
})();
