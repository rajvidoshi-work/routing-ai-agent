import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdonixHeader from '../components/AdonixHeader';

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

  // Styles - Updated to match login/dashboard/patient details theme
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e8f4fd 0%, #f0f9ff 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(14, 165, 233, 0.1)',
    padding: '24px 32px',
    marginBottom: '32px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0',
    color: '#1e293b',
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
    background: 'transparent',
    border: '2px solid #0ea5e9',
    color: '#0ea5e9',
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
    transition: 'all 0.3s ease'
  };

  const formCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '32px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '700',
    color: '#475569',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 20px',
    border: '2px solid #f1f5f9',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    background: '#f8fafc',
    transition: 'all 0.3s ease'
  };

  const buttonStyle: React.CSSProperties = {
    background: loading ? 
      'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 
      'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: 'white',
    padding: '16px 32px',
    border: 'none',
    borderRadius: '16px',
    fontSize: '16px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    letterSpacing: '0.025em',
    boxShadow: loading ? 'none' : '0 8px 32px rgba(14, 165, 233, 0.3)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%'
  };

  const messageStyle: React.CSSProperties = {
    marginTop: '20px',
    padding: '16px 20px',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: message.includes('✅') ? '#e0f2fe' : '#fef2f2',
    color: message.includes('✅') ? '#0ea5e9' : '#dc2626',
    border: `1px solid ${message.includes('✅') ? '#bae6fd' : '#fecaca'}`,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(20px)'
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
      <AdonixHeader 
        showBackButton={true}
        backButtonText="← Back to Results"
        backButtonPath="/results"
      />
      <style>{spinnerCSS}</style>
      <div style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={titleStyle}>
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
              borderBottom: '2px solid #f1f5f9',
              paddingBottom: '16px',
              marginBottom: '24px'
            }}>
              <h2 style={{
                color: '#0ea5e9',
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
            </div>

            {!pharmacyForm.submitted ? (
              <form onSubmit={handlePharmacyFormSubmit}>
                {/* Patient Information Section */}
                <div style={{ 
                  backgroundColor: '#f8fafc', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  border: '1px solid #f1f5f9'
                }}>
                  <h4 style={{ 
                    color: '#0ea5e9', 
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
                  backgroundColor: '#e0f2fe', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  border: '1px solid #bae6fd'
                }}>
                  <h4 style={{ 
                    color: '#0ea5e9', 
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
                  border: '1px solid #bae6fd'
                }}>
                  <h4 style={{ 
                    color: '#0ea5e9', 
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
                  backgroundColor: '#f0f9ff', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  border: '1px solid #bae6fd'
                }}>
                  <h4 style={{ 
                    color: '#0ea5e9', 
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
                  backgroundColor: '#f0f9ff', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  border: '1px solid #bae6fd'
                }}>
                  <h4 style={{ 
                    color: '#0ea5e9', 
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
                    placeholder="Any additional information, allergies, preferred pharmacy, or special medication instructions..."
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
                      Submit Pharmacy Order Form
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div>
                <div style={{
                  backgroundColor: '#e0f2fe',
                  color: '#0ea5e9',
                  padding: '20px',
                  borderRadius: '16px',
                  marginBottom: '24px',
                  border: '1px solid #bae6fd',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  Pharmacy Order Form Submitted Successfully!
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                  <button
                    onClick={() => {
                      // Future: Generate PDF or print functionality
                      alert('Print/Export functionality - Coming Soon!\n\nThis will allow you to print or export the pharmacy order form.');
                    }}
                    style={{
                      backgroundColor: '#0ea5e9',
                      color: 'white',
                      padding: '16px 32px',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 8px 32px rgba(14, 165, 233, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <span>🖨️</span>
                    Print Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PharmacyOrderForm;
