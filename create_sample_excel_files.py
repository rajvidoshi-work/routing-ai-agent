#!/usr/bin/env python3
"""
Create sample Excel files to demonstrate different upload scenarios
"""

import pandas as pd
import os

def create_sample_files():
    """Create various sample Excel files for testing."""
    
    # Create samples directory
    samples_dir = "sample_excel_files"
    os.makedirs(samples_dir, exist_ok=True)
    
    # 1. Perfect file with all fields
    perfect_data = [
        {
            'patient_id': 'PERFECT001',
            'name': 'Perfect Patient',
            'age': 65,
            'gender': 'Female',
            'diagnosis': 'Diabetes Type 2, Hypertension',
            'medications': 'Metformin 500mg; Lisinopril 10mg; Aspirin 81mg',
            'medical_history': 'Heart disease; Family history of diabetes',
            'current_symptoms': 'Fatigue; Dizziness; Frequent urination',
            'mobility_status': 'Ambulatory with walker',
            'insurance_info': 'Medicare Part A & B'
        },
        {
            'patient_id': 'PERFECT002',
            'name': 'Another Perfect Patient',
            'age': 72,
            'gender': 'Male',
            'diagnosis': 'COPD, Osteoarthritis',
            'medications': 'Albuterol inhaler; Prednisone 5mg',
            'medical_history': 'Smoking history; Hip replacement 2020',
            'current_symptoms': 'Shortness of breath; Joint pain',
            'mobility_status': 'Limited mobility, uses wheelchair',
            'insurance_info': 'Medicare Advantage'
        }
    ]
    
    df = pd.DataFrame(perfect_data)
    df.to_excel(f"{samples_dir}/01_perfect_file.xlsx", index=False)
    print("✅ Created: 01_perfect_file.xlsx")
    
    # 2. Missing optional fields (should work)
    minimal_data = [
        {
            'patient_id': 'MINIMAL001',
            'name': 'Minimal Data Patient',
            'age': 70,
            'gender': 'Male',
            'diagnosis': 'Hypertension'
        },
        {
            'patient_id': 'MINIMAL002',
            'name': 'Another Minimal Patient',
            'age': 68,
            'gender': 'Female',
            'diagnosis': 'Arthritis'
        }
    ]
    
    df = pd.DataFrame(minimal_data)
    df.to_excel(f"{samples_dir}/02_minimal_required_fields.xlsx", index=False)
    print("✅ Created: 02_minimal_required_fields.xlsx")
    
    # 3. Extra fields (should work - extras ignored)
    extra_fields_data = [
        {
            'patient_id': 'EXTRA001',
            'name': 'Extra Fields Patient',
            'age': 60,
            'gender': 'Female',
            'diagnosis': 'Diabetes',
            'medications': 'Insulin',
            'medical_history': 'None significant',
            'current_symptoms': 'Fatigue',
            'mobility_status': 'Ambulatory',
            'insurance_info': 'Private insurance',
            # Extra fields that will be ignored
            'emergency_contact': 'John Doe - 555-1234',
            'allergies': 'Penicillin; Shellfish',
            'primary_physician': 'Dr. Smith',
            'admission_date': '2024-01-15',
            'room_number': '101A',
            'custom_notes': 'VIP patient - handle with care'
        }
    ]
    
    df = pd.DataFrame(extra_fields_data)
    df.to_excel(f"{samples_dir}/03_extra_fields.xlsx", index=False)
    print("✅ Created: 03_extra_fields.xlsx")
    
    # 4. Missing required fields (should fail)
    missing_required_data = [
        {
            'patient_id': 'MISSING001',
            'name': 'Missing Required Fields',
            'age': 75
            # Missing: gender, diagnosis
        }
    ]
    
    df = pd.DataFrame(missing_required_data)
    df.to_excel(f"{samples_dir}/04_missing_required_fields.xlsx", index=False)
    print("❌ Created: 04_missing_required_fields.xlsx (will fail)")
    
    # 5. Wrong data types (should fail)
    wrong_types_data = [
        {
            'patient_id': 'WRONG001',
            'name': 'Wrong Data Types',
            'age': 'seventy-five',  # Should be integer
            'gender': 'Female',
            'diagnosis': 'Test diagnosis'
        }
    ]
    
    df = pd.DataFrame(wrong_types_data)
    df.to_excel(f"{samples_dir}/05_wrong_data_types.xlsx", index=False)
    print("❌ Created: 05_wrong_data_types.xlsx (will fail)")
    
    # 6. Case sensitive column names (should fail)
    case_sensitive_data = [
        {
            'Patient_ID': 'CASE001',  # Wrong case
            'NAME': 'Case Sensitive Test',  # Wrong case
            'Age': 65,  # Wrong case
            'Gender': 'Male',  # Wrong case
            'Diagnosis': 'Test diagnosis'  # Wrong case
        }
    ]
    
    df = pd.DataFrame(case_sensitive_data)
    df.to_excel(f"{samples_dir}/06_wrong_column_case.xlsx", index=False)
    print("❌ Created: 06_wrong_column_case.xlsx (will fail)")
    
    # 7. Mixed data quality (should fail)
    mixed_data = [
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
            # Missing optional fields - this is OK
        },
        {
            'patient_id': 'BAD001',
            'name': 'Bad Patient',
            'age': None,  # Missing required field
            'gender': None,  # Missing required field
            'diagnosis': None  # Missing required field
        }
    ]
    
    df = pd.DataFrame(mixed_data)
    df.to_excel(f"{samples_dir}/07_mixed_data_quality.xlsx", index=False)
    print("❌ Created: 07_mixed_data_quality.xlsx (will fail due to bad row)")
    
    print(f"\n📁 All sample files created in: {samples_dir}/")
    print("\n🧪 Test these files by uploading them to the application:")
    print("   1. Go to http://localhost:8000")
    print("   2. Try uploading each file")
    print("   3. See how the application handles different scenarios")
    
    print("\n✅ Files that should work:")
    print("   - 01_perfect_file.xlsx")
    print("   - 02_minimal_required_fields.xlsx") 
    print("   - 03_extra_fields.xlsx")
    
    print("\n❌ Files that should fail (with helpful error messages):")
    print("   - 04_missing_required_fields.xlsx")
    print("   - 05_wrong_data_types.xlsx")
    print("   - 06_wrong_column_case.xlsx")
    print("   - 07_mixed_data_quality.xlsx")

if __name__ == "__main__":
    create_sample_files()
