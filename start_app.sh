#!/bin/bash

# Discharge Planning Application - Quick Start Script
echo "🏥 Starting Discharge Planning Application..."
echo "================================================"

# Check if we're in the right directory
if [ ! -f "app/main.py" ]; then
    echo "❌ Error: Please run this script from the routing-ai-agent directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found. Please create it with your API keys."
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "❌ Error: Frontend directory not found."
    exit 1
fi

# Kill any existing processes
echo "🔄 Stopping any existing processes..."
pkill -f "uvicorn app.main:app" 2>/dev/null
pkill -f "npm start" 2>/dev/null
sleep 2

# Create patient data directory if it doesn't exist
mkdir -p /Users/rajvi/patient_data
echo "📁 Patient data directory: /Users/rajvi/patient_data"

# Start backend in background
echo "🚀 Starting FastAPI backend..."
export $(grep -v '^#' .env | xargs)
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend started successfully at http://localhost:8000"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo "🚀 Starting React frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Waiting for frontend to initialize..."
sleep 10

echo ""
echo "🎉 Application Started Successfully!"
echo "=================================="
echo "📱 React Frontend:  http://localhost:3003"
echo "🔧 FastAPI Backend: http://localhost:8000"
echo "📚 API Docs:        http://localhost:8000/docs"
echo "📁 Data Management: http://localhost:3003/manage-data"
echo ""
echo "💡 Quick Start:"
echo "1. Go to http://localhost:3003/manage-data"
echo "2. Load your Excel file with patient data"
echo "3. Go to http://localhost:3003 for discharge planning"
echo ""
echo "🛑 To stop the application:"
echo "   Press Ctrl+C or run: pkill -f uvicorn && pkill -f 'npm start'"
echo ""

# Keep script running and show logs
echo "📊 Application Status:"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for user interrupt
trap 'echo ""; echo "🛑 Stopping application..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo "✅ Application stopped."; exit 0' INT

# Keep the script running
while true; do
    sleep 1
done
