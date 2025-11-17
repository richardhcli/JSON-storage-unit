const API_BASE = window.location.origin;

// DOM references
const dataOutput = document.getElementById("dataOutput");
const refreshBtn = document.getElementById("refreshBtn");
const updateBtn = document.getElementById("updateBtn");
const searchBox = document.getElementById("searchBox");
const searchResults = document.getElementById("searchResults");
const logBox = document.getElementById("logBox");

// Log helper
function log(message, type = "info") {
  const time = new Date().toLocaleTimeString();
  const prefix = type === "error" ? "[ERROR]" : "[OK]";
  logBox.textContent += `${time} ${prefix} ${message}\n`;
  logBox.scrollTop = logBox.scrollHeight;  // auto-scroll
}

// Refresh JSON from backend
async function refreshJSON() {
  try {
    const res = await fetch(`${API_BASE}/getall`);
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

// Update backend with textarea JSON
async function updateJSON() {
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
      headers: { "Content-Type": "application/json" },
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

// Live auto-search
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

// Event bindings
refreshBtn.onclick = refreshJSON;
updateBtn.onclick = updateJSON;
searchBox.addEventListener("input", performSearch);

// Initial load
refreshJSON();
log("Dashboard ready.");
