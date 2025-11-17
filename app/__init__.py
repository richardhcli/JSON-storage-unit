"""Flask application factory."""
from flask import Flask

from app.routes.api import api_bp
from app.routes.dashboard import ui_bp


def create_app() -> Flask:
    app = Flask(__name__, template_folder="templates", static_folder="static")

    app.register_blueprint(ui_bp)
    app.register_blueprint(api_bp)

    return app
