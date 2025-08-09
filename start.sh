#!/bin/bash

# Startup script for Routing AI Agent Healthcare MVP

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Routing AI Agent Healthcare MVP${NC}"
echo "=================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${RED}📝 Please edit .env file and add your OpenAI API key${NC}"
    echo -e "${RED}   Then run this script again.${NC}"
    exit 1
fi

# Check if AI API key is set
if grep -q "GOOGLE_AI_API_KEY=.*[^-].*" .env 2>/dev/null; then
    echo -e "${GREEN}✅ Google AI Studio API key configured${NC}"
elif grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then
    echo -e "${GREEN}✅ OpenAI API key configured${NC}"
else
    echo -e "${YELLOW}⚠️  No AI API key configured in .env file${NC}"
    echo -e "${YELLOW}   The application will run with fallback logic only.${NC}"
    echo -e "${YELLOW}   For full AI features, add GOOGLE_AI_API_KEY or OPENAI_API_KEY to .env${NC}"
fi

# Check if dependencies are installed
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
if ! python3 -c "import fastapi, uvicorn, pandas, openai" 2>/dev/null; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    pip3 install -r requirements.txt
fi

# Run setup test
echo -e "${YELLOW}🧪 Running setup verification...${NC}"
if ! python3 test_setup.py > /dev/null 2>&1; then
    echo -e "${RED}❌ Setup verification failed. Please check the installation.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Setup verification passed${NC}"

# Start the application
echo -e "${GREEN}🌟 Starting the application...${NC}"
echo -e "${GREEN}📱 Dashboard will be available at: http://localhost:8000${NC}"
echo -e "${GREEN}📊 Sample Excel file available: sample_patients.xlsx${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the application${NC}"
echo ""

# Load environment variables and start uvicorn
export $(grep -v '^#' .env | xargs)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
