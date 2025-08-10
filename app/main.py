from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from typing import List
import json

from app.models import (
    PatientData, ComprehensivePatientData, CaregiverInput, RoutingRequest, RoutingDecision, 
    AgentResponse, AgentType
)
from app.ai_service import AIService
from app.data_service import DataService

# Initialize FastAPI app
app = FastAPI(
    title="Routing AI Agent - Discharge Planning API",
    description="AI-powered discharge planning API for hospital-to-home transitions",
    version="2.0.0"
)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3003"],  # React dev server on port 3003
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ai_service = AIService()
data_service = DataService()

@app.get("/")
async def root():
    """Root endpoint - API information."""
    return {
        "message": "Routing AI Agent - Discharge Planning API",
        "version": "2.0.0",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "data_status": "/api/data-status",
            "patients": "/api/patients",
            "available_files": "/api/available-files",
            "process_complete_case": "/api/process-complete-case"
        },
        "frontend": "http://localhost:3003"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "routing-ai-agent-api", "version": "2.0.0"}

# Data Management Endpoints
@app.get("/api/data-status")
async def get_data_status():
    """Get current data loading status and available files."""
    return data_service.get_patient_summary()

@app.get("/api/available-files")
async def get_available_files():
    """Get list of available Excel files in the data directory."""
    return {
        "data_directory": data_service.data_directory,
        "files": data_service.get_available_files()
    }

@app.post("/api/load-file/{filename}")
async def load_specific_file(filename: str):
    """Load a specific Excel file from the data directory."""
    try:
        patient_count = data_service.load_specific_file(filename)
        return {
            "message": f"Successfully loaded {patient_count} patients from {filename}",
            "patient_count": patient_count,
            "filename": filename
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File not found: {filename}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading file: {str(e)}")

@app.post("/api/refresh-data")
async def refresh_data():
    """Refresh data by reloading the most recent file."""
    try:
        patient_count = data_service.refresh_data()
        return {
            "message": f"Data refreshed successfully. Loaded {patient_count} patients.",
            "patient_count": patient_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing data: {str(e)}")

@app.post("/api/set-data-directory")
async def set_data_directory(request: Request):
    """Set the data directory path."""
    try:
        body = await request.json()
        directory_path = body.get("directory_path")
        
        if not directory_path:
            raise HTTPException(status_code=400, detail="directory_path is required")
        
        data_service.set_data_directory(directory_path)
        return {
            "message": f"Data directory set to: {directory_path}",
            "directory": directory_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error setting directory: {str(e)}")

@app.get("/api/patients")
async def get_patients():
    """Get all loaded patients."""
    try:
        patients = data_service.list_patients()
        return {
            "patients": [
                {
                    "patient_id": p.patient_id,
                    "name": p.name,
                    "primary_diagnosis": p.primary_icu_diagnosis,
                    "skilled_nursing_needed": p.skilled_nursing_needed,
                    "equipment_needed": p.equipment_needed,
                    "medication": p.medication,
                    "insurance_coverage_status": p.insurance_coverage_status
                }
                for p in patients
            ],
            "total": len(patients)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting patients: {str(e)}")

# AI Processing Endpoints
@app.post("/api/route-patient", response_model=RoutingDecision)
async def route_patient(request: RoutingRequest):
    """Route patient to appropriate agents using AI."""
    
    try:
        # Get patient data from cache
        patient_data = data_service.get_patient(request.patient_data.patient_id)
        
        routing_decision = await ai_service.route_patient(
            patient_data,
            request.caregiver_input
        )
        return routing_decision
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Routing failed: {str(e)}")

@app.post("/api/process-nursing-agent", response_model=AgentResponse)
async def process_nursing_agent(request: RoutingRequest):
    """Process patient case through nursing agent."""
    
    try:
        # Get patient data from cache
        patient_data = data_service.get_patient(request.patient_data.patient_id)
        
        response = await ai_service.process_nursing_agent(
            patient_data,
            request.caregiver_input
        )
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nursing agent failed: {str(e)}")

@app.post("/api/process-dme-agent", response_model=AgentResponse)
async def process_dme_agent(request: RoutingRequest):
    """Process patient case through DME agent."""
    
    try:
        # Get patient data from cache
        patient_data = data_service.get_patient(request.patient_data.patient_id)
        
        response = await ai_service.process_dme_agent(
            patient_data,
            request.caregiver_input
        )
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DME agent failed: {str(e)}")

@app.post("/api/process-pharmacy-agent", response_model=AgentResponse)
async def process_pharmacy_agent(request: RoutingRequest):
    """Process patient case through pharmacy agent."""
    
    try:
        # Get patient data from cache
        patient_data = data_service.get_patient(request.patient_data.patient_id)
        
        response = await ai_service.process_pharmacy_agent(
            patient_data,
            request.caregiver_input
        )
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pharmacy agent failed: {str(e)}")

@app.post("/api/process-state-agent", response_model=AgentResponse)
async def process_state_agent(request: RoutingRequest):
    """Process patient case through state/insurance coordination agent."""
    
    try:
        # Get patient data from cache
        patient_data = data_service.get_patient(request.patient_data.patient_id)
        
        response = await ai_service.process_state_agent(
            patient_data,
            request.caregiver_input
        )
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"State agent failed: {str(e)}")

@app.post("/api/process-complete-case")
async def process_complete_case(request: RoutingRequest):
    """Complete end-to-end processing: routing + all recommended agents."""
    
    try:
        # Get patient data from cache
        patient_data = data_service.get_patient(request.patient_data.patient_id)
        
        # Step 1: Get routing decision
        routing_decision = await ai_service.route_patient(
            patient_data,
            request.caregiver_input
        )
        
        # Step 2: Process through all recommended agents
        agent_responses = []
        
        for agent_type in routing_decision.recommended_agents:
            try:
                response = None
                
                if agent_type == AgentType.NURSING:
                    response = await ai_service.process_nursing_agent(
                        patient_data, request.caregiver_input
                    )
                elif agent_type == AgentType.DME:
                    response = await ai_service.process_dme_agent(
                        patient_data, request.caregiver_input
                    )
                elif agent_type == AgentType.PHARMACY:
                    response = await ai_service.process_pharmacy_agent(
                        patient_data, request.caregiver_input
                    )
                elif agent_type == AgentType.STATE:
                    response = await ai_service.process_state_agent(
                        patient_data, request.caregiver_input
                    )
                else:
                    # Handle unknown agent types
                    print(f"⚠️ Unknown agent type: {agent_type}")
                    continue
                
                if response:
                    agent_responses.append(response)
                else:
                    print(f"⚠️ No response from {agent_type} agent")
                    
            except Exception as agent_error:
                print(f"❌ Error processing {agent_type} agent: {str(agent_error)}")
                # Continue processing other agents instead of failing completely
                continue
        
        return {
            "routing_decision": routing_decision,
            "agent_responses": agent_responses,
            "status": "success",
            "processed_agents": len(agent_responses),
            "total_recommended": len(routing_decision.recommended_agents)
        }
        
    except Exception as e:
        print(f"❌ Complete case processing error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Complete case processing failed: {str(e)}")

@app.get("/api/sample-data")
async def get_sample_data():
    """Get information about data directory and expected format."""
    return {
        "data_directory": data_service.data_directory,
        "message": "Place your Excel files in the data directory",
        "expected_columns": [
            "Patient ID", "Name", "Gender", "Age", "MRN", "Address", "Phone",
            "Emergency Contact", "Emergency Contact Phone", "ICU Admission Date",
            "ICU Discharge Date", "Length of Stay (Days)", "Primary ICU Diagnosis",
            "Secondary Diagnoses", "Allergies", "Medication", "Dosage", "Frequency",
            "Route", "Duration of Therapy", "Vascular Access", "Prescriber Name",
            "Prescriber Contact", "NPI Number", "Skilled Nursing Needed",
            "Nursing Visit Frequency", "Type of Nursing Care", "Nurse Agency",
            "Emergency Contact Procedure", "Equipment Needed", "Equipment Delivery Date",
            "DME Supplier", "Physical Therapy", "Occupational Therapy", "Speech Therapy",
            "Transportation Needed", "Insurance Coverage Status", "Follow-up Appointment Date",
            "Follow-up Provider", "Special Instructions"
        ],
        "available_files": data_service.get_available_files()
    }
