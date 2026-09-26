import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env file from project root or backend dir
load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "LocalBiz AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-localbiz-ai-key-change-in-prod-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./data/localbiz.db")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    MOCK_AI_FALLBACK: bool = True

settings = Settings()
os.makedirs("data", exist_ok=True)
os.makedirs("uploads", exist_ok=True)
