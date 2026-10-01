from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Literal


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    ENVIRONMENT: Literal["development", "production"] = "development"
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/legalsaathi"

    # Auth
    AUTH_SECRET: str = "change-me-in-production"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # LLM
    LLM_PROVIDER: Literal["openai", "mock"] = "mock"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o"
    LLM_API_BASE: str = "https://api.openai.com/v1"

    # Embeddings
    EMBEDDING_PROVIDER: Literal["openai", "mock"] = "mock"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSIONS: int = 1536

    # OCR
    OCR_PROVIDER: Literal["tesseract", "mock"] = "tesseract"

    # Storage
    STORAGE_PROVIDER: Literal["supabase", "local"] = "local"
    STORAGE_BUCKET: str = "documents"
    STORAGE_ENDPOINT: str = ""

    # File upload
    MAX_FILE_SIZE_MB: int = 20
    ALLOWED_EXTENSIONS: str = "pdf,docx,png,jpg,jpeg"

    @property
    def allowed_extensions_list(self) -> list[str]:
        return [ext.strip().lower() for ext in self.ALLOWED_EXTENSIONS.split(",")]

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"


@lru_cache
def get_settings() -> Settings:
    return Settings()
