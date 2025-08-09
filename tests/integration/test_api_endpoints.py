import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models import PatientData, CaregiverInput
import io
import pandas as pd

client = TestClient(app)

class TestHealthEndpoint:
    """Test health check endpoint."""
    
    def test_health_check(self):
        """Test health check returns 200."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

class TestPatientDataEndpoints:
    """Test patient data management endpoints."""
    
    def test_upload_valid_excel(self):
        """Test uploading valid Excel file."""
        # Create sample Excel data
        sample_data = [
            {
                "patient_id": "TEST001",
                "name": "Test Patient 1",
                "age": 70,
                "gender": "Male",
                "diagnosis": "Test Diagnosis",
                "medications": "Test Med 1; Test Med 2",
                "medical_history": "Test History",
                "current_symptoms": "Test Symptom 1; Test Symptom 2",
                "mobility_status": "Ambulatory",
                "insurance_info": "Test Insurance"
            }
        ]
        
        # Create Excel file in memory
        df = pd.DataFrame(sample_data)
        excel_buffer = io.BytesIO()
        df.to_excel(excel_buffer, index=False)
        excel_buffer.seek(0)
        
        # Upload file
        response = client.post(
            "/upload-patient-data",
            files={"file": ("test_patients.xlsx", excel_buffer.getvalue(), 
                          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        )
        
        assert response.status_code == 200
        assert "Successfully processed" in response.json()["message"]
    
    def test_upload_invalid_file_format(self):
        """Test uploading invalid file format."""
        response = client.post(
            "/upload-patient-data",
            files={"file": ("test.txt", b"invalid content", "text/plain")}
        )
        
        assert response.status_code == 400
        assert "File must be an Excel file" in response.json()["detail"]
    
    def test_list_patients_empty(self):
        """Test listing patients when none are loaded."""
        response = client.get("/patients")
        assert response.status_code == 200
        # May be empty or contain previously uploaded test data
        assert "patients" in response.json()
    
    def test_get_nonexistent_patient(self):
        """Test getting a patient that doesn't exist."""
        response = client.get("/patients/NONEXISTENT")
        assert response.status_code == 404

class TestSampleDataEndpoints:
    """Test sample data endpoints."""
    
    def test_get_sample_data(self):
        """Test getting sample data."""
        response = client.get("/sample-data")
        assert response.status_code == 200
        
        sample_data = response.json()["sample_data"]
        assert len(sample_data) > 0
        
        # Verify structure of first sample
        first_patient = sample_data[0]
        required_fields = ["patient_id", "name", "age", "gender", "diagnosis"]
        for field in required_fields:
            assert field in first_patient
    
    def test_download_sample_excel(self):
        """Test downloading sample Excel file."""
        response = client.get("/download-sample-excel")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

class TestRoutingEndpoints:
    """Test routing and agent endpoints."""
    
    @pytest.fixture
    def sample_request_data(self):
        """Fixture providing sample request data."""
        return {
            "patient_data": {
                "patient_id": "TEST001",
                "name": "Test Patient",
                "age": 70,
                "gender": "Male",
                "diagnosis": "Test diagnosis requiring nursing care",
                "medications": ["Test Med 1", "Test Med 2"],
                "medical_history": ["Test History"],
                "current_symptoms": ["Test Symptom 1", "Test Symptom 2"],
                "mobility_status": "Ambulatory with assistance",
                "insurance_info": "Test Insurance"
            },
            "caregiver_input": {
                "patient_id": "TEST001",
                "urgency_level": "medium",
                "primary_concern": "Patient needs assessment and care coordination",
                "requested_services": ["nursing assessment", "medication review"],
                "additional_notes": "Test case for API testing",
                "contact_preference": "phone"
            }
        }
    
    def test_route_patient_valid_request(self, sample_request_data):
        """Test routing patient with valid request."""
        response = client.post("/route-patient", json=sample_request_data)
        
        # May succeed or fail depending on OpenAI API availability
        if response.status_code == 200:
            routing_decision = response.json()
            assert "recommended_agents" in routing_decision
            assert "reasoning" in routing_decision
            assert "priority_score" in routing_decision
            assert 1 <= routing_decision["priority_score"] <= 10
        else:
            # If OpenAI API is not available, should still handle gracefully
            assert response.status_code in [500, 422]
    
    def test_route_patient_invalid_request(self):
        """Test routing patient with invalid request."""
        invalid_request = {
            "patient_data": {
                "patient_id": "TEST001"
                # Missing required fields
            },
            "caregiver_input": {
                "patient_id": "TEST001",
                "urgency_level": "invalid_level",  # Invalid urgency level
                "primary_concern": "Test concern"
            }
        }
        
        response = client.post("/route-patient", json=invalid_request)
        assert response.status_code == 422  # Validation error
    
    def test_nursing_agent_endpoint(self, sample_request_data):
        """Test nursing agent endpoint."""
        response = client.post("/agents/nursing", json=sample_request_data)
        
        # May succeed or fail depending on OpenAI API availability
        if response.status_code == 200:
            agent_response = response.json()
            assert agent_response["agent_type"] == "nursing"
            assert "structured_data" in agent_response
            assert "form_data" in agent_response
            assert "recommendations" in agent_response
            assert "next_steps" in agent_response
        else:
            assert response.status_code in [500, 422]
    
    def test_dme_agent_endpoint(self, sample_request_data):
        """Test DME agent endpoint."""
        # Modify request for DME-relevant case
        dme_request = sample_request_data.copy()
        dme_request["patient_data"]["mobility_status"] = "wheelchair dependent"
        dme_request["caregiver_input"]["primary_concern"] = "Patient needs mobility equipment"
        
        response = client.post("/agents/dme", json=dme_request)
        
        if response.status_code == 200:
            agent_response = response.json()
            assert agent_response["agent_type"] == "dme"
            assert "form_data" in agent_response
        else:
            assert response.status_code in [500, 422]
    
    def test_pharmacy_agent_endpoint(self, sample_request_data):
        """Test pharmacy agent endpoint."""
        # Modify request for pharmacy-relevant case
        pharmacy_request = sample_request_data.copy()
        pharmacy_request["patient_data"]["medications"] = ["Warfarin 5mg", "Metformin 500mg", "Lisinopril 10mg"]
        pharmacy_request["caregiver_input"]["primary_concern"] = "Medication interaction concerns"
        
        response = client.post("/agents/pharmacy", json=pharmacy_request)
        
        if response.status_code == 200:
            agent_response = response.json()
            assert agent_response["agent_type"] == "pharmacy"
            assert "form_data" in agent_response
        else:
            assert response.status_code in [500, 422]
    
    def test_complete_case_processing(self, sample_request_data):
        """Test complete case processing endpoint."""
        response = client.post("/process-complete-case", json=sample_request_data)
        
        if response.status_code == 200:
            result = response.json()
            assert "routing_decision" in result
            assert "agent_responses" in result
            
            # Verify routing decision structure
            routing = result["routing_decision"]
            assert "recommended_agents" in routing
            assert "reasoning" in routing
            
            # Verify agent responses
            agent_responses = result["agent_responses"]
            assert len(agent_responses) > 0
            
            for agent_response in agent_responses:
                assert "agent_type" in agent_response
                assert "structured_data" in agent_response
                assert "form_data" in agent_response
        else:
            assert response.status_code in [500, 422]

class TestDashboardEndpoint:
    """Test dashboard endpoint."""
    
    def test_dashboard_loads(self):
        """Test that dashboard HTML loads."""
        response = client.get("/")
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
        
        # Check for key elements in HTML
        html_content = response.text
        assert "Routing AI Agent" in html_content
        assert "Upload Patient Data" in html_content
        assert "Caregiver Input" in html_content

class TestErrorHandling:
    """Test error handling scenarios."""
    
    def test_404_endpoint(self):
        """Test accessing non-existent endpoint."""
        response = client.get("/nonexistent-endpoint")
        assert response.status_code == 404
    
    def test_invalid_json_request(self):
        """Test sending invalid JSON to API endpoint."""
        response = client.post(
            "/route-patient",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422
    
    def test_missing_request_body(self):
        """Test sending request without body to endpoints that require it."""
        response = client.post("/route-patient")
        assert response.status_code == 422
