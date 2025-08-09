#!/usr/bin/env python3
"""
Generate sample patient data Excel file for testing the Routing AI Agent
"""

import pandas as pd
import sys
import os

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.data_service import DataService

def main():
    """Generate and save sample patient data to Excel file."""
    
    data_service = DataService()
    sample_data = data_service.generate_sample_data()
    
    # Create DataFrame
    df = pd.DataFrame(sample_data)
    
    # Save to Excel file
    output_file = "sample_patients.xlsx"
    df.to_excel(output_file, index=False, sheet_name="Patients")
    
    print(f"✅ Sample patient data saved to {output_file}")
    print(f"📊 Generated {len(sample_data)} patient records")
    
    # Display summary
    print("\n📋 Sample Data Summary:")
    print("-" * 50)
    for i, patient in enumerate(sample_data, 1):
        print(f"{i}. {patient['name']} ({patient['patient_id']})")
        print(f"   Age: {patient['age']}, Gender: {patient['gender']}")
        print(f"   Diagnosis: {patient['diagnosis']}")
        print(f"   Mobility: {patient['mobility_status']}")
        print()

if __name__ == "__main__":
    main()
