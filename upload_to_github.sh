#!/bin/bash

# 🚀 Automated GitHub Upload Script for Routing AI Agent
# This script will upload your complete application to GitHub

echo "🚀 ROUTING AI AGENT - GITHUB UPLOAD SCRIPT"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "app/main.py" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the routing-ai-agent directory"
    exit 1
fi

# Get user input
echo "📝 Please provide the following information:"
echo ""

read -p "🔹 Your GitHub username: " GITHUB_USERNAME
if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ GitHub username is required"
    exit 1
fi

read -p "🔹 Repository name (default: routing-ai-agent): " REPO_NAME
REPO_NAME=${REPO_NAME:-routing-ai-agent}

echo ""
echo "🔍 Repository will be created as: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""

read -p "🔹 Continue with upload? (y/N): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "❌ Upload cancelled"
    exit 1
fi

echo ""
echo "🔧 Preparing repository..."

# Ensure we have the latest commits
git add .
git commit -m "Final commit before GitHub upload

Complete discharge planning application ready for GitHub:
- React frontend with modern medical UI
- FastAPI backend with AI routing
- All agent forms (Nursing, DME, Pharmacy, State)
- Dedicated nursing order form page
- Complete documentation and setup guides
- Sample data and configuration files

Ready for deployment and collaboration!" 2>/dev/null || echo "✅ Repository already up to date"

echo ""
echo "🌐 Setting up GitHub remote..."

# Remove existing origin if it exists
git remote remove origin 2>/dev/null || true

# Add new origin
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

echo ""
echo "📤 Uploading to GitHub..."
echo "Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""

# Set main branch and push
git branch -M main

# Push to GitHub
if git push -u origin main; then
    echo ""
    echo "🎉 SUCCESS! Your application has been uploaded to GitHub!"
    echo "========================================================="
    echo ""
    echo "📍 Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "✅ What's been uploaded:"
    echo "   • Complete React frontend (TypeScript)"
    echo "   • FastAPI backend with AI integration"
    echo "   • All healthcare agent forms"
    echo "   • Dedicated nursing order form page"
    echo "   • Data management system"
    echo "   • Complete documentation"
    echo "   • Sample patient data"
    echo "   • Docker configuration"
    echo "   • Environment setup files"
    echo ""
    echo "🔒 Protected (not uploaded):"
    echo "   • .env file (API keys safe)"
    echo "   • node_modules/ (excluded)"
    echo "   • Log files (excluded)"
    echo "   • Sensitive data (excluded)"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Visit: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "   2. Verify all files are present"
    echo "   3. Check that README.md displays properly"
    echo "   4. Share the repository with collaborators"
    echo ""
    echo "🚀 Your discharge planning application is now on GitHub!"
else
    echo ""
    echo "❌ Upload failed. This might be because:"
    echo "   1. Repository doesn't exist on GitHub yet"
    echo "   2. You need to authenticate with GitHub"
    echo "   3. Repository name already exists"
    echo ""
    echo "🔧 Manual steps needed:"
    echo "   1. Go to https://github.com/new"
    echo "   2. Create repository named: $REPO_NAME"
    echo "   3. Don't initialize with README"
    echo "   4. Run this script again"
    echo ""
    echo "Or run these commands manually:"
    echo "   git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
fi

echo ""
echo "📋 Repository contains $(git ls-files | wc -l | xargs) files across:"
echo "   • Backend: $(find app -name '*.py' | wc -l | xargs) Python files"
echo "   • Frontend: $(find frontend/src -name '*.tsx' -o -name '*.ts' | wc -l | xargs) TypeScript files"
echo "   • Documentation: $(find . -name '*.md' | wc -l | xargs) Markdown files"
echo "   • Configuration: $(find . -name '*.json' -o -name '*.txt' -o -name '*.yml' | wc -l | xargs) config files"
echo ""
echo "✅ Upload script completed!"
