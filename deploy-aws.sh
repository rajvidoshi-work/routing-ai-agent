#!/bin/bash

# AWS Deployment Script for Routing AI Agent
set -e

echo "🚀 Starting AWS deployment..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    echo "❌ AWS CDK is not installed. Installing..."
    npm install -g aws-cdk
fi

# Check AWS credentials
echo "🔍 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure'"
    exit 1
fi

# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)
AWS_REGION=${AWS_REGION:-us-east-1}

echo "✅ AWS Account ID: $AWS_ACCOUNT_ID"
echo "✅ AWS Region: $AWS_REGION"

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Setup CDK environment
echo "🏗️ Setting up CDK environment..."
cd aws-cdk

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install CDK dependencies
pip install -r requirements.txt

# Bootstrap CDK (only needed once per account/region)
echo "🔧 Bootstrapping CDK..."
cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_REGION

# Deploy the stack
echo "🚀 Deploying to AWS..."
cdk deploy --require-approval never

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Note the API Gateway URL from the output above"
echo "2. Update your frontend environment variables"
echo "3. Deploy frontend to S3/CloudFront or Netlify"

cd ..
