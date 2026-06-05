"""
Centralised application configuration loaded from environment variables.
Import `settings` anywhere in the backend.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Database ───────────────────────────────────────────────────────────
    mongodb_url: str = "mongodb://localhost:27017/guardian_db"

    # ── AI Providers ───────────────────────────────────────────────────────
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    ollama_url: str = "http://localhost:11434"
    ai_model_anthropic: str = "claude-sonnet-4-20250514"
    ai_model_openai: str = "gpt-4o-mini"

    # ── Auth ───────────────────────────────────────────────────────────────
    jwt_secret: str = "change_this_in_production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 24 hours

    # ── App ────────────────────────────────────────────────────────────────
    app_name: str = "AI Agent Security Guardian"
    app_version: str = "4.0.0"
    debug: bool = False
    cors_origins: list[str] = ["*"]

    # ── Risk thresholds ────────────────────────────────────────────────────
    risk_block_threshold: int = 50
    risk_warn_threshold: int = 25
    action_risk_block: int = 80
    action_risk_warn: int = 50

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()


# Convenience singleton
settings = get_settings()
