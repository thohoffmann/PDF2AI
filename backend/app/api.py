"""
API routes for PDF2AI backend.
"""

from fastapi import APIRouter
from datetime import datetime
from app.config import settings

# Create API router
api_router = APIRouter(prefix="/api")


@api_router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "Backend is healthy and ready to serve requests",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.VERSION
    }


@api_router.get("/test")
async def test_connection():
    """Test endpoint to verify frontend-backend connection."""
    return {
        "message": "Connection successful!",
        "backend": "FastAPI",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.VERSION,
        "available_endpoints": [
            "/api/health",
            "/api/test",
            "/api/upload",  # Will be implemented later
            "/api/chat"     # Will be implemented later
        ],
        "cors_origins": settings.BACKEND_CORS_ORIGINS
    } 