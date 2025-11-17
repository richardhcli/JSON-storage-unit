// Auto-detect backend host
const API_BASE = window.location.origin;

// DOM elements
const dataOutput = document.getElementById("dataOutput");
const refreshBtn = document.getElementById("refreshBtn");
const updateBtn = document.getElementById("updateBtn");
const searchBox = document.getElementById("searchBox");
const searchResults = document.getElementById("searchResults");

// Refresh JSON from backend
async function refreshJSON() {
  try {
    const res = await fetch(`${API_BASE}/getall`);
    const json = await res.json();
    dataOutput.value = JSON.stringify(json, null, 2);
  } catch (err) {
    alert("Failed to refresh: " + err);
  }
}

// Update backend with textarea JSON
async function updateJSON() {
  try {
    const parsed = JSON.parse(dataOutput.value);
    await fetch(`${API_BASE}/setall`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed)
    });
    alert("Updated JSON!");
  } catch (err) {
    alert("Invalid JSON or update failed: " + err);
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
}

// Event bindings
refreshBtn.onclick = refreshJSON;
updateBtn.onclick = updateJSON;
searchBox.addEventListener("input", performSearch);

// Load initial JSON
refreshJSON();
