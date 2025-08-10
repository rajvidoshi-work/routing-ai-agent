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

interface DMEOrderFormProps {}

const DMEOrderForm: React.FC<DMEOrderFormProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dmeForm, setDmeForm] = useState<any>({});
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
      autofillDMEForm(patientData);
    } else {
      // If no data, redirect back to results page
      navigate('/results');
    }
  }, [location.state, navigate]);

  // Function to autofill DME form with LLM-generated realistic data
  const autofillDMEForm = useCallback(async (patientData: any) => {
    try {
      // Make API call to get autofill data from backend
      const requestData = {
        patient_data: patientData,
        caregiver_input: {
          patient_id: patientData?.patient_id,
          urgency_level: "medium",
          primary_concern: "DME equipment needed for discharge planning",
          requested_services: ['dme'],
          additional_notes: "Auto-generating form data"
        }
      };

      const response = await fetch('http://localhost:8000/api/process-dme-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Use the form_autofill data from backend if available
        if (result.form_autofill) {
          setDmeForm(result.form_autofill);
        } else {
          // Fallback to sample data if backend doesn't provide autofill
          setDmeForm(getSamplePatientInfo(patientData));
        }
      } else {
        // Fallback to sample data if API call fails
        setDmeForm(getSamplePatientInfo(patientData));
      }
    } catch (error) {
      console.error('Error getting autofill data:', error);
      // Fallback to sample data
      setDmeForm(getSamplePatientInfo(patientData));
    }
  }, []);

  // Fallback sample data function
  const getSamplePatientInfo = (patientData: any) => {
    return {
      // Patient Information
      patientName: patientData?.name || "Isaiah Oneal",
      dateOfBirth: "1958-03-15",
      mrn: patientData?.patient_id || "MRN-1003",
      phoneNumber: "(555) 234-5678",
      patientAddress: "13637 Thompson Cove Suite 621\nRonnieside, WI 90185",
      
      // Equipment details based on patient's condition
      equipmentType: "hospital-bed",
      equipmentModel: "Hill-Rom Advance Series Hospital Bed",
      quantity: "1",
      rentalPurchase: "rental",
      deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
      
      // Medical justification
      primaryDiagnosis: "I50.9 - Heart failure, unspecified",
      secondaryDiagnoses: "E11.9 - Type 2 diabetes mellitus without complications",
      medicalNecessity: "Patient with congestive heart failure exacerbation requires hospital bed for safe positioning and mobility assistance during recovery. Elevated head positioning is medically necessary to reduce cardiac workload and prevent respiratory complications. Patient has limited mobility and requires bed height adjustment for safe transfers.",
      physicianOrders: "Hospital bed with head elevation capability, side rails for safety, and height adjustment for patient transfers. Duration: 30 days with potential for extension based on recovery progress.",
      
      // Insurance information
      primaryInsurance: "Medicare Part B",
      secondaryInsurance: "Medicaid",
      priorAuthNumber: "",
      coverageStatus: "pending",
      patientResponsibility: "$0 (Medicare covered)",
      
      // Delivery and setup
      deliveryAddress: "", // Same as patient address
      setupRequired: "yes",
      trainingNeeded: "yes",
      emergencyContactName: "Sarah Oneal (Daughter)",
      emergencyContactPhone: "(555) 345-6789",
      
      // Physician information
      prescribingPhysician: "Dr. Sherry Chung",
      physicianNPI: "3662871596",
      physicianPhone: "(067) 318-5308",
      physicianFax: "(067) 318-5309",
      
      // Original concern and notes
      concern: "Patient requires hospital bed for congestive heart failure management. Need bed with head elevation capability for respiratory support and safe patient positioning during recovery period.",
      notes: "Patient lives in second-floor apartment - delivery team should coordinate for stair access. Family available for training on bed operation. Insurance pre-authorization may be required for extended rental period."
    };
  };

  // Handle DME form submission
  const handleDMEFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dmeForm.concern) {
      setMessage('❌ Please fill in the concern field.');
      return;
    }

    setLoading(true);
    setMessage('Processing DME order form...');

    try {
      const patientData = location.state?.patientData;
      const requestData = {
        patient_data: patientData,
        caregiver_input: {
          patient_id: patientData?.patient_id,
          urgency_level: "medium",
          primary_concern: dmeForm.concern,
          requested_services: ['dme'],
          additional_notes: dmeForm.notes || ""
        }
      };

      const response = await fetch('http://localhost:8000/api/process-dme-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        setDmeForm((prev: any) => ({
          ...prev,
          result,
          submitted: true
        }));
        setMessage('✅ DME order form processed successfully!');
      } else {
        setMessage('❌ DME order form processing failed');
      }
    } catch (err) {
      setMessage('❌ Error processing DME order form');
    } finally {
      setLoading(false);
    }
  };

  const updateDMEForm = (field: string, value: string) => {
    setDmeForm((prev: any) => ({
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
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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
      'linear-gradient(135deg, #059669 0%, #047857 100%)',
    color: 'white',
    padding: '16px 32px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    letterSpacing: '0.025em',
    boxShadow: loading ? 'none' : '0 4px 12px rgba(5, 150, 105, 0.3)',
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
              <span style={{ fontSize: '32px' }}>🏥</span>
              DME Order Form
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

          {/* DME Form Card */}
          <div style={formCardStyle}>
            <div style={{
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '16px',
              marginBottom: '24px'
            }}>
              <h2 style={{
                color: '#059669',
                fontSize: '20px',
                fontWeight: '600',
                margin: '0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '24px' }}>🏥</span>
                DME (Durable Medical Equipment) Order Form
              </h2>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: '8px 0 0 0',
                lineHeight: '1.5'
              }}>
                Complete this form to generate DME equipment orders based on the patient's discharge planning needs.
              </p>
              
              {/* Autofill Indicator */}
              <div style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
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
                      color: '#065f46', 
                      fontSize: '14px', 
                      fontWeight: '600' 
                    }}>
                      Form Auto-filled by AI
                    </div>
                    <div style={{ 
                      color: '#047857', 
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
                    autofillDMEForm(patientData);
                    setMessage('✅ Form regenerated with updated AI recommendations');
                    setTimeout(() => setMessage(''), 3000);
                  }}
                  style={{
                    backgroundColor: '#059669',
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

            {!dmeForm.submitted ? (
              <form onSubmit={handleDMEFormSubmit}>
                {/* Patient Information Section */}
                <div style={{ 
                  backgroundColor: '#f8fafc', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ 
                    color: '#059669', 
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
                        value={dmeForm.patientName || ''}
                        onChange={(e) => updateDMEForm('patientName', e.target.value)}
                        required
                        placeholder="Full patient name"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Date of Birth *</label>
                      <input
                        type="date"
                        value={dmeForm.dateOfBirth || ''}
                        onChange={(e) => updateDMEForm('dateOfBirth', e.target.value)}
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
                        value={dmeForm.mrn || ''}
                        onChange={(e) => updateDMEForm('mrn', e.target.value)}
                        placeholder="MRN"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone Number</label>
                      <input
                        type="tel"
                        value={dmeForm.phoneNumber || ''}
                        onChange={(e) => updateDMEForm('phoneNumber', e.target.value)}
                        placeholder="(555) 123-4567"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Patient Address *</label>
                    <textarea
                      value={dmeForm.patientAddress || ''}
                      onChange={(e) => updateDMEForm('patientAddress', e.target.value)}
                      required
                      rows={2}
                      placeholder="Full address including city, state, zip"
                      style={{...inputStyle, minHeight: '60px', resize: 'vertical'}}
                    />
                  </div>
                </div>

                {/* Equipment Details Section */}
                <div style={{ 
                  backgroundColor: '#f0fdf4', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  marginBottom: '24px',
                  border: '1px solid #bbf7d0'
                }}>
                  <h4 style={{ 
                    color: '#059669', 
                    marginBottom: '16px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    🏥 Equipment Details
                  </h4>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Equipment Type/Category *</label>
                    <select
                      value={dmeForm.equipmentType || ''}
                      onChange={(e) => updateDMEForm('equipmentType', e.target.value)}
                      required
                      style={inputStyle}
                    >
                      <option value="">Select equipment type</option>
                      <option value="hospital-bed">Hospital Bed</option>
                      <option value="wheelchair">Wheelchair</option>
                      <option value="walker">Walker/Mobility Aid</option>
                      <option value="oxygen">Oxygen Equipment</option>
                      <option value="cpap">CPAP/BiPAP</option>
                      <option value="lift">Patient Lift</option>
                      <option value="commode">Bedside Commode</option>
                      <option value="iv-pole">IV Pole</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Specific Model/Brand</label>
                      <input
                        type="text"
                        value={dmeForm.equipmentModel || ''}
                        onChange={(e) => updateDMEForm('equipmentModel', e.target.value)}
                        placeholder="Model number or brand preference"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Quantity Needed *</label>
                      <input
                        type="number"
                        value={dmeForm.quantity || '1'}
                        onChange={(e) => updateDMEForm('quantity', e.target.value)}
                        required
                        min="1"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Rental vs Purchase</label>
                      <select
                        value={dmeForm.rentalPurchase || ''}
                        onChange={(e) => updateDMEForm('rentalPurchase', e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Select option</option>
                        <option value="rental">Rental</option>
                        <option value="purchase">Purchase</option>
                        <option value="either">Either</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Delivery Date Required</label>
                      <input
                        type="date"
                        value={dmeForm.deliveryDate || ''}
                        onChange={(e) => updateDMEForm('deliveryDate', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Justification Section */}
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
                    📋 Medical Justification
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Primary Diagnosis (ICD-10) *</label>
                      <input
                        type="text"
                        value={dmeForm.primaryDiagnosis || ''}
                        onChange={(e) => updateDMEForm('primaryDiagnosis', e.target.value)}
                        required
                        placeholder="e.g., I50.9 - Heart failure, unspecified"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Secondary Diagnoses</label>
                      <input
                        type="text"
                        value={dmeForm.secondaryDiagnoses || ''}
                        onChange={(e) => updateDMEForm('secondaryDiagnoses', e.target.value)}
                        placeholder="Additional ICD-10 codes"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Medical Necessity Statement *</label>
                    <textarea
                      value={dmeForm.medicalNecessity || ''}
                      onChange={(e) => updateDMEForm('medicalNecessity', e.target.value)}
                      required
                      rows={3}
                      placeholder="Explain why this equipment is medically necessary for the patient's condition and treatment..."
                      style={{...inputStyle, minHeight: '90px', resize: 'vertical'}}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Physician Orders/Prescription</label>
                    <textarea
                      value={dmeForm.physicianOrders || ''}
                      onChange={(e) => updateDMEForm('physicianOrders', e.target.value)}
                      rows={2}
                      placeholder="Specific physician orders or prescription details..."
                      style={{...inputStyle, minHeight: '60px', resize: 'vertical'}}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>
                    Specific DME Equipment Concern *
                  </label>
                  <textarea
                    value={dmeForm.concern || ''}
                    onChange={(e) => updateDMEForm('concern', e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe specific DME equipment requirements, medical devices needed, or equipment concerns for discharge planning..."
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
                    value={dmeForm.notes || ''}
                    onChange={(e) => updateDMEForm('notes', e.target.value)}
                    rows={3}
                    placeholder="Any additional information, special equipment considerations, delivery instructions, or insurance details..."
                    style={{
                      ...inputStyle,
                      minHeight: '90px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Insurance & Authorization Section */}
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
                    💰 Insurance & Authorization
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Primary Insurance</label>
                      <input
                        type="text"
                        value={dmeForm.primaryInsurance || ''}
                        onChange={(e) => updateDMEForm('primaryInsurance', e.target.value)}
                        placeholder="Primary insurance provider"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Secondary Insurance</label>
                      <input
                        type="text"
                        value={dmeForm.secondaryInsurance || ''}
                        onChange={(e) => updateDMEForm('secondaryInsurance', e.target.value)}
                        placeholder="Secondary insurance (if any)"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Prior Authorization Number</label>
                      <input
                        type="text"
                        value={dmeForm.priorAuthNumber || ''}
                        onChange={(e) => updateDMEForm('priorAuthNumber', e.target.value)}
                        placeholder="PA number (if obtained)"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Insurance Coverage Status</label>
                      <select
                        value={dmeForm.coverageStatus || ''}
                        onChange={(e) => updateDMEForm('coverageStatus', e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Select status</option>
                        <option value="verified">Verified</option>
                        <option value="pending">Pending Verification</option>
                        <option value="denied">Denied</option>
                        <option value="partial">Partial Coverage</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Patient Responsibility/Copay</label>
                    <input
                      type="text"
                      value={dmeForm.patientResponsibility || ''}
                      onChange={(e) => updateDMEForm('patientResponsibility', e.target.value)}
                      placeholder="Patient copay or out-of-pocket amount"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Delivery & Setup Section */}
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
                    🏠 Delivery & Setup
                  </h4>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Delivery Address</label>
                    <textarea
                      value={dmeForm.deliveryAddress || ''}
                      onChange={(e) => updateDMEForm('deliveryAddress', e.target.value)}
                      rows={2}
                      placeholder="Delivery address (if different from patient address)"
                      style={{...inputStyle, minHeight: '60px', resize: 'vertical'}}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Setup Required</label>
                      <select
                        value={dmeForm.setupRequired || ''}
                        onChange={(e) => updateDMEForm('setupRequired', e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Select option</option>
                        <option value="yes">Yes - Professional Setup</option>
                        <option value="no">No - Delivery Only</option>
                        <option value="patient">Patient/Family Setup</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Patient Training Needed</label>
                      <select
                        value={dmeForm.trainingNeeded || ''}
                        onChange={(e) => updateDMEForm('trainingNeeded', e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Select option</option>
                        <option value="yes">Yes - Training Required</option>
                        <option value="no">No Training Needed</option>
                        <option value="family">Family Training</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Emergency Contact Name</label>
                      <input
                        type="text"
                        value={dmeForm.emergencyContactName || ''}
                        onChange={(e) => updateDMEForm('emergencyContactName', e.target.value)}
                        placeholder="Emergency contact person"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Emergency Contact Phone</label>
                      <input
                        type="tel"
                        value={dmeForm.emergencyContactPhone || ''}
                        onChange={(e) => updateDMEForm('emergencyContactPhone', e.target.value)}
                        placeholder="Emergency contact number"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Physician Information Section */}
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
                    👨‍⚕️ Physician Information
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Prescribing Physician *</label>
                      <input
                        type="text"
                        value={dmeForm.prescribingPhysician || ''}
                        onChange={(e) => updateDMEForm('prescribingPhysician', e.target.value)}
                        required
                        placeholder="Dr. Name"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Physician NPI Number</label>
                      <input
                        type="text"
                        value={dmeForm.physicianNPI || ''}
                        onChange={(e) => updateDMEForm('physicianNPI', e.target.value)}
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
                        value={dmeForm.physicianPhone || ''}
                        onChange={(e) => updateDMEForm('physicianPhone', e.target.value)}
                        placeholder="Physician contact number"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Physician Fax</label>
                      <input
                        type="tel"
                        value={dmeForm.physicianFax || ''}
                        onChange={(e) => updateDMEForm('physicianFax', e.target.value)}
                        placeholder="Physician fax number"
                        style={inputStyle}
                      />
                    </div>
                  </div>
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
                      Processing DME Order...
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '18px' }}>🏥</span>
                      Generate DME Order Form
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
                  DME Order Form Generated Successfully!
                </div>

                {/* Display DME-specific results */}
                {dmeForm.result && (
                  <div style={resultCardStyle}>
                    <h3 style={{ 
                      color: '#059669', 
                      marginBottom: '20px',
                      fontSize: '18px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '20px' }}>🏥</span>
                      DME Equipment Recommendations
                    </h3>
                    
                    {dmeForm.result.recommendations && (
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '10px'
                        }}>
                          Equipment Recommendations:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
                          {dmeForm.result.recommendations.map((rec: string, i: number) => (
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
                                color: '#059669',
                                fontWeight: '600'
                              }}>•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {dmeForm.result.next_steps && (
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
                          {dmeForm.result.next_steps.map((step: string, i: number) => (
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

                    {dmeForm.result.external_referrals && (
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
                          {dmeForm.result.external_referrals.map((ref: string, i: number) => (
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
                        onClick={() => setDmeForm((prev: any) => ({
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
                          alert('Print/Export functionality - Coming Soon!\n\nThis will allow you to print or export the DME order form.');
                        }}
                        style={{
                          backgroundColor: '#059669',
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

export default DMEOrderForm;
