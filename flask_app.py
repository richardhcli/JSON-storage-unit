"""Dev entry point."""
import os
from dotenv import load_dotenv
from app import create_app

# Load environment variables from `.env` if present (local development convenience)
load_dotenv()

# Ensure the runner treats this as a development run so create_app doesn't
# enforce production-only requirements like a missing SECRET_KEY.
os.environ.setdefault("FLASK_ENV", "development")

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)



# # A very simple Flask Hello World app for you to get started with...

# from flask import Flask

# app = Flask(__name__)

# @app.route('/')
# def hello_world():
#     return 'Hello from Flask!'

