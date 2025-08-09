#!/usr/bin/env python3
"""
Test script to demonstrate Google AI Studio integration
"""

import os
import sys
import asyncio

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ai_service import AIService
from app.models import PatientData, CaregiverInput

async def test_google_ai_integration():
    """Test Google AI Studio integration with a sample case."""
    
    print("🧪 Testing Google AI Studio Integration")
    print("=" * 50)
    
    # Initialize AI service
    ai_service = AIService()
    
    if not ai_service.client:
        print("❌ No AI API key configured")
        print("📝 To test with Google AI Studio:")
        print("   1. Go to https://aistudio.google.com/")
        print("   2. Create an API key")
        print("   3. Add GOOGLE_AI_API_KEY=your-key to .env file")
        print("   4. Run this test again")
        return
    
    print(f"✅ Using AI provider: {ai_service.ai_provider}")
    
    # Create sample patient data
    patient_data = PatientData(
        patient_id="TEST001",
        name="Test Patient",
        age=70,
        gender="Male",
        diagnosis="Post-surgical wound care needed",
        medications=["Oxycodone 5mg", "Antibiotics"],
        medical_history=["Recent surgery"],
        current_symptoms=["Wound drainage", "Pain", "Fever"],
        mobility_status="Bed rest required",
        insurance_info="Medicare"
    )
    
    caregiver_input = CaregiverInput(
        patient_id="TEST001",
        urgency_level="high",
        primary_concern="Patient has surgical wound with concerning drainage and fever",
        requested_services=["nursing assessment", "wound care"],
        additional_notes="Family reports increased pain and drainage",
        contact_preference="phone"
    )
    
    try:
        print("\n🎯 Testing Routing Decision...")
        routing_decision = await ai_service.route_patient(patient_data, caregiver_input)
        
        print("✅ Routing Decision Successful!")
        print(f"📋 Patient: {patient_data.name}")
        print(f"🚨 Urgency: {caregiver_input.urgency_level.upper()}")
        print(f"🎯 Recommended Agents: {', '.join(routing_decision.recommended_agents).upper()}")
        print(f"📊 Priority Score: {routing_decision.priority_score}/10")
        print(f"⏰ Timeline: {routing_decision.estimated_timeline}")
        print(f"💭 Reasoning: {routing_decision.reasoning[:100]}...")
        
        # Test nursing agent if recommended
        if "nursing" in routing_decision.recommended_agents:
            print("\n🏥 Testing Nursing Agent...")
            nursing_response = await ai_service.process_nursing_agent(patient_data, caregiver_input)
            
            print("✅ Nursing Agent Response:")
            print(f"   📋 Recommendations: {len(nursing_response.recommendations)} items")
            print(f"   📝 Next Steps: {len(nursing_response.next_steps)} items")
            print(f"   📄 Form Fields: {len(nursing_response.form_data['fields'])} fields")
            print(f"   🏢 Recipient: {nursing_response.form_data['recipient']}")
        
        print("\n🎉 Google AI Studio integration working perfectly!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        print("💡 Make sure your Google AI Studio API key is valid and has sufficient quota")

if __name__ == "__main__":
    asyncio.run(test_google_ai_integration())
