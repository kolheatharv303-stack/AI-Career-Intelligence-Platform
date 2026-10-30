"""Application configuration and environment settings using Pydantic Settings v2.

Manages configuration for AWS RDS PostgreSQL, Azure Cosmos DB, Google
Firebase Admin, and Google Gemini API.
"""

from typing import List, Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application & Environment
    PROJECT_NAME: str = "AI Career Intelligence Platform"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # Security & JWT Authentication
    APP_SECRET_KEY: str = Field(
        default="career-intel-super-secure-jwt-signing-secret-key-32-bytes-min!",
        description="Cryptographic secret key for signing JWT tokens",
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*"
    ]

    # 1. AWS RDS PostgreSQL Database Configuration
    AWS_RDS_POSTGRES_URL: Optional[str] = Field(
        default=None,
        description="Async PostgreSQL connection string, e.g., postgresql+asyncpg://user:pass@rds-host:5432/dbname"
    )
    POSTGRES_POOL_SIZE: int = 10
    POSTGRES_MAX_OVERFLOW: int = 20
    POSTGRES_POOL_TIMEOUT: int = 30
    POSTGRES_POOL_RECYCLE: int = 1800
    ENABLE_DB_FALLBACK: bool = True

    # 2. Azure Cosmos DB (SQL/Core API) Configuration
    AZURE_COSMOS_ENDPOINT: Optional[str] = Field(
        default=None,
        description="Azure Cosmos DB Account URI, e.g., https://<account-name>.documents.azure.com:443/"
    )
    AZURE_COSMOS_KEY: Optional[str] = Field(
        default=None,
        description="Azure Cosmos DB Primary or Secondary Read-Write Master Key"
    )
    AZURE_COSMOS_DATABASE_NAME: str = "CareerIntelligence"
    AZURE_COSMOS_CONTAINER_NAME: str = "AIInteractions"
    AZURE_COSMOS_PARTITION_KEY: str = "/user_id"
    ENABLE_COSMOS_FALLBACK: bool = True

    # 3. Google Firebase Admin SDK Configuration
    FIREBASE_CREDENTIALS_PATH: Optional[str] = Field(
        default=None,
        description="Local path to the Firebase Service Account JSON credentials file"
    )
    FIREBASE_DATABASE_URL: Optional[str] = Field(
        default=None,
        description="Firebase Realtime Database URL, e.g. https://<project>.firebaseio.com"
    )
    FIREBASE_PROJECT_ID: Optional[str] = "career-intel-platform"
    ENABLE_FIREBASE_FALLBACK: bool = True

    # 4. Google Gemini AI Layer Configuration
    GEMINI_API_KEY: Optional[str] = Field(
        default=None,
        description="Google Gemini API Key for LLM inference (or from GEMINI_API_KEY env)"
    )
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Server Binding
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        return ["*"]


settings = Settings()
