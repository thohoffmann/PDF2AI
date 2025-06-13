#!/usr/bin/env python3
"""
Startup script for PDF2AI FastAPI backend.
"""

import uvicorn
from app.config import settings

if __name__ == "__main__":
    print("🚀 Starting PDF2AI Backend Server...")
    print(f"📍 Host: {settings.HOST}")
    print(f"🔌 Port: {settings.PORT}")
    print(f"🐛 Debug: {settings.DEBUG}")
    print(f"🌐 CORS Origins: {settings.BACKEND_CORS_ORIGINS}")
    print("-" * 50)
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    ) 