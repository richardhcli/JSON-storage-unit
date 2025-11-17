const API_BASE = window.location.origin;

const key1 = document.getElementById('key1');
const key2 = document.getElementById('key2');
const amount = document.getElementById('amount');
const generateBtn = document.getElementById('generateBtn');
const refreshKeysBtn = document.getElementById('refreshKeysBtn');
const headersOut = document.getElementById('headersOut');
const bodyOut = document.getElementById('bodyOut');
const jsOut = document.getElementById('jsOut');
const userIdInput = document.getElementById('userIdInput');

// Lightweight logging helper that writes to the central log box if available
function log(message, type = 'info') {
  try {
    const lb = document.getElementById('logBox');
    const time = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '[ERROR]' : '[OK]';
    if (lb) {
      lb.textContent += `${time} ${prefix} ${message}\n`;
      lb.scrollTop = lb.scrollHeight;
    } else {
      // Fallback to console when no log box present
      if (type === 'error') console.error(message);
      else console.log(message);
    }
  } catch (e) {
    console.warn('Log failed', e);
  }
}

function getAuthHeaders(extra = {}) {
  const headers = Object.assign({}, extra);
  const apiKey = userIdInput && userIdInput.value && userIdInput.value.trim();
  if (apiKey) headers['X-API-KEY'] = apiKey;
  return headers;
}

async function loadKeys() {
  if (!key1) return;
  key1.innerHTML = '<option value="">(loading...)</option>';
  key2.innerHTML = '<option value="">(none)</option>';
  log('Loading top-level keys...');
  try {
    const res = await fetch(`${API_BASE}/getall`, { headers: getAuthHeaders() });
    if (!res.ok) {
      const txt = await res.text().catch(()=>'<no body>');
      throw new Error(`Failed to fetch keys (status ${res.status}): ${txt}`);
    }
    const data = await res.json();
    const keys = Object.keys(data || {});
    key1.innerHTML = '<option value="">(select...)</option>' + keys.map(k=>`<option value="${k}">${k}</option>`).join('');
    key2.innerHTML = '<option value="">(none)</option>';
    log(`Loaded ${keys.length} top-level keys.`);
  } catch (err) {
    key1.innerHTML = '<option value="">(error)</option>';
    log(`loadKeys error: ${err.message}`, 'error');
    console.error(err);
  }
}

// when key1 changes, try to populate key2 if it's an object
async function populateNested() {
  if (!key2) return;
  key2.innerHTML = '<option value="">(none)</option>';
  const k = key1.value;
  if (!k) return;
  log(`Populating nested keys for '${k}'...`);
  try {
    const res = await fetch(`${API_BASE}/getall`, { headers: getAuthHeaders() });
    if (!res.ok) {
      const txt = await res.text().catch(()=>'<no body>');
      log(`populateNested fetch failed: status ${res.status} ${txt}`, 'error');
      return;
    }
    const data = await res.json();
    const node = data && data[k];
    if (node && typeof node === 'object' && !Array.isArray(node)) {
      const nested = Object.keys(node);
      if (nested.length) {
        key2.innerHTML = '<option value="">(none)</option>' + nested.map(n=>`<option value="${n}">${n}</option>`).join('');
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
  const k1 = key1 ? key1.value : '';
  const k2 = key2 ? key2.value : '';
  const amt = Number(amount.value) || 1;
  if (!k1) {
    alert('Select a top-level key');
    return;
  }

  const keys = k2 ? [k1, k2] : [k1];
  const body = { keys, amount: amt };

  const apiKey = userIdInput && userIdInput.value && userIdInput.value.trim();
  headersOut.textContent = `Content-Type: application/json\nX-API-KEY: ${apiKey ? apiKey : '<your-secret>'}`;
  bodyOut.textContent = JSON.stringify(body, null, 2);
  log(`Generated increment for keys ${JSON.stringify(keys)} amount=${amt}`);

  const headerLiteral = apiKey ? apiKey : '<YOUR_SECRET>';
  const jsExample = `const payload = ${JSON.stringify(body, null, 2)};\n\nfetch('${API_BASE}/increment', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json', 'X-API-KEY': '${headerLiteral}' },\n  body: JSON.stringify(payload)\n}).then(r => r.json()).then(console.log).catch(console.error);`;

  jsOut.textContent = jsExample;
}

if (generateBtn) generateBtn.addEventListener('click', generate);
if (refreshKeysBtn) refreshKeysBtn.addEventListener('click', loadKeys);
if (key1) key1.addEventListener('change', populateNested);

// initial load
loadKeys();
