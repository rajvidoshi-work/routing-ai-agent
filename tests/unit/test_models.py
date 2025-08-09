import pytest
from pydantic import ValidationError
from app.models import (
    PatientData, CaregiverInput, RoutingRequest, RoutingDecision,
    AgentResponse, AgentType, EditableForm, FormField
)

class TestPatientData:
    """Test PatientData model validation."""
    
    def test_valid_patient_data(self):
        """Test creating valid patient data."""
        patient = PatientData(
            patient_id="P001",
            name="John Smith",
            age=72,
            gender="Male",
            diagnosis="Diabetes Type 2",
            medications=["Metformin 500mg", "Lisinopril 10mg"],
            medical_history=["Heart disease"],
            current_symptoms=["Fatigue", "Dizziness"],
            mobility_status="Ambulatory with walker",
            insurance_info="Medicare Part A & B"
        )
        
        assert patient.patient_id == "P001"
        assert patient.name == "John Smith"
        assert patient.age == 72
        assert len(patient.medications) == 2
    
    def test_required_fields(self):
        """Test that required fields are enforced."""
        with pytest.raises(ValidationError):
            PatientData(
                # Missing required fields
                patient_id="P001"
            )
    
    def test_optional_fields(self):
        """Test that optional fields can be None."""
        patient = PatientData(
            patient_id="P001",
            name="John Smith",
            age=72,
            gender="Male",
            diagnosis="Test diagnosis",
            mobility_status=None,
            insurance_info=None
        )
        
        assert patient.mobility_status is None
        assert patient.insurance_info is None

class TestCaregiverInput:
    """Test CaregiverInput model validation."""
    
    def test_valid_caregiver_input(self):
        """Test creating valid caregiver input."""
        caregiver_input = CaregiverInput(
            patient_id="P001",
            urgency_level="medium",
            primary_concern="Patient experiencing symptoms",
            requested_services=["nursing assessment"],
            additional_notes="Family reports confusion",
            contact_preference="phone"
        )
        
        assert caregiver_input.urgency_level == "medium"
        assert len(caregiver_input.requested_services) == 1
    
    def test_default_values(self):
        """Test default values are set correctly."""
        caregiver_input = CaregiverInput(
            patient_id="P001",
            primary_concern="Test concern"
        )
        
        assert caregiver_input.contact_preference == "phone"
        assert caregiver_input.requested_services == []

class TestRoutingDecision:
    """Test RoutingDecision model validation."""
    
    def test_valid_routing_decision(self):
        """Test creating valid routing decision."""
        routing_decision = RoutingDecision(
            patient_id="P001",
            recommended_agents=[AgentType.NURSING, AgentType.PHARMACY],
            reasoning="Patient needs nursing assessment and medication review",
            priority_score=7,
            estimated_timeline="24 hours"
        )
        
        assert len(routing_decision.recommended_agents) == 2
        assert AgentType.NURSING in routing_decision.recommended_agents
        assert routing_decision.priority_score == 7
    
    def test_priority_score_validation(self):
        """Test priority score validation (1-10)."""
        # Valid priority score
        routing_decision = RoutingDecision(
            patient_id="P001",
            recommended_agents=[AgentType.NURSING],
            reasoning="Test reasoning",
            priority_score=5,
            estimated_timeline="24 hours"
        )
        assert routing_decision.priority_score == 5
        
        # Invalid priority scores
        with pytest.raises(ValidationError):
            RoutingDecision(
                patient_id="P001",
                recommended_agents=[AgentType.NURSING],
                reasoning="Test reasoning",
                priority_score=0,  # Too low
                estimated_timeline="24 hours"
            )
        
        with pytest.raises(ValidationError):
            RoutingDecision(
                patient_id="P001",
                recommended_agents=[AgentType.NURSING],
                reasoning="Test reasoning",
                priority_score=11,  # Too high
                estimated_timeline="24 hours"
            )

class TestAgentResponse:
    """Test AgentResponse model validation."""
    
    def test_valid_agent_response(self):
        """Test creating valid agent response."""
        agent_response = AgentResponse(
            agent_type=AgentType.NURSING,
            patient_id="P001",
            structured_data={"assessment_type": "comprehensive"},
            form_data={"form_id": "nursing_P001", "fields": []},
            recommendations=["Schedule assessment"],
            next_steps=["Contact patient"],
            external_referrals=["Home Health Agency"]
        )
        
        assert agent_response.agent_type == AgentType.NURSING
        assert len(agent_response.recommendations) == 1
        assert len(agent_response.external_referrals) == 1

class TestFormField:
    """Test FormField model validation."""
    
    def test_valid_form_field(self):
        """Test creating valid form field."""
        field = FormField(
            field_name="patient_name",
            field_type="text",
            label="Patient Name",
            value="John Smith",
            required=True,
            options=[]
        )
        
        assert field.field_name == "patient_name"
        assert field.required is True
    
    def test_select_field_with_options(self):
        """Test select field with options."""
        field = FormField(
            field_name="urgency",
            field_type="select",
            label="Urgency Level",
            value="medium",
            options=["low", "medium", "high"]
        )
        
        assert len(field.options) == 3
        assert "medium" in field.options

class TestEditableForm:
    """Test EditableForm model validation."""
    
    def test_valid_editable_form(self):
        """Test creating valid editable form."""
        fields = [
            FormField(
                field_name="patient_name",
                field_type="text",
                label="Patient Name",
                value="John Smith"
            ),
            FormField(
                field_name="urgency",
                field_type="select",
                label="Urgency",
                value="medium",
                options=["low", "medium", "high"]
            )
        ]
        
        form = EditableForm(
            form_id="nursing_P001",
            title="Nursing Care Form",
            fields=fields,
            recipient="Home Health Agency",
            submission_endpoint="https://api.example.com/submit"
        )
        
        assert form.form_id == "nursing_P001"
        assert len(form.fields) == 2
        assert form.recipient == "Home Health Agency"
