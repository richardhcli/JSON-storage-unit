"""Utility helpers for working with the JSON datastore."""
from __future__ import annotations

import json
from threading import Lock
from typing import Any, Callable, Dict

from app.config import DATA_FILE_PATH

_data_lock = Lock()


def _ensure_store_exists() -> None:
    """Create the data file if missing or reset when corrupt."""
    if DATA_FILE_PATH.exists():
        try:
            DATA_FILE_PATH.read_text()
            return
        except OSError:
            pass
    DATA_FILE_PATH.write_text("{}", encoding="utf-8")


def _load_unlocked() -> Dict[str, Any]:
    if not DATA_FILE_PATH.exists():
        _ensure_store_exists()
        return {}
    try:
        return json.loads(DATA_FILE_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        DATA_FILE_PATH.write_text("{}", encoding="utf-8")
        return {}


def _save_unlocked(data: Dict[str, Any]) -> None:
    DATA_FILE_PATH.write_text(json.dumps(data, indent=2), encoding="utf-8")


def read_data() -> Dict[str, Any]:
    """Return a snapshot of the data store."""
    with _data_lock:
        return _load_unlocked()


def write_data(mutator: Callable[[Dict[str, Any]], Any]) -> Any:
    """Mutate the datastore within a lock, persisting the result."""
    with _data_lock:
        data = _load_unlocked()
        result = mutator(data)
        _save_unlocked(data)
        return result
