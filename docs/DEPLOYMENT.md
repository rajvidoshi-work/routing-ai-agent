# Deployment Guide - Routing AI Agent

## Overview

This guide covers deploying the Routing AI Agent healthcare application to AWS using containerized deployment with ECS Fargate.

## Prerequisites

### Local Development
- Python 3.11+
- Docker
- OpenAI API key

### AWS Deployment
- AWS CLI configured with appropriate permissions
- Terraform >= 1.0
- Docker
- OpenAI API key

## Local Development Setup

### 1. Clone and Setup

```bash
git clone <repository-url>
cd routing-ai-agent

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your OpenAI API key
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Run Locally

```bash
# Start the application
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or use Docker
docker-compose up --build
```

### 4. Test the Application

```bash
# Generate sample data
python examples/generate_sample_data.py

# Test API endpoints
python examples/test_api.py
```

Access the dashboard at `http://localhost:8000`

## AWS Deployment

### 1. AWS Prerequisites

Ensure you have:
- AWS CLI installed and configured
- Appropriate IAM permissions for:
  - ECS (Elastic Container Service)
  - ECR (Elastic Container Registry)
  - VPC and networking resources
  - Application Load Balancer
  - CloudWatch
  - SSM Parameter Store

### 2. Configure Terraform Variables

```bash
cd infrastructure

# Copy the example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
vim terraform.tfvars
```

Required variables:
```hcl
aws_region = "us-east-1"
project_name = "routing-ai-agent"
environment = "production"
openai_api_key = "your-openai-api-key-here"
```

### 3. Deploy Using Script

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

### 4. Manual Deployment Steps

If you prefer manual deployment:

#### Build and Push Docker Image

```bash
# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"
PROJECT_NAME="routing-ai-agent"

# Create ECR repository
aws ecr create-repository --repository-name $PROJECT_NAME --region $AWS_REGION

# Get ECR login
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push image
docker build -t $PROJECT_NAME .
docker tag $PROJECT_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME:latest
```

#### Deploy Infrastructure

```bash
cd infrastructure

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply deployment
terraform apply
```

### 5. Verify Deployment

```bash
# Get the load balancer URL
terraform output load_balancer_url

# Test the deployment
curl -f "$(terraform output -raw load_balancer_url)/health"

# Run API tests against deployed service
python examples/test_api.py "$(terraform output -raw load_balancer_url)"
```

## Architecture Components

### AWS Resources Created

1. **VPC and Networking**
   - VPC with public and private subnets
   - Internet Gateway and NAT Gateways
   - Route tables and security groups

2. **Container Infrastructure**
   - ECR repository for Docker images
   - ECS Fargate cluster and service
   - Application Load Balancer

3. **Security and Configuration**
   - IAM roles for ECS tasks
   - SSM Parameter Store for secrets
   - CloudWatch log groups

4. **Monitoring**
   - ECS service health checks
   - CloudWatch container insights
   - Load balancer health checks

### Security Considerations

1. **Secrets Management**
   - OpenAI API key stored in SSM Parameter Store
   - No secrets in container images or code

2. **Network Security**
   - Private subnets for ECS tasks
   - Security groups with minimal required access
   - Load balancer in public subnets only

3. **Access Control**
   - IAM roles with least privilege
   - No direct internet access for containers

## Monitoring and Maintenance

### Health Checks

The application provides several health check endpoints:
- `/health` - Basic service health
- Load balancer health checks on port 8000

### Logs

View application logs:
```bash
# Using AWS CLI
aws logs tail /ecs/routing-ai-agent --follow

# Using AWS Console
# Navigate to CloudWatch > Log Groups > /ecs/routing-ai-agent
```

### Scaling

Adjust the number of running tasks:
```bash
# Update terraform.tfvars
ecs_desired_count = 3

# Apply changes
terraform apply
```

### Updates

To deploy application updates:
```bash
# Build and push new image
docker build -t routing-ai-agent .
docker tag routing-ai-agent:latest $ECR_REPOSITORY_URL:latest
docker push $ECR_REPOSITORY_URL:latest

# Force ECS service update
aws ecs update-service \
  --cluster routing-ai-agent-cluster \
  --service routing-ai-agent \
  --force-new-deployment
```

## Troubleshooting

### Common Issues

1. **Service Not Starting**
   - Check ECS service events in AWS Console
   - Verify environment variables and secrets
   - Check CloudWatch logs

2. **Health Check Failures**
   - Verify application is listening on port 8000
   - Check security group rules
   - Verify load balancer target group health

3. **OpenAI API Errors**
   - Verify API key is correct in SSM Parameter Store
   - Check API key permissions and usage limits

### Debug Commands

```bash
# Check ECS service status
aws ecs describe-services --cluster routing-ai-agent-cluster --services routing-ai-agent

# Check task status
aws ecs list-tasks --cluster routing-ai-agent-cluster --service-name routing-ai-agent

# View task logs
aws logs tail /ecs/routing-ai-agent --follow

# Check load balancer targets
aws elbv2 describe-target-health --target-group-arn <target-group-arn>
```

## Cleanup

To remove all AWS resources:

```bash
cd infrastructure
terraform destroy
```

Note: This will delete all resources including data. Make sure to backup any important data before destroying.

## Cost Optimization

### Estimated Monthly Costs (us-east-1)

- ECS Fargate (2 tasks, 0.5 vCPU, 1GB RAM): ~$25
- Application Load Balancer: ~$20
- NAT Gateways (2): ~$45
- CloudWatch Logs: ~$5
- **Total: ~$95/month**

### Cost Reduction Options

1. **Single AZ Deployment**: Remove one NAT Gateway (~$22.50 savings)
2. **Smaller Tasks**: Reduce CPU/memory if sufficient
3. **Reserved Capacity**: Use Savings Plans for predictable workloads
4. **Log Retention**: Reduce CloudWatch log retention period

## Production Considerations

### Security Enhancements

1. **HTTPS/TLS**: Add SSL certificate to load balancer
2. **Authentication**: Implement API authentication
3. **WAF**: Add AWS WAF for additional protection
4. **VPC Endpoints**: Use VPC endpoints for AWS services

### Performance Optimization

1. **Auto Scaling**: Implement ECS auto scaling
2. **Caching**: Add Redis/ElastiCache for caching
3. **CDN**: Use CloudFront for static assets
4. **Database**: Add RDS for persistent data storage

### Compliance

1. **HIPAA**: Implement additional security controls for healthcare data
2. **Audit Logging**: Enhanced logging and monitoring
3. **Data Encryption**: Encrypt data at rest and in transit
4. **Backup**: Implement backup and disaster recovery
