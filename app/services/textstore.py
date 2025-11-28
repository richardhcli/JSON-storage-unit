"""Helpers for reading and writing the plain-text dashboard note."""
from __future__ import annotations

from threading import Lock
from typing import Callable

from app.config import TEXT_FILE_PATH

_text_lock = Lock()


def _ensure_text_file() -> None:
    TEXT_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not TEXT_FILE_PATH.exists():
        TEXT_FILE_PATH.write_text("", encoding="utf-8")


def read_textdb() -> str:
    """Return the full text contents of the text datastore."""
    with _text_lock:
        _ensure_text_file()
        return TEXT_FILE_PATH.read_text(encoding="utf-8")


def write_textdb(mutator: Callable[[str], str]) -> str:
    """Mutate the text datastore with a provided callable."""
    with _text_lock:
        _ensure_text_file()
        current = TEXT_FILE_PATH.read_text(encoding="utf-8")
        new_value = mutator(current)
        if not isinstance(new_value, str):
            raise TypeError("Text datastore mutator must return a string")
        TEXT_FILE_PATH.write_text(new_value, encoding="utf-8")
        return new_value
