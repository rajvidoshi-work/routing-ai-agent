#!/bin/bash

# Deployment script for Routing AI Agent
echo "🚀 Starting deployment process..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
else
    echo "❌ Frontend build failed!"
    exit 1
fi

cd ..

# Check if backend files are ready
echo "🔍 Checking backend files..."
if [ -f "requirements.txt" ] && [ -d "app" ]; then
    echo "✅ Backend files ready!"
else
    echo "❌ Backend files missing!"
    exit 1
fi

echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Railway/Render/Vercel"
echo "2. Deploy frontend to Netlify"
echo "3. Update environment variables"
echo ""
echo "Frontend build is ready in: frontend/build/"
echo "Backend files are ready for deployment"
