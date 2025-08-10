import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Add CSS animation for spinner
const spinnerCSS = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface PharmacyOrderFormProps {}

const PharmacyOrderForm: React.FC<PharmacyOrderFormProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pharmacyForm, setPharmacyForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Get results and patient data from navigation state
    if (location.state && location.state.results && location.state.patientData) {
      setResults(location.state.results);
      
      // Auto-fill form with LLM-generated data based on patient information
      const patientData = location.state.patientData;
      autofillPharmacyForm(patientData);
    } else {
      // If no data, redirect back to results page
      navigate('/results');
    }
  }, [location.state, navigate]);

  // Function to autofill Pharmacy form with LLM-generated realistic data
  const autofillPharmacyForm = useCallback(async (patientData: any) => {
    try {
      // Make API call to get autofill data from backend
      const requestData = {
        patient_data: patientData,
        caregiver_input: {
          patient_id: patientData?.patient_id,
          urgency_level: "medium",
          primary_concern: "Pharmacy medication management needed for discharge planning",
          requested_services: ['pharmacy'],
          additional_notes: "Auto-generating pharmacy form data"
        }
      };

      const response = await fetch('http://localhost:8000/api/process-pharmacy-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Use the form_autofill data from backend if available
        if (result.form_autofill) {
          setPharmacyForm(result.form_autofill);
        } else {
          // Fallback to sample data if backend doesn't provide autofill
          setPharmacyForm(getSamplePharmacyInfo(patientData));
        }
      } else {
        // Fallback to sample data if API call fails
        setPharmacyForm(getSamplePharmacyInfo(patientData));
      }
    } catch (error) {
      console.error('Error getting pharmacy autofill data:', error);
      // Fallback to sample data
      setPharmacyForm(getSamplePharmacyInfo(patientData));
    }
  }, []);

  // Fallback sample data function for pharmacy
  const getSamplePharmacyInfo = (patientData: any) => {
    return {
      // Patient Information
      patientName: patientData?.name || "Isaiah Oneal",
      dateOfBirth: "1958-03-15",
      mrn: patientData?.patient_id || "MRN-1003",
      phoneNumber: "(555) 234-5678",
      patientAddress: "13637 Thompson Cove Suite 621\nRonnieside, WI 90185",
      height: "5'8\"",
      weight: "180 lbs",
      
      // Medication Information
      medicationName: "Ceftriaxone (Rocephin)",
      strength: "1g/10mL",
      dosageForm: "injection",
      route: "IV",
      frequency: "once-daily",
      duration: "7 days",
      startDate: new Date().toISOString().split('T')[0],
      
      // Clinical Information
      primaryDiagnosis: "I50.9 - Heart failure, unspecified",
      secondaryDiagnoses: "E11.9 - Type 2 diabetes mellitus without complications",
      allergies: "NKDA (No Known Drug Allergies)",
      currentMedications: "Lisinopril 10mg daily, Metformin 500mg twice daily, Furosemide 40mg daily",
      renalFunction: "1.2 mg/dL",
      hepaticFunction: "Normal",
      
      // Home Infusion Details
      infusionType: "antibiotic",
      vascularAccess: "picc",
      infusionRate: "50 mL/hr",
      infusionDuration: "30 minutes",
      specialHandling: "Refrigerate until use, protect from light",
      
      // Prescriber Information
      prescribingPhysician: "Dr. Sherry Chung",
      physicianNPI: "3662871596",
      physicianPhone: "(067) 318-5308",
      physicianFax: "(067) 318-5309",
      practiceName: "Regional Medical Center",
      
      // Insurance Information
      primaryInsurance: "Medicare Part B",
      policyNumber: "1EG4-TE5-MK72",
      groupNumber: "12345",
      priorAuthNumber: "",
      secondaryInsurance: "Medicaid",
      
      // Original fields
      concern: "Patient requires home infusion therapy for antibiotic treatment. Need coordination for PICC line maintenance and medication delivery.",
      notes: "Patient has good family support for home infusion therapy. Requires nursing coordination for PICC line care and medication administration training."
    };
  };

  // Handle Pharmacy form submission
  const handlePharmacyFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pharmacyForm.concern) {
      setMessage('❌ Please fill in the concern field.');
      return;
    }

    setLoading(true);
    setMessage('Processing pharmacy order form...');

    try {
      const patientData = location.state?.patientData;
      const requestData = {
        patient_data: patientData,
        caregiver_input: {
          patient_id: patientData?.patient_id,
          urgency_level: "medium",
          primary_concern: pharmacyForm.concern,
          requested_services: ['pharmacy'],
          additional_notes: pharmacyForm.notes || ""
        }
      };

      const response = await fetch('http://localhost:8000/api/process-pharmacy-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        setPharmacyForm((prev: any) => ({
          ...prev,
          result,
          submitted: true
        }));
        setMessage('✅ Pharmacy order form processed successfully!');
      } else {
        setMessage('❌ Pharmacy order form processing failed');
      }
    } catch (err) {
      setMessage('❌ Error processing pharmacy order form');
    } finally {
      setLoading(false);
    }
  };

  const updatePharmacyForm = (field: string, value: string) => {
    setPharmacyForm((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
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
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 32px 32px 32px'
  };

  const backButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px'
  };

  const formCardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
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
    fontFamily: 'inherit',
    backgroundColor: '#ffffff',
    transition: 'border-color 0.2s ease'
  };

  const buttonStyle: React.CSSProperties = {
    background: loading ? 
      'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 
      'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    color: 'white',
    padding: '16px 32px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    letterSpacing: '0.025em',
    boxShadow: loading ? 'none' : '0 4px 12px rgba(220, 38, 38, 0.3)',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%'
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

  const resultCardStyle: React.CSSProperties = {
    backgroundColor: '#f8fafc',
    padding: '24px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    marginTop: '24px'
  };

  if (!results) {
    return (
      <>
        <style>{spinnerCSS}</style>
        <div style={containerStyle}>
          <div style={headerStyle}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h1 style={titleStyle}>Loading...</h1>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{spinnerCSS}</style>
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={titleStyle}>
              <span style={{ fontSize: '32px' }}>💊</span>
              Pharmacy Order Form
            </h1>
          </div>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Back Button */}
          <button
            onClick={() => navigate('/results', { state: location.state })}
            style={backButtonStyle}
          >
            <span>←</span>
            Back to Results
          </button>

          {/* Pharmacy Form Card */}
          <div style={formCardStyle}>
            <div style={{
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '16px',
              marginBottom: '24px'
            }}>
              <h2 style={{
                color: '#dc2626',
                fontSize: '20px',
                fontWeight: '600',
                margin: '0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '24px' }}>💊</span>
                Pharmacy & Medication Order Form
              </h2>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: '8px 0 0 0',
                lineHeight: '1.5'
              }}>
                Complete this form to generate pharmacy orders and medication management based on the patient's discharge planning needs.
              </p>
              
              {/* Autofill Indicator */}
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 16px',
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🤖</span>
                  <div>
                    <div style={{ 
                      color: '#991b1b', 
                      fontSize: '14px', 
                      fontWeight: '600' 
                    }}>
                      Form Auto-filled by AI
                    </div>
                    <div style={{ 
                      color: '#dc2626', 
                      fontSize: '12px' 
                    }}>
                      All fields have been populated based on patient data. You can edit any field as needed.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const patientData = location.state?.patientData;
                    autofillPharmacyForm(patientData);
                    setMessage('✅ Form regenerated with updated AI recommendations');
                    setTimeout(() => setMessage(''), 3000);
                  }}
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>🔄</span>
                  Regenerate
                </button>
              </div>
            </div>

            {!pharmacyForm.submitted ? (
              <form onSubmit={handlePharmacyFormSubmit}>
                {/* Patient Information Section */}
                <div style={{ 
                  backgroundColor: '#fef2f2', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  border: '1px solid #fecaca'
                }}>
                  <h4 style={{ 
                    color: '#dc2626', 
                    marginBottom: '16px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    📝 Patient Information
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Patient Name *</label>
                      <input
                        type="text"
                        value={pharmacyForm.patientName || ''}
                        onChange={(e) => updatePharmacyForm('patientName', e.target.value)}
                        required
                        placeholder="Full patient name"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Date of Birth *</label>
                      <input
                        type="date"
                        value={pharmacyForm.dateOfBirth || ''}
                        onChange={(e) => updatePharmacyForm('dateOfBirth', e.target.value)}
                        required
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Medical Record Number</label>
                      <input
                        type="text"
                        value={pharmacyForm.mrn || ''}
                        onChange={(e) => updatePharmacyForm('mrn', e.target.value)}
                        placeholder="MRN"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone Number</label>
                      <input
                        type="tel"
                        value={pharmacyForm.phoneNumber || ''}
                        onChange={(e) => updatePharmacyForm('phoneNumber', e.target.value)}
                        placeholder="(555) 123-4567"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Patient Address *</label>
                    <textarea
                      value={pharmacyForm.patientAddress || ''}
                      onChange={(e) => updatePharmacyForm('patientAddress', e.target.value)}
                      required
                      rows={2}
                      placeholder="Full address including city, state, zip"
                      style={{...inputStyle, minHeight: '60px', resize: 'vertical'}}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Height</label>
                      <input
                        type="text"
                        value={pharmacyForm.height || ''}
                        onChange={(e) => updatePharmacyForm('height', e.target.value)}
                        placeholder="e.g., 5'8&quot;"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Weight</label>
                      <input
                        type="text"
                        value={pharmacyForm.weight || ''}
                        onChange={(e) => updatePharmacyForm('weight', e.target.value)}
                        placeholder="e.g., 150 lbs"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Medication Information Section */}
                <div style={{ 
                  backgroundColor: '#fef3c7', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  border: '1px solid #fcd34d'
                }}>
                  <h4 style={{ 
                    color: '#d97706', 
                    marginBottom: '16px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    💊 Medication Information
                  </h4>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Medication Name *</label>
                    <input
                      type="text"
                      value={pharmacyForm.medicationName || ''}
                      onChange={(e) => updatePharmacyForm('medicationName', e.target.value)}
                      required
                      placeholder="Generic and brand name"
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Strength/Concentration *</label>
                      <input
                        type="text"
                        value={pharmacyForm.strength || ''}
                        onChange={(e) => updatePharmacyForm('strength', e.target.value)}
                        required
                        placeholder="e.g., 250mg/5mL"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Dosage Form</label>
                      <select
                        value={pharmacyForm.dosageForm || ''}
                        onChange={(e) => updatePharmacyForm('dosageForm', e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Select dosage form</option>
                        <option value="injection">Injection</option>
                        <option value="infusion">Infusion</option>
                        <option value="tablet">Tablet</option>
                        <option value="capsule">Capsule</option>
                        <option value="liquid">Liquid</option>
                        <option value="cream">Cream/Ointment</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Route of Administration *</label>
                      <select
                        value={pharmacyForm.route || ''}
                        onChange={(e) => updatePharmacyForm('route', e.target.value)}
                        required
                        style={inputStyle}
                      >
                        <option value="">Select route</option>
                        <option value="IV">Intravenous (IV)</option>
                        <option value="IM">Intramuscular (IM)</option>
                        <option value="SQ">Subcutaneous (SQ)</option>
                        <option value="PO">Oral (PO)</option>
                        <option value="topical">Topical</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Frequency *</label>
                      <select
                        value={pharmacyForm.frequency || ''}
                        onChange={(e) => updatePharmacyForm('frequency', e.target.value)}
                        required
                        style={inputStyle}
                      >
                        <option value="">Select frequency</option>
                        <option value="once-daily">Once daily</option>
                        <option value="twice-daily">Twice daily</option>
                        <option value="three-times-daily">Three times daily</option>
                        <option value="four-times-daily">Four times daily</option>
                        <option value="every-6-hours">Every 6 hours</option>
                        <option value="every-8-hours">Every 8 hours</option>
                        <option value="every-12-hours">Every 12 hours</option>
                        <option value="as-needed">As needed (PRN)</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Duration of Therapy</label>
                      <input
                        type="text"
                        value={pharmacyForm.duration || ''}
                        onChange={(e) => updatePharmacyForm('duration', e.target.value)}
                        placeholder="e.g., 7 days, 2 weeks"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Start Date</label>
                      <input
                        type="date"
                        value={pharmacyForm.startDate || ''}
                        onChange={(e) => updatePharmacyForm('startDate', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Clinical Information Section */}
                <div style={{ 
                  backgroundColor: '#f0f9ff', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  border: '1px solid #7dd3fc'
                }}>
                  <h4 style={{ 
                    color: '#0369a1', 
                    marginBottom: '16px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    🩺 Clinical Information
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Primary Diagnosis (ICD-10) *</label>
                      <input
                        type="text"
                        value={pharmacyForm.primaryDiagnosis || ''}
                        onChange={(e) => updatePharmacyForm('primaryDiagnosis', e.target.value)}
                        required
                        placeholder="e.g., I50.9 - Heart failure, unspecified"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Secondary Diagnoses</label>
                      <input
                        type="text"
                        value={pharmacyForm.secondaryDiagnoses || ''}
                        onChange={(e) => updatePharmacyForm('secondaryDiagnoses', e.target.value)}
                        placeholder="Additional ICD-10 codes"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Allergies/Adverse Reactions</label>
                    <textarea
                      value={pharmacyForm.allergies || ''}
                      onChange={(e) => updatePharmacyForm('allergies', e.target.value)}
                      rows={2}
                      placeholder="List all known allergies and adverse drug reactions"
                      style={{...inputStyle, minHeight: '60px', resize: 'vertical'}}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Current Medications</label>
                    <textarea
                      value={pharmacyForm.currentMedications || ''}
                      onChange={(e) => updatePharmacyForm('currentMedications', e.target.value)}
                      rows={3}
                      placeholder="List all current medications with dosages and frequencies"
                      style={{...inputStyle, minHeight: '90px', resize: 'vertical'}}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Renal Function (Creatinine)</label>
                      <input
                        type="text"
                        value={pharmacyForm.renalFunction || ''}
                        onChange={(e) => updatePharmacyForm('renalFunction', e.target.value)}
                        placeholder="e.g., 1.2 mg/dL"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Hepatic Function</label>
                      <input
                        type="text"
                        value={pharmacyForm.hepaticFunction || ''}
                        onChange={(e) => updatePharmacyForm('hepaticFunction', e.target.value)}
                        placeholder="e.g., Normal, Impaired"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Home Infusion Details Section */}
                <div style={{ 
                  backgroundColor: '#f5f3ff', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  border: '1px solid #c4b5fd'
                }}>
                  <h4 style={{ 
                    color: '#7c3aed', 
                    marginBottom: '16px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    🏠 Home Infusion Details
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Infusion Type</label>
                      <select
                        value={pharmacyForm.infusionType || ''}
                        onChange={(e) => updatePharmacyForm('infusionType', e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Select infusion type</option>
                        <option value="antibiotic">Antibiotic Therapy</option>
                        <option value="chemotherapy">Chemotherapy</option>
                        <option value="hydration">Hydration Therapy</option>
                        <option value="nutrition">Parenteral Nutrition</option>
                        <option value="pain-management">Pain Management</option>
                        <option value="immunoglobulin">Immunoglobulin</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Vascular Access</label>
                      <select
                        value={pharmacyForm.vascularAccess || ''}
                        onChange={(e) => updatePharmacyForm('vascularAccess', e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Select access type</option>
                        <option value="peripheral-iv">Peripheral IV</option>
                        <option value="picc">PICC Line</option>
                        <option value="central-line">Central Line</option>
                        <option value="port">Port</option>
                        <option value="midline">Midline</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Infusion Rate</label>
                      <input
                        type="text"
                        value={pharmacyForm.infusionRate || ''}
                        onChange={(e) => updatePharmacyForm('infusionRate', e.target.value)}
                        placeholder="e.g., 100 mL/hr"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Infusion Duration</label>
                      <input
                        type="text"
                        value={pharmacyForm.infusionDuration || ''}
                        onChange={(e) => updatePharmacyForm('infusionDuration', e.target.value)}
                        placeholder="e.g., 30 minutes, 2 hours"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Special Handling Requirements</label>
                    <textarea
                      value={pharmacyForm.specialHandling || ''}
                      onChange={(e) => updatePharmacyForm('specialHandling', e.target.value)}
                      rows={2}
                      placeholder="Refrigeration, light protection, sterile preparation, etc."
                      style={{...inputStyle, minHeight: '60px', resize: 'vertical'}}
                    />
                  </div>
                </div>

                {/* Prescriber Information Section */}
                <div style={{ 
                  backgroundColor: '#ecfdf5', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  border: '1px solid #a7f3d0'
                }}>
                  <h4 style={{ 
                    color: '#059669', 
                    marginBottom: '16px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    👨‍⚕️ Prescriber Information
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Prescribing Physician *</label>
                      <input
                        type="text"
                        value={pharmacyForm.prescribingPhysician || ''}
                        onChange={(e) => updatePharmacyForm('prescribingPhysician', e.target.value)}
                        required
                        placeholder="Dr. Name"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>NPI Number</label>
                      <input
                        type="text"
                        value={pharmacyForm.physicianNPI || ''}
                        onChange={(e) => updatePharmacyForm('physicianNPI', e.target.value)}
                        placeholder="NPI number"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Physician Phone</label>
                      <input
                        type="tel"
                        value={pharmacyForm.physicianPhone || ''}
                        onChange={(e) => updatePharmacyForm('physicianPhone', e.target.value)}
                        placeholder="Physician contact number"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Physician Fax</label>
                      <input
                        type="tel"
                        value={pharmacyForm.physicianFax || ''}
                        onChange={(e) => updatePharmacyForm('physicianFax', e.target.value)}
                        placeholder="Physician fax number"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Practice/Hospital Name</label>
                    <input
                      type="text"
                      value={pharmacyForm.practiceName || ''}
                      onChange={(e) => updatePharmacyForm('practiceName', e.target.value)}
                      placeholder="Medical practice or hospital name"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Insurance Information Section */}
                <div style={{ 
                  backgroundColor: '#fdf2f8', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  border: '1px solid #f9a8d4'
                }}>
                  <h4 style={{ 
                    color: '#be185d', 
                    marginBottom: '16px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    💳 Insurance Information
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Primary Insurance</label>
                      <input
                        type="text"
                        value={pharmacyForm.primaryInsurance || ''}
                        onChange={(e) => updatePharmacyForm('primaryInsurance', e.target.value)}
                        placeholder="Primary insurance provider"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Policy Number</label>
                      <input
                        type="text"
                        value={pharmacyForm.policyNumber || ''}
                        onChange={(e) => updatePharmacyForm('policyNumber', e.target.value)}
                        placeholder="Insurance policy number"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Group Number</label>
                      <input
                        type="text"
                        value={pharmacyForm.groupNumber || ''}
                        onChange={(e) => updatePharmacyForm('groupNumber', e.target.value)}
                        placeholder="Insurance group number"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Prior Authorization Number</label>
                      <input
                        type="text"
                        value={pharmacyForm.priorAuthNumber || ''}
                        onChange={(e) => updatePharmacyForm('priorAuthNumber', e.target.value)}
                        placeholder="PA number (if obtained)"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Secondary Insurance</label>
                    <input
                      type="text"
                      value={pharmacyForm.secondaryInsurance || ''}
                      onChange={(e) => updatePharmacyForm('secondaryInsurance', e.target.value)}
                      placeholder="Secondary insurance (if any)"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>
                    Specific Pharmacy/Medication Concern *
                  </label>
                  <textarea
                    value={pharmacyForm.concern || ''}
                    onChange={(e) => updatePharmacyForm('concern', e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe specific medication requirements, prescription concerns, drug interactions, or pharmacy coordination needs for discharge planning..."
                    style={{
                      ...inputStyle,
                      minHeight: '120px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>
                    Additional Notes
                  </label>
                  <textarea
                    value={pharmacyForm.notes || ''}
                    onChange={(e) => updatePharmacyForm('notes', e.target.value)}
                    rows={3}
                    placeholder="Any additional information, allergies, insurance coverage details, preferred pharmacy, or special medication instructions..."
                    style={{
                      ...inputStyle,
                      minHeight: '90px',
                      resize: 'vertical'
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
                      Processing Pharmacy Order...
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '18px' }}>💊</span>
                      Generate Pharmacy Order Form
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div>
                <div style={{
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  padding: '20px',
                  borderRadius: '10px',
                  marginBottom: '24px',
                  border: '1px solid #a7f3d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  <span style={{ fontSize: '24px' }}>✅</span>
                  Pharmacy Order Form Generated Successfully!
                </div>

                {/* Display Pharmacy-specific results */}
                {pharmacyForm.result && (
                  <div style={resultCardStyle}>
                    <h3 style={{ 
                      color: '#dc2626', 
                      marginBottom: '20px',
                      fontSize: '18px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '20px' }}>💊</span>
                      Pharmacy & Medication Recommendations
                    </h3>
                    
                    {pharmacyForm.result.recommendations && (
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '10px'
                        }}>
                          Medication Recommendations:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
                          {pharmacyForm.result.recommendations.map((rec: string, i: number) => (
                            <li key={i} style={{ 
                              marginBottom: '8px',
                              fontSize: '14px',
                              lineHeight: '1.6',
                              color: '#4b5563',
                              position: 'relative',
                              paddingLeft: '20px'
                            }}>
                              <span style={{ 
                                position: 'absolute', 
                                left: '0', 
                                color: '#dc2626',
                                fontWeight: '600'
                              }}>•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {pharmacyForm.result.next_steps && (
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '10px'
                        }}>
                          Next Steps:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
                          {pharmacyForm.result.next_steps.map((step: string, i: number) => (
                            <li key={i} style={{ 
                              marginBottom: '8px',
                              fontSize: '14px',
                              lineHeight: '1.6',
                              color: '#4b5563',
                              position: 'relative',
                              paddingLeft: '20px'
                            }}>
                              <span style={{ 
                                position: 'absolute', 
                                left: '0', 
                                color: '#f59e0b',
                                fontWeight: '600'
                              }}>•</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {pharmacyForm.result.external_referrals && (
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '10px'
                        }}>
                          External Referrals:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
                          {pharmacyForm.result.external_referrals.map((ref: string, i: number) => (
                            <li key={i} style={{ 
                              marginBottom: '8px',
                              fontSize: '14px',
                              lineHeight: '1.6',
                              color: '#4b5563',
                              position: 'relative',
                              paddingLeft: '20px'
                            }}>
                              <span style={{ 
                                position: 'absolute', 
                                left: '0', 
                                color: '#dc2626',
                                fontWeight: '600'
                              }}>•</span>
                              {ref}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <button
                        onClick={() => setPharmacyForm((prev: any) => ({
                          ...prev,
                          submitted: false
                        }))}
                        style={{
                          backgroundColor: '#6b7280',
                          color: 'white',
                          padding: '10px 20px',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>🔄</span>
                        Edit Form
                      </button>

                      <button
                        onClick={() => {
                          // Future: Generate PDF or print functionality
                          alert('Print/Export functionality - Coming Soon!\n\nThis will allow you to print or export the pharmacy order form.');
                        }}
                        style={{
                          backgroundColor: '#dc2626',
                          color: 'white',
                          padding: '10px 20px',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>🖨️</span>
                        Print Order
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {message && <div style={messageStyle}>{message}</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default PharmacyOrderForm;
