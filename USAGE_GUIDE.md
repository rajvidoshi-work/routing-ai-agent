# 🚀 Complete Usage Guide - Routing AI Agent with Google AI Studio

## 🎯 Quick Start with Google AI Studio (Recommended)

### Step 1: Get Your Google AI Studio API Key (FREE!)

1. **Go to [Google AI Studio](https://aistudio.google.com/)**
2. **Sign in** with your Google account
3. **Click "Get API key"** in the left sidebar
4. **Click "Create API key"** → **"Create API key in new project"**
5. **Copy the API key** (starts with `AIza...`)

### Step 2: Configure the Application

1. **Edit the `.env` file:**
   ```bash
   # Add your Google AI Studio API key
   GOOGLE_AI_API_KEY=AIzaSyC-your-actual-api-key-here
   ```

2. **Save the file**

### Step 3: Start the Application

```bash
cd /Users/rajvi/routing-ai-agent
./start.sh
```

You should see:
```
✅ Google AI Studio API key configured
✅ Using Google AI Studio (Gemini) for AI features
```

### Step 4: Open the Dashboard

Go to **http://localhost:8000** in your browser

## 📊 Using the Application

### 1. Upload Patient Data

**Option A: Use Existing Sample Data**
- The file `sample_patients.xlsx` is already in your directory
- Click "Upload" and select this file

**Option B: Download Fresh Sample**
- Click "Download Sample" button in the dashboard
- Upload the downloaded file

### 2. Process a Patient Case

Try this realistic example:

**Select Patient:** Robert Davis (P003)
**Urgency Level:** High
**Primary Concern:** "Patient has surgical wound with drainage and fever, needs immediate nursing assessment"
**Requested Services:** "nursing assessment, wound care"
**Additional Notes:** "Family reports increased pain and concerning drainage"

**Click "Process Case"**

### 3. View AI-Powered Results

With Google AI Studio configured, you'll see:

- **🎯 Routing Decision**: Which agents should handle the case
- **📊 Priority Score**: 1-10 urgency rating  
- **⏰ Timeline**: Expected response time
- **💭 AI Reasoning**: Detailed explanation of the routing decision
- **🤖 Agent Responses**: Comprehensive responses from each recommended agent
- **📄 Editable Forms**: Ready-to-send forms for external partners

## 🧪 Test All Features

### API Testing
```bash
# Test all endpoints
python3 examples/test_api.py

# Test Google AI Studio integration specifically
python3 test_google_ai.py
```

### Sample Patient Scenarios

1. **John Smith (P001)** - Diabetes + Hypertension
   - **Expected Routing**: Nursing + Pharmacy
   - **Use Case**: Chronic disease management

2. **Mary Johnson (P002)** - COPD + Mobility Issues
   - **Expected Routing**: All three agents (Nursing + DME + Pharmacy)
   - **Use Case**: Complex multi-specialty coordination

3. **Robert Davis (P003)** - Post-Surgical Wound Care
   - **Expected Routing**: Nursing (primary)
   - **Use Case**: Acute care needs

4. **Linda Wilson (P004)** - Heart Failure + Medication Management
   - **Expected Routing**: Nursing + Pharmacy
   - **Use Case**: Medication complexity

5. **James Brown (P005)** - Spinal Cord Injury + Equipment Needs
   - **Expected Routing**: Nursing + DME
   - **Use Case**: Equipment and mobility support

## 🔧 Advanced Configuration

### Multiple AI Providers

You can configure both Google AI Studio and OpenAI:

```bash
# .env file
GOOGLE_AI_API_KEY=your-google-key-here
OPENAI_API_KEY=your-openai-key-here
```

**Priority Order:**
1. Google AI Studio (if configured)
2. OpenAI (if Google AI not available)
3. Fallback logic (if no APIs configured)

### Environment Variables

```bash
# AI Configuration
GOOGLE_AI_API_KEY=your-google-ai-studio-key
OPENAI_API_KEY=your-openai-key

# Application Settings
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO

# AWS Deployment (optional)
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=your-account-id
```

## 🌐 API Usage Examples

### Direct API Calls

```python
import requests

# Route a patient case
response = requests.post("http://localhost:8000/route-patient", json={
    "patient_data": {
        "patient_id": "P001",
        "name": "John Smith",
        "age": 72,
        "gender": "Male",
        "diagnosis": "Diabetes Type 2, Hypertension",
        "medications": ["Metformin 500mg", "Lisinopril 10mg"],
        "current_symptoms": ["Fatigue", "Dizziness"],
        "mobility_status": "Ambulatory with walker"
    },
    "caregiver_input": {
        "patient_id": "P001",
        "urgency_level": "medium",
        "primary_concern": "Patient experiencing increased symptoms",
        "requested_services": ["nursing assessment"]
    }
})

print(response.json())
```

### Complete Case Processing

```python
# Process complete case (routing + all agents)
response = requests.post("http://localhost:8000/process-complete-case", json=request_data)
result = response.json()

print(f"Routing: {result['routing_decision']['recommended_agents']}")
print(f"Agents processed: {len(result['agent_responses'])}")
```

## 🎯 Expected AI Responses

### With Google AI Studio

**Routing Decision Example:**
```json
{
  "patient_id": "P003",
  "recommended_agents": ["nursing", "pharmacy"],
  "reasoning": "Patient presents with post-surgical complications including wound drainage and fever, indicating potential infection. Immediate nursing assessment is critical for wound evaluation and vital signs monitoring. Pharmacy consultation needed to review antibiotic therapy and pain management protocols.",
  "priority_score": 9,
  "estimated_timeline": "Within 2 hours"
}
```

**Nursing Agent Response:**
```json
{
  "agent_type": "nursing",
  "recommendations": [
    "Immediate comprehensive wound assessment",
    "Vital signs monitoring every 4 hours",
    "Wound culture if drainage appears infected",
    "Pain assessment using standardized scale"
  ],
  "next_steps": [
    "Schedule urgent home visit within 2 hours",
    "Coordinate with physician for potential antibiotic adjustment",
    "Provide family education on infection signs"
  ],
  "form_data": {
    "title": "Nursing Care Coordination Form",
    "recipient": "Home Health Agency",
    "fields": [...]
  }
}
```

## 🔍 Troubleshooting

### Common Issues

1. **"No AI API key configured"**
   - Add `GOOGLE_AI_API_KEY` to your `.env` file
   - Restart the application

2. **"Invalid API key" error**
   - Verify your Google AI Studio API key is correct
   - Check that it starts with `AIza`

3. **Rate limit errors**
   - Google AI Studio free tier: 15 requests/minute
   - Wait a minute and try again

4. **Application won't start**
   - Run `python3 test_setup.py` to verify installation
   - Check that all dependencies are installed

### Getting Help

1. **Check the logs** when starting the application
2. **Run the test scripts** to verify functionality
3. **Review the documentation** in the `docs/` folder
4. **Check the health endpoint**: http://localhost:8000/health

## 🚀 Production Deployment

### AWS Deployment with Google AI Studio

1. **Configure Terraform variables:**
   ```hcl
   # infrastructure/terraform.tfvars
   google_ai_api_key = "your-google-ai-studio-key"
   ```

2. **Deploy to AWS:**
   ```bash
   ./scripts/deploy.sh
   ```

3. **The application will be available at your AWS Load Balancer URL**

## 💡 Pro Tips

1. **Google AI Studio is FREE** for most use cases - perfect for testing and small deployments
2. **Monitor your usage** in the Google AI Studio console
3. **Use descriptive concerns** in the caregiver input for better AI routing
4. **Test different urgency levels** to see how they affect priority scoring
5. **The AI learns from context** - more detailed patient data = better routing decisions

## 🎉 You're Ready!

With Google AI Studio configured, you now have a fully functional AI-powered healthcare routing system that can:

- ✅ **Intelligently route** patient cases to appropriate care teams
- ✅ **Generate detailed responses** from specialized agents
- ✅ **Create editable forms** for external partners
- ✅ **Provide priority scoring** and timeline estimates
- ✅ **Scale to production** on AWS infrastructure

The system is ready for testing, demonstrations, and real-world healthcare coordination scenarios!
