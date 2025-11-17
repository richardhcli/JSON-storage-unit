"""Frontend routes for serving the dashboard."""
from flask import Blueprint, render_template

ui_bp = Blueprint("ui", __name__)


@ui_bp.route("/")
def dashboard():
    return render_template("dashboard.html")
