#!/bin/bash

# Startup script for Railway deployment
echo "🚀 Starting Routing AI Agent..."
echo "PORT: ${PORT:-8000}"
echo "PYTHONPATH: ${PYTHONPATH:-/app}"
echo "Working directory: $(pwd)"

# Set default port if not provided
PORT=${PORT:-8000}

echo "Starting uvicorn on port $PORT"

# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
