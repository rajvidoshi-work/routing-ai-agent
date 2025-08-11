#!/bin/bash

# Routing AI Agent - Service Startup Script
# This script starts both backend and frontend services

set -e

echo "🏥 Starting Routing AI Agent Services..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on a port
kill_port() {
    local port=$1
    echo -e "${YELLOW}Stopping existing services on port $port...${NC}"
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Check and kill existing services
if check_port 8000; then
    kill_port 8000
fi

if check_port 3003; then
    kill_port 3003
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}📝 Please edit .env file and add your Google AI API key${NC}"
    else
        echo -e "${RED}❌ No .env.example file found${NC}"
        exit 1
    fi
fi

# Install backend dependencies if needed
echo -e "${BLUE}📦 Checking backend dependencies...${NC}"
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || true

# Install Python dependencies
pip install -r requirements.txt > /dev/null 2>&1
echo -e "${GREEN}✅ Backend dependencies ready${NC}"

# Install frontend dependencies if needed
echo -e "${BLUE}📦 Checking frontend dependencies...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install > /dev/null 2>&1
fi
echo -e "${GREEN}✅ Frontend dependencies ready${NC}"
cd ..

# Start backend service
echo -e "${BLUE}🚀 Starting backend service on port 8000...${NC}"
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend service started successfully${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend failed to start. Check backend.log for errors${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# Start frontend service
echo -e "${BLUE}🚀 Starting frontend service on port 3003...${NC}"
cd frontend
PORT=3003 npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo -e "${YELLOW}⏳ Waiting for frontend to start...${NC}"
for i in {1..60}; do
    if curl -s http://localhost:3003 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend service started successfully${NC}"
        break
    fi
    if [ $i -eq 60 ]; then
        echo -e "${RED}❌ Frontend failed to start. Check frontend.log for errors${NC}"
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# Success message
echo ""
echo -e "${GREEN}🎉 Routing AI Agent is now running!${NC}"
echo "========================================"
echo -e "${BLUE}🎨 Frontend:${NC} http://localhost:3003"
echo -e "${BLUE}🔧 Backend API:${NC} http://localhost:8000"
echo -e "${BLUE}📚 API Docs:${NC} http://localhost:8000/docs"
echo -e "${BLUE}❤️  Health Check:${NC} http://localhost:8000/health"
echo ""
echo -e "${YELLOW}📋 Sample Patients Available:${NC}"
echo "  • Michael Kelly - COPD Exacerbation"
echo "  • Gary Jones - COPD Exacerbation"
echo "  • Isaiah Oneal - CHF Exacerbation"
echo "  • Bryan Keller - CHF Exacerbation"
echo "  • Victoria Conley - Acute Pancreatitis"
echo ""
echo -e "${GREEN}🎬 Ready for demo! Open http://localhost:3003 in your browser${NC}"
echo ""
echo -e "${YELLOW}To stop services:${NC}"
echo "  lsof -ti:8000 | xargs kill -9"
echo "  lsof -ti:3003 | xargs kill -9"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo "  Backend: tail -f backend.log"
echo "  Frontend: tail -f frontend.log"

# Keep script running to show logs
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Services stopped${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop services
wait
