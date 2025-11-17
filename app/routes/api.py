"""REST API blueprint."""
from flask import Blueprint, jsonify, request

from app.services.datastore import read_data, write_data
from app.services.security import require_secret

api_bp = Blueprint("api", __name__)


@api_bp.route("/get", methods=["GET"])
@require_secret
def get_value():
    key = request.args.get("key")
    if not key:
        return jsonify({"error": "Missing 'key' parameter"}), 400

    data = read_data()
    if key not in data:
        return jsonify({"error": "Key not found"}), 404
    return jsonify({"key": key, "value": data[key]})


@api_bp.route("/getall", methods=["GET"])
@require_secret
def get_all():
    return jsonify(read_data())


@api_bp.route("/setall", methods=["POST"])
@require_secret
def set_all():
    new_data = request.get_json()
    if not isinstance(new_data, dict):
        return jsonify({"error": "Request body must be a JSON object"}), 400

    def _replace(data):
        data.clear()
        data.update(new_data)

    write_data(_replace)
    return jsonify({
        "success": True,
        "message": "data.json has been fully replaced",
        "new_data": new_data,
    })


@api_bp.route("/add", methods=["POST"])
@require_secret
def add_value():
    payload = request.get_json()
    if not payload or "key" not in payload or "value" not in payload:
        return jsonify({"error": "JSON must include 'key' and 'value'"}), 400

    key = payload["key"]
    value = payload["value"]

    def _add(data):
        if key in data:
            raise KeyError
        data[key] = value

    try:
        write_data(_add)
    except KeyError:
        return jsonify({"error": "Key already exists"}), 409

    return jsonify({"success": True, "message": f"Added '{key}'"}), 201


@api_bp.route("/update", methods=["POST"])
@require_secret
def update_value():
    payload = request.get_json()
    if not payload or "key" not in payload or "value" not in payload:
        return jsonify({"error": "JSON must include 'key' and 'value'"}), 400

    key = payload["key"]
    value = payload["value"]

    def _update(data):
        if key not in data:
            raise KeyError
        data[key] = value

    try:
        write_data(_update)
    except KeyError:
        return jsonify({"error": "Key does not exist"}), 404

    return jsonify({"success": True, "message": f"Updated '{key}'"})


@api_bp.route("/delete", methods=["POST"])
@require_secret
def delete_value():
    payload = request.get_json()
    if not payload or "key" not in payload:
        return jsonify({"error": "JSON must include 'key'"}), 400

    key = payload["key"]

    def _delete(data):
        if key not in data:
            raise KeyError
        del data[key]

    try:
        write_data(_delete)
    except KeyError:
        return jsonify({"error": "Key not found"}), 404

    return jsonify({"success": True, "message": f"Deleted '{key}'"})


@api_bp.route("/increment", methods=["POST"])
@require_secret
def increment_value():
    payload = request.get_json()
    if not isinstance(payload, dict):
        return jsonify({"error": "Request body must be a JSON object with a 'keys' array"}), 400

    keys = payload.get("keys")
    if not isinstance(keys, list) or not keys:
        return jsonify({"error": "'keys' must be a non-empty array"}), 400

    amount = payload.get("amount", 1)
    if not isinstance(amount, (int, float)):
        try:
            amount = int(amount) if isinstance(amount, str) and amount.isdigit() else float(amount)
        except Exception:
            return jsonify({"error": "'amount' must be numeric if provided"}), 400

    if isinstance(amount, float) and amount.is_integer():
        amount = int(amount)

    try:
        keys = [str(k) for k in keys]
    except Exception:
        return jsonify({"error": "All keys must be convertible to strings"}), 400

    def _increment(data):
        node = data
        for key in keys[:-1]:
            if key not in node or not isinstance(node[key], dict):
                node[key] = {}
            node = node[key]

        leaf = keys[-1]
        if leaf not in node or not isinstance(node[leaf], (int, float)):
            node[leaf] = 0
        node[leaf] += amount
        return node[leaf]

    new_value = write_data(_increment)
    return jsonify({
        "success": True,
        "message": f"Incremented '{'.'.join(keys)}'",
        "new_value": new_value,
        "amount": amount,
    })
