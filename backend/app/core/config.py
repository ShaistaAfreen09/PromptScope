import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, AnyHttpUrl

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "PromptScope Enterprise API"
    VERSION: str = "1.0.0"
    
    # Environment
    ENV: str = Field(default="production", env="ENV")
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://ai.studio",
        "https://ai.studio/build"
    ]
    
    # Database Configuration
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/promptscope",
        env="DATABASE_URL"
    )
    
    # Firebase Configuration for ID Token Verification
    FIREBASE_PROJECT_ID: Optional[str] = Field(default=None, env="FIREBASE_PROJECT_ID")
    # Path to Firebase Admin SDK service account credentials JSON file (optional)
    FIREBASE_CREDENTIALS_PATH: Optional[str] = Field(default=None, env="FIREBASE_CREDENTIALS_PATH")
    
    # Security Configurations
    JWT_ALGORITHM: str = "RS256"  # Firebase uses RS256 with Google public certificates
    
    # Rate Limiting (Requests per minute per user)
    DEFAULT_RATE_LIMIT_LIMIT: int = 60
    DEFAULT_RATE_LIMIT_WINDOW: int = 60  # seconds
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
