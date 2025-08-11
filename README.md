# 🏥 Routing AI Agent - Healthcare Discharge Planning System

A comprehensive AI-powered discharge planning system that intelligently routes patients to appropriate healthcare agents (Nursing, DME, Pharmacy, State) for coordinated care transitions from hospital to home.

## 🎯 Overview

This application revolutionizes hospital discharge planning by:
- **🤖 AI-Powered Routing**: Automatically determines which healthcare agents are needed based on patient data
- **📋 Specialized Workflows**: Dedicated order forms for each healthcare discipline
- **⚡ Real-time Processing**: Instant AI analysis and recommendations
- **🎨 Professional Interface**: Medical-grade user interface designed for healthcare professionals
- **📊 Complete Data Management**: Patient data upload, processing, and order generation

## 🏗️ Architecture

```
🎨 Frontend (React + TypeScript)
├── Dashboard - Patient selection and discharge planning
├── Results - AI recommendations and agent routing
├── Nursing Orders - Dedicated nursing workflow
├── Data Management - Patient data upload/management
└── Professional UI - Medical-grade interface

🔧 Backend (FastAPI + Python)
├── AI Service - Google Gemini integration for intelligent routing
├── Data Service - Patient data management and Excel processing
├── Agent Processing - Specialized workflows for each discipline
└── RESTful API - Complete endpoint coverage

📊 Data Layer
├── Excel Integration - Patient data import/export
├── Sample Data - Pre-loaded patient scenarios
└── Dynamic Storage - Runtime patient data management
```

## ✨ Key Features

### 🎯 Core Functionality
- **Patient Selection**: Choose from pre-loaded patient scenarios or upload new data
- **AI Routing**: Intelligent agent recommendation using Google Gemini AI
- **Multi-Agent Support**: Nursing, DME (Durable Medical Equipment), Pharmacy, and State authorization
- **Order Form Generation**: Specialized, auto-populated forms for each healthcare discipline
- **Real-time Processing**: Live AI analysis with loading indicators

### 👩⚕️ Healthcare Agent Workflows
- **🩺 Nursing**: Home health setup, care plan generation, visit scheduling
- **🏥 DME**: Equipment ordering, delivery coordination, insurance authorization
- **💊 Pharmacy**: Medication reconciliation, prescription management, patient education
- **📋 State**: Insurance authorization, Medicaid coordination, compliance documentation

### 🎨 User Experience
- **Professional Medical UI**: Healthcare-focused design with medical color schemes
- **Responsive Design**: Optimized for desktop and tablet devices
- **Intuitive Navigation**: Clear workflow from patient assessment to order completion
- **Error Handling**: Comprehensive error messages and user guidance

## 🚀 Quick Start Guide

### 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** (Python 3.11+ recommended)
- **Node.js 16+** and **npm**
- **Google AI API Key** (for AI routing functionality)
- **Git** (for cloning the repository)

### 🔧 Installation & Setup

#### Step 1: Clone the Repository

```bash
git clone https://github.com/rajvidoshi-work/routing-ai-agent.git
cd routing-ai-agent
```

#### Step 2: Environment Configuration

```bash
# Copy the environment template
cp .env.example .env

# Edit the .env file and add your API keys
# Required: GOOGLE_AI_API_KEY=your_google_ai_api_key_here
# Optional: OPENAI_API_KEY=your_openai_api_key_here (fallback)
```

**🔑 Getting Your Google AI API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

#### Step 3: Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Verify installation
python3 -c "import fastapi, uvicorn; print('✅ Backend dependencies installed')"
```

#### Step 4: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Verify installation
npm list react react-dom
cd ..
```

### 🚀 Running the Application

#### Option 1: Quick Start (Recommended)

```bash
# Start both backend and frontend services
./start-services.sh
```

#### Option 2: Manual Start

**Terminal 1 - Backend Service:**
```bash
# Start the FastAPI backend server
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend Service:**
```bash
# Navigate to frontend and start React development server
cd frontend
PORT=3003 npm start
```

### 🌐 Access the Application

Once both services are running:

- **🎨 Frontend Application**: http://localhost:3003
- **🔧 Backend API**: http://localhost:8000
- **📚 API Documentation**: http://localhost:8000/docs
- **❤️ Health Check**: http://localhost:8000/health

## 📖 Usage Guide

### 1. 📊 Load Patient Data

**Option A: Use Sample Data (Default)**
- Sample patients are automatically loaded on startup
- Includes 5 realistic patient scenarios (COPD, CHF, Pancreatitis)

**Option B: Upload Custom Data**
1. Navigate to **Data Management** (`/manage-data`)
2. Upload Excel file with patient data
3. Verify patients are loaded successfully

### 2. 🎯 Process Discharge Planning

1. Go to **Dashboard** (`/`)
2. Select patient from dropdown (e.g., "Michael Kelly - COPD Exacerbation")
3. Enter primary concern (e.g., "Patient needs comprehensive discharge planning")
4. Select urgency level (Low/Medium/High)
5. Click **"Process Discharge Planning"**

### 3. 📋 Review AI Recommendations

The AI will provide:
- **Routing Decision**: Priority score and overall assessment
- **Agent Recommendations**: Specific recommendations for each discipline
- **Action Items**: Clear next steps for each healthcare agent

### 4. 📝 Generate Order Forms

Click the colored buttons to access specialized workflows:
- **👩⚕️ Nursing** (Blue): "Create Order Form" → Dedicated nursing page
- **🏥 DME** (Green): "Create DME Order Form" → Equipment ordering
- **💊 Pharmacy** (Red): "Create Pharmacy Order Form" → Medication management
- **📋 State** (Purple): "Create Authorization Form" → Insurance coordination

## 🛠️ Development

### 📁 Project Structure

```
routing-ai-agent/
├── 🔧 Backend (FastAPI)
│   ├── app/
│   │   ├── main.py              # API endpoints and FastAPI app
│   │   ├── ai_service.py        # AI routing logic (Google Gemini)
│   │   ├── data_service.py      # Patient data management
│   │   ├── models.py            # Pydantic data models
│   │   └── enhanced_nursing_agent.py # Specialized nursing workflows
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # Environment variables
│
├── 🎨 Frontend (React + TypeScript)
│   ├── src/
│   │   ├── pages/               # Page components
│   │   │   ├── WorkingDashboard.tsx    # Main dashboard
│   │   │   ├── ResultsPage.tsx         # AI results display
│   │   │   ├── NursingOrderForm.tsx    # Nursing workflow
│   │   │   └── DataManagement.tsx      # Data upload/management
│   │   ├── components/          # Reusable components
│   │   │   ├── AdonixHeader.tsx        # Professional header
│   │   │   └── LoadingSpinner.tsx      # Loading animations
│   │   ├── App.tsx              # Main app component
│   │   └── index.tsx            # React entry point
│   ├── public/                  # Static assets
│   ├── package.json             # Node.js dependencies
│   └── tsconfig.json            # TypeScript configuration
│
├── 📊 Data & Documentation
│   ├── sample_excel_files/      # Sample patient data
│   ├── patient_data/            # Runtime patient data storage
│   ├── docs/                    # Additional documentation
│   ├── DEMO_SCRIPT.md           # 2-minute demo guide
│   └── AWS_DEPLOYMENT.md        # AWS deployment guide
│
└── 🚀 Deployment
    ├── aws-cdk/                 # AWS CDK deployment stack
    ├── deploy-aws.sh            # AWS deployment script
    └── netlify.toml             # Netlify frontend deployment
```

### 🔧 Key Technologies

**Frontend Stack:**
- **React 18** with **TypeScript** for type safety
- **React Router** for navigation
- **Custom CSS** with medical-themed styling
- **Responsive Design** for desktop and tablet

**Backend Stack:**
- **FastAPI** for high-performance API
- **Python 3.8+** with **Pydantic** for data validation
- **Google Gemini AI** for intelligent routing decisions
- **Excel Integration** with **pandas** and **openpyxl**

**AI & Data:**
- **Google AI Studio (Gemini)** for primary AI processing
- **OpenAI GPT** as fallback option
- **Excel/CSV** data import and export
- **JSON** for runtime data storage

### 🔗 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information and status |
| `/health` | GET | Health check endpoint |
| `/docs` | GET | Interactive API documentation |
| `/api/patients` | GET | List all available patients |
| `/api/data-status` | GET | Data loading status and statistics |
| `/api/process-complete-case` | POST | Process complete discharge planning |
| `/api/process-nursing-agent` | POST | Process nursing-specific orders |
| `/api/process-dme-agent` | POST | Process DME equipment orders |
| `/api/process-pharmacy-agent` | POST | Process pharmacy orders |
| `/api/process-state-agent` | POST | Process state authorization |

## 🎨 UI Design System

### Color Scheme
- **🔵 Primary Blue** (`#007bff`): Dashboard and nursing workflows
- **🟢 Success Green** (`#28a745`): DME and positive actions
- **🔴 Danger Red** (`#dc3545`): Pharmacy and critical items
- **🟣 Info Purple** (`#6f42c1`): State authorization processes
- **🟡 Warning Orange** (`#ffc107`): Attention and warning items

### Component Styling
- **Professional Medical Theme**: Clean, clinical interface design
- **Consistent Typography**: Clear, readable fonts optimized for medical data
- **Responsive Layout**: Adapts to different screen sizes
- **Accessibility**: WCAG compliant color contrasts and navigation

## 📊 Sample Data

The application includes realistic patient scenarios for testing:

| Patient | Condition | Nursing Needed | Equipment | Insurance |
|---------|-----------|----------------|-----------|-----------|
| **Michael Kelly** | COPD Exacerbation | Yes | Suction machine, Trach supplies | Pending |
| **Gary Jones** | COPD Exacerbation | No | Hospital bed, IV pole | Pending |
| **Isaiah Oneal** | CHF Exacerbation | Yes | Hospital bed, IV pole | Denied |
| **Bryan Keller** | CHF Exacerbation | Yes | Walker, Bedside commode | Approved |
| **Victoria Conley** | Acute Pancreatitis | No | Wheelchair, Oxygen concentrator | Approved |

## 🔧 Configuration

### Environment Variables

```bash
# Required Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Optional Configuration
OPENAI_API_KEY=your_openai_api_key_here    # Fallback AI provider
PORT=8000                                   # Backend port
FRONTEND_PORT=3003                          # Frontend port
DEBUG=true                                  # Enable debug logging
ENVIRONMENT=development                     # Environment setting

# Data Configuration
PATIENT_DATA_DIR=/Users/rajvi/patient_data  # Patient data directory
LOG_LEVEL=INFO                              # Logging level
```

### Patient Data Directory

- **Default Location**: `/Users/rajvi/patient_data/`
- **Supported Formats**: Excel (.xlsx), CSV (.csv)
- **Auto-loading**: Sample data loads automatically on startup
- **Custom Upload**: Use Data Management page for custom patient data

## 🚀 Deployment Options

### 🌐 Local Development
```bash
# Quick start for development
python3 -m uvicorn app.main:app --reload &
cd frontend && PORT=3003 npm start
```

### ☁️ AWS Deployment
```bash
# Deploy to AWS Lambda + API Gateway
./deploy-aws.sh
```

### 🌍 Netlify + Railway
```bash
# Frontend to Netlify, Backend to Railway
# See deployment guides in docs/
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] **Backend Health**: `curl http://localhost:8000/health`
- [ ] **Patient Data**: `curl http://localhost:8000/api/patients`
- [ ] **Frontend Load**: Open `http://localhost:3003`
- [ ] **AI Processing**: Select patient and process discharge planning
- [ ] **Form Generation**: Test nursing, DME, pharmacy, and state forms

### API Testing

```bash
# Test health endpoint
curl -X GET http://localhost:8000/health

# Test patient data
curl -X GET http://localhost:8000/api/patients

# Test AI processing (replace with actual patient data)
curl -X POST http://localhost:8000/api/process-complete-case \
  -H "Content-Type: application/json" \
  -d '{"patient_data": {...}, "caregiver_input": {...}}'
```

## 🔍 Troubleshooting

### Common Issues

**❌ Backend won't start:**
```bash
# Check Python version
python3 --version  # Should be 3.8+

# Check dependencies
pip install -r requirements.txt

# Check port availability
lsof -i :8000
```

**❌ Frontend won't start:**
```bash
# Check Node.js version
node --version  # Should be 16+

# Clear npm cache
npm cache clean --force
cd frontend && npm install
```

**❌ AI not working:**
```bash
# Check API key in .env file
cat .env | grep GOOGLE_AI_API_KEY

# Test API key
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://generativelanguage.googleapis.com/v1/models
```

**❌ No patient data:**
```bash
# Check data directory
ls -la /Users/rajvi/patient_data/

# Reload sample data
curl -X GET http://localhost:8000/api/data-status
```

### Debug Mode

Enable detailed logging:
```bash
# Set debug environment
export DEBUG=true
export LOG_LEVEL=DEBUG

# Start with verbose logging
python3 -m uvicorn app.main:app --log-level debug
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** Pull Request

### Development Guidelines

- **Code Style**: Follow PEP 8 for Python, ESLint for TypeScript
- **Testing**: Add tests for new features
- **Documentation**: Update README and API docs
- **Commit Messages**: Use conventional commit format

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Documentation

### Getting Help

- **🐛 Issues**: [GitHub Issues](https://github.com/rajvidoshi-work/routing-ai-agent/issues)
- **📚 Documentation**: Check `/docs` directory
- **🔧 API Docs**: http://localhost:8000/docs (when running)
- **💬 Discussions**: GitHub Discussions for questions

### Additional Resources

- **🎬 Demo Script**: See `DEMO_SCRIPT.md` for 2-minute demo guide
- **☁️ AWS Deployment**: See `AWS_DEPLOYMENT.md` for cloud deployment
- **🌐 Frontend Deployment**: See `netlify.toml` for frontend deployment
- **📊 Sample Data**: Check `sample_excel_files/` for data examples

## 🎉 Acknowledgments

- **🤖 Google AI**: For Gemini AI integration and intelligent routing
- **⚛️ React Community**: For excellent frontend framework and ecosystem
- **🚀 FastAPI**: For high-performance, modern Python web framework
- **👩⚕️ Healthcare Professionals**: For workflow insights and requirements
- **🏥 Medical Community**: For feedback and real-world testing

---

**🏥 Built with ❤️ for healthcare professionals to streamline discharge planning workflows and improve patient care transitions.**

## 🚀 Quick Commands Reference

```bash
# Start everything
python3 -m uvicorn app.main:app --reload &
cd frontend && PORT=3003 npm start

# Check status
curl http://localhost:8000/health
curl http://localhost:8000/api/patients

# Stop services
lsof -ti:8000 | xargs kill -9
lsof -ti:3003 | xargs kill -9
```

**Ready to revolutionize discharge planning? Start with the Quick Start Guide above! 🎯**
