import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Add CSS animation for spinner
const spinnerCSS = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ForcedForm: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [concern, setConcern] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/patients')
      .then(res => res.json())
      .then(data => setPatients(data.patients || []))
      .catch(err => setMessage('Failed to load patients'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !concern) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    setMessage('Processing...');

    try {
      const patient = patients.find(p => p.patient_id === selectedPatient);
      
      // Determine gender based on patient name (fallback)
      const getGenderFromName = (name: string) => {
        const femaleNames = ['Victoria', 'Sarah', 'Jennifer', 'Mary', 'Lisa'];
        const firstName = name.split(' ')[0];
        return femaleNames.includes(firstName) ? 'Female' : 'Male';
      };
      
      const patientData = {
        // Basic Patient Information
        patient_id: patient.patient_id,
        name: patient.name,
        date_of_birth: null,
        gender: patient.gender || getGenderFromName(patient.name),
        mrn: `MRN-${patient.patient_id}`,
        address: patient.address || "123 Main Street, Anytown, ST 12345",
        contact_number: patient.phone || "(555) 123-4567",
        
        // ICU Stay Information
        icu_admission_date: null,
        icu_discharge_date: null,
        length_of_stay_days: 3,
        
        // Medical Information
        primary_icu_diagnosis: patient.primary_diagnosis,
        secondary_diagnoses: patient.secondary_diagnoses || null,
        allergies: patient.allergies || null,
        
        // Prescriber Information
        prescriber_name: "Dr. Sherry Chung",
        npi_number: "3662871596",
        prescriber_contact: "(067) 318-5308",
        
        // Medication Information
        medication: patient.medication || "Heart medication",
        dosage: "As prescribed",
        frequency: "Daily",
        route: "Oral",
        
        // Discharge Planning
        skilled_nursing_needed: patient.skilled_nursing_needed || "Yes",
        equipment_needed: patient.equipment_needed || "Hospital bed, IV pole",
        home_health_services: patient.home_health_services || "Nursing care",
        discharge_destination: patient.discharge_destination || "Home",
        
        // Insurance Information
        insurance_type: patient.insurance_type || "Medicare",
        insurance_coverage_status: patient.insurance_coverage_status || "Active",
        
        // DME Information
        dme_supplier: "Regional DME Services",
        equipment_delivery_date: null,
        
        // Additional Information
        special_instructions: "Patient requires careful monitoring during transition to home care"
      };

      const response = await fetch('http://localhost:8000/api/process-complete-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_data: patientData,
          caregiver_input: {
            patient_id: patient.patient_id,
            urgency_level: "medium",
            primary_concern: concern,
            requested_services: ["nursing", "equipment"],
            additional_notes: "From dashboard form"
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Navigate to results page with data
        navigate('/results', { 
          state: { 
            results: result,
            patientData: patientData
          }
        });
      } else {
        setMessage('❌ Processing failed');
        setLoading(false);
      }
    } catch (err) {
      setMessage('❌ Error occurred');
      setLoading(false);
    }
  };

  // Modern medical UI styles - Direct page layout (no container box)
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
    padding: '0',
    margin: '0'
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    padding: '24px 32px',
    color: 'white',
    marginBottom: '32px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: '700',
    margin: '0',
    letterSpacing: '-0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const contentStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 32px 32px 32px'
  };

  const formCardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '28px',
    marginBottom: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '24px'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#374151',
    fontSize: '14px',
    letterSpacing: '0.025em'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    backgroundColor: '#ffffff'
  };

  const buttonStyle: React.CSSProperties = {
    background: loading ? 
      'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 
      'linear-gradient(135deg, #059669 0%, #047857 100%)',
    color: 'white',
    padding: '16px 32px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    cursor: loading ? 'not-allowed' : 'pointer',
    width: '100%',
    fontWeight: '600',
    letterSpacing: '0.025em',
    boxShadow: loading ? 'none' : '0 4px 12px rgba(5, 150, 105, 0.3)',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const messageStyle: React.CSSProperties = {
    marginTop: '20px',
    padding: '16px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: message.includes('✅') ? '#ecfdf5' : '#fef2f2',
    color: message.includes('✅') ? '#065f46' : '#991b1b',
    border: `1px solid ${message.includes('✅') ? '#a7f3d0' : '#fecaca'}`,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  return (
    <>
      <style>{spinnerCSS}</style>
      <div style={containerStyle}>
        {/* Modern Header - Full Width */}
        <div style={headerStyle}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={titleStyle}>
              <span style={{ fontSize: '32px' }}>🏥</span>
              Discharge Planning Dashboard
            </h1>
          </div>
        </div>

        {/* Content Area - Centered */}
        <div style={contentStyle}>
          {/* Main Form Card */}
          <div style={formCardStyle}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Select Patient *</label>
                  <select 
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    required
                    style={{
                      ...inputStyle,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Choose patient...</option>
                    {patients.map(patient => (
                      <option key={patient.patient_id} value={patient.patient_id}>
                        {patient.name} - {patient.primary_diagnosis}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Urgency Level</label>
                  <select
                    value="medium"
                    style={{
                      ...inputStyle,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="low">🟢 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🔴 High Priority</option>
                  </select>
                </div>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Primary Concern *</label>
                <textarea
                  value={concern}
                  onChange={(e) => setConcern(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe the discharge planning concern in detail..."
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    minHeight: '120px'
                  }}
                />
              </div>

              <button type="submit" disabled={loading} style={buttonStyle}>
                {loading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '18px' }}>🚀</span>
                    Process Discharge Planning
                  </>
                )}
              </button>
            </form>

            {message && <div style={messageStyle}>{message}</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default ForcedForm;
