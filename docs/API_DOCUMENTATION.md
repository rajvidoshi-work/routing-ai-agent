# Routing AI Agent - API Documentation

## Overview

The Routing AI Agent provides a REST API for healthcare case routing and management. The system uses AI to determine which downstream agents (Nursing, DME, or Pharmacy) should handle patient cases.

## Base URL

- **Local Development**: `http://localhost:8000`
- **Production**: `https://your-alb-dns-name.amazonaws.com`

## Authentication

Currently, the MVP does not require authentication. In production, implement appropriate authentication mechanisms.

## Endpoints

### Health Check

**GET** `/health`

Check if the service is running and healthy.

**Response:**
```json
{
  "status": "healthy",
  "service": "routing-ai-agent"
}
```

### Dashboard

**GET** `/`

Serves the main dashboard interface (HTML).

### Patient Data Management

#### Upload Patient Data

**POST** `/upload-patient-data`

Upload an Excel file containing patient data.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Excel file (.xlsx or .xls)

**Response:**
```json
{
  "message": "Successfully processed 5 patients",
  "patients": [
    {
      "patient_id": "P001",
      "name": "John Smith"
    }
  ]
}
```

#### List Patients

**GET** `/patients`

Get all uploaded patient data.

**Response:**
```json
{
  "patients": [
    {
      "patient_id": "P001",
      "name": "John Smith",
      "age": 72,
      "gender": "Male",
      "diagnosis": "Diabetes Type 2, Hypertension",
      "medications": ["Metformin 500mg", "Lisinopril 10mg"],
      "medical_history": ["Heart disease", "Stroke 2019"],
      "current_symptoms": ["Fatigue", "Dizziness"],
      "mobility_status": "Ambulatory with walker",
      "insurance_info": "Medicare Part A & B"
    }
  ]
}
```

#### Get Specific Patient

**GET** `/patients/{patient_id}`

Get data for a specific patient.

**Response:**
```json
{
  "patient": {
    "patient_id": "P001",
    "name": "John Smith",
    // ... full patient data
  }
}
```

### Routing and Agent Processing

#### Route Patient

**POST** `/route-patient`

Get AI routing decision for a patient case.

**Request Body:**
```json
{
  "patient_data": {
    "patient_id": "P001",
    "name": "John Smith",
    "age": 72,
    "gender": "Male",
    "diagnosis": "Diabetes Type 2, Hypertension",
    "medications": ["Metformin 500mg", "Lisinopril 10mg"],
    "medical_history": ["Heart disease"],
    "current_symptoms": ["Fatigue", "Dizziness"],
    "mobility_status": "Ambulatory with walker",
    "insurance_info": "Medicare Part A & B"
  },
  "caregiver_input": {
    "patient_id": "P001",
    "urgency_level": "medium",
    "primary_concern": "Patient experiencing increased symptoms",
    "requested_services": ["nursing assessment"],
    "additional_notes": "Family reports confusion",
    "contact_preference": "phone"
  }
}
```

**Response:**
```json
{
  "patient_id": "P001",
  "recommended_agents": ["nursing", "pharmacy"],
  "reasoning": "Patient requires nursing assessment for symptoms and pharmacy review for medication management",
  "priority_score": 7,
  "estimated_timeline": "24 hours"
}
```

#### Nursing Agent

**POST** `/agents/nursing`

Process patient case through nursing agent.

**Request Body:** Same as routing request

**Response:**
```json
{
  "agent_type": "nursing",
  "patient_id": "P001",
  "structured_data": {
    "assessment_type": "comprehensive",
    "care_frequency": "weekly",
    "vital_signs_monitoring": true
  },
  "form_data": {
    "form_id": "nursing_P001",
    "title": "Nursing Care Coordination Form",
    "fields": [
      {
        "name": "patient_name",
        "type": "text",
        "label": "Patient Name",
        "value": "John Smith",
        "required": true
      }
    ],
    "recipient": "Home Health Agency"
  },
  "recommendations": [
    "Comprehensive nursing assessment within 24 hours",
    "Weekly vital signs monitoring"
  ],
  "next_steps": [
    "Schedule initial assessment",
    "Coordinate with primary care physician"
  ],
  "external_referrals": ["Home Health Agency"]
}
```

#### DME Agent

**POST** `/agents/dme`

Process patient case through DME (Durable Medical Equipment) agent.

**Request Body:** Same as routing request

**Response:**
```json
{
  "agent_type": "dme",
  "patient_id": "P001",
  "structured_data": {
    "equipment_needs": ["walker", "grab_bars"],
    "insurance_authorization": true,
    "delivery_timeline": "3-5 days"
  },
  "form_data": {
    "form_id": "dme_P001",
    "title": "DME Equipment Request Form",
    "fields": [
      {
        "name": "equipment_type",
        "type": "select",
        "label": "Equipment Type",
        "value": "walker",
        "options": ["walker", "wheelchair", "hospital_bed"]
      }
    ],
    "recipient": "DME Supplier"
  },
  "recommendations": [
    "Upgrade to four-wheel walker with seat",
    "Install bathroom grab bars"
  ],
  "next_steps": [
    "Obtain physician prescription",
    "Submit insurance authorization"
  ],
  "external_referrals": ["DME Supplier"]
}
```

#### Pharmacy Agent

**POST** `/agents/pharmacy`

Process patient case through pharmacy agent.

**Request Body:** Same as routing request

**Response:**
```json
{
  "agent_type": "pharmacy",
  "patient_id": "P001",
  "structured_data": {
    "medication_interactions": [],
    "dosing_recommendations": {
      "metformin": "Continue current dose",
      "lisinopril": "Monitor blood pressure"
    },
    "adherence_score": 8
  },
  "form_data": {
    "form_id": "pharmacy_P001",
    "title": "Pharmacy Consultation Form",
    "fields": [
      {
        "name": "consultation_type",
        "type": "select",
        "label": "Consultation Type",
        "value": "medication_review",
        "options": ["medication_review", "drug_interaction", "adherence_support"]
      }
    ],
    "recipient": "Clinical Pharmacist"
  },
  "recommendations": [
    "Continue current medication regimen",
    "Monitor blood glucose levels"
  ],
  "next_steps": [
    "Schedule medication review in 3 months",
    "Provide patient education materials"
  ],
  "external_referrals": ["Clinical Pharmacist"]
}
```

#### Complete Case Processing

**POST** `/process-complete-case`

Process a complete case through routing and all recommended agents.

**Request Body:** Same as routing request

**Response:**
```json
{
  "routing_decision": {
    // Routing decision object
  },
  "agent_responses": [
    // Array of agent response objects
  ]
}
```

### Utility Endpoints

#### Get Sample Data

**GET** `/sample-data`

Get sample patient data for testing.

**Response:**
```json
{
  "sample_data": [
    {
      "patient_id": "P001",
      "name": "John Smith",
      // ... sample patient data
    }
  ]
}
```

#### Download Sample Excel

**GET** `/download-sample-excel`

Download a sample Excel file with patient data.

**Response:** Excel file download

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "detail": "Error message description"
}
```

## Data Models

### PatientData
```json
{
  "patient_id": "string",
  "name": "string",
  "age": "integer",
  "gender": "string",
  "diagnosis": "string",
  "medications": ["string"],
  "medical_history": ["string"],
  "current_symptoms": ["string"],
  "mobility_status": "string (optional)",
  "insurance_info": "string (optional)"
}
```

### CaregiverInput
```json
{
  "patient_id": "string",
  "urgency_level": "low|medium|high",
  "primary_concern": "string",
  "requested_services": ["string"],
  "additional_notes": "string (optional)",
  "contact_preference": "phone|email|text"
}
```

## Rate Limiting

Currently no rate limiting is implemented. Consider implementing rate limiting for production use.

## Monitoring

The service provides health check endpoints for monitoring. Consider implementing additional metrics and logging for production deployment.
