import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Serverless environment safeguards
if os.getenv("VERCEL"):
    if not os.getenv("DATABASE_URL"):
        os.environ["DATABASE_URL"] = "sqlite:////tmp/localbiz.db"
    if not os.getenv("UPLOAD_DIR"):
        os.environ["UPLOAD_DIR"] = "/tmp/uploads"

from app.main import app
