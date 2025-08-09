#!/usr/bin/env python3
"""
Quick API usage example for the Routing AI Agent
"""

import requests
import json

# Base URL
BASE_URL = "http://localhost:8000"

def test_routing_example():
    """Test the routing with a realistic example."""
    
    # Example patient case
    request_data = {
        "patient_data": {
            "patient_id": "P003",
            "name": "Robert Davis",
            "age": 58,
            "gender": "Male",
            "diagnosis": "Post-surgical recovery, Wound care needed",
            "medications": ["Oxycodone 5mg", "Antibiotics", "Wound care supplies"],
            "medical_history": ["Appendectomy 2023"],
            "current_symptoms": ["Surgical site pain", "Wound drainage", "Fever"],
            "mobility_status": "Bed rest required",
            "insurance_info": "Private insurance - Blue Cross"
        },
        "caregiver_input": {
            "patient_id": "P003",
            "urgency_level": "high",
            "primary_concern": "Patient has surgical wound with drainage and fever, needs immediate nursing assessment",
            "requested_services": ["nursing assessment", "wound care"],
            "additional_notes": "Family reports increased pain and concerning drainage",
            "contact_preference": "phone"
        }
    }
    
    print("🧪 Testing Routing Decision...")
    print("=" * 50)
    
    try:
        response = requests.post(
            f"{BASE_URL}/route-patient",
            json=request_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Routing Decision Successful!")
            print(f"📋 Patient: {request_data['patient_data']['name']}")
            print(f"🚨 Urgency: {request_data['caregiver_input']['urgency_level'].upper()}")
            print(f"🎯 Recommended Agents: {', '.join(result['recommended_agents']).upper()}")
            print(f"📊 Priority Score: {result['priority_score']}/10")
            print(f"⏰ Timeline: {result['estimated_timeline']}")
            print(f"💭 Reasoning: {result['reasoning']}")
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_routing_example()
