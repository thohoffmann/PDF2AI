# PDF2AI Web Application Architecture Plan

## 🏗️ System Architecture Overview

### **Technology Stack**
- **Frontend**: React 18+ with TypeScript
- **UI Components**: V0-generated components with shadcn/ui and Tailwind CSS
- **Backend**: FastAPI (Python 3.13+)
- **CLI Application**: Existing `deepdfscan.py` (preserved and integrated)
- **AI Processing**: Ollama + Gemma3
- **File Storage**: Local filesystem with planned cloud support
- **Communication**: REST API + WebSockets for real-time updates

### **Development Servers**
- **React Frontend**: `http://localhost:3000`
- **FastAPI Backend**: `http://localhost:8000`
- **CORS**: Enabled for cross-origin requests

---

## 📁 Project Structure

```
PDF2AI-Web/
├── backend/                     # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── config.py           # Configuration settings
│   │   ├── models/             # Pydantic models
│   │   │   ├── __init__.py
│   │   │   ├── pdf_models.py
│   │   │   └── analysis_models.py
│   │   ├── services/           # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── pdf_service.py
│   │   │   ├── ai_service.py
│   │   │   └── analysis_service.py
│   │   ├── api/                # API routes
│   │   │   ├── __init__.py
│   │   │   ├── pdf_routes.py
│   │   │   ├── analysis_routes.py
│   │   │   └── websocket_routes.py
│   │   ├── utils/              # Utilities
│   │   │   ├── __init__.py
│   │   │   ├── file_handler.py
│   │   │   └── ai_client.py
│   │   └── cli/                # CLI Integration
│   │       ├── __init__.py
│   │       └── deepdfscan_core.py  # Refactored CLI logic
│   ├── requirements.txt
│   ├── .env
│   └── README.md
├── deepdfscan.py               # Standalone CLI Application (preserved)
├── cli_requirements.txt        # CLI-specific requirements
├── frontend/                    # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/         # React components (V0-compatible structure)
│   │   │   ├── ui/            # shadcn/ui base components (from V0)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   └── dialog.tsx
│   │   │   ├── common/        # Shared components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   ├── pdf/          # PDF-related components (V0-generated)
│   │   │   │   ├── PDFUpload.tsx
│   │   │   │   ├── PDFViewer.tsx
│   │   │   │   └── PDFList.tsx
│   │   │   ├── analysis/     # Analysis components (V0-generated)
│   │   │   │   ├── FeatureSelector.tsx
│   │   │   │   ├── JobAdvertInput.tsx
│   │   │   │   ├── AnalysisResults.tsx
│   │   │   │   └── ProgressTracker.tsx
│   │   │   └── layout/       # Layout components
│   │   │       ├── Layout.tsx
│   │   │       └── Sidebar.tsx
│   │   ├── services/           # API services
│   │   │   ├── api.ts
│   │   │   ├── pdfService.ts
│   │   │   ├── analysisService.ts
│   │   │   └── websocketService.ts
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useAPI.ts
│   │   │   ├── useWebSocket.ts
│   │   │   └── useFileUpload.ts
│   │   ├── types/              # TypeScript types
│   │   │   ├── api.ts
│   │   │   ├── pdf.ts
│   │   │   └── analysis.ts
│   │   ├── utils/              # Utility functions
│   │   │   ├── constants.ts
│   │   │   └── helpers.ts
│   │   ├── lib/                # shadcn/ui utilities (V0 compatibility)
│   │   │   └── utils.ts
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── globals.css         # Tailwind CSS globals
│   │   └── App.css
│   ├── components.json         # shadcn/ui configuration
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── shared/                      # Shared configurations
│   ├── docker-compose.yml
│   └── README.md
└── README.md                    # Main project README
```

---

## 🖥️ CLI Application Integration

### **Preserved CLI Functionality**

The existing `deepdfscan.py` CLI application will be **preserved and enhanced** as part of the overall architecture:

#### **Standalone CLI Application**
- **Current Location**: `/deepdfscan.py` (root level, preserved as-is)
- **Functionality**: Full interactive menu system for PDF analysis
- **Independence**: Can run completely separate from web application
- **Use Cases**: 
  - Local development and testing
  - Batch processing scenarios
  - Users who prefer command-line interfaces
  - Backup interface if web app is unavailable

#### **CLI-Backend Integration Strategy**

```python
# backend/app/cli/deepdfscan_core.py
# Refactored core logic from CLI for reuse in FastAPI

class PDFAnalysisCore:
    """Shared logic between CLI and web backend"""
    
    def __init__(self):
        self.pdf_parser = PDFParser()
        self.ai_service = AIService()
    
    async def analyze_pdf_summary(self, pdf_path: str) -> dict:
        """Core summarization logic (used by both CLI and API)"""
        text = self.pdf_parser.parse_pdf(pdf_path)
        summary = await self.ai_service.summarize_text(text)
        return {"summary": summary, "status": "completed"}
    
    async def analyze_cv_comparison(self, cv_path: str, job_text: str) -> dict:
        """Core CV comparison logic (used by both CLI and API)"""
        cv_text = self.pdf_parser.parse_pdf(cv_path)
        analysis = await self.ai_service.analyze_cv_job_match(cv_text, job_text)
        return analysis

# FastAPI services will import and use this core
# CLI will also import and use this core (DRY principle)
```

#### **Dual Interface Benefits**
- **Code Reuse**: Core AI logic shared between CLI and web interfaces
- **Consistent Results**: Same analysis engine for both interfaces
- **Development Efficiency**: Test features in CLI before web implementation
- **User Choice**: Users can choose their preferred interface
- **Fallback Option**: CLI available if web service is down

#### **CLI Development Workflow**
1. **Preserve Current CLI**: Keep `deepdfscan.py` fully functional
2. **Extract Core Logic**: Move shared functionality to `deepdfscan_core.py`
3. **Refactor CLI**: Update CLI to use shared core modules
4. **Backend Integration**: FastAPI services import same core modules
5. **Maintain Both**: CLI and web app evolve together

#### **Future CLI Enhancements**
- **Config File Support**: JSON/YAML configuration for repeated analyses
- **Batch Processing**: Multiple PDFs in one command
- **Output Formats**: JSON, CSV, PDF report generation
- **Integration Commands**: CLI commands to interact with web API
- **Automation Scripts**: Shell scripts for common workflows

---

## 🔌 API Endpoints Design

### **PDF Management Endpoints**

#### `POST /api/upload-pdf`
```json
// Request (multipart/form-data)
{
  "file": "<PDF file>",
  "filename": "string",
  "description": "string (optional)"
}

// Response
{
  "success": true,
  "data": {
    "file_id": "uuid",
    "filename": "string",
    "size": "number",
    "pages": "number",
    "upload_timestamp": "datetime"
  }
}
```

#### `GET /api/pdfs`
```json
// Response
{
  "success": true,
  "data": [
    {
      "file_id": "uuid",
      "filename": "string",
      "size": "number",
      "pages": "number",
      "upload_timestamp": "datetime",
      "status": "uploaded|processing|completed|error"
    }
  ]
}
```

#### `GET /api/pdfs/{file_id}`
```json
// Response
{
  "success": true,
  "data": {
    "file_id": "uuid",
    "filename": "string",
    "content": "string",
    "metadata": {
      "pages": "number",
      "size": "number",
      "extracted_at": "datetime"
    }
  }
}
```

#### `DELETE /api/pdfs/{file_id}`
```json
// Response
{
  "success": true,
  "message": "PDF deleted successfully"
}
```

### **Analysis Endpoints**

#### `POST /api/analyze/summarize`
```json
// Request
{
  "file_id": "uuid",
  "options": {
    "summary_type": "concise|detailed|bullet_points",
    "max_length": "number (optional)"
  }
}

// Response
{
  "success": true,
  "data": {
    "analysis_id": "uuid",
    "status": "processing|completed|error",
    "file_id": "uuid"
  }
}
```

#### `POST /api/analyze/compare-cv`
```json
// Request
{
  "cv_file_id": "uuid",
  "job_advert_text": "string",
  "options": {
    "industry": "tech|finance|healthcare|general",
    "analysis_depth": "basic|detailed|comprehensive"
  }
}

// Response
{
  "success": true,
  "data": {
    "analysis_id": "uuid",
    "status": "processing|completed|error",
    "cv_file_id": "uuid"
  }
}
```

#### `GET /api/analysis/{analysis_id}`
```json
// Response
{
  "success": true,
  "data": {
    "analysis_id": "uuid",
    "type": "summarize|cv_comparison",
    "status": "processing|completed|error",
    "progress": "number (0-100)",
    "results": {
      // For summarization
      "summary": "string",
      "key_points": ["string"],
      
      // For CV comparison
      "match_score": "number",
      "matching_keywords": ["string"],
      "missing_keywords": ["string"],
      "recommendations": ["string"],
      "ai_analysis": "string"
    },
    "created_at": "datetime",
    "completed_at": "datetime (nullable)"
  }
}
```

#### `GET /api/analysis/history`
```json
// Response
{
  "success": true,
  "data": [
    {
      "analysis_id": "uuid",
      "type": "summarize|cv_comparison",
      "status": "completed|error",
      "file_id": "uuid",
      "filename": "string",
      "created_at": "datetime",
      "summary": "string (brief)"
    }
  ]
}
```

### **System Endpoints**

#### `GET /api/health`
```json
// Response
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "database": "healthy",
      "ai_service": "healthy|unhealthy",
      "file_storage": "healthy"
    },
    "version": "2.0.0"
  }
}
```

#### `GET /api/features`
```json
// Response
{
  "success": true,
  "data": {
    "features": [
      {
        "id": "summarize",
        "name": "PDF Summarization",
        "description": "AI-powered PDF summarization",
        "available": true
      },
      {
        "id": "cv_compare",
        "name": "CV-Job Comparison",
        "description": "Compare CV against job adverts",
        "available": true
      }
    ],
    "ai_status": {
      "ollama_available": true,
      "models": ["gemma3"],
      "version": "string"
    }
  }
}
```

### **WebSocket Endpoints**

#### `WS /ws/analysis/{analysis_id}`
```json
// Real-time updates during analysis
{
  "type": "progress_update",
  "data": {
    "analysis_id": "uuid",
    "progress": "number (0-100)",
    "stage": "parsing|extracting|analyzing|finalizing",
    "message": "string"
  }
}

{
  "type": "analysis_complete",
  "data": {
    "analysis_id": "uuid",
    "status": "completed|error",
    "results": "object (same as GET /api/analysis/{id})"
  }
}
```

---

## 🎨 Frontend Component Architecture

### **V0 Integration Strategy**

This architecture is specifically designed to work seamlessly with V0 (Vercel's AI interface design tool):

#### **V0-Compatible Structure**
- **`/components/ui/`**: Base shadcn/ui components that V0 generates
- **Component Import Path**: Direct drop-in of V0 components into respective folders
- **Tailwind CSS**: Pre-configured for V0's styling approach
- **TypeScript**: Full compatibility with V0's TypeScript generation

#### **V0 Workflow Integration**
1. **Design in V0**: Create components using V0's interface
2. **Export Components**: Copy generated TSX code from V0
3. **Drop into Structure**: Place components in appropriate folders:
   - UI components → `/components/ui/`
   - Feature components → `/components/pdf/`, `/components/analysis/`
   - Layout components → `/components/layout/`
4. **Import and Use**: Components ready to use with existing architecture

#### **V0 Component Categories for PDF2AI**
- **File Upload Components**: Drag-and-drop PDF upload interfaces
- **Analysis Dashboard**: Real-time progress and results display
- **Data Visualization**: Charts and statistics for CV analysis
- **Form Components**: Job advert input and configuration forms
- **Navigation**: Modern sidebar and header layouts

### **Core Components**

#### `App.tsx` - Main Application Container
- Route management
- Global state management
- Error boundary
- Authentication (future)

#### `Layout.tsx` - Main Layout
- Header with navigation
- Sidebar with feature menu
- Main content area
- Footer

#### `PDFUpload.tsx` - File Upload Component
- Drag & drop interface
- File validation
- Upload progress
- Multiple file support

#### `FeatureSelector.tsx` - Feature Selection
- Interactive feature cards
- Feature availability status
- Quick action buttons

#### `AnalysisResults.tsx` - Results Display
- Dynamic result rendering based on analysis type
- Export functionality
- Share results
- Visual charts and statistics

#### `ProgressTracker.tsx` - Real-time Progress
- WebSocket connection for live updates
- Progress bar with stages
- Cancel analysis option

### **State Management Strategy**

#### React Context + Hooks
```typescript
// Global App Context
interface AppContextType {
  user: User | null;
  theme: 'light' | 'dark';
  features: Feature[];
  isLoading: boolean;
}

// PDF Management Context
interface PDFContextType {
  pdfs: PDF[];
  uploadPDF: (file: File) => Promise<PDF>;
  deletePDF: (id: string) => Promise<void>;
  selectedPDF: PDF | null;
  setSelectedPDF: (pdf: PDF) => void;
}

// Analysis Context
interface AnalysisContextType {
  analyses: Analysis[];
  currentAnalysis: Analysis | null;
  startAnalysis: (type: string, data: any) => Promise<Analysis>;
  getAnalysis: (id: string) => Promise<Analysis>;
}
```

---

## 🔧 Backend Service Architecture

### **FastAPI Application Structure**

#### `main.py` - Application Entry Point
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import pdf_routes, analysis_routes, websocket_routes
from app.config import settings

app = FastAPI(title="PDF2AI API", version="2.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(pdf_routes.router, prefix="/api", tags=["PDF"])
app.include_router(analysis_routes.router, prefix="/api", tags=["Analysis"])
app.include_router(websocket_routes.router, prefix="/ws", tags=["WebSocket"])
```

#### Service Layer Pattern
```python
# services/pdf_service.py
class PDFService:
    async def upload_pdf(self, file: UploadFile) -> PDFModel:
        # File validation and storage
        # Text extraction
        # Metadata generation
        pass
    
    async def get_pdf_content(self, file_id: str) -> str:
        # Retrieve and return PDF text content
        pass

# services/ai_service.py
class AIService:
    async def summarize_text(self, text: str, options: dict) -> str:
        # Ollama/Gemma3 integration
        pass
    
    async def analyze_cv_job_match(self, cv_text: str, job_text: str) -> dict:
        # AI-powered CV analysis
        pass

# services/analysis_service.py
class AnalysisService:
    async def create_analysis(self, analysis_type: str, data: dict) -> Analysis:
        # Create and manage analysis tasks
        pass
    
    async def get_analysis_results(self, analysis_id: str) -> dict:
        # Retrieve analysis results
        pass
```

### **Background Task Processing**
```python
from fastapi import BackgroundTasks

async def process_analysis_background(
    analysis_id: str,
    analysis_type: str,
    data: dict,
    websocket_manager: WebSocketManager
):
    """Background task for processing AI analysis with real-time updates"""
    try:
        # Update progress via WebSocket
        await websocket_manager.send_progress_update(analysis_id, 25, "Extracting text...")
        
        # Perform analysis
        if analysis_type == "summarize":
            result = await ai_service.summarize_text(data["text"], data["options"])
        elif analysis_type == "cv_compare":
            result = await ai_service.analyze_cv_job_match(
                data["cv_text"], 
                data["job_text"]
            )
        
        # Save results and notify completion
        await analysis_service.save_results(analysis_id, result)
        await websocket_manager.send_completion_update(analysis_id, result)
        
    except Exception as e:
        await websocket_manager.send_error_update(analysis_id, str(e))
```

---

## 🌐 Development Workflow

### **Getting Started Commands**

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Install shadcn/ui (V0 compatibility)
npx shadcn-ui@latest init

# Install additional dependencies for V0 components
npm install tailwindcss-animate class-variance-authority clsx lucide-react

# Start React development server
npm start
```

### **API Testing Strategy**
- **Automated Testing**: pytest for backend API tests
- **Manual Testing**: Postman collection for API endpoints
- **Integration Testing**: End-to-end tests with Playwright
- **Load Testing**: Locust for performance testing

### **Development Tools**
- **Backend**: FastAPI auto-documentation at `http://localhost:8000/docs`
- **Frontend**: React Developer Tools
- **UI Design**: V0 by Vercel for component generation
- **Component Library**: shadcn/ui with Tailwind CSS
- **API Client**: Axios with interceptors for error handling
- **State Management**: React DevTools for context debugging

---

## 🚀 Deployment Considerations

### **Production Architecture**
- **Frontend**: Nginx for static file serving
- **Backend**: Gunicorn + Uvicorn workers
- **File Storage**: Cloud storage (AWS S3/Google Cloud)
- **Database**: PostgreSQL for analysis history
- **Caching**: Redis for analysis results
- **Monitoring**: Prometheus + Grafana

### **Security Measures**
- **File Upload**: Virus scanning and file type validation
- **Rate Limiting**: API request limiting per user
- **CORS**: Restricted origin configuration for production
- **Data Privacy**: Automatic file cleanup after processing
- **API Security**: API key authentication (future)

This architecture provides a solid foundation for building a modern, scalable PDF2AI web application with excellent user experience and maintainable code structure. 