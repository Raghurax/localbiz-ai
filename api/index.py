import os
import sys

# Ensure backend directory is in Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, ".."))
backend_dir = os.path.join(root_dir, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# On Vercel serverless environments, the filesystem is read-only except for /tmp.
# Redirect SQLite and uploads to /tmp if not explicitly set to external DB.
if os.getenv("VERCEL"):
    if not os.getenv("DATABASE_URL"):
        os.environ["DATABASE_URL"] = "sqlite:////tmp/localbiz.db"
    if not os.getenv("UPLOAD_DIR"):
        os.environ["UPLOAD_DIR"] = "/tmp/uploads"

from app.main import app
