"""Dev entry point."""
from dotenv import load_dotenv
from app import create_app

# Load environment variables from `.env` if present (local development convenience)
load_dotenv()

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
