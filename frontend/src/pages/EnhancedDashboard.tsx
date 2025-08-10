import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useScrollToTop } from '../hooks/useScrollToTop';
import AdonixHeader from '../components/AdonixHeader';

// Add CSS animation for spinner
const spinnerCSS = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EnhancedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [concern, setConcern] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [prefilledData, setPrefilledData] = useState<any>(null);

  // Scroll to top when component mounts
  useScrollToTop();

  useEffect(() => {
    // Check if we have prefilled data from PatientDetails page
    if (location.state && location.state.prefilledPatient) {
      const prefilledPatient = location.state.prefilledPatient;
      setPrefilledData(prefilledPatient);
      setSelectedPatient(prefilledPatient.patient_id);
      setMessage('Patient data loaded from Patient Details. Please enter your primary concern below.');
    }

    // Load patients from API
    fetch('http://localhost:8000/api/patients')
      .then(res => res.json())
      .then(data => setPatients(data.patients || []))
      .catch(err => setMessage('Failed to load patients'));
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !concern) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    setMessage('Processing discharge planning...');

    try {
      let patientData;
      
      if (prefilledData && prefilledData.patient_id === selectedPatient) {
        // Use prefilled data from PatientDetails
        patientData = prefilledData;
      } else {
        // Use regular patient data from the dropdown
        const patient = patients.find(p => p.patient_id === selectedPatient);
        
        // Determine gender based on patient name (fallback)
        const getGenderFromName = (name: string) => {
          const femaleNames = ['Victoria', 'Sarah', 'Jennifer', 'Mary', 'Lisa'];
          const firstName = name.split(' ')[0];
          return femaleNames.includes(firstName) ? 'Female' : 'Male';
        };
        
        patientData = {
          // Basic Patient Information
          patient_id: patient.patient_id,
          name: patient.name,
          date_of_birth: null,
          gender: getGenderFromName(patient.name),
          mrn: null,
          address: null,
          contact_number: null,
          
          // ICU Stay Information
          icu_admission_date: null,
          icu_discharge_date: null,
          length_of_stay_days: null,
          
          // Medical Information
          primary_icu_diagnosis: patient.primary_diagnosis,
          secondary_diagnoses: null,
          allergies: null,
          
          // Prescriber Information
          prescriber_name: null,
          npi_number: null,
          prescriber_contact: null,
          
          // Medication Information
          medication: patient.medication,
          dosage: null,
          frequency: null,
          duration_of_therapy: null,
          route: null,
          vascular_access: null,
          
          // Nursing Care
          skilled_nursing_needed: patient.skilled_nursing_needed,
          nursing_visit_frequency: null,
          type_of_nursing_care: null,
          nurse_agency: null,
          emergency_contact_procedure: null,
          
          // Equipment/DME
          equipment_needed: patient.equipment_needed,
          equipment_delivery_date: null,
          dme_supplier: null,
          
          // Administrative
          insurance_coverage_status: patient.insurance_coverage_status,
          follow_up_appointment_date: null,
          
          // Additional Services
          dietician_referral: null,
          physical_therapy: null,
          transportation_needed: null,
          special_instructions: null
        };
      }

      const requestData = {
        patient_data: patientData,
        caregiver_input: {
          patient_id: selectedPatient,
          urgency_level: "medium",
          primary_concern: concern,
          requested_services: [],
          additional_notes: prefilledData ? "Data loaded from Patient Details page" : ""
        }
      };

      const response = await fetch('http://localhost:8000/api/process-complete-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();
      
      // Navigate to results page
      navigate('/results', { 
        state: { 
          results: results,
          patientData: patientData
        } 
      });

    } catch (error) {
      console.error('Error:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdonixHeader 
        showBackButton={true}
        backButtonText="← Back to Patient Details"
        backButtonPath="/patient-details"
      />
      <div className="container-fluid" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <style>{spinnerCSS}</style>
      
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0" style={{ borderRadius: '20px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
            <div className="card-header text-center py-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '20px 20px 0 0', border: 'none' }}>
              <h2 className="text-white mb-0" style={{ fontWeight: '700' }}>
                <i className="fas fa-hospital-user me-3"></i>
                Discharge Planning Dashboard
              </h2>
              <p className="text-white-50 mb-0 mt-2">AI-Powered Healthcare Coordination</p>
            </div>
            
            <div className="card-body p-5">
              {prefilledData && (
                <div className="alert alert-info mb-4" style={{ borderRadius: '15px', border: 'none', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Patient data loaded from Patient Details!</strong><br/>
                  Patient: <strong>{prefilledData.name}</strong> ({prefilledData.patient_id})<br/>
                  Diagnosis: <strong>{prefilledData.primary_icu_diagnosis}</strong>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">
                    <i className="fas fa-user-injured me-2 text-primary"></i>
                    Select Patient
                  </label>
                  <select 
                    className="form-select form-select-lg" 
                    value={selectedPatient} 
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    style={{ borderRadius: '15px', border: '2px solid #e9ecef', padding: '15px' }}
                    disabled={!!prefilledData}
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map(patient => (
                      <option key={patient.patient_id} value={patient.patient_id}>
                        {patient.name} ({patient.patient_id}) - {patient.primary_diagnosis}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">
                    <i className="fas fa-clipboard-list me-2 text-warning"></i>
                    Primary Concern
                  </label>
                  <textarea 
                    className="form-control form-control-lg" 
                    rows={4}
                    value={concern} 
                    onChange={(e) => setConcern(e.target.value)}
                    placeholder="Describe the primary concern for discharge planning..."
                    style={{ borderRadius: '15px', border: '2px solid #e9ecef', padding: '15px' }}
                  />
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-lg fw-bold text-white"
                    disabled={loading}
                    style={{ 
                      borderRadius: '15px', 
                      padding: '15px',
                      background: loading ? '#6c757d' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      border: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? (
                      <>
                        <div 
                          className="spinner-border spinner-border-sm me-2" 
                          style={{ animation: 'spin 1s linear infinite' }}
                        ></div>
                        Processing Discharge Planning...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-brain me-2"></i>
                        Process Discharge Planning
                      </>
                    )}
                  </button>
                </div>
              </form>

              {message && (
                <div className={`alert mt-4 ${message.includes('Error') ? 'alert-danger' : 'alert-info'}`} style={{ borderRadius: '15px', border: 'none' }}>
                  <i className={`fas ${message.includes('Error') ? 'fa-exclamation-triangle' : 'fa-info-circle'} me-2`}></i>
                  {message}
                </div>
              )}

              <div className="text-center mt-4">
                <small className="text-muted">
                  <i className="fas fa-shield-alt me-1"></i>
                  Powered by AI • Secure • HIPAA Compliant
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default EnhancedDashboard;
