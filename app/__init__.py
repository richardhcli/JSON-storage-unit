"""Flask application factory."""
from flask import Flask
import logging
import os

from app.routes.api import api_bp
from app.routes.dashboard import ui_bp
from app import config


def create_app() -> Flask:
    app = Flask(__name__, template_folder="templates", static_folder="static")

    # Apply minimal config values to the Flask app
    app.config['DATA_FILE_PATH'] = str(config.DATA_FILE_PATH)
    app.config['SECRET_KEY'] = config.SECRET_KEY

    # Register blueprints
    app.register_blueprint(ui_bp)
    app.register_blueprint(api_bp)

    # Startup logging (do not print secrets)
    logger = logging.getLogger(__name__)
    logger.info("DATA_FILE: %s", config.DATA_FILE_PATH)
    logger.info("SECRET_KEY set: %s", bool(config.SECRET_KEY))

    # # Enforce explicit secret in non-development environments
    # env = os.environ.get("FLASK_ENV", "production")
    # if env != "development" and not config.SECRET_KEY:
    #     logger.error("SECRET_KEY is not set and FLASK_ENV != 'development'. Refusing to start.")
    #     raise RuntimeError("SECRET_KEY must be set in production environments")

    return app
