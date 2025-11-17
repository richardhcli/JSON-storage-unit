from flask import Flask, request, jsonify
from flask import send_from_directory

import json
import os
import threading
from functools import wraps

app = Flask(__name__)

DATA_FILE = "data.json"
lock = threading.Lock()
# Hard-coded secret key for simple API access control.
# NOTE: For production use, read this from env vars or a secrets store.
SECRET_KEY = "richardli-secret"


def require_secret(func):
    """Decorator to require the shared secret on API requests.

    Accepts the key either via header `X-API-KEY` or query param `api_key`.
    Returns 401 if missing/invalid.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        # check header first, then query param
        key = request.headers.get("X-API-KEY") or request.args.get("api_key")
        if key != SECRET_KEY:
            return jsonify({"error": "Unauthorized - missing or invalid API key"}), 401
        return func(*args, **kwargs)
    return wrapper



@app.route("/")
def serve_dashboard():
    return send_from_directory(".", "dashboard.html")



# ---------- Helper Functions ---------- #

def load_data():
    """Load JSON dictionary from file, creating the file if missing."""
    if not os.path.exists(DATA_FILE):
        # Create empty JSON file
        with open(DATA_FILE, "w") as f:
            json.dump({}, f)
        return {}

    with open(DATA_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            # Reset corrupted file
            with open(DATA_FILE, "w") as f2:
                json.dump({}, f2)
            return {}


def save_data(data):
    """Save dictionary safely to JSON."""
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


# ---------- CRUD Routes ---------- #

@app.route("/get", methods=["GET"])
@require_secret
def get_value():
    key = request.args.get("key")
    if not key:
        return jsonify({"error": "Missing 'key' parameter"}), 400

    with lock:
        data = load_data()

    if key not in data:
        return jsonify({"error": "Key not found"}), 404

    return jsonify({"key": key, "value": data[key]})



@app.route("/add", methods=["POST"])
@require_secret
def add_value():
    json_in = request.get_json()
    if not json_in or "key" not in json_in or "value" not in json_in:
        return jsonify({"error": "JSON must include 'key' and 'value'"}), 400

    key = json_in["key"]
    value = json_in["value"]
    print(f"Adding key: {key} with value: {value}")
    
    with lock:
        data = load_data()
        if key in data:
            return jsonify({"error": "Key already exists"}), 409
        data[key] = value
        save_data(data)

    return jsonify({"success": True, "message": f"Added '{key}'"}), 201


@app.route("/update", methods=["POST"])
@require_secret
def update_value():
    json_in = request.get_json()
    if not json_in or "key" not in json_in or "value" not in json_in:
        return jsonify({"error": "JSON must include 'key' and 'value'"}), 400

    key = json_in["key"]
    value = json_in["value"]

    with lock:
        data = load_data()
        if key not in data:
            return jsonify({"error": "Key does not exist"}), 404
        data[key] = value
        save_data(data)

    return jsonify({"success": True, "message": f"Updated '{key}'"})


@app.route("/delete", methods=["POST"])
@require_secret
def delete_value():
    json_in = request.get_json()
    if not json_in or "key" not in json_in:
        return jsonify({"error": "JSON must include 'key'"}), 400

    key = json_in["key"]

    with lock:
        data = load_data()
        if key not in data:
            return jsonify({"error": "Key not found"}), 404
        del data[key]
        save_data(data)

    return jsonify({"success": True, "message": f"Deleted '{key}'"})




@app.route("/getall", methods=["GET"])
@require_secret
def get_all():
    with lock:
        data = load_data()
    return jsonify(data)

@app.route("/setall", methods=["POST"])
@require_secret
def set_all():
    """Overwrite the entire data.json file with the posted JSON object."""
    new_data = request.get_json()

    if not isinstance(new_data, dict):
        return jsonify({
            "error": "Request body must be a JSON object"
        }), 400

    with lock:
        save_data(new_data)

    return jsonify({
        "success": True,
        "message": "data.json has been fully replaced",
        "new_data": new_data
    })
    


@app.route("/increment", methods=["POST"])
@require_secret
def increment_value():
    """
    Increment a nested value following a series of keys provided in the request JSON.

    Expected request JSON format:
    {
      "keys": ["a", "b", "c"],    # required, non-empty list of keys
      "amount": 5                      # optional numeric amount (defaults to 1)
    }

    Behavior:
    - Traverse `data.json` creating nested dicts for each key except the last.
    - If the final key does not exist, initialize it to 0.
    - If the final key exists but is not numeric, it will be reset to 0.
    - Increment the final key's numeric value by `amount` and save.
    """
    payload = request.get_json()

    if not isinstance(payload, dict):
        return jsonify({"error": "Request body must be a JSON object with a 'keys' array"}), 400

    keys = payload.get('keys')
    if not isinstance(keys, list) or not keys:
        return jsonify({"error": "'keys' must be a non-empty array"}), 400

    # amount provided in JSON takes precedence; default to 1
    amount = payload.get('amount', 1)
    # validate amount
    if not isinstance(amount, (int, float)):
        # try to coerce numeric-looking strings
        try:
            amount = int(amount) if isinstance(amount, str) and amount.isdigit() else float(amount)
        except Exception:
            return jsonify({"error": "'amount' must be numeric if provided"}), 400

    # Coerce integer-like floats to int
    try:
        if isinstance(amount, float) and amount.is_integer():
            amount = int(amount)
    except Exception:
        pass

    # Convert keys to strings
    try:
        keys = [str(k) for k in keys]
    except Exception:
        return jsonify({"error": "All keys must be convertible to strings"}), 400

    with lock:
        data = load_data()

        node = data
        # create nested dicts for all keys except the last
        for k in keys[:-1]:
            if k not in node or not isinstance(node[k], dict):
                node[k] = {}
            node = node[k]

        last = keys[-1]
        # initialize or coerce non-numeric to 0
        if last not in node or not isinstance(node[last], (int, float)):
            node[last] = 0

        node[last] = node[last] + amount

        save_data(data)

    return jsonify({"success": True, "message": f"Incremented '{'.'.join(keys)}'", "new_value": node[last], "amount": amount})

# ---------- Run Server ---------- #

if __name__ == "__main__":
    app.run(debug=True)
