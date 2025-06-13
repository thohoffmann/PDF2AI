"""
Configuration settings for PDF2AI backend.
"""

import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "PDF2AI Backend"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Backend API for PDF2AI - Transform PDFs into interactive AI assistants"
    
    # Server Configuration
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_FILE_TYPES: List[str] = [".pdf"]
    UPLOAD_DIR: str = "uploads"
    
    # AI Configuration (will be used later)
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings() 