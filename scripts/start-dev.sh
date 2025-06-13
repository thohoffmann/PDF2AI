#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to handle cleanup on script exit
cleanup() {
    echo -e "\n${RED}Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up trap to catch script termination
trap cleanup SIGINT SIGTERM

# Function to setup virtual environment
setup_venv() {
    echo -e "${GREEN}Setting up Python virtual environment...${NC}"
    cd "$PROJECT_ROOT"
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r "$PROJECT_ROOT/backend/requirements.txt"
}

# Function to start backend server
start_backend() {
    echo -e "${GREEN}Starting backend server...${NC}"
    cd "$PROJECT_ROOT/backend"
    source "$PROJECT_ROOT/venv/bin/activate"
    # Add the current directory to PYTHONPATH
    export PYTHONPATH=$PYTHONPATH:$(pwd)
    # Run uvicorn with the ASGI application
    python -m uvicorn asgi:application --host 127.0.0.1 --port 8000 &
}

# Function to start frontend server
start_frontend() {
    echo -e "${GREEN}Starting frontend server...${NC}"
    cd "$PROJECT_ROOT/frontend"
    npm start &
}

# Main execution
echo -e "${GREEN}Starting development servers...${NC}"

# Setup virtual environment and install dependencies
setup_venv

# Start backend
start_backend

# Wait a moment for backend to initialize
sleep 3

# Start frontend
start_frontend

echo -e "${GREEN}Both servers are running!${NC}"
echo -e "Press Ctrl+C to stop all servers"

# Keep script running and wait for user interrupt
wait 