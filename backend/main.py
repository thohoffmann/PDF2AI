"""
FastAPI backend for PDF2AI application.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from datetime import datetime
from deepdfscan import extract_text_from_pdf, summarize_text
from typing import Optional

# Create FastAPI application
app = FastAPI(
    title="PDF2AI",
    description="PDF to AI Summary API",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {
        "message": "PDF2AI Backend is running!",
        "status": "healthy",
        "version": "0.1.0"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "message": "PDF2AI Backend is running!",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "0.1.0"
    }

@app.get("/api/test")
async def test_connection():
    """Test connection endpoint."""
    return {
        "message": "Connection successful",
        "backend": "PDF2AI",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "0.1.0",
        "available_endpoints": ["/", "/api/health", "/api/test", "/api/summarize"],
        "cors_origins": ["http://localhost:3000"]
    }

class SummaryResponse(BaseModel):
    summary: str
    status: str
    progress: Optional[float] = None

@app.post("/api/summarize", response_model=SummaryResponse)
async def summarize_pdf(file: UploadFile = File(...)):
    try:
        # Save the uploaded file temporarily
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Extract text from PDF (30% progress)
        text = extract_text_from_pdf(temp_path)
        
        # Generate summary (70% progress)
        summary = summarize_text(text)
        
        # Clean up temporary file
        os.remove(temp_path)
        
        return SummaryResponse(
            summary=summary,
            status="success",
            progress=100.0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 