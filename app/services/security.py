"""Security helpers (simple shared-secret decorator)."""
from functools import wraps
from typing import Callable

from flask import jsonify, request

from app.config import SECRET_KEY


def require_secret(func: Callable):
    """Ensure each request carries the shared secret via header or query param."""

    @wraps(func)
    def wrapper(*args, **kwargs):
        provided = request.headers.get("X-API-KEY") or request.args.get("api_key")
        if provided != SECRET_KEY:
            return jsonify({"error": "Unauthorized - missing or invalid API key"}), 401
        return func(*args, **kwargs)

    return wrapper
