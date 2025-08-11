#!/bin/bash

# Routing AI Agent - Stop Services Script

echo "🛑 Stopping Routing AI Agent Services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to kill processes on a port
kill_port() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}Stopping $service_name on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
        
        # Check if successfully stopped
        if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        else
            echo -e "${RED}❌ Failed to stop $service_name${NC}"
        fi
    else
        echo -e "${YELLOW}$service_name not running on port $port${NC}"
    fi
}

# Stop backend service
kill_port 8000 "Backend API"

# Stop frontend service
kill_port 3003 "Frontend React"

echo ""
echo -e "${GREEN}🎉 All services stopped successfully!${NC}"
echo ""
echo "To restart services, run:"
echo "  ./start-services.sh"
