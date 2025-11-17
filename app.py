from flask import Flask, request, jsonify
import json
import os
import threading

app = Flask(__name__)

DATA_FILE = "data.json"
lock = threading.Lock()

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
def get_value():
    key = request.args.get("key")
    if not key:
        return jsonify({"error": "Missing 'key' parameter"}), 400

    with lock:
        data = load_data()

    if key not in data:
        return jsonify({"error": "Key not found"}), 404

    return jsonify({"key": key, "value": data[key]})


@app.route("/getall", methods=["GET"])
def get_all():
    with lock:
        data = load_data()
    return jsonify(data)


@app.route("/add", methods=["POST"])
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


# ---------- Run Server ---------- #

if __name__ == "__main__":
    app.run(debug=True)
