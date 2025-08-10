import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useScrollToTop } from '../hooks/useScrollToTop';
import AdonixHeader from '../components/AdonixHeader';
import './PatientDetails.css';

interface IntegratedPatientDetailsProps {}

const IntegratedPatientDetails: React.FC<IntegratedPatientDetailsProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Scroll to top when component mounts
  useScrollToTop();

  useEffect(() => {
    // Load patients from the API
    loadPatients();
  }, []);

  useEffect(() => {
    // Check if we have a specific patient ID from dashboard navigation
    if (location.state && location.state.selectedPatientId && patients.length > 0) {
      const patientFromDashboard = patients.find(p => p.patient_id === location.state.selectedPatientId);
      if (patientFromDashboard) {
        setSelectedPatient(patientFromDashboard);
      }
    } else if (patients.length > 0 && !selectedPatient) {
      // Auto-select the first patient if no specific patient was requested
      setSelectedPatient(patients[0]);
    }
  }, [location.state, patients, selectedPatient]);

  const loadPatients = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/patients');
      const data = await response.json();
      if (data.patients && data.patients.length > 0) {
        setPatients(data.patients);
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const handleAIAnalysis = () => {
    if (!selectedPatient) {
      alert('No patient selected');
      return;
    }

    // Create patient data object that matches the expected format
    const patientData = {
      // Basic Patient Information
      patient_id: selectedPatient.patient_id,
      name: selectedPatient.name || 'John Miller',
      date_of_birth: null,
      gender: 'Male', // Default for demo
      mrn: '123456789',
      address: '123 Main St, City, State 12345',
      contact_number: '(555) 123-4567',
      
      // ICU Stay Information
      icu_admission_date: null,
      icu_discharge_date: null,
      length_of_stay_days: 5,
      
      // Medical Information
      primary_icu_diagnosis: selectedPatient.primary_diagnosis || 'Congestive Heart Failure',
      secondary_diagnoses: 'Diabetes Type 2, Hypertension, COPD',
      allergies: 'Penicillin, Shellfish',
      
      // Prescriber Information
      prescriber_name: 'Dr. James Wilson, MD',
      npi_number: '1234567890',
      prescriber_contact: '(555) 987-6543',
      
      // Medication Information
      medication: selectedPatient.medication || 'Lisinopril 10mg, Metformin 500mg, Furosemide 20mg, Carvedilol 3.125mg',
      dosage: 'As prescribed',
      frequency: 'Daily',
      duration_of_therapy: '30 days',
      route: 'Oral',
      vascular_access: 'N/A',
      
      // Nursing Care
      skilled_nursing_needed: selectedPatient.skilled_nursing_needed || 'Yes',
      nursing_visit_frequency: '3x per week',
      type_of_nursing_care: 'Medication management, vital signs monitoring',
      nurse_agency: 'Home Health Plus',
      emergency_contact_procedure: 'Call 911 or contact primary physician',
      
      // Equipment/DME
      equipment_needed: selectedPatient.equipment_needed || 'Hospital bed, oxygen concentrator',
      equipment_delivery_date: null,
      dme_supplier: 'Medical Equipment Co.',
      
      // Administrative
      insurance_coverage_status: selectedPatient.insurance_coverage_status || 'Medicare Primary, BCBS Secondary',
      follow_up_appointment_date: null,
      
      // Additional Services
      dietician_referral: 'Yes',
      physical_therapy: 'Yes',
      transportation_needed: 'Family transport',
      special_instructions: 'Monitor daily weights, low sodium diet'
    };

    // Navigate to the discharge planning dashboard with pre-filled patient data
    navigate('/enhanced-dashboard', { 
      state: { 
        prefilledPatient: patientData,
        fromPatientDetails: true 
      } 
    });
  };

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
  };

  if (!selectedPatient) {
    return (
      <div className="patient-details-container">
        <div className="patient-main">
          <div className="patient-title-section">
            <div className="title-info">
              <h1 className="patient-title">Loading Patient Data...</h1>
              <p className="patient-subtitle">Please wait while we load patient information</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-details-container">
      <AdonixHeader 
        showBackButton={true}
        backButtonText={location.state && location.state.fromDashboard ? '← Back to Dashboard' : '← Back to Data Management'}
        backButtonPath={location.state && location.state.fromDashboard ? '/' : '/manage-data'}
      />
      
      <main className="patient-main">
        <div className="patient-title-section">
          <div className="title-info">
            <h1 className="patient-title">{selectedPatient.name} - Patient Profile</h1>
            <p className="patient-subtitle">
              Room 302A • MRN: 123456789 • DOB: 03/15/1965 • ID: {selectedPatient.patient_id}
            </p>
          </div>
          <div className="action-buttons">
            <button className="ai-analysis-btn" onClick={handleAIAnalysis}>
              Run AI Analysis
            </button>
            <button className="print-btn">Print Summary</button>
          </div>
        </div>
        
        <div className="details-grid">
          <div className="details-section">
            <h3>Patient Information</h3>
            <div className="info-card">
              <h4>Primary Diagnosis</h4>
              <p>{selectedPatient.primary_diagnosis || 'Congestive Heart Failure'}</p>
            </div>
            <div className="info-card">
              <h4>Secondary Conditions</h4>
              <textarea readOnly value="Diabetes Type 2, Hypertension, COPD" />
            </div>
            <div className="info-card">
              <h4>Allergies</h4>
              <p>Penicillin, Shellfish</p>
            </div>
            <div className="info-card">
              <h4>Insurance</h4>
              <p>{selectedPatient.insurance_coverage_status || 'Medicare Primary, BCBS Secondary'}</p>
            </div>
          </div>
          
          <div className="details-section">
            <h3>Discharge Planning</h3>
            <div className="info-card">
              <h4>Planned Discharge Date</h4>
              <div className="date-input">
                <input type="date" defaultValue="2025-08-10" />
                <input type="time" defaultValue="14:00" />
              </div>
            </div>
            <div className="info-card">
              <h4>Discharge Destination</h4>
              <select defaultValue="home">
                <option value="home">Home with Home Health</option>
                <option value="rehab">Rehabilitation Facility</option>
                <option value="nursing">Nursing Home</option>
              </select>
            </div>
            <div className="info-card">
              <h4>Transportation</h4>
              <select defaultValue="family">
                <option value="family">Family</option>
                <option value="ambulance">Ambulance</option>
                <option value="taxi">Medical Taxi</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="details-grid">
          <div className="details-section">
            <h3>Care Team</h3>
            <div className="info-card">
              <h4>Primary Physician</h4>
              <p>Dr. James Wilson, MD</p>
            </div>
            <div className="info-card">
              <h4>Cardiologist</h4>
              <p>Dr. Sarah Kim, MD</p>
            </div>
            <div className="info-card">
              <h4>Primary Contact</h4>
              <p>Jane Miller (Daughter) - (555) 123-4567</p>
            </div>
            <div className="info-card">
              <h4>Emergency Contact</h4>
              <p>Mike Miller (Son) - (555) 987-6543</p>
            </div>
          </div>
          
          <div className="details-section">
            <h3>Current Medications</h3>
            <div className="medications-list">
              <div className="medication-item">
                <strong>Lisinopril 10mg</strong> - Once daily
              </div>
              <div className="medication-item">
                <strong>Metformin 500mg</strong> - Twice daily with meals
              </div>
              <div className="medication-item">
                <strong>Furosemide 20mg</strong> - Once daily morning
              </div>
              <div className="medication-item">
                <strong>Carvedilol 3.125mg</strong> - Twice daily
              </div>
            </div>
            <button className="update-medications-btn">Update Medications</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IntegratedPatientDetails;
