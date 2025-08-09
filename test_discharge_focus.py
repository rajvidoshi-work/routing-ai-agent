#!/usr/bin/env python3
"""
Test script to validate discharge-focused MVP behavior.
Tests the acceptance criteria for hospital-to-home transition focus.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_discharge_focus():
    """Test the acceptance criteria example."""
    
    print("🧪 Testing Discharge-Focused MVP Behavior")
    print("=" * 60)
    
    # Acceptance test example
    test_case = {
        "patient_data": {
            "patient_id": "TEST001",
            "name": "Test Patient",
            "gender": "Female",
            "primary_icu_diagnosis": "Stage 3 pressure ulcer",
            "secondary_diagnoses": "Mobility impairment",
            "skilled_nursing_needed": "Yes",
            "nursing_visit_frequency": "Daily",
            "type_of_nursing_care": "Wound care, mobility assistance",
            "equipment_needed": "Wheelchair, wound care supplies",
            "icu_discharge_date": "2025-08-09",
            "insurance_coverage_status": "Pending",
            "allergies": "None",
            "medication": "Wound care antibiotics",
            "prescriber_name": "Dr. Smith"
        },
        "caregiver_input": {
            "patient_id": "TEST001",
            "urgency_level": "high",
            "primary_concern": "Stage 3 pressure ulcer; needs home wound care; mobility issues; discharge tomorrow.",
            "requested_services": ["nursing", "equipment"],
            "additional_notes": "Urgent discharge planning needed"
        }
    }
    
    print(f"📋 Test Case: {test_case['caregiver_input']['primary_concern']}")
    print()
    
    # Test complete case processing
    response = requests.post(f"{BASE_URL}/process-complete-case", json=test_case)
    
    if response.status_code != 200:
        print(f"❌ Test failed with status {response.status_code}: {response.text}")
        return
    
    result = response.json()
    
    # Validate routing decision
    routing = result["routing_decision"]
    print(f"🎯 Routing Decision:")
    print(f"   Recommended Agents: {routing['recommended_agents']}")
    print(f"   Priority Score: {routing['priority_score']}/10")
    print(f"   Timeline: {routing['estimated_timeline']}")
    print(f"   Reasoning: {routing['reasoning']}")
    print()
    
    # Expected: ["nursing", "dme"] based on acceptance criteria
    expected_agents = ["nursing", "dme"]
    actual_agents = routing["recommended_agents"]
    
    if set(expected_agents).issubset(set(actual_agents)):
        print("✅ Routing Decision: PASS - Nursing and DME agents activated")
    else:
        print(f"❌ Routing Decision: FAIL - Expected {expected_agents}, got {actual_agents}")
    
    # Validate agent responses
    agent_responses = result["agent_responses"]
    print(f"🤖 Agent Responses: {len(agent_responses)} agents processed")
    print()
    
    for response in agent_responses:
        agent_type = response["agent_type"]
        print(f"📋 {agent_type.upper()} Agent Response:")
        
        # Check for discharge-focused content
        recommendations = response["recommendations"]
        next_steps = response["next_steps"]
        
        print(f"   Recommendations ({len(recommendations)}):")
        for rec in recommendations:
            print(f"     • {rec}")
        
        print(f"   Next Steps ({len(next_steps)}):")
        for step in next_steps:
            print(f"     • {step}")
        
        # Validate discharge focus
        discharge_keywords = [
            "home", "discharge", "transition", "post-acute", "community",
            "follow-up", "outpatient", "delivery", "pickup", "referral"
        ]
        
        inpatient_keywords = [
            "inpatient", "hospital stay", "ICU management", "ward", 
            "titration", "monitoring in hospital", "bedside"
        ]
        
        all_text = " ".join(recommendations + next_steps).lower()
        
        has_discharge_focus = any(keyword in all_text for keyword in discharge_keywords)
        has_inpatient_content = any(keyword in all_text for keyword in inpatient_keywords)
        
        if has_discharge_focus and not has_inpatient_content:
            print(f"   ✅ Focus Check: PASS - Discharge-focused content")
        elif has_inpatient_content:
            print(f"   ❌ Focus Check: FAIL - Contains inpatient content")
        else:
            print(f"   ⚠️  Focus Check: UNCLEAR - Limited discharge indicators")
        
        print()
    
    # Validate specific acceptance criteria
    print("🎯 Acceptance Criteria Validation:")
    
    # Check for nursing agent with wound care focus
    nursing_response = next((r for r in agent_responses if r["agent_type"] == "nursing"), None)
    if nursing_response:
        nursing_text = " ".join(nursing_response["recommendations"] + nursing_response["next_steps"]).lower()
        
        criteria_checks = {
            "Visit frequency mentioned": any(freq in nursing_text for freq in ["daily", "weekly", "visit"]),
            "Wound care protocol": "wound" in nursing_text,
            "First-visit target": any(target in nursing_text for target in ["first visit", "initial", "24 hours"]),
            "Caregiver teaching": any(teach in nursing_text for teach in ["education", "teaching", "training"]),
            "Follow-up clinic": any(followup in nursing_text for followup in ["follow-up", "appointment", "clinic"])
        }
        
        for criteria, passed in criteria_checks.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"   Nursing - {criteria}: {status}")
    
    # Check for DME agent with equipment focus
    dme_response = next((r for r in agent_responses if r["agent_type"] == "dme"), None)
    if dme_response:
        dme_text = " ".join(dme_response["recommendations"] + dme_response["next_steps"]).lower()
        
        criteria_checks = {
            "Wheelchair order": "wheelchair" in dme_text,
            "Diagnosis code": any(dx in dme_text for dx in ["diagnosis", "code", "medical necessity"]),
            "Medical necessity": "necessity" in dme_text or "justification" in dme_text,
            "Duration specified": "duration" in dme_text or "timeline" in dme_text,
            "Supplier selection": "supplier" in dme_text or "vendor" in dme_text
        }
        
        for criteria, passed in criteria_checks.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"   DME - {criteria}: {status}")
    
    # Check that pharmacy is NOT activated (per acceptance criteria)
    pharmacy_response = next((r for r in agent_responses if r["agent_type"] == "pharmacy"), None)
    if not pharmacy_response:
        print(f"   Pharmacy - Not activated (correct): ✅ PASS")
    else:
        print(f"   Pharmacy - Incorrectly activated: ❌ FAIL")
    
    print()
    print("🎯 Test Summary:")
    print("   Focus: Hospital-to-home transition workflows only")
    print("   Scope: 0-14 days post-discharge")
    print("   Agents: Nursing, DME, Pharmacy, State coordination")
    print("   Forms: Ready for external partner coordination")

if __name__ == "__main__":
    test_discharge_focus()
