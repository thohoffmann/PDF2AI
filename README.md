# PDF2AI - AI-Powered PDF Analysis and CV Optimization Tool

A Python tool for PDF text extraction, AI-powered summarization, and intelligent CV optimization with interactive features.

## 🚀 Features

### 1. **Interactive Menu System** 🎯
- User-friendly menu for feature selection
- Guided prompts for PDF input and comparison text
- Error handling and input validation
- Graceful exit options

### 2. **AI-Powered PDF Summarization** 📄
- Extract text from PDF documents using PyPDF2
- **AI summarization using Ollama/Gemma3** - Advanced language model integration
- Support for multi-page documents
- Progress tracking during processing
- High-quality, context-aware summaries

### 3. **CV-Job Advert Comparison** 🎯 *(NEW!)*
- **AI-powered keyword extraction** from both CV and job adverts
- **Intelligent keyword analysis and matching**
- **Interactive job advert input** via console
- **Smart recommendations** for CV improvement
- **ATS optimization scoring** with detailed feedback
- **Synonym and concept matching** using AI
- **Priority keyword suggestions** for immediate action

## 📋 Complete System Setup

PDF2AI now includes both a FastAPI backend and React frontend for full-stack operation.

### Prerequisites
- **Python 3.11+** (tested with 3.13.3)
- **Node.js 16+** and npm
- pip (Python package manager)
- **Ollama with Gemma3 model** (for AI features)

### 🛠️ Quick Setup Guide

#### 1. **Clone and Navigate to Project**
```bash
git clone <repository-url>
cd PDF2AI
```

#### 2. **Backend Setup (FastAPI)**
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Navigate to backend directory
cd backend

# Install backend dependencies
pip install -r requirements.txt

# Copy environment configuration (optional)
cp env.example .env
# Edit .env file if needed with your settings
```

#### 3. **Frontend Setup (React)**
```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install frontend dependencies
npm install
```

#### 4. **AI Setup (Ollama with Gemma3)**
```bash
# Install Ollama (if not already installed)
# Visit: https://ollama.ai/download

# Pull Gemma3 model
ollama pull gemma3

# Start Ollama service (in separate terminal)
ollama serve
```

### 🚀 Running the Application

#### **Option 1: Full Stack Development (Recommended)**

**Terminal 1 - Backend:**
```bash
cd backend
source ../venv/bin/activate  # Activate virtual environment
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 - AI Service:**
```bash
ollama serve
```

The applications will be available at:
- **Frontend (React)**: http://localhost:3000
- **Backend (FastAPI)**: http://127.0.0.1:8000
- **API Documentation**: http://127.0.0.1:8000/docs

#### **Option 2: Backend Only**
```bash
cd backend
source ../venv/bin/activate
python main.py
```

#### **Option 3: Legacy Mode (Original Script)**
```bash
source venv/bin/activate
python deepdfscan.py
```

### 🧪 Testing the Setup

#### **Connection Test**
```bash
# Test backend connectivity
python test_connection.py
```

Expected output:
```
🧪 Testing PDF2AI Backend Connection...
📡 Testing: http://127.0.0.1:8000/
✅ SUCCESS: 200
📄 Response: {
  "message": "PDF2AI Backend is running!",
  "status": "healthy",
  "version": "1.0.0"
}
```

#### **Frontend Connection Test**
1. Open http://localhost:3000 in your browser
2. You should see the **Backend Connection Test** component at the top
3. If connected properly, you'll see:
   - ✅ Backend Connected
   - Health check results
   - Available endpoints
   - CORS configuration

### 📁 Project Structure

```
PDF2AI/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── api.py          # API routes
│   │   └── config.py       # Configuration
│   ├── main.py             # FastAPI application
│   ├── start.py            # Startup script
│   ├── requirements.txt    # Python dependencies
│   ├── env.example         # Environment variables
│   └── README.md           # Backend documentation
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── App.tsx         # Main application
│   ├── package.json        # Node dependencies
│   └── README.md           # Frontend documentation
├── venv/                   # Python virtual environment
├── deepdfscan.py           # Legacy standalone script
├── test_connection.py      # Backend connection test
└── README.md               # This file
```

### 🔧 Development Workflow

1. **Start Backend**: `cd backend && uvicorn main:app --reload`
2. **Start Frontend**: `cd frontend && npm start`
3. **Start AI Service**: `ollama serve`
4. **Open Browser**: http://localhost:3000
5. **API Documentation**: http://127.0.0.1:8000/docs

### ⚡ Quick Commands

```bash
# Backend development
cd backend && source ../venv/bin/activate && uvicorn main:app --reload

# Frontend development  
cd frontend && npm start

# Test connection
python test_connection.py

# Legacy mode
source venv/bin/activate && python deepdfscan.py
```

### 🛠️ Troubleshooting

#### **Common Issues**

**1. Backend won't start / Import errors**
```bash
# Make sure you're in the backend directory
cd backend

# Activate virtual environment
source ../venv/bin/activate

# Check Python path and imports
python -c "from main import app; print('✅ Import successful')"

# If imports fail, reinstall dependencies
pip install -r requirements.txt
```

**2. Frontend can't connect to backend**
- Ensure backend is running on http://127.0.0.1:8000
- Check the browser console for CORS errors
- Verify API_BASE_URL in `frontend/src/services/api.ts`

**3. Port conflicts**
```bash
# Backend port 8000 in use
lsof -i :8000
kill <PID>  # Kill conflicting process

# Frontend port 3000 in use
# React will offer to run on different port (Y/n)
```

**4. Virtual environment issues**
```bash
# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
cd backend && pip install -r requirements.txt
```

**5. Node.js/npm issues**
```bash
# Clear npm cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### **Quick Health Checks**

```bash
# Test backend health
curl http://127.0.0.1:8000/api/health

# Test frontend build
cd frontend && npm run build

# Test Python environment
python --version  # Should be 3.11+
node --version     # Should be 16+
```

#### **Development Tips**

- Keep 3 terminals open: Backend, Frontend, Ollama
- Use `--reload` flag for backend auto-restart during development
- Check browser DevTools Network tab for API call debugging
- Backend logs show in terminal, frontend logs in browser console

## 🔧 Usage

### **Always activate the virtual environment first:**
```bash
source venv/bin/activate
```

### **Interactive Mode (Recommended)**
```bash
python3 deepdfscan.py
```

This will launch the interactive menu:

```
🚀 PDF2AI - AI-Powered PDF Analysis and CV Optimization Tool
============================================================
Choose a feature:
  1. 📄 Summarise PDF - Get an AI-powered summary of your PDF
  2. 🎯 Compare CV with Job - Compare your CV against a job advert
  3. ❌ Exit
============================================================

Enter your choice (1, 2, or 3):
```

### **Feature 1: PDF Summarization**
1. Select option `1` from the menu
2. Enter the path to your PDF file when prompted
3. Wait for AI processing and receive your summary

**Example Output:**
```
📄 Enter the path to your PDF file: sample.pdf

🤖 Processing PDF: sample.pdf
Parsing PDF: sample.pdf
Number of pages: 3
Processing page 1...
Processing page 2...
Processing page 3...

🤖 Generating AI summary using Gemma3...

==================================================
📄 AI SUMMARY:
==================================================
This document presents a comprehensive analysis of...
[Detailed, context-aware summary generated by AI]
==================================================
```

### **Feature 2: CV-Job Comparison** *(NEW!)*
1. Select option `2` from the menu
2. Enter the path to your CV PDF file
3. Paste the job advert text when prompted
4. Press Enter twice (empty line) to finish input
5. Receive comprehensive AI analysis

**Example Workflow:**
```
📄 Enter the path to your PDF file: CV.pdf

🎯 Starting CV-Job comparison with: CV.pdf

============================================================
JOB ADVERT INPUT
============================================================
Please paste the job advert text below.
When finished, press Enter twice (empty line) to continue:
(Or type 'quit' to cancel)
------------------------------------------------------------
[Paste your job advert text here]


✓ Job advert captured: 1,247 characters

🤖 Analyzing CV with Gemma3 AI...
🤖 Analyzing job advert with Gemma3 AI...
🧠 Performing intelligent keyword analysis...

============================================================
🤖 AI KEYWORD ANALYSIS RESULTS
============================================================

📈 STATISTICS:
   • AI-extracted CV keywords: 45
   • AI-extracted job keywords: 32
   • Direct keyword matches: 18
   • Missing keywords: 14

🎯 AI KEYWORD MATCH SCORE: 56.3%
   👍 GOOD - Strong keyword alignment

🧠 AI ANALYSIS:
   Strong technical foundation with good keyword coverage...

✅ MATCHING KEYWORDS (18):
   python         | javascript     | react          | sql
   ...

🔥 AI-IDENTIFIED CRITICAL MISSING KEYWORDS:
    1. kubernetes
    2. docker
    3. aws
    ...

💼 AI-POWERED RECOMMENDATIONS:
   1. Add containerization experience with Docker and Kubernetes
   2. Highlight cloud platform experience, especially AWS
   ...

🎯 IMMEDIATE PRIORITY ADDITIONS:
   Add these keywords ASAP: kubernetes, docker, aws

🚀 NEXT STEPS:
   1. Add the priority keywords to your CV
   2. Incorporate missing keywords naturally into job descriptions
   3. Update your skills section with relevant technologies
   4. Use keyword variations to avoid over-repetition
   5. Re-run this analysis after updates to track improvement

============================================================
✨ AI Analysis Complete! Your CV is now optimized for ATS!
============================================================
```

## 📁 Project Structure

```
PDF2AI/
├── deepdfscan.py              # Main CLI application script (interactive)
├── README.md                  # This documentation
├── ARCHITECTURE_PLAN.md       # Full web architecture plan
├── .gitignore                 # Git ignore patterns
├── venv/                      # Virtual environment (CLI dependencies)
│   ├── bin/
│   ├── lib/
│   └── ...
├── frontend/                  # React TypeScript Frontend (COMPLETE)
│   ├── public/
│   │   ├── index.html
│   │   └── pdf.worker.min.js  # PDF.js worker
│   ├── src/
│   │   ├── components/        # V0-compatible component structure
│   │   │   ├── ui/           # shadcn/ui base components
│   │   │   │   ├── button.tsx     # CVA-powered button variants
│   │   │   │   ├── card.tsx       # Tailwind card components
│   │   │   │   └── DocumentIcon.tsx
│   │   │   ├── pdf/          # PDF functionality
│   │   │   │   ├── PDFUpload.tsx   # Drag-and-drop upload
│   │   │   │   └── PDFViewer.tsx   # PDF display with controls
│   │   │   └── layout/       # Layout components
│   │   ├── globals.css       # Tailwind v4 directives
│   │   ├── App.tsx           # Main React app
│   │   └── index.tsx
│   ├── package.json          # Frontend dependencies
│   └── node_modules/         # Frontend packages
├── backend/                   # FastAPI Backend (PLANNED)
│   └── (Future implementation)
├── CV.pdf                     # Sample CV for testing
├── sample.pdf                 # Sample PDF for testing
├── sample2.pdf                # Additional sample PDFs
└── sample3.pdf
```

## 🌐 Frontend Web Application *(NEW!)*

### **Modern React Frontend** 🚀
- **React 18+ with TypeScript** for type safety and modern features
- **Tailwind CSS v4.1.6** for utility-first styling
- **V0 Component Compatibility** with shadcn/ui integration
- **PDF.js Integration** for in-browser PDF viewing
- **Drag-and-Drop Upload** with file validation
- **Responsive Design** for desktop and mobile

### **Frontend Features**
- ✅ **PDF Upload Component** - Drag-and-drop interface with validation
- ✅ **PDF Viewer Component** - Zoom, rotate, navigate, download controls
- ✅ **V0-Compatible Components** - Ready for V0 component imports
- ✅ **Tailwind v4 Integration** - Modern utility classes and design system
- ✅ **Class Variance Authority** - Component variants for consistency
- ✅ **Radix UI Primitives** - Accessible, unstyled component foundations

### **Running the Frontend**
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm start

# Frontend will be available at http://localhost:3000
```

### **Frontend Technology Stack**
- **React**: `^19.1.0` - Latest React with concurrent features
- **TypeScript**: `^4.9.5` - Type safety and developer experience
- **Tailwind CSS**: `^4.1.6` - Utility-first CSS framework (v4)
- **shadcn/ui**: `github:shadcn/ui` - Component library for V0 compatibility
- **class-variance-authority**: `^0.7.1` - Component variant system
- **Radix UI**: Multiple packages for accessible primitives
- **PDF.js**: `^4.8.69` - PDF rendering in the browser
- **Lucide React**: `^0.513.0` - Beautiful icon library

## 🧠 Technical Details

### **CLI Dependencies**
- **PyPDF2**: PDF text extraction
- **subprocess**: Interface with Ollama/Gemma3
- **Ollama + Gemma3**: AI-powered text analysis and summarization
- **json**: Data parsing for AI responses
- **pathlib**: File path handling

### **Frontend Dependencies**
- **react-pdf**: PDF rendering and interaction
- **lucide-react**: Icon components
- **@radix-ui/***: Accessible UI primitives
- **@testing-library/***: Testing utilities

### **Key Functions**
- `get_user_choice()`: Interactive menu system
- `get_pdf_path()`: PDF file input with validation
- `parse_pdf()`: Extract text from PDF files
- `summarize_text()`: AI summarization using Ollama/Gemma3
- `compare_cv_with_job()`: Complete CV-job comparison workflow
- `extract_keywords_ai()`: AI-powered keyword extraction
- `ai_keyword_analysis()`: Intelligent keyword matching and analysis
- `get_job_advert_text()`: Interactive job advert input

### **AI Integration**
- **Gemma3 Model**: Advanced language understanding for keyword extraction
- **Context-aware Analysis**: Understands professional terminology and synonyms
- **JSON Response Parsing**: Structured AI responses for reliable analysis
- **Fallback Mechanisms**: Graceful degradation if AI is unavailable

## 🔮 Future Development Plan

### **Phase 1: Enhanced User Experience** *(COMPLETED)*
- [x] **Interactive Menu System**
- [x] **CV-Job Advert Comparison with AI**
- [x] **Smart Keyword Extraction and Analysis**
- [x] **React Frontend with TypeScript**
- [x] **Tailwind CSS v4 + V0 Compatibility**
- [x] **PDF Upload and Viewer Components**
- [x] **Modern Component Architecture**
- [ ] **Backend API Integration**
- [ ] **Real-time Analysis Progress**

### **Phase 2: Backend Integration** *(Next Priority)*
- [ ] **FastAPI Backend Development**
- [ ] **REST API Endpoints**
- [ ] **WebSocket Real-time Updates**
- [ ] **File Upload Handling**
- [ ] **AI Service Integration**
- [ ] **CLI-Backend Logic Sharing**

### **Phase 3: Advanced Analysis Features**
- [ ] **Industry-specific keyword dictionaries**
  - Tech/IT keywords database
  - Finance/Business terminology
  - Healthcare/Medical terms
  - Engineering/Manufacturing terms

- [ ] **Enhanced keyword matching**
  - Advanced synonym recognition
  - Skill clustering and grouping
  - Context-aware scoring algorithms

- [ ] **Export and reporting**
  - Save analysis results to JSON/CSV/PDF
  - Generate detailed comparison reports
  - Track improvements over time

### **Phase 3: Multi-document Support**
- [ ] **Batch processing**
  - Compare one CV against multiple job adverts
  - Bulk PDF summarization
  - Aggregate analysis across documents

- [ ] **Advanced comparison features**
  - Side-by-side document analysis
  - Trend analysis across multiple applications
  - Best-fit job recommendations

### **Phase 4: Web Interface & Cloud Features**
- [ ] **Web-based interface**
  - Drag-and-drop PDF upload
  - Real-time analysis dashboard
  - Visual keyword comparison charts

- [ ] **Cloud integration**
  - Online document storage
  - Shared analysis results
  - Collaborative CV optimization

## 🐛 Known Issues & Limitations

### **Current Limitations:**
- Requires Ollama and Gemma3 model to be installed and running
- AI analysis quality depends on model performance and internet connectivity
- Large PDFs may take longer to process
- Limited to English language processing
- Complex PDF layouts may affect text extraction quality

### **Performance Notes:**
- Large PDFs (>50 pages) may take longer to process
- AI analysis time depends on text length and system performance
- Interactive input supports copy-paste for easy job advert entry
- Memory usage scales with document size

## 🛠️ Troubleshooting

### **Ollama/Gemma3 Issues:**
- Ensure Ollama is installed and running: `ollama serve`
- Check if Gemma3 model is available: `ollama list`
- If model missing: `ollama pull gemma3`
- Restart Ollama service if responses are slow

### **Interactive Input Issues:**
- Use Ctrl+C to cancel input at any time
- Type 'quit' in job advert input to cancel
- Press Enter twice (empty line) to finish job advert input
- Check file paths for PDF input (supports both relative and absolute paths)

### **Virtual Environment Issues:**
- Always activate before running: `source venv/bin/activate`
- Check Python version: `python3 --version`
- Reinstall PyPDF2 if needed: `pip install PyPDF2`

## 🤝 Contributing

### **Development Setup:**
1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Follow existing code style and documentation standards
4. Test with various PDF formats and job adverts
5. Submit pull request with detailed description

### **Code Style:**
- Follow PEP 8 Python style guide
- Use descriptive function and variable names
- Include docstrings for all functions
- Add comprehensive error handling
- Test interactive features thoroughly

## 📄 License

This project is open source. Feel free to use, modify, and distribute according to your needs.

## 📞 Support

For issues, feature requests, or questions:
1. Check existing documentation
2. Review known issues section
3. Create detailed issue report with:
   - Python version
   - Ollama/Gemma3 setup details
   - PDF sample (if possible)
   - Error messages and screenshots
   - Expected vs actual behavior

---

**Last Updated:** June 2025  
**Version:** 3.0.0 - React Frontend + V0 Integration  
**Python Compatibility:** 3.13.3+  
**Frontend Stack:** React 18+ TypeScript, Tailwind CSS v4, shadcn/ui  
**AI Model:** Ollama + Gemma3  
**Key Features:** CLI + Web Interface, V0 Component Compatibility, Modern PDF Viewer 