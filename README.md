# 🏥 Routing AI Agent - Healthcare MVP

A comprehensive discharge planning system that uses AI to route patients to appropriate healthcare agents (Nursing, DME, Pharmacy, State) for coordinated care transitions.

## 🎯 Overview

This application streamlines hospital discharge planning by:
- **AI-Powered Routing**: Automatically determines which healthcare agents are needed
- **Specialized Forms**: Dedicated order forms for each healthcare discipline
- **Modern Interface**: Professional medical-grade user interface
- **Complete Workflow**: From patient assessment to order generation

## 🏗️ Architecture

```
├── 🎨 Frontend (React + TypeScript)
│   ├── Dashboard - Patient selection and discharge planning
│   ├── Results - AI recommendations and agent forms
│   ├── Nursing Orders - Dedicated nursing order form
│   └── Data Management - Patient data upload/management
│
├── 🔧 Backend (FastAPI + Python)
│   ├── AI Service - Google AI integration for routing decisions
│   ├── Data Service - Patient data management
│   ├── Agent Processing - Specialized agent workflows
│   └── API Endpoints - RESTful API for frontend integration
│
└── 📊 Data Layer
    ├── Excel Integration - Patient data import/export
    ├── Sample Data - Pre-loaded patient scenarios
    └── Dynamic Storage - Runtime patient data management
```

## ✨ Features

### 🎯 Core Functionality
- **Patient Selection**: Choose from pre-loaded patient scenarios
- **AI Routing**: Intelligent agent recommendation based on patient needs
- **Multi-Agent Support**: Nursing, DME, Pharmacy, and State authorization
- **Order Form Generation**: Specialized forms for each healthcare discipline

### 👩‍⚕️ Agent-Specific Features
- **Nursing**: Dedicated page with care plan generation
- **DME**: Equipment ordering and insurance authorization
- **Pharmacy**: Medication reconciliation and prescription management
- **State**: Insurance authorization and Medicaid coordination

### 🎨 User Experience
- **Modern Medical UI**: Professional healthcare interface design
- **Responsive Design**: Works on desktop and tablet devices
- **Intuitive Navigation**: Clear workflow from assessment to orders
- **Real-time Processing**: Live updates during AI analysis

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **Google AI API Key** (for AI routing)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/routing-ai-agent.git
cd routing-ai-agent
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Add your Google AI API key to .env
GOOGLE_AI_API_KEY=your_api_key_here
```

### 3. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 4. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 5. Access Application
- **Frontend**: http://localhost:3003
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📋 Usage Guide

### 1. Load Patient Data
1. Go to **Data Management** (`/manage-data`)
2. Upload Excel file with patient data or use sample data
3. Verify patients are loaded successfully

### 2. Process Discharge Planning
1. Go to **Dashboard** (`/`)
2. Select patient from dropdown
3. Enter primary concern
4. Click "Process Discharge Planning"

### 3. Review AI Recommendations
1. View **AI Routing Decision** with priority scores
2. Review **Agent Recommendations** for each discipline
3. See **Create Order Form** buttons for each agent

### 4. Generate Order Forms
- **Nursing**: Click button → Navigate to dedicated nursing page
- **DME/Pharmacy/State**: Complete forms directly on results page

## 🛠️ Development

### Project Structure
```
routing-ai-agent/
├── app/                    # Backend (FastAPI)
│   ├── main.py            # API endpoints
│   ├── ai_service.py      # AI routing logic
│   ├── data_service.py    # Data management
│   └── models.py          # Data models
├── frontend/              # Frontend (React)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── App.tsx        # Main app component
│   └── public/            # Static assets
├── docs/                  # Documentation
├── sample_excel_files/    # Sample patient data
└── requirements.txt       # Python dependencies
```

### Key Technologies
- **Frontend**: React 18, TypeScript, React Router
- **Backend**: FastAPI, Python 3.8+, Pydantic
- **AI**: Google AI (Gemini) for routing decisions
- **Data**: Excel integration, JSON storage
- **Styling**: Custom CSS with medical theme

### API Endpoints
- `GET /api/patients` - List all patients
- `POST /api/process-complete-case` - Process discharge planning
- `POST /api/process-nursing-agent` - Process nursing orders
- `POST /api/process-dme-agent` - Process DME orders
- `POST /api/process-pharmacy-agent` - Process pharmacy orders
- `POST /api/process-state-agent` - Process state authorization

## 🎨 UI Components

### Color Scheme
- **Primary Blue**: Dashboard and nursing workflows
- **Success Green**: DME and positive actions
- **Warning Orange**: Pharmacy and attention items
- **Info Purple**: State and authorization processes

### Form Buttons
- **👩‍⚕️ Nursing**: "Create Order Form" (Blue)
- **🏥 DME**: "Create DME Order Form" (Green)
- **💊 Pharmacy**: "Create Pharmacy Order Form" (Red)
- **📋 State**: "Create Authorization Form" (Purple)

## 📊 Sample Data

The application includes sample patient data for testing:
- **Michael Kelly** - COPD Exacerbation
- **Gary Jones** - COPD Exacerbation
- **Isaiah Oneal** - Congestive Heart Failure
- **Bryan Keller** - Congestive Heart Failure
- **Victoria Conley** - Acute Pancreatitis

## 🔧 Configuration

### Environment Variables
```bash
# Required
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Optional
PORT=8000
FRONTEND_PORT=3003
DEBUG=true
```

### Patient Data Directory
- Default: `/Users/rajvi/patient_data/`
- Configurable via environment variables
- Supports Excel (.xlsx) and CSV files

## 🚀 Deployment

### Using Docker
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment
1. Set up production environment variables
2. Build React frontend: `npm run build`
3. Deploy FastAPI backend with production ASGI server
4. Configure reverse proxy (nginx) for frontend/backend routing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Issues**: GitHub Issues
- **Documentation**: `/docs` directory
- **API Docs**: http://localhost:8000/docs (when running)

## 🎉 Acknowledgments

- **Google AI**: For intelligent routing capabilities
- **React Community**: For excellent frontend framework
- **FastAPI**: For high-performance backend framework
- **Healthcare Professionals**: For workflow insights and requirements

---

**Built with ❤️ for healthcare professionals to streamline discharge planning workflows.**
