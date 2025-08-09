# Project Structure - Routing AI Agent Healthcare MVP

## 📁 Complete Directory Structure

```
routing-ai-agent/
├── 📄 README.md                           # Main project documentation
├── 📄 PROJECT_SUMMARY.md                  # Complete project overview
├── 📄 PROJECT_STRUCTURE.md               # This file - project structure guide
├── 📄 requirements.txt                    # Python dependencies
├── 📄 .env.example                       # Environment variables template
├── 📄 pytest.ini                         # Pytest configuration
├── 📄 docker-compose.yml                 # Docker Compose for local development
├── 📄 Dockerfile                         # Container configuration
├── 🚀 start.sh                          # Easy startup script
├── 🧪 test_setup.py                     # Setup verification script
├── 📊 sample_patients.xlsx               # Generated sample data (after running script)
│
├── 📂 app/                               # Main application code
│   ├── 📄 __init__.py                   # Python package marker
│   ├── 📄 main.py                       # FastAPI application and routes
│   ├── 📄 models.py                     # Pydantic data models
│   ├── 📄 ai_service.py                 # AI routing and agent logic
│   └── 📄 data_service.py               # Excel processing and data management
│
├── 📂 templates/                         # HTML templates
│   └── 📄 dashboard.html                # Main dashboard interface
│
├── 📂 static/                           # Static web assets
│   └── 📄 style.css                    # Additional CSS styles
│
├── 📂 docs/                             # Comprehensive documentation
│   ├── 📄 API_DOCUMENTATION.md         # Complete API reference
│   ├── 📄 DEPLOYMENT.md                # AWS deployment guide
│   └── 📄 TESTING.md                   # Testing strategies and examples
│
├── 📂 examples/                         # Sample data and testing scripts
│   ├── 📄 generate_sample_data.py      # Generate sample Excel file
│   └── 📄 test_api.py                  # API testing script
│
├── 📂 tests/                           # Test suite
│   ├── 📂 unit/                        # Unit tests
│   │   └── 📄 test_models.py           # Data model tests
│   └── 📂 integration/                 # Integration tests
│       └── 📄 test_api_endpoints.py    # API endpoint tests
│
├── 📂 infrastructure/                   # AWS deployment infrastructure
│   ├── 📄 main.tf                      # Main Terraform configuration
│   ├── 📄 variables.tf                 # Terraform variables
│   ├── 📄 outputs.tf                   # Terraform outputs
│   └── 📄 terraform.tfvars.example     # Terraform variables template
│
└── 📂 scripts/                         # Deployment and utility scripts
    └── 🚀 deploy.sh                    # AWS deployment script
```

## 🏗️ Architecture Components

### Core Application (`app/`)

#### `main.py` - FastAPI Application
- **Purpose**: Main application entry point with all API routes
- **Key Features**:
  - Health check endpoint
  - Patient data upload and management
  - AI routing and agent processing endpoints
  - Dashboard serving
  - Error handling and validation

#### `models.py` - Data Models
- **Purpose**: Pydantic models for data validation and serialization
- **Key Models**:
  - `PatientData`: Patient information structure
  - `CaregiverInput`: Caregiver form input
  - `RoutingDecision`: AI routing response
  - `AgentResponse`: Agent processing results
  - `EditableForm`: Form generation for external partners

#### `ai_service.py` - AI Processing Engine
- **Purpose**: OpenAI integration and AI-powered decision making
- **Key Features**:
  - Patient routing logic using GPT
  - Individual agent processing (Nursing, DME, Pharmacy)
  - Form generation for external partners
  - Fallback logic when AI is unavailable

#### `data_service.py` - Data Management
- **Purpose**: Excel file processing and patient data management
- **Key Features**:
  - Excel file parsing and validation
  - Patient data caching
  - Sample data generation
  - Data model conversion

### Frontend (`templates/`, `static/`)

#### `dashboard.html` - Main Interface
- **Purpose**: Interactive web dashboard for caregivers
- **Key Features**:
  - File upload interface
  - Patient selection and caregiver input forms
  - Real-time processing with loading indicators
  - Results visualization with agent responses

#### `style.css` - Additional Styling
- **Purpose**: Enhanced styling for the dashboard
- **Features**: Responsive design, animations, agent-specific styling

### Infrastructure (`infrastructure/`)

#### `main.tf` - AWS Infrastructure
- **Purpose**: Complete AWS deployment configuration
- **Resources Created**:
  - VPC with public/private subnets
  - ECS Fargate cluster and service
  - Application Load Balancer
  - ECR repository
  - CloudWatch logging
  - SSM Parameter Store

#### `variables.tf` & `outputs.tf`
- **Purpose**: Terraform configuration management
- **Features**: Parameterized deployment, output values for integration

### Testing (`tests/`)

#### Unit Tests (`tests/unit/`)
- **Purpose**: Test individual components in isolation
- **Coverage**: Data models, validation, business logic

#### Integration Tests (`tests/integration/`)
- **Purpose**: Test API endpoints and component interaction
- **Coverage**: HTTP endpoints, data flow, error handling

### Documentation (`docs/`)

#### `API_DOCUMENTATION.md`
- **Purpose**: Complete API reference with examples
- **Content**: All endpoints, request/response formats, error codes

#### `DEPLOYMENT.md`
- **Purpose**: Comprehensive deployment guide
- **Content**: Local setup, AWS deployment, monitoring, troubleshooting

#### `TESTING.md`
- **Purpose**: Testing strategies and examples
- **Content**: Test scenarios, performance testing, CI/CD integration

### Examples & Scripts

#### `examples/`
- **Purpose**: Sample data and testing utilities
- **Files**: Data generation, API testing scripts

#### `scripts/`
- **Purpose**: Deployment and automation scripts
- **Files**: AWS deployment automation

## 🔧 Key Configuration Files

### `requirements.txt`
```
fastapi==0.104.1          # Web framework
uvicorn[standard]==0.24.0 # ASGI server
pandas==2.1.3             # Data processing
openpyxl==3.1.2           # Excel file handling
pydantic==2.5.0           # Data validation
openai==1.3.7             # AI integration
boto3==1.34.0             # AWS SDK
```

### `.env.example`
```bash
OPENAI_API_KEY=your-openai-api-key-here
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO
```

### `docker-compose.yml`
- Local development environment
- Environment variable injection
- Volume mounting for development

### `Dockerfile`
- Multi-stage build for optimization
- Health check configuration
- Security best practices

## 🚀 Entry Points

### Local Development
1. **`./start.sh`** - Automated startup (recommended)
2. **`uvicorn app.main:app --reload`** - Manual startup
3. **`docker-compose up`** - Containerized development

### Testing
1. **`python3 test_setup.py`** - Setup verification
2. **`pytest`** - Full test suite
3. **`python3 examples/test_api.py`** - API testing

### Deployment
1. **`./scripts/deploy.sh`** - Automated AWS deployment
2. **Manual Terraform** - Step-by-step deployment

## 📊 Data Flow

```
Excel File → data_service.py → PatientData Models
     ↓
Dashboard Input → CaregiverInput Models
     ↓
AI Service → OpenAI API → RoutingDecision
     ↓
Agent Processing → AgentResponse + EditableForm
     ↓
Dashboard Display → Results Visualization
```

## 🔒 Security Considerations

### Secrets Management
- Environment variables for local development
- AWS SSM Parameter Store for production
- No hardcoded credentials in code

### Network Security
- Private subnets for application containers
- Security groups with minimal required access
- Load balancer in public subnets only

### Data Validation
- Pydantic models for all input validation
- File type and size restrictions
- Comprehensive error handling

## 📈 Scalability Features

### Current Architecture
- Stateless application design
- Containerized deployment
- Load balancer distribution
- Auto-scaling capabilities

### Future Enhancements
- Database integration points
- Caching layer preparation
- Message queue integration
- Multi-region deployment support

## 🎯 Development Workflow

### Adding New Features
1. Update models in `models.py`
2. Implement business logic in appropriate service
3. Add API endpoints in `main.py`
4. Update frontend in `dashboard.html`
5. Add tests in `tests/`
6. Update documentation

### Deployment Process
1. Test locally with `./start.sh`
2. Run test suite with `pytest`
3. Build and test Docker image
4. Deploy to AWS with `./scripts/deploy.sh`
5. Verify deployment health

This structure provides a solid foundation for a production-ready healthcare routing application with clear separation of concerns, comprehensive testing, and scalable deployment options.
