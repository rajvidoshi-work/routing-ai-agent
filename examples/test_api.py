#!/usr/bin/env python3
"""
Test script for the Routing AI Agent API endpoints
"""

import requests
import json
import sys
import time

# Configuration
BASE_URL = "http://localhost:8000"  # Change this for deployed version

def test_health_check():
    """Test the health check endpoint."""
    print("🏥 Testing health check...")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_sample_data():
    """Test getting sample data."""
    print("\n📊 Testing sample data endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/sample-data")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Sample data retrieved: {len(data['sample_data'])} patients")
            return data['sample_data']
        else:
            print(f"❌ Sample data failed: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Sample data failed: {e}")
        return None

def test_routing_decision(patient_data):
    """Test the routing decision endpoint."""
    print("\n🧭 Testing routing decision...")
    
    # Use first patient from sample data
    if not patient_data:
        print("❌ No patient data available")
        return None
    
    patient = patient_data[0]
    
    request_data = {
        "patient_data": {
            "patient_id": patient["patient_id"],
            "name": patient["name"],
            "age": patient["age"],
            "gender": patient["gender"],
            "diagnosis": patient["diagnosis"],
            "medications": patient["medications"].split(";") if patient["medications"] else [],
            "medical_history": patient["medical_history"].split(";") if patient["medical_history"] else [],
            "current_symptoms": patient["current_symptoms"].split(";") if patient["current_symptoms"] else [],
            "mobility_status": patient["mobility_status"],
            "insurance_info": patient["insurance_info"]
        },
        "caregiver_input": {
            "patient_id": patient["patient_id"],
            "urgency_level": "medium",
            "primary_concern": "Patient experiencing increased symptoms and needs care coordination",
            "requested_services": ["nursing assessment", "medication review"],
            "additional_notes": "Family reports patient confusion about medications",
            "contact_preference": "phone"
        }
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/route-patient",
            json=request_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            routing_result = response.json()
            print("✅ Routing decision successful")
            print(f"   Recommended agents: {routing_result['recommended_agents']}")
            print(f"   Priority score: {routing_result['priority_score']}/10")
            print(f"   Timeline: {routing_result['estimated_timeline']}")
            print(f"   Reasoning: {routing_result['reasoning'][:100]}...")
            return routing_result
        else:
            print(f"❌ Routing decision failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"❌ Routing decision failed: {e}")
        return None

def test_agent_endpoints(patient_data):
    """Test individual agent endpoints."""
    if not patient_data:
        print("❌ No patient data available")
        return
    
    patient = patient_data[0]
    
    request_data = {
        "patient_data": {
            "patient_id": patient["patient_id"],
            "name": patient["name"],
            "age": patient["age"],
            "gender": patient["gender"],
            "diagnosis": patient["diagnosis"],
            "medications": patient["medications"].split(";") if patient["medications"] else [],
            "medical_history": patient["medical_history"].split(";") if patient["medical_history"] else [],
            "current_symptoms": patient["current_symptoms"].split(";") if patient["current_symptoms"] else [],
            "mobility_status": patient["mobility_status"],
            "insurance_info": patient["insurance_info"]
        },
        "caregiver_input": {
            "patient_id": patient["patient_id"],
            "urgency_level": "medium",
            "primary_concern": "Patient needs specialized care coordination",
            "requested_services": ["assessment"],
            "additional_notes": "Testing agent endpoints",
            "contact_preference": "phone"
        }
    }
    
    agents = ["nursing", "dme", "pharmacy"]
    
    for agent in agents:
        print(f"\n🤖 Testing {agent.upper()} agent...")
        
        try:
            response = requests.post(
                f"{BASE_URL}/agents/{agent}",
                json=request_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                agent_result = response.json()
                print(f"✅ {agent.upper()} agent successful")
                print(f"   Recommendations: {len(agent_result['recommendations'])} items")
                print(f"   Next steps: {len(agent_result['next_steps'])} items")
                print(f"   Form fields: {len(agent_result['form_data']['fields'])} fields")
            else:
                print(f"❌ {agent.upper()} agent failed: {response.status_code}")
                print(f"   Error: {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {agent.upper()} agent failed: {e}")

def test_complete_case(patient_data):
    """Test the complete case processing endpoint."""
    print("\n🔄 Testing complete case processing...")
    
    if not patient_data:
        print("❌ No patient data available")
        return
    
    patient = patient_data[0]
    
    request_data = {
        "patient_data": {
            "patient_id": patient["patient_id"],
            "name": patient["name"],
            "age": patient["age"],
            "gender": patient["gender"],
            "diagnosis": patient["diagnosis"],
            "medications": patient["medications"].split(";") if patient["medications"] else [],
            "medical_history": patient["medical_history"].split(";") if patient["medical_history"] else [],
            "current_symptoms": patient["current_symptoms"].split(";") if patient["current_symptoms"] else [],
            "mobility_status": patient["mobility_status"],
            "insurance_info": patient["insurance_info"]
        },
        "caregiver_input": {
            "patient_id": patient["patient_id"],
            "urgency_level": "high",
            "primary_concern": "Patient requires comprehensive care coordination across multiple services",
            "requested_services": ["nursing assessment", "equipment evaluation", "medication review"],
            "additional_notes": "Complex case requiring multiple agent coordination",
            "contact_preference": "phone"
        }
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/process-complete-case",
            json=request_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Complete case processing successful")
            print(f"   Routing decision: {len(result['routing_decision']['recommended_agents'])} agents recommended")
            print(f"   Agent responses: {len(result['agent_responses'])} agents processed")
            
            for agent_response in result['agent_responses']:
                agent_type = agent_response['agent_type']
                print(f"   - {agent_type.upper()}: {len(agent_response['recommendations'])} recommendations")
        else:
            print(f"❌ Complete case processing failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Complete case processing failed: {e}")

def main():
    """Run all API tests."""
    print("🧪 Starting API tests for Routing AI Agent")
    print("=" * 50)
    
    # Test health check first
    if not test_health_check():
        print("❌ Service is not healthy. Exiting tests.")
        sys.exit(1)
    
    # Get sample data
    sample_data = test_sample_data()
    
    # Test routing decision
    routing_result = test_routing_decision(sample_data)
    
    # Test individual agents
    test_agent_endpoints(sample_data)
    
    # Test complete case processing
    test_complete_case(sample_data)
    
    print("\n" + "=" * 50)
    print("🎉 API tests completed!")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        BASE_URL = sys.argv[1]
        print(f"Using base URL: {BASE_URL}")
    
    main()
