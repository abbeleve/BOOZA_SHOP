import os
from functools import lru_cache

try:
    from pydantic_settings import BaseSettings  # Pydantic v2
except ImportError:
    from pydantic import BaseSettings  # Pydantic v1 (fallback)

class Settings(BaseSettings):
    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # БД (опционально, если не используете отдельный DATABASE_URL)
    postgres_user: str = "postgres"
    postgres_password: str
    postgres_db: str = "restaurant"
    postgres_host: str = "localhost"
    postgres_port: str = "5432"

    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()