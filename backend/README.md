# PDF2AI Backend

FastAPI backend for the PDF2AI application - Transform PDFs into interactive AI assistants.

## Features

- 🚀 FastAPI framework with automatic API documentation
- 🔄 CORS support for frontend communication
- 🏥 Health check endpoints
- 🔧 Environment-based configuration
- 📁 Structured project layout ready for expansion

## Quick Start

### 1. Install Dependencies

Make sure you're in the backend directory:

```bash
cd backend
```

Create a virtual environment (recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 2. Configuration

Copy the example environment file:

```bash
cp env.example .env
```

Edit `.env` file with your settings (optional for basic testing).

### 3. Start the Server

Option 1 - Using the startup script:
```bash
python start.py
```

Option 2 - Using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Option 3 - Using Python directly:
```bash
python main.py
```

The server will start on `http://localhost:8000`

## API Documentation

Once the server is running, you can access:

- **Interactive API Docs (Swagger)**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Available Endpoints

- `GET /` - Root endpoint with basic info
- `GET /api/health` - Health check endpoint
- `GET /api/test` - Connection test endpoint

## Testing the Connection

1. Start the backend server (see Quick Start above)
2. Start the frontend application
3. The frontend will automatically test the connection and display the status

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── api.py          # API routes
│   └── config.py       # Configuration settings
├── main.py             # FastAPI application
├── start.py            # Startup script
├── requirements.txt    # Python dependencies
├── env.example         # Environment variables example
└── README.md           # This file
```

## Development

The server runs in development mode with auto-reload enabled. Any changes to the code will automatically restart the server.

## Next Steps

This basic backend is ready for extending with:
- File upload endpoints
- AI integration (OpenAI, Anthropic)
- Database models
- Authentication
- Advanced PDF processing

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `.env` file or kill the process using port 8000
2. **CORS errors**: Make sure the frontend URL is in `BACKEND_CORS_ORIGINS`
3. **Import errors**: Make sure you're in the correct directory and virtual environment is activated

### Logs

The server provides detailed logging. Check the console output for error messages and request logs. 