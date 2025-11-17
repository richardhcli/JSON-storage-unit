"""Application configuration settings."""
from pathlib import Path
import os

# Project root two levels up from this file
BASE_DIR = Path(__file__).resolve().parent.parent

# Location of the JSON datastore (configurable via env var)
DATA_FILE_PATH = Path(os.environ.get("DATA_FILE", BASE_DIR / "data.json"))

# Simple shared secret for API auth (default value preserved for dev parity)
SECRET_KEY = os.environ.get("SECRET_KEY", "richardli-secret")
