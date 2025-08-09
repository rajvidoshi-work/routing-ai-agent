#!/usr/bin/env python3
"""
Test script to demonstrate Excel file handling with different field scenarios
"""

import pandas as pd
import requests
import io
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

BASE_URL = "http://localhost:8000"

def create_excel_file(data, filename):
    """Create an Excel file from data."""
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Patients', index=False)
    output.seek(0)
    return output.getvalue()

def test_upload_excel(data, scenario_name):
    """Test uploading Excel data and return the response."""
    print(f"\n🧪 Testing: {scenario_name}")
    print("-" * 50)
    
    try:
        excel_content = create_excel_file(data, f"test_{scenario_name.lower().replace(' ', '_')}.xlsx")
        
        response = requests.post(
            f"{BASE_URL}/upload-patient-data",
            files={"file": (f"test_{scenario_name}.xlsx", excel_content, 
                          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
        )
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success: {result['message']}")
            if 'patients' in result:
                print(f"📊 Patients processed: {len(result['patients'])}")
                for patient in result['patients']:
                    print(f"   - {patient['name']} ({patient['patient_id']})")
        else:
            print(f"❌ Error: {response.json().get('detail', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def main():
    """Test various Excel file scenarios."""
    
    print("🧪 Testing Excel File Upload Scenarios")
    print("=" * 60)
    
    # Scenario 1: Perfect file with all required fields
    perfect_data = [
        {
            'patient_id': 'TEST001',
            'name': 'Perfect Patient',
            'age': 65,
            'gender': 'Female',
            'diagnosis': 'Test diagnosis',
            'medications': 'Test Med 1; Test Med 2',
            'medical_history': 'Test History',
            'current_symptoms': 'Test Symptom 1; Test Symptom 2',
            'mobility_status': 'Ambulatory',
            'insurance_info': 'Test Insurance'
        }
    ]
    test_upload_excel(perfect_data, "Perfect File - All Fields")
    
    # Scenario 2: Missing optional fields
    missing_optional = [
        {
            'patient_id': 'TEST002',
            'name': 'Missing Optional Fields',
            'age': 70,
            'gender': 'Male',
            'diagnosis': 'Test diagnosis'
            # Missing: medications, medical_history, current_symptoms, mobility_status, insurance_info
        }
    ]
    test_upload_excel(missing_optional, "Missing Optional Fields")
    
    # Scenario 3: Missing required fields
    missing_required = [
        {
            'patient_id': 'TEST003',
            'name': 'Missing Required',
            'age': 75
            # Missing: gender, diagnosis (required fields)
        }
    ]
    test_upload_excel(missing_required, "Missing Required Fields")
    
    # Scenario 4: Extra fields
    extra_fields = [
        {
            'patient_id': 'TEST004',
            'name': 'Extra Fields Patient',
            'age': 60,
            'gender': 'Female',
            'diagnosis': 'Test diagnosis',
            'medications': 'Test Med',
            'medical_history': 'Test History',
            'current_symptoms': 'Test Symptom',
            'mobility_status': 'Ambulatory',
            'insurance_info': 'Test Insurance',
            # Extra fields
            'emergency_contact': 'John Doe - 555-1234',
            'allergies': 'Penicillin; Shellfish',
            'primary_physician': 'Dr. Smith',
            'admission_date': '2024-01-15',
            'room_number': '101A',
            'custom_notes': 'This is a custom field'
        }
    ]
    test_upload_excel(extra_fields, "Extra Fields")
    
    # Scenario 5: Wrong data types
    wrong_types = [
        {
            'patient_id': 'TEST005',
            'name': 'Wrong Types Patient',
            'age': 'seventy-five',  # Should be integer
            'gender': 'Female',
            'diagnosis': 'Test diagnosis',
            'medications': 123,  # Should be string
            'medical_history': ['History1', 'History2'],  # Should be string, not list
            'current_symptoms': 'Test Symptom',
            'mobility_status': 'Ambulatory',
            'insurance_info': 'Test Insurance'
        }
    ]
    test_upload_excel(wrong_types, "Wrong Data Types")
    
    # Scenario 6: Empty file
    empty_data = []
    test_upload_excel(empty_data, "Empty File")
    
    # Scenario 7: Different column names (case sensitivity)
    different_case = [
        {
            'Patient_ID': 'TEST007',  # Different case
            'NAME': 'Case Sensitive Test',  # Different case
            'Age': 65,
            'Gender': 'Male',
            'Diagnosis': 'Test diagnosis'
        }
    ]
    test_upload_excel(different_case, "Different Column Case")
    
    # Scenario 8: Multiple patients with mixed data quality
    mixed_quality = [
        {
            'patient_id': 'GOOD001',
            'name': 'Good Patient',
            'age': 65,
            'gender': 'Female',
            'diagnosis': 'Complete data',
            'medications': 'Med1; Med2',
            'medical_history': 'History1',
            'current_symptoms': 'Symptom1',
            'mobility_status': 'Ambulatory',
            'insurance_info': 'Insurance'
        },
        {
            'patient_id': 'PARTIAL001',
            'name': 'Partial Patient',
            'age': 70,
            'gender': 'Male',
            'diagnosis': 'Partial data'
            # Missing optional fields
        },
        {
            'patient_id': 'BAD001',
            'name': 'Bad Patient'
            # Missing required fields
        }
    ]
    test_upload_excel(mixed_quality, "Mixed Data Quality")

if __name__ == "__main__":
    main()
