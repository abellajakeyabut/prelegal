from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # The repo-root .env holds secrets (OPENROUTER_API_KEY); backend/.env wins on conflicts.
    model_config = SettingsConfigDict(
        env_file=("../.env", ".env"), env_file_encoding="utf-8", extra="ignore"
    )

    app_name: str = "Prelegal API"
    environment: str = "development"
    api_prefix: str = "/api"
    cors_origins: list[str] = ["http://localhost:3000"]
    database_path: Path = Path("prelegal.db")
    static_dir: Path = Path("../frontend/out")
    openrouter_api_key: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
