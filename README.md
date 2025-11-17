## Incremental System

Flask-backed JSON store with a lightweight dashboard UI for managing personal goals/plans.

### Quick start
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install flask requests python-dotenv
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
		dashboard.html   # Frontend layout
	static/js/
		dashboard.js     # Frontend logic
run.py               # Dev entry point (python run.py)
app.py               # Back-compat runner for hosting platforms
data.json            # Persistent JSON store
```

### API basics
- All endpoints expect `X-API-KEY: richardli-secret` (or `?api_key=`).
- `POST /increment` body: `{ "keys": ["path","to","value"], "amount": 2 }`.
- `test_requests.py` contains a working increment example.