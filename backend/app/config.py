import os
from functools import lru_cache
from pathlib import Path
from dotenv import load_dotenv

# Ensure .env is loaded from backend directory
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

class Settings:
    def __init__(self):
        # Groq credentials & models
        self.groq_api_key: str = (os.getenv("GROQ_API_KEY") or os.getenv("GEMINI_API_KEY", "")).strip()
        self.groq_vision_model: str = os.getenv("GROQ_VISION_MODEL", "qwen/qwen3.8-27b").strip()
        self.groq_text_model: str = os.getenv("GROQ_TEXT_MODEL", "openai/gpt-oss-120b").strip()

        # Backward compatibility properties
        self.gemini_api_key: str = self.groq_api_key
        self.gemini_model: str = self.groq_vision_model

        self.host: str = os.getenv("HOST", "127.0.0.1")
        self.port: int = int(os.getenv("PORT", "8000"))
        cors_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
        self.cors_origins: list[str] = [origin.strip() for origin in cors_raw.split(",") if origin.strip()]

    @property
    def is_api_key_set(self) -> bool:
        return bool(self.groq_api_key and self.groq_api_key not in ("your_groq_api_key_here", "your_gemini_api_key_here"))

@lru_cache()
def get_settings() -> Settings:
    return Settings()
