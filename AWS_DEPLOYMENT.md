# 🚀 AWS Deployment Guide - Routing AI Agent

This guide will help you deploy the Routing AI Agent application to your AWS account using AWS Lambda, API Gateway, and S3.

## 📋 Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Node.js and npm installed
- Python 3.11+ installed
- Docker installed (for building Lambda container)

## 🏗️ Architecture

- **Backend**: AWS Lambda (containerized FastAPI)
- **API**: API Gateway (REST API)
- **Storage**: S3 bucket for patient data files
- **Frontend**: S3 + CloudFront or Netlify

## 🚀 Quick Deployment

### Option 1: Automated Deployment Script

```bash
# Run the automated deployment script
./deploy-aws.sh
```

### Option 2: Manual Deployment Steps

#### Step 1: Install Prerequisites

```bash
# Install AWS CDK globally
npm install -g aws-cdk

# Configure AWS credentials
aws configure
```

#### Step 2: Deploy Backend Infrastructure

```bash
# Navigate to CDK directory
cd aws-cdk

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy the stack
cdk deploy
```

#### Step 3: Update Frontend Configuration

After deployment, update your frontend environment variables:

```bash
# In frontend/.env.production
REACT_APP_API_URL=https://your-api-gateway-url.amazonaws.com/prod/api
```

#### Step 4: Deploy Frontend

**Option A: Deploy to S3 + CloudFront**
```bash
# Build frontend
cd frontend
npm run build

# Deploy to S3 (replace with your bucket name)
aws s3 sync build/ s3://your-frontend-bucket --delete
```

**Option B: Deploy to Netlify**
- Use the existing netlify.toml configuration
- Set `REACT_APP_API_URL` to your API Gateway URL

## 🔧 Configuration

### Environment Variables

Set these in AWS Lambda environment variables:

```
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key (optional)
DATA_BUCKET=routing-ai-agent-data-{account-id}
PYTHONPATH=/var/task
```

### API Gateway CORS

The CDK stack automatically configures CORS for:
- All origins (`*`)
- All HTTP methods
- Standard headers

## 🧪 Testing

After deployment, test these endpoints:

1. **Health Check**: `https://your-api-url.amazonaws.com/health`
2. **API Docs**: `https://your-api-url.amazonaws.com/docs`
3. **Root**: `https://your-api-url.amazonaws.com/`

## 📊 Monitoring

- **CloudWatch Logs**: Lambda function logs
- **CloudWatch Metrics**: API Gateway and Lambda metrics
- **X-Ray**: Distributed tracing (optional)

## 💰 Cost Estimation

**Monthly costs (approximate):**
- Lambda: $0-20 (depending on usage)
- API Gateway: $3.50 per million requests
- S3: $0.023 per GB stored
- CloudFront: $0.085 per GB transferred

## 🔍 Troubleshooting

### Common Issues

1. **Lambda Timeout**: Increase timeout in CDK stack (max 15 minutes)
2. **Memory Issues**: Increase memory allocation (currently 2048MB)
3. **CORS Errors**: Check API Gateway CORS configuration
4. **Import Errors**: Ensure all dependencies are in requirements.aws.txt

### Debugging

```bash
# View Lambda logs
aws logs tail /aws/lambda/RoutingAiAgentStack-RoutingAiAgentFunction --follow

# Check API Gateway logs
aws logs describe-log-groups --log-group-name-prefix API-Gateway-Execution-Logs
```

## 🔄 Updates

To update the application:

```bash
# Update code and redeploy
git pull
cd aws-cdk
cdk deploy
```

## 🗑️ Cleanup

To remove all AWS resources:

```bash
cd aws-cdk
cdk destroy
```

## 📞 Support

If you encounter issues:

1. Check CloudWatch logs for errors
2. Verify environment variables are set
3. Ensure API Gateway is properly configured
4. Test Lambda function directly in AWS Console

## 🎉 Success!

Once deployed, your application will be available at:
- **Backend API**: `https://your-api-id.execute-api.region.amazonaws.com/prod/`
- **Frontend**: Your S3/CloudFront or Netlify URL

The application will have the same functionality as your local development environment, but running on AWS infrastructure with automatic scaling and high availability!
