from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "DeTourist API"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: Literal["local", "staging", "prod"] = "local"

    
    # Database
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/detourist"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Search
    MEILISEARCH_URL: str = "http://localhost:7700"
    MEILISEARCH_MASTER_KEY: str = "masterKey"

    # JWT Authentication
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7" # Should be overridden in .env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore")

    @property
    def is_local(self) -> bool:
        return self.ENVIRONMENT == "local"
        
    @property
    def is_staging(self) -> bool:
        return self.ENVIRONMENT == "staging"
        
    @property
    def is_prod(self) -> bool:
        return self.ENVIRONMENT == "prod"

settings = Settings()
