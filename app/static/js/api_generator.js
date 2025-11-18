
document.addEventListener('DOMContentLoaded', () => {
  const App = window.App || {};
  const els = (App && App.els) || {};
  const log = (App && App.utils && App.utils.log) ? App.utils.log : () => {};
  const getApiHeaders = (App && App.utils && App.utils.getApiHeaders) ? App.utils.getApiHeaders : (e=>e||{});

  async function loadKeys() {
    if (!els.rootLevelKeySelect) return;
    els.rootLevelKeySelect.innerHTML = '<option value="">(loading...)</option>';
    if (els.childLevelKeySelect) els.childLevelKeySelect.innerHTML = '<option value="">(none)</option>';
    log('Loading top-level keys...');
    try {
      const res = await fetch(`${App.api.base}/getall`, { headers: getApiHeaders() });
      if (!res.ok) {
        const txt = await res.text().catch(() => '<no body>');
        throw new Error(`Failed to fetch keys (status ${res.status}): ${txt}`);
      }
      const data = await res.json();
      const keys = Object.keys(data || {});
      els.rootLevelKeySelect.innerHTML = '<option value="">(select...)</option>' + keys.map(k => `<option value="${k}">${k}</option>`).join('');
      if (els.childLevelKeySelect) els.childLevelKeySelect.innerHTML = '<option value="">(none)</option>';
      log(`Loaded ${keys.length} top-level keys.`);
    } catch (err) {
      els.rootLevelKeySelect.innerHTML = '<option value="">(error)</option>';
      log(`loadKeys error: ${err.message}`, 'error');
      console.error(err);
    }
  }

  // when key1 changes, try to populate key2 if it's an object
  async function populateNested() {
    if (!els.childLevelKeySelect) return;
    els.childLevelKeySelect.innerHTML = '<option value="">(none)</option>';
    const k = els.rootLevelKeySelect && els.rootLevelKeySelect.value;
    if (!k) return;
    log(`Populating nested keys for '${k}'...`);
    try {
      const res = await fetch(`${App.api.base}/getall`, { headers: getApiHeaders() });
      if (!res.ok) {
        const txt = await res.text().catch(() => '<no body>');
        log(`populateNested fetch failed: status ${res.status} ${txt}`, 'error');
        return;
      }
      const data = await res.json();
      const node = data && data[k];
      if (node && typeof node === 'object' && !Array.isArray(node)) {
        const nested = Object.keys(node);
        if (nested.length) {
          els.childLevelKeySelect.innerHTML = '<option value="">(none)</option>' + nested.map((n) => `<option value="${n}">${n}</option>`).join('');
          log(`Found ${nested.length} nested keys for '${k}'.`);
        } else {
          log(`No nested keys found for '${k}'.`);
        }
      } else {
        log(`Key '${k}' is not an object; no nested keys to populate.`);
      }
    } catch (err) {
      log(`populateNested error: ${err.message}`, 'error');
      console.error(err);
    }
  }

  function generate() {
    const k1 = els.rootLevelKeySelect ? els.rootLevelKeySelect.value : '';
    const k2 = els.childLevelKeySelect ? els.childLevelKeySelect.value : '';
    const amt = Number(els.amount && els.amount.value) || 1;
    if (!k1) {
      alert('Select a top-level key');
      return;
    }
    const keys = k2 ? [k1, k2] : [k1];
    const body = { keys, amount: amt };

    const userIdInput = els.userIdInput;
    const apiKey = userIdInput && userIdInput.value && userIdInput.value.trim();
    if (els.headersOut) els.headersOut.textContent = `Content-Type: application/json\nX-API-KEY: ${apiKey ? apiKey : '<your-secret>'}`;
    if (els.bodyOut) els.bodyOut.textContent = JSON.stringify(body, null, 2);
    log(`Generated increment for keys ${JSON.stringify(keys)} amount=${amt}`);

    const headerLiteral = apiKey ? apiKey : '<YOUR_SECRET>';
    const jsExample = `const payload = ${JSON.stringify(body, null, 2)};\n\nfetch('${App.api.base}/increment', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json', 'X-API-KEY': '${headerLiteral}' },\n  body: JSON.stringify(payload)\n}).then(r => r.json()).then(console.log).catch(console.error);`;
    if (els.jsOut) els.jsOut.textContent = jsExample;
  }

  function bindApiGenOnce() {
    const generateBtn = els.generateBtn || document.getElementById('generateBtn');
    const refreshKeysBtn = els.refreshKeysBtn || document.getElementById('refreshKeysBtn');
    const rootLevelKeySelect = els.rootLevelKeySelect || document.getElementById('rootLevelKeySelect');

    if (generateBtn && !generateBtn.__bound) {
      generateBtn.addEventListener('click', () => {
        log('Generate button clicked.');
        generate();
      });
      generateBtn.__bound = true;
    }
    if (refreshKeysBtn && !refreshKeysBtn.__bound) {
      refreshKeysBtn.addEventListener('click', () => {
        log('Refresh Keys button clicked.');
        loadKeys();
      });
      refreshKeysBtn.__bound = true;
    }
    if (rootLevelKeySelect && !rootLevelKeySelect.__boundChange) {
      rootLevelKeySelect.addEventListener('change', () => {
        log(`Root-level key changed to '${rootLevelKeySelect.value || '(empty)'}'.`);
        populateNested();
      });
      rootLevelKeySelect.__boundChange = true;
    }
  }

  bindApiGenOnce();
  loadKeys();

  document.addEventListener('tabchange', (e) => {
    if (e && e.detail && e.detail.tab === 'apigen') {
      bindApiGenOnce();
      loadKeys();
    }
  });
});
