## Incremental System

Flask-backed JSON store with a lightweight, single-page dashboard UI.

### Quick start
```powershell
python -m venv .venv
\.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```
Open http://localhost:5000 and enter the shared key (`richardli-secret` by default) in the User ID box to unlock API calls.

Environment variables
- Create a local `.env` file at the project root to store secrets during development. Example keys are provided in `.env.example`.
- The app loads `.env` automatically when running `run.py` (via `python-dotenv`). Do NOT commit `.env` to source control — it is ignored by `.gitignore`.

### Project layout
```
app/
	__init__.py        # Flask factory & blueprint registration
	config.py          # Secret key + datastore path
	routes/
		api.py           # CRUD + increment endpoints
		dashboard.py     # Serves the HTML dashboard
	services/
		datastore.py     # Thread-safe JSON file helpers
		security.py      # Shared-secret decorator
	templates/
		dashboard.html   # Single-page dashboard with tabs
	static/js/
		refs.js          # Central window.App { els, api.base, utils }
		shared_ui.js     # Tabs, persistence (userId), tabchange event
		dashboard.js     # Data tab: refresh/setall, search, sticky banner
		api_generator.js # API Gen tab: keys loading, nested population, snippets
run.py               # Dev entry point (python run.py)
app.py               # Back-compat runner for hosting platforms
data.json            # Persistent JSON store
```

### Frontend architecture
- Single template (`dashboard.html`) renders three tabs: `dashboard`, `data`, `apigen` inside a `.tab-wrapper` and a right-side Activity Log.
- `refs.js` initializes `window.App`:
	- `App.api.base`: `window.location.origin`
	- `App.els`: all DOM elements (by id and common classes) loaded once
	- `App.utils.log(message, type)`: writes to `#logBox`
	- `App.utils.getApiHeaders(extra)`: injects `X-API-KEY` from `#userIdInput`
- Script load order (important): include `refs.js` before `shared_ui.js`, `dashboard.js`, and `api_generator.js`.
- Activity Log clears on page refresh; `userId` and active tab persist via `localStorage`.

### API basics
- All endpoints expect `X-API-KEY: richardli-secret` (or `?api_key=`).
- `POST /increment` body: `{ "keys": ["path","to","value"], "amount": 2 }`.
- `test_requests.py` contains a working increment example.