#!/usr/bin/env python3
"""
Simple test script to verify the Routing AI Agent setup
"""

import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all modules can be imported."""
    print("🧪 Testing imports...")
    
    try:
        from app.models import PatientData, CaregiverInput, RoutingDecision
        print("✅ Models imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import models: {e}")
        return False
    
    try:
        from app.data_service import DataService
        print("✅ DataService imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import DataService: {e}")
        return False
    
    try:
        from app.ai_service import AIService
        print("✅ AIService imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import AIService: {e}")
        return False
    
    try:
        from app.main import app
        print("✅ FastAPI app imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import FastAPI app: {e}")
        return False
    
    return True

def test_data_models():
    """Test data model creation."""
    print("\n🧪 Testing data models...")
    
    try:
        from app.models import PatientData, CaregiverInput
        
        # Test PatientData creation
        patient = PatientData(
            patient_id="TEST001",
            name="Test Patient",
            age=70,
            gender="Male",
            diagnosis="Test diagnosis",
            medications=["Test Med 1", "Test Med 2"],
            medical_history=["Test History"],
            current_symptoms=["Test Symptom"],
            mobility_status="Ambulatory",
            insurance_info="Test Insurance"
        )
        print("✅ PatientData model works correctly")
        
        # Test CaregiverInput creation
        caregiver_input = CaregiverInput(
            patient_id="TEST001",
            urgency_level="medium",
            primary_concern="Test concern",
            requested_services=["test service"],
            additional_notes="Test notes",
            contact_preference="phone"
        )
        print("✅ CaregiverInput model works correctly")
        
        return True
        
    except Exception as e:
        print(f"❌ Data model test failed: {e}")
        return False

def test_data_service():
    """Test data service functionality."""
    print("\n🧪 Testing data service...")
    
    try:
        from app.data_service import DataService
        
        data_service = DataService()
        
        # Test sample data generation
        sample_data = data_service.generate_sample_data()
        print(f"✅ Generated {len(sample_data)} sample patients")
        
        # Test Excel file creation
        excel_content = data_service.create_sample_excel()
        print(f"✅ Created sample Excel file ({len(excel_content)} bytes)")
        
        return True
        
    except Exception as e:
        print(f"❌ Data service test failed: {e}")
        return False

def test_fastapi_app():
    """Test FastAPI app creation."""
    print("\n🧪 Testing FastAPI app...")
    
    try:
        from app.main import app
        
        # Test that the app can be created
        print("✅ FastAPI app created successfully")
        
        # Test that routes are registered
        routes = [route.path for route in app.routes]
        expected_routes = ["/health", "/sample-data", "/"]
        
        for route in expected_routes:
            if route in routes:
                print(f"✅ Route {route} registered")
            else:
                print(f"❌ Route {route} not found")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ FastAPI app test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 Testing Routing AI Agent Setup")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_data_models,
        test_data_service,
        test_fastapi_app
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        else:
            print(f"\n❌ Test failed: {test.__name__}")
    
    print("\n" + "=" * 50)
    print(f"🎯 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The application is ready to run.")
        print("\n📝 Next steps:")
        print("1. Set your OpenAI API key in .env file")
        print("2. Run: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        print("3. Open: http://localhost:8000")
        return True
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
