# Testing Guide - Routing AI Agent

## Overview

This guide covers testing the Routing AI Agent application, including unit tests, integration tests, and end-to-end testing scenarios.

## Test Structure

```
routing-ai-agent/
├── tests/
│   ├── unit/
│   │   ├── test_models.py
│   │   ├── test_ai_service.py
│   │   └── test_data_service.py
│   ├── integration/
│   │   ├── test_api_endpoints.py
│   │   └── test_complete_workflow.py
│   └── fixtures/
│       ├── sample_patients.xlsx
│       └── test_data.json
├── examples/
│   ├── test_api.py
│   └── generate_sample_data.py
└── pytest.ini
```

## Running Tests

### Prerequisites

```bash
# Install test dependencies
pip install pytest pytest-asyncio pytest-mock httpx

# Set environment variables
export OPENAI_API_KEY="test-key-or-real-key"
```

### Local Testing

```bash
# Run all tests
pytest

# Run specific test categories
pytest tests/unit/
pytest tests/integration/

# Run with coverage
pytest --cov=app --cov-report=html

# Run with verbose output
pytest -v
```

### API Testing

```bash
# Start the application
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Run API tests
python examples/test_api.py

# Test against deployed service
python examples/test_api.py https://your-alb-dns.amazonaws.com
```

## Test Scenarios

### 1. Patient Data Upload and Processing

#### Test Case: Valid Excel Upload
```python
def test_valid_excel_upload():
    """Test uploading a valid Excel file with patient data."""
    # Create sample Excel file
    sample_data = generate_sample_patients()
    excel_file = create_excel_from_data(sample_data)
    
    # Upload file
    response = client.post(
        "/upload-patient-data",
        files={"file": ("patients.xlsx", excel_file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
    )
    
    assert response.status_code == 200
    assert "Successfully processed" in response.json()["message"]
```

#### Test Case: Invalid File Format
```python
def test_invalid_file_format():
    """Test uploading an invalid file format."""
    response = client.post(
        "/upload-patient-data",
        files={"file": ("test.txt", b"invalid content", "text/plain")}
    )
    
    assert response.status_code == 400
    assert "File must be an Excel file" in response.json()["detail"]
```

### 2. AI Routing Decisions

#### Test Case: Nursing Route
```python
def test_nursing_routing():
    """Test routing decision for nursing care."""
    request_data = {
        "patient_data": {
            "patient_id": "P001",
            "name": "John Smith",
            "age": 75,
            "gender": "Male",
            "diagnosis": "Post-surgical wound care",
            "current_symptoms": ["wound drainage", "pain"],
            "mobility_status": "bed rest required"
        },
        "caregiver_input": {
            "patient_id": "P001",
            "urgency_level": "high",
            "primary_concern": "Surgical wound needs assessment",
            "requested_services": ["nursing assessment"]
        }
    }
    
    response = client.post("/route-patient", json=request_data)
    
    assert response.status_code == 200
    routing_decision = response.json()
    assert "nursing" in routing_decision["recommended_agents"]
    assert routing_decision["priority_score"] >= 7  # High urgency
```

#### Test Case: Multi-Agent Routing
```python
def test_multi_agent_routing():
    """Test routing decision requiring multiple agents."""
    request_data = {
        "patient_data": {
            "patient_id": "P002",
            "name": "Mary Johnson",
            "age": 68,
            "gender": "Female",
            "diagnosis": "COPD, medication management, mobility issues",
            "medications": ["Albuterol", "Prednisone"],
            "mobility_status": "wheelchair dependent"
        },
        "caregiver_input": {
            "patient_id": "P002",
            "urgency_level": "medium",
            "primary_concern": "Complex care needs across multiple areas",
            "requested_services": ["nursing", "equipment", "medication review"]
        }
    }
    
    response = client.post("/route-patient", json=request_data)
    
    assert response.status_code == 200
    routing_decision = response.json()
    
    # Should recommend multiple agents
    assert len(routing_decision["recommended_agents"]) >= 2
    assert "nursing" in routing_decision["recommended_agents"]
    assert "dme" in routing_decision["recommended_agents"]
    assert "pharmacy" in routing_decision["recommended_agents"]
```

### 3. Agent Processing

#### Test Case: Nursing Agent Response
```python
def test_nursing_agent_processing():
    """Test nursing agent processing and form generation."""
    request_data = create_nursing_test_case()
    
    response = client.post("/agents/nursing", json=request_data)
    
    assert response.status_code == 200
    agent_response = response.json()
    
    # Verify response structure
    assert agent_response["agent_type"] == "nursing"
    assert "structured_data" in agent_response
    assert "form_data" in agent_response
    assert "recommendations" in agent_response
    assert "next_steps" in agent_response
    
    # Verify form structure
    form_data = agent_response["form_data"]
    assert form_data["title"] == "Nursing Care Coordination Form"
    assert form_data["recipient"] == "Home Health Agency"
    assert len(form_data["fields"]) > 0
```

#### Test Case: DME Agent Response
```python
def test_dme_agent_processing():
    """Test DME agent processing for equipment needs."""
    request_data = create_dme_test_case()
    
    response = client.post("/agents/dme", json=request_data)
    
    assert response.status_code == 200
    agent_response = response.json()
    
    assert agent_response["agent_type"] == "dme"
    
    # Verify equipment recommendations
    assert len(agent_response["recommendations"]) > 0
    
    # Verify form for DME supplier
    form_data = agent_response["form_data"]
    assert "Equipment" in form_data["title"]
    assert form_data["recipient"] == "DME Supplier"
```

### 4. Complete Workflow Testing

#### Test Case: End-to-End Processing
```python
def test_complete_case_processing():
    """Test complete case processing from routing to all agents."""
    request_data = create_complex_test_case()
    
    response = client.post("/process-complete-case", json=request_data)
    
    assert response.status_code == 200
    result = response.json()
    
    # Verify routing decision
    assert "routing_decision" in result
    routing = result["routing_decision"]
    assert len(routing["recommended_agents"]) > 0
    
    # Verify agent responses
    assert "agent_responses" in result
    agent_responses = result["agent_responses"]
    assert len(agent_responses) == len(routing["recommended_agents"])
    
    # Verify each agent response
    for agent_response in agent_responses:
        assert agent_response["agent_type"] in routing["recommended_agents"]
        assert "structured_data" in agent_response
        assert "form_data" in agent_response
```

### 5. Error Handling

#### Test Case: Missing Patient Data
```python
def test_missing_patient_data():
    """Test handling of missing required patient data."""
    incomplete_request = {
        "patient_data": {
            "patient_id": "P001"
            # Missing required fields
        },
        "caregiver_input": {
            "patient_id": "P001",
            "urgency_level": "medium",
            "primary_concern": "Test concern"
        }
    }
    
    response = client.post("/route-patient", json=incomplete_request)
    
    assert response.status_code == 422  # Validation error
```

#### Test Case: Invalid Urgency Level
```python
def test_invalid_urgency_level():
    """Test handling of invalid urgency level."""
    request_data = create_valid_test_case()
    request_data["caregiver_input"]["urgency_level"] = "invalid"
    
    response = client.post("/route-patient", json=request_data)
    
    assert response.status_code == 422
```

## Performance Testing

### Load Testing

```python
import asyncio
import aiohttp
import time

async def load_test_routing():
    """Simple load test for routing endpoint."""
    async with aiohttp.ClientSession() as session:
        tasks = []
        start_time = time.time()
        
        for i in range(100):  # 100 concurrent requests
            task = asyncio.create_task(
                make_routing_request(session, f"P{i:03d}")
            )
            tasks.append(task)
        
        responses = await asyncio.gather(*tasks)
        end_time = time.time()
        
        successful_requests = sum(1 for r in responses if r.status == 200)
        total_time = end_time - start_time
        
        print(f"Successful requests: {successful_requests}/100")
        print(f"Total time: {total_time:.2f} seconds")
        print(f"Requests per second: {100/total_time:.2f}")

# Run load test
asyncio.run(load_test_routing())
```

## Integration Testing

### Database Integration
```python
def test_patient_data_persistence():
    """Test that patient data is properly stored and retrieved."""
    # Upload patient data
    upload_response = upload_test_patients()
    assert upload_response.status_code == 200
    
    # Retrieve patient list
    list_response = client.get("/patients")
    assert list_response.status_code == 200
    
    patients = list_response.json()["patients"]
    assert len(patients) > 0
    
    # Retrieve specific patient
    patient_id = patients[0]["patient_id"]
    patient_response = client.get(f"/patients/{patient_id}")
    assert patient_response.status_code == 200
```

### External API Integration
```python
def test_openai_integration():
    """Test OpenAI API integration (requires valid API key)."""
    if not os.getenv("OPENAI_API_KEY"):
        pytest.skip("OpenAI API key not provided")
    
    request_data = create_valid_test_case()
    response = client.post("/route-patient", json=request_data)
    
    assert response.status_code == 200
    routing_decision = response.json()
    
    # Verify AI-generated content
    assert len(routing_decision["reasoning"]) > 50  # Substantial reasoning
    assert routing_decision["priority_score"] in range(1, 11)
```

## Test Data Management

### Sample Data Generation
```python
def generate_test_patients(count=5):
    """Generate test patient data."""
    patients = []
    
    for i in range(count):
        patient = {
            "patient_id": f"TEST{i:03d}",
            "name": f"Test Patient {i+1}",
            "age": 65 + (i * 5),
            "gender": "Male" if i % 2 == 0 else "Female",
            "diagnosis": f"Test Diagnosis {i+1}",
            "medications": [f"Medication {i+1}A", f"Medication {i+1}B"],
            "medical_history": [f"History {i+1}"],
            "current_symptoms": [f"Symptom {i+1}A", f"Symptom {i+1}B"],
            "mobility_status": "Ambulatory",
            "insurance_info": "Test Insurance"
        }
        patients.append(patient)
    
    return patients
```

### Test Fixtures
```python
@pytest.fixture
def sample_patient_data():
    """Fixture providing sample patient data."""
    return {
        "patient_id": "FIXTURE001",
        "name": "Fixture Patient",
        "age": 70,
        "gender": "Female",
        "diagnosis": "Test diagnosis for fixture",
        "medications": ["Test Med 1", "Test Med 2"],
        "medical_history": ["Test History"],
        "current_symptoms": ["Test Symptom"],
        "mobility_status": "Ambulatory with assistance",
        "insurance_info": "Test Insurance Plan"
    }

@pytest.fixture
def sample_caregiver_input():
    """Fixture providing sample caregiver input."""
    return {
        "patient_id": "FIXTURE001",
        "urgency_level": "medium",
        "primary_concern": "Test concern for fixture",
        "requested_services": ["test service"],
        "additional_notes": "Test notes",
        "contact_preference": "phone"
    }
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.11
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-asyncio pytest-cov
    
    - name: Run tests
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      run: |
        pytest --cov=app --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v1
```

## Test Coverage Goals

- **Unit Tests**: 90%+ coverage for core business logic
- **Integration Tests**: All API endpoints covered
- **End-to-End Tests**: Complete workflows tested
- **Error Handling**: All error conditions tested

## Manual Testing Checklist

### Pre-Deployment Testing
- [ ] Upload valid Excel file
- [ ] Upload invalid file formats
- [ ] Test all routing scenarios
- [ ] Test each agent individually
- [ ] Test complete case processing
- [ ] Verify form generation
- [ ] Test error handling
- [ ] Performance under load

### Post-Deployment Testing
- [ ] Health check endpoint
- [ ] Dashboard loads correctly
- [ ] File upload works
- [ ] API endpoints respond
- [ ] Forms are editable
- [ ] External integrations work

## Troubleshooting Tests

### Common Test Failures

1. **OpenAI API Errors**
   - Check API key validity
   - Verify network connectivity
   - Check rate limits

2. **File Upload Tests**
   - Verify file format handling
   - Check file size limits
   - Test malformed Excel files

3. **Database/Cache Issues**
   - Clear test data between runs
   - Verify data persistence
   - Check concurrent access

### Debug Commands
```bash
# Run specific test with debug output
pytest -v -s tests/test_specific.py::test_function

# Run tests with pdb debugger
pytest --pdb tests/test_specific.py

# Generate detailed coverage report
pytest --cov=app --cov-report=html --cov-report=term-missing
```
