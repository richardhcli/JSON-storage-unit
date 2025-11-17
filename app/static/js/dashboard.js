const API_BASE = window.location.origin;

// DOM references
const dataOutput = document.getElementById("dataOutput");
const refreshBtn = document.getElementById("refreshBtn");
const updateBtn = document.getElementById("updateBtn");
const searchBox = document.getElementById("searchBox");
const searchResults = document.getElementById("searchResults");
const logBox = document.getElementById("logBox");

// Panels & banner for sticky behavior
const leftPanel = document.querySelector('.left-panel');
const rightPanel = document.querySelector('.right-panel');
const banner = document.querySelector('.banner');
const container = document.querySelector('.container');
const userIdInput = document.getElementById("userIdInput");

function getApiHeaders(extra = {}) {
  const apiKey = userIdInput ? userIdInput.value.trim() : "";
  const headers = Object.assign({}, extra);
  if (apiKey) headers["X-API-KEY"] = apiKey;
  return headers;
}

if (userIdInput) {
  const saved = localStorage.getItem('incremental_user_id');
  if (saved) userIdInput.value = saved;
  let lastUserIdPresent = null;

  function checkUserIdPresence() {
    const has = userIdInput.value && userIdInput.value.trim().length > 0;
    if (!has && lastUserIdPresent !== false) {
      log('No User ID entered — API requests will be rejected by the server.', 'error');
    }
    if (has && lastUserIdPresent === false) {
      log('User ID entered.');
    }
    lastUserIdPresent = has;
  }

  userIdInput.addEventListener('input', () => {
    localStorage.setItem('incremental_user_id', userIdInput.value);
    checkUserIdPresence();
  });
  userIdInput.addEventListener('change', () => {
    log('User ID updated.');
    checkUserIdPresence();
  });

  checkUserIdPresence();
}

function updateBannerSticky() {
  const leftScrolled = leftPanel && leftPanel.scrollTop > 0;
  const rightScrolled = rightPanel && rightPanel.scrollTop > 0;

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

if (leftPanel) leftPanel.addEventListener('scroll', updateBannerSticky);
if (rightPanel) rightPanel.addEventListener('scroll', updateBannerSticky);
window.addEventListener('resize', updateBannerSticky);

function log(message, type = "info") {
  const time = new Date().toLocaleTimeString();
  const prefix = type === "error" ? "[ERROR]" : "[OK]";
  logBox.textContent += `${time} ${prefix} ${message}\n`;
  logBox.scrollTop = logBox.scrollHeight;
}

async function refreshJSON() {
  if (!userIdInput || !userIdInput.value.trim()) {
    log("Cannot refresh — User ID is empty.", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/getall`, { headers: getApiHeaders() });
    if (!res.ok) {
      log("Failed to fetch JSON from backend.", "error");
      return;
    }

    const json = await res.json();
    dataOutput.value = JSON.stringify(json, null, 2);
    log("Refreshed JSON.");
  } catch (err) {
    log("Refresh error: " + err.message, "error");
  }
}

async function updateJSON() {
  if (!userIdInput || !userIdInput.value.trim()) {
    log("Cannot update — User ID is empty.", "error");
    return;
  }

  let parsed;

  try {
    parsed = JSON.parse(dataOutput.value);
  } catch (err) {
    log("Update failed — invalid JSON.", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/setall`, {
      method: "POST",
      headers: getApiHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(parsed)
    });

    if (!res.ok) {
      log("Backend rejected update.", "error");
      return;
    }

    log("Updated backend JSON successfully.");
  } catch (err) {
    log("Update request failed: " + err.message, "error");
  }
}

function performSearch() {
  const query = searchBox.value.trim().toLowerCase();

  let json;
  try {
    json = JSON.parse(dataOutput.value);
  } catch {
    searchResults.innerHTML = "<i>Invalid JSON in dataOutput</i>";
    log("Search aborted — invalid JSON in viewer.", "error");
    return;
  }

  if (!query) {
    searchResults.innerHTML = "";
    return;
  }

  const matches = [];
  for (const key in json) {
    if (key.toLowerCase().includes(query)) {
      matches.push(`<b>${key}</b>: ${JSON.stringify(json[key])}`);
    }
  }

  searchResults.innerHTML =
    matches.length ? matches.join("<br><br>") : "<i>No matches found</i>";

  log(matches.length ? `Search matched ${matches.length} key(s).`
                     : "Search found no matches.");
}

refreshBtn.onclick = refreshJSON;
updateBtn.onclick = updateJSON;
searchBox.addEventListener("input", performSearch);

refreshJSON();
log("Dashboard ready.");
updateBannerSticky();
