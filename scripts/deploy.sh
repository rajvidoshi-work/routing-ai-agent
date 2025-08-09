#!/bin/bash

# Deployment script for Routing AI Agent to AWS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="routing-ai-agent"
AWS_REGION="us-east-1"

echo -e "${GREEN}🚀 Starting deployment of Routing AI Agent${NC}"

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    exit 1
fi

if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform is not installed${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Build and push Docker image
echo -e "${YELLOW}🐳 Building and pushing Docker image...${NC}"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create ECR repository if it doesn't exist
aws ecr describe-repositories --repository-names $PROJECT_NAME --region $AWS_REGION 2>/dev/null || \
aws ecr create-repository --repository-name $PROJECT_NAME --region $AWS_REGION

# Get ECR login token
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build image
docker build -t $PROJECT_NAME .

# Tag image
docker tag $PROJECT_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME:latest

# Push image
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME:latest

echo -e "${GREEN}✅ Docker image pushed successfully${NC}"

# Deploy infrastructure
echo -e "${YELLOW}🏗️  Deploying infrastructure with Terraform...${NC}"

cd infrastructure

# Check if terraform.tfvars exists
if [ ! -f terraform.tfvars ]; then
    echo -e "${RED}❌ terraform.tfvars file not found${NC}"
    echo -e "${YELLOW}Please copy terraform.tfvars.example to terraform.tfvars and fill in your values${NC}"
    exit 1
fi

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply deployment
echo -e "${YELLOW}🚀 Applying Terraform configuration...${NC}"
terraform apply -auto-approve

# Get outputs
LOAD_BALANCER_URL=$(terraform output -raw load_balancer_url)
ECR_REPOSITORY_URL=$(terraform output -raw ecr_repository_url)

cd ..

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}📱 Application URL: ${LOAD_BALANCER_URL}${NC}"
echo -e "${GREEN}🐳 ECR Repository: ${ECR_REPOSITORY_URL}${NC}"

# Wait for service to be healthy
echo -e "${YELLOW}⏳ Waiting for service to be healthy...${NC}"
sleep 60

# Test the deployment
echo -e "${YELLOW}🧪 Testing deployment...${NC}"
if curl -f "${LOAD_BALANCER_URL}/health" &> /dev/null; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo -e "${YELLOW}The service might still be starting up. Please check the ECS console.${NC}"
fi

echo -e "${GREEN}🚀 Deployment script completed!${NC}"
