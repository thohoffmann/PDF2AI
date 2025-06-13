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
    # Kill processes on ports 3000 and 8000
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up trap to catch script termination
trap cleanup SIGINT SIGTERM

# Function to setup virtual environment
setup_venv() {
    echo -e "${GREEN}Setting up Python virtual environment...${NC}"
    cd "$PROJECT_ROOT/backend"
    if [ ! -d "venv" ]; then
        /opt/homebrew/bin/python3.11 -m venv venv
    fi
    source venv/bin/activate
    pip install --upgrade pip wheel setuptools
    pip install -r requirements.txt
}

# Function to start backend server
start_backend() {
    echo -e "${GREEN}Starting backend server...${NC}"
    cd "$PROJECT_ROOT/backend"
    source venv/bin/activate
    
    # Kill any existing process on port 8000
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    
    # Set PYTHONPATH to include the backend directory
    export PYTHONPATH="$PROJECT_ROOT/backend:$PYTHONPATH"
    
    # Start the backend server
    echo "Starting uvicorn server..."
    uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
    
    # Wait for backend to be ready
    echo "Waiting for backend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:8000/ > /dev/null; then
            echo "Backend is ready!"
            return 0
        fi
        echo "Attempt $i: Waiting for backend..."
        sleep 1
    done
    
    echo -e "${RED}Backend failed to start within 30 seconds${NC}"
    return 1
}

# Function to start frontend server
start_frontend() {
    echo -e "${GREEN}Starting frontend server...${NC}"
    cd "$PROJECT_ROOT/frontend"
    # Kill any existing process on port 3000
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    npm install  # Ensure dependencies are installed
    npm run dev &
}

# Main execution
echo -e "${GREEN}Starting development servers...${NC}"

# Setup virtual environment and install dependencies
setup_venv

# Start backend
if ! start_backend; then
    echo -e "${RED}Failed to start backend server. Exiting...${NC}"
    exit 1
fi

# Start frontend
start_frontend

echo -e "${GREEN}Both servers are running!${NC}"
echo -e "Press Ctrl+C to stop all servers"

# Keep script running and wait for user interrupt
wait 