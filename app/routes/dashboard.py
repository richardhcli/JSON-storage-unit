"""Frontend routes for serving the dashboard."""
from flask import Blueprint, render_template, redirect, url_for

ui_bp = Blueprint("ui", __name__)


@ui_bp.route("/")
def dashboard():
    return render_template("dashboard.html")

@ui_bp.route("/view")
def view():
    # Legacy route: now part of the single-page dashboard tabs
    return redirect(url_for("ui.dashboard"))


@ui_bp.route("/api-gen")
def api_generator():
    # Legacy route: now part of the single-page dashboard tabs
    return redirect(url_for("ui.dashboard"))