from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from enum import Enum

class AgentType(str, Enum):
    NURSING = "nursing"
    DME = "dme"
    PHARMACY = "pharmacy"
    STATE = "state"

class ComprehensivePatientData(BaseModel):
    """Comprehensive patient data model based on ICU discharge planning."""
    # Basic Patient Information
    patient_id: str
    name: str
    date_of_birth: Optional[date] = None
    gender: str
    mrn: Optional[str] = None
    address: Optional[str] = None
    contact_number: Optional[str] = None
    
    # ICU Stay Information
    icu_admission_date: Optional[date] = None
    icu_discharge_date: Optional[date] = None
    length_of_stay_days: Optional[int] = None
    
    # Medical Information
    primary_icu_diagnosis: str
    secondary_diagnoses: Optional[str] = None
    allergies: Optional[str] = None
    
    # Prescriber Information
    prescriber_name: Optional[str] = None
    npi_number: Optional[str] = None
    prescriber_contact: Optional[str] = None
    
    # Medication Information
    medication: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration_of_therapy: Optional[str] = None
    route: Optional[str] = None
    vascular_access: Optional[str] = None
    
    # Nursing Care
    skilled_nursing_needed: Optional[str] = None
    nursing_visit_frequency: Optional[str] = None
    type_of_nursing_care: Optional[str] = None
    nurse_agency: Optional[str] = None
    emergency_contact_procedure: Optional[str] = None
    
    # Equipment/DME
    equipment_needed: Optional[str] = None
    equipment_delivery_date: Optional[date] = None
    dme_supplier: Optional[str] = None
    
    # Administrative
    insurance_coverage_status: Optional[str] = None
    follow_up_appointment_date: Optional[date] = None
    
    # Additional Services
    dietician_referral: Optional[str] = None
    physical_therapy: Optional[str] = None
    transportation_needed: Optional[str] = None
    special_instructions: Optional[str] = None

class PatientData(BaseModel):
    patient_id: str
    name: str
    age: int
    gender: str
    diagnosis: str
    medications: List[str] = []
    medical_history: List[str] = []
    current_symptoms: List[str] = []
    mobility_status: Optional[str] = None
    insurance_info: Optional[str] = None

class CaregiverInput(BaseModel):
    patient_id: str
    urgency_level: str = Field(..., description="low, medium, high")
    primary_concern: str
    requested_services: List[str] = []
    additional_notes: Optional[str] = None
    contact_preference: str = "phone"

class RoutingRequest(BaseModel):
    patient_data: ComprehensivePatientData  # Updated to use comprehensive model
    caregiver_input: CaregiverInput

class RoutingDecision(BaseModel):
    patient_id: str
    recommended_agents: List[AgentType]
    reasoning: str
    priority_score: int = Field(..., ge=1, le=10)
    estimated_timeline: str

class AgentResponse(BaseModel):
    agent_type: AgentType
    patient_id: str
    structured_data: Dict[str, Any]
    form_data: Dict[str, Any]
    recommendations: List[str]
    next_steps: List[str]
    external_referrals: List[str] = []

class FormField(BaseModel):
    field_name: str
    field_type: str  # text, textarea, select, checkbox, date
    label: str
    value: Any
    required: bool = False
    options: List[str] = []  # for select fields

class EditableForm(BaseModel):
    form_id: str
    title: str
    fields: List[FormField]
    recipient: str  # external partner
    submission_endpoint: Optional[str] = None
