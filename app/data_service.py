import pandas as pd
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models import ComprehensivePatientData

class DataService:
    def __init__(self):
        # Default data directory - can be configured
        self.data_directory = "/Users/rajvi/patient_data"  # Change this to your preferred location
        self.patient_cache: Dict[str, ComprehensivePatientData] = {}
        
        # Ensure data directory exists
        os.makedirs(self.data_directory, exist_ok=True)
        
        # Auto-load data on initialization
        self._auto_load_data()
    
    def set_data_directory(self, directory_path: str):
        """Set the directory path where Excel files are located."""
        self.data_directory = directory_path
        os.makedirs(self.data_directory, exist_ok=True)
        print(f"📁 Data directory set to: {directory_path}")
    
    def _auto_load_data(self):
        """Automatically load the most recent Excel file from the data directory."""
        try:
            excel_files = [f for f in os.listdir(self.data_directory) if f.endswith(('.xlsx', '.xls'))]
            
            if not excel_files:
                print(f"📁 No Excel files found in {self.data_directory}")
                print(f"💡 Place your patient data Excel files in: {self.data_directory}")
                return
            
            # Sort by modification time, get the most recent
            excel_files.sort(key=lambda x: os.path.getmtime(os.path.join(self.data_directory, x)), reverse=True)
            latest_file = excel_files[0]
            
            file_path = os.path.join(self.data_directory, latest_file)
            print(f"📊 Auto-loading latest patient data: {latest_file}")
            
            patients = self._load_excel_file(file_path)
            
            # Cache patients
            self.patient_cache.clear()
            for patient in patients:
                self.patient_cache[patient.patient_id] = patient
            
            print(f"✅ Loaded {len(patients)} patients from {latest_file}")
            
        except Exception as e:
            print(f"⚠️  Auto-load failed: {e}")
    
    def get_available_files(self) -> List[Dict[str, Any]]:
        """Get list of available Excel files in the data directory."""
        try:
            excel_files = [f for f in os.listdir(self.data_directory) if f.endswith(('.xlsx', '.xls'))]
            
            file_info = []
            for file in excel_files:
                file_path = os.path.join(self.data_directory, file)
                stat = os.stat(file_path)
                
                file_info.append({
                    "filename": file,
                    "size": stat.st_size,
                    "modified": datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
                    "path": file_path
                })
            
            # Sort by modification time (newest first)
            file_info.sort(key=lambda x: x["modified"], reverse=True)
            return file_info
            
        except Exception as e:
            print(f"Error getting available files: {e}")
            return []
    
    def load_specific_file(self, filename: str) -> int:
        """Load a specific Excel file by filename."""
        file_path = os.path.join(self.data_directory, filename)
        
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {filename}")
        
        print(f"📊 Loading patient data from: {filename}")
        patients = self._load_excel_file(file_path)
        
        # Cache patients
        self.patient_cache.clear()
        for patient in patients:
            self.patient_cache[patient.patient_id] = patient
        
        print(f"✅ Loaded {len(patients)} patients from {filename}")
        return len(patients)
    
    def refresh_data(self) -> int:
        """Refresh data by reloading the most recent file."""
        self._auto_load_data()
        return len(self.patient_cache)
    
    def _load_excel_file(self, file_path: str) -> List[ComprehensivePatientData]:
        """Load and parse Excel file into patient data objects."""
        try:
            # Read Excel file
            df = pd.read_excel(file_path)
            
            # Basic check for completely empty file
            if df.empty:
                raise ValueError("Excel file is empty")
            
            patients = []
            for _, row in df.iterrows():
                try:
                    patient = self._row_to_comprehensive_patient_data(row)
                    patients.append(patient)
                except Exception as e:
                    # Skip problematic rows but continue processing
                    print(f"⚠️  Warning: Skipping row due to error: {e}")
                    continue
            
            if not patients:
                raise ValueError("No valid patient data could be processed from the file")
            
            return patients
            
        except Exception as e:
            raise Exception(f"Error loading Excel file: {str(e)}")
    
    def _row_to_comprehensive_patient_data(self, row) -> ComprehensivePatientData:
        """Convert a pandas row to ComprehensivePatientData object."""
        
        # Helper function to get value from multiple possible column names
        def get_value(row, *possible_names):
            for name in possible_names:
                if name in row and pd.notna(row[name]) and row[name] != '':
                    return str(row[name])
            return ''
        
        return ComprehensivePatientData(
            # Basic Information
            patient_id=get_value(row, 'PatientID', 'Patient ID', 'patient_id', 'ID'),
            name=get_value(row, 'Name', 'name', 'Patient Name'),
            gender=get_value(row, 'Gender', 'gender', 'Sex'),
            age=self._safe_int(row.get('Age', row.get('age'))),
            mrn=get_value(row, 'MRN', 'mrn', 'Medical Record Number'),
            address=get_value(row, 'Address', 'address', 'Patient Address'),
            phone=get_value(row, 'Contact Number', 'Phone', 'phone', 'Contact', 'Phone Number'),
            emergency_contact=get_value(row, 'Emergency Contact', 'emergency_contact', 'Emergency Contact Name'),
            emergency_contact_phone=get_value(row, 'Emergency Contact Phone', 'emergency_contact_phone', 'Emergency Phone'),
            
            # ICU Information
            icu_admission_date=self._safe_date(row.get('ICU Admission Date', row.get('icu_admission_date'))),
            icu_discharge_date=self._safe_date(row.get('ICU Discharge Date', row.get('icu_discharge_date'))),
            length_of_stay_days=self._safe_int(row.get('Length of Stay (Days)', row.get('length_of_stay_days', row.get('Length of Stay')))),
            primary_icu_diagnosis=get_value(row, 'Primary ICU Diagnosis', 'primary_icu_diagnosis', 'Primary Diagnosis', 'Diagnosis'),
            secondary_diagnoses=get_value(row, 'Secondary Diagnoses', 'secondary_diagnoses', 'Secondary Diagnosis'),
            allergies=get_value(row, 'Allergies', 'allergies', 'Allergy'),
            
            # Medication Information
            medication=get_value(row, 'Medication', 'medication', 'Drug', 'Med'),
            dosage=get_value(row, 'Dosage', 'dosage', 'Dose'),
            frequency=get_value(row, 'Frequency', 'frequency', 'Freq'),
            route=get_value(row, 'Route', 'route', 'Administration Route'),
            duration_of_therapy=get_value(row, 'Duration of Therapy', 'duration_of_therapy', 'Duration'),
            vascular_access=get_value(row, 'Vascular Access', 'vascular_access', 'IV Access'),
            prescriber_name=get_value(row, 'Prescriber Name', 'prescriber_name', 'Doctor', 'Physician'),
            prescriber_contact=get_value(row, 'Prescriber Contact', 'prescriber_contact', 'Doctor Phone'),
            npi_number=get_value(row, 'NPI Number', 'npi_number', 'NPI'),
            
            # Nursing Care
            skilled_nursing_needed=get_value(row, 'Skilled Nursing Needed', 'skilled_nursing_needed', 'Nursing Required'),
            nursing_visit_frequency=get_value(row, 'Nursing Visit Frequency', 'nursing_visit_frequency', 'Visit Frequency'),
            type_of_nursing_care=get_value(row, 'Type of Nursing Care', 'type_of_nursing_care', 'Nursing Care Type'),
            nurse_agency=get_value(row, 'Nurse Agency', 'nurse_agency', 'Home Health Agency'),
            emergency_contact_procedure=get_value(row, 'Emergency Contact Procedure', 'emergency_contact_procedure', 'Emergency Procedure'),
            
            # Equipment and DME
            equipment_needed=get_value(row, 'Equipment Needed', 'equipment_needed', 'DME Required', 'Medical Equipment'),
            equipment_delivery_date=self._safe_date(row.get('Equipment Delivery Date', row.get('equipment_delivery_date'))),
            dme_supplier=get_value(row, 'DME Supplier', 'dme_supplier', 'Equipment Supplier'),
            
            # Additional Services
            physical_therapy=get_value(row, 'Physical Therapy', 'physical_therapy', 'PT'),
            occupational_therapy=get_value(row, 'Occupational Therapy', 'occupational_therapy', 'OT'),
            speech_therapy=get_value(row, 'Speech Therapy', 'speech_therapy', 'ST'),
            transportation_needed=get_value(row, 'Transportation Needed', 'transportation_needed', 'Transport'),
            
            # Insurance and Administrative
            insurance_coverage_status=get_value(row, 'Insurance Coverage Status', 'insurance_coverage_status', 'Insurance Status'),
            follow_up_appointment_date=self._safe_date(row.get('Follow-up Appointment Date', row.get('follow_up_appointment_date'))),
            follow_up_provider=get_value(row, 'Follow-up Provider', 'follow_up_provider', 'Follow-up Doctor'),
            special_instructions=get_value(row, 'Special Instructions', 'special_instructions', 'Notes', 'Instructions')
        )
    
    def _safe_int(self, value) -> Optional[int]:
        """Safely convert value to integer."""
        if pd.isna(value) or value == '' or value is None:
            return None
        try:
            return int(float(value))
        except (ValueError, TypeError):
            return None
    
    def _safe_date(self, value) -> Optional[str]:
        """Safely convert value to date string."""
        if pd.isna(value) or value == '' or value is None:
            return None
        try:
            if isinstance(value, str):
                return value
            return value.strftime('%Y-%m-%d') if hasattr(value, 'strftime') else str(value)
        except (ValueError, TypeError, AttributeError):
            return None
    
    # Keep existing methods for compatibility
    def get_patient(self, patient_id: str) -> ComprehensivePatientData:
        """Retrieve patient data from cache."""
        if patient_id not in self.patient_cache:
            raise ValueError(f"Patient {patient_id} not found")
        return self.patient_cache[patient_id]
    
    def list_patients(self) -> List[ComprehensivePatientData]:
        """List all cached patient data."""
        return list(self.patient_cache.values())
    
    def get_patient_summary(self) -> Dict[str, Any]:
        """Get summary of loaded patient data."""
        if not self.patient_cache:
            return {
                "total_patients": 0,
                "data_directory": self.data_directory,
                "status": "No data loaded",
                "available_files": self.get_available_files()
            }
        
        return {
            "total_patients": len(self.patient_cache),
            "data_directory": self.data_directory,
            "patients": [
                {
                    "id": patient.patient_id,
                    "name": patient.name,
                    "diagnosis": patient.primary_icu_diagnosis
                }
                for patient in self.patient_cache.values()
            ],
            "status": "Data loaded successfully",
            "available_files": self.get_available_files()
        }
