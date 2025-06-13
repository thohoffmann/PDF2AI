"""
FastAPI backend for PDF2AI application.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown."""
    # Startup
    print("🚀 Starting PDF2AI Backend...")
    print(f"📋 Version: {settings.VERSION}")
    print(f"🌐 CORS Origins: {settings.BACKEND_CORS_ORIGINS}")
    yield
    # Shutdown
    print("🛑 Shutting down PDF2AI Backend...")


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)


@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {
        "message": "PDF2AI Backend is running!",
        "status": "healthy",
        "version": settings.VERSION,
        "project": settings.PROJECT_NAME
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 