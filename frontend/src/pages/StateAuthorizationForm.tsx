import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Add CSS animation for spinner
const spinnerCSS = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface StateAuthorizationFormProps {}

const StateAuthorizationForm: React.FC<StateAuthorizationFormProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [stateForm, setStateForm] = useState<any>({});
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
      autofillStateForm(patientData);
    } else {
      // If no data, redirect back to results page
      navigate('/results');
    }
  }, [location.state, navigate]);

  // Function to autofill State form with LLM-generated realistic data
  const autofillStateForm = useCallback(async (patientData: any) => {
    try {
      // Make API call to get autofill data from backend
      const requestData = {
        patient_data: patientData,
        caregiver_input: {
          patient_id: patientData?.patient_id,
          urgency_level: "medium",
          primary_concern: "State authorization and insurance coverage needed for discharge planning",
          requested_services: ['state'],
          additional_notes: "Auto-generating state authorization form data"
        }
      };

      const response = await fetch('http://localhost:8000/api/process-state-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Use the form_autofill data from backend if available
        if (result.form_autofill) {
          setStateForm(result.form_autofill);
        } else {
          // Fallback to sample data if backend doesn't provide autofill
          setStateForm(getSampleStateInfo(patientData));
        }
      } else {
        // Fallback to sample data if API call fails
        setStateForm(getSampleStateInfo(patientData));
      }
    } catch (error) {
      console.error('Error getting state autofill data:', error);
      // Fallback to sample data
      setStateForm(getSampleStateInfo(patientData));
    }
  }, []);

  // Fallback sample data function for state authorization
  const getSampleStateInfo = (patientData: any) => {
    return {
      // Patient Information
      patientName: patientData?.name || "Isaiah Oneal",
      dateOfBirth: "1958-03-15",
      ssn: "XXX-XX-1234",
      mrn: patientData?.patient_id || "MRN-1003",
      patientAddress: "13637 Thompson Cove Suite 621\nRonnieside, WI 90185",
      phoneNumber: "(555) 234-5678",
      email: "isaiah.oneal@email.com",
      
      // Insurance Information
      primaryInsurance: "medicare",
      insuranceId: "1EG4-TE5-MK72",
      groupNumber: "12345",
      secondaryInsurance: "Medicaid",
      coverageStatus: "denied",
      
      // Medical Information
      primaryDiagnosis: "I50.9 - Heart failure, unspecified",
      secondaryDiagnoses: "E11.9 - Type 2 diabetes mellitus without complications",
      admissionDate: "2024-01-15",
      dischargeDate: new Date().toISOString().split('T')[0],
      medicalNecessity: "Patient requires home health services and DME equipment for safe transition from hospital to home care following congestive heart failure exacerbation.",
      
      // Services Requested
      serviceType: "home-health",
      serviceDescription: "Home health nursing services for medication management, vital signs monitoring, and patient education. DME equipment including hospital bed and IV pole for safe home care.",
      serviceFrequency: "3x per week",
      serviceDuration: "30 days",
      
      // Provider Information
      attendingPhysician: "Dr. Sherry Chung",
      physicianNPI: "3662871596",
      physicianPhone: "(067) 318-5308",
      facilityName: "Regional Medical Center",
      facilityAddress: "123 Medical Center Drive\nHealthcare City, ST 12345",
      
      // Authorization Details
      authorizationType: "prior-authorization",
      urgencyLevel: "urgent",
      requestedStartDate: new Date().toISOString().split('T')[0],
      requestedEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      previousAuthNumber: "",
      clinicalJustification: "Patient with congestive heart failure requires continued medical supervision and support services to prevent readmission. Home health services are medically necessary for medication compliance, symptom monitoring, and patient safety.",
      
      // Original fields
      concern: "Patient requires prior authorization for home health services and DME equipment. Current insurance coverage has been denied and needs appeal process initiated.",
      notes: "Patient has complex medical history requiring specialized care coordination. Family support available but professional medical oversight necessary for safe discharge transition."
    };
  };

  // Handle State form submission
  const handleStateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stateForm.concern) {
      setMessage('❌ Please fill in the concern field.');
      return;
    }

    setLoading(true);
    setMessage('Processing state authorization form...');

    try {
      const patientData = location.state?.patientData;
      const requestData = {
        patient_data: patientData,
        caregiver_input: {
          patient_id: patientData?.patient_id,
          urgency_level: "medium",
          primary_concern: stateForm.concern,
          requested_services: ['state'],
          additional_notes: stateForm.notes || ""
        }
      };

      const response = await fetch('http://localhost:8000/api/process-state-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        setStateForm((prev: any) => ({
          ...prev,
          result,
          submitted: true
        }));
        setMessage('✅ State authorization form processed successfully!');
      } else {
        setMessage('❌ State authorization form processing failed');
      }
    } catch (err) {
      setMessage('❌ Error processing state authorization form');
    } finally {
      setLoading(false);
    }
  };

  const updateStateForm = (field: string, value: string) => {
    setStateForm((prev: any) => ({
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
    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
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
      'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    color: 'white',
    padding: '16px 32px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    letterSpacing: '0.025em',
    boxShadow: loading ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.3)',
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
              <span style={{ fontSize: '32px' }}>📋</span>
              State Authorization Form
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

          {/* State Form Card */}
          <div style={formCardStyle}>
            <div style={{
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '16px',
              marginBottom: '24px'
            }}>
              <h2 style={{
                color: '#7c3aed',
                fontSize: '20px',
                fontWeight: '600',
                margin: '0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '24px' }}>📋</span>
                Insurance & State Authorization Form
              </h2>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: '8px 0 0 0',
                lineHeight: '1.5'
              }}>
                Complete this form to generate insurance authorization requests and state program applications based on the patient's discharge planning needs.
              </p>
            </div>

            {!stateForm.submitted ? (
              <form onSubmit={handleStateFormSubmit}>
                {/* Patient Information Section */}
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
                    📝 Patient Information
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Patient Name *</label>
                      <input
                        type="text"
                        value={stateForm.patientName || ''}
                        onChange={(e) => updateStateForm('patientName', e.target.value)}
                        required
                        placeholder="Full patient name"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Date of Birth *</label>
                      <input
                        type="date"
                        value={stateForm.dateOfBirth || ''}
                        onChange={(e) => updateStateForm('dateOfBirth', e.target.value)}
                        required
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Social Security Number</label>
                      <input
                        type="text"
                        value={stateForm.ssn || ''}
                        onChange={(e) => updateStateForm('ssn', e.target.value)}
                        placeholder="XXX-XX-XXXX"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Medical Record Number</label>
                      <input
                        type="text"
                        value={stateForm.mrn || ''}
                        onChange={(e) => updateStateForm('mrn', e.target.value)}
                        placeholder="MRN"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Patient Address *</label>
                    <textarea
                      value={stateForm.patientAddress || ''}
                      onChange={(e) => updateStateForm('patientAddress', e.target.value)}
                      required
                      rows={2}
                      placeholder="Full address including city, state, zip"
                      style={{...inputStyle, minHeight: '60px', resize: 'vertical'}}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Phone Number</label>
                      <input
                        type="tel"
                        value={stateForm.phoneNumber || ''}
                        onChange={(e) => updateStateForm('phoneNumber', e.target.value)}
                        placeholder="(555) 123-4567"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Email Address</label>
                      <input
                        type="email"
                        value={stateForm.email || ''}
                        onChange={(e) => updateStateForm('email', e.target.value)}
                        placeholder="patient@email.com"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Insurance Information Section */}
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
                    💳 Insurance Information
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Primary Insurance *</label>
                      <select
                        value={stateForm.primaryInsurance || ''}
                        onChange={(e) => updateStateForm('primaryInsurance', e.target.value)}
                        required
                        style={inputStyle}
                      >
                        <option value="">Select primary insurance</option>
                        <option value="medicare">Medicare</option>
                        <option value="medicaid">Medicaid</option>
                        <option value="private">Private Insurance</option>
                        <option value="tricare">TRICARE</option>
                        <option value="va">VA Benefits</option>
                        <option value="self-pay">Self-Pay</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Insurance ID Number</label>
                      <input
                        type="text"
                        value={stateForm.insuranceId || ''}
                        onChange={(e) => updateStateForm('insuranceId', e.target.value)}
                        placeholder="Insurance ID number"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Group Number</label>
                      <input
                        type="text"
                        value={stateForm.groupNumber || ''}
                        onChange={(e) => updateStateForm('groupNumber', e.target.value)}
                        placeholder="Group number"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Secondary Insurance</label>
                      <input
                        type="text"
                        value={stateForm.secondaryInsurance || ''}
                        onChange={(e) => updateStateForm('secondaryInsurance', e.target.value)}
                        placeholder="Secondary insurance (if any)"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Current Coverage Status</label>
                    <select
                      value={stateForm.coverageStatus || ''}
                      onChange={(e) => updateStateForm('coverageStatus', e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Select status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="denied">Denied</option>
                      <option value="expired">Expired</option>
                      <option value="suspended">Suspended</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                </div>

                {/* Medical Information Section */}
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
                    🩺 Medical Information
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Primary Diagnosis (ICD-10) *</label>
                      <input
                        type="text"
                        value={stateForm.primaryDiagnosis || ''}
                        onChange={(e) => updateStateForm('primaryDiagnosis', e.target.value)}
                        required
                        placeholder="e.g., I50.9 - Heart failure, unspecified"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Secondary Diagnoses</label>
                      <input
                        type="text"
                        value={stateForm.secondaryDiagnoses || ''}
                        onChange={(e) => updateStateForm('secondaryDiagnoses', e.target.value)}
                        placeholder="Additional ICD-10 codes"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Admission Date</label>
                      <input
                        type="date"
                        value={stateForm.admissionDate || ''}
                        onChange={(e) => updateStateForm('admissionDate', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Discharge Date</label>
                      <input
                        type="date"
                        value={stateForm.dischargeDate || ''}
                        onChange={(e) => updateStateForm('dischargeDate', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Medical Necessity Statement</label>
                    <textarea
                      value={stateForm.medicalNecessity || ''}
                      onChange={(e) => updateStateForm('medicalNecessity', e.target.value)}
                      rows={3}
                      placeholder="Explain why the requested services are medically necessary..."
                      style={{...inputStyle, minHeight: '90px', resize: 'vertical'}}
                    />
                  </div>
                </div>

                {/* Services Requested Section */}
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
                    🏥 Services Requested for Authorization
                  </h4>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Service Type *</label>
                    <select
                      value={stateForm.serviceType || ''}
                      onChange={(e) => updateStateForm('serviceType', e.target.value)}
                      required
                      style={inputStyle}
                    >
                      <option value="">Select service type</option>
                      <option value="home-health">Home Health Services</option>
                      <option value="dme">Durable Medical Equipment</option>
                      <option value="skilled-nursing">Skilled Nursing Facility</option>
                      <option value="rehabilitation">Rehabilitation Services</option>
                      <option value="hospice">Hospice Care</option>
                      <option value="long-term-care">Long-Term Care</option>
                      <option value="specialty-pharmacy">Specialty Pharmacy</option>
                      <option value="transportation">Medical Transportation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Detailed Service Description *</label>
                    <textarea
                      value={stateForm.serviceDescription || ''}
                      onChange={(e) => updateStateForm('serviceDescription', e.target.value)}
                      required
                      rows={3}
                      placeholder="Provide detailed description of services requested..."
                      style={{...inputStyle, minHeight: '90px', resize: 'vertical'}}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Frequency of Service</label>
                      <input
                        type="text"
                        value={stateForm.serviceFrequency || ''}
                        onChange={(e) => updateStateForm('serviceFrequency', e.target.value)}
                        placeholder="e.g., 3x per week, daily"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Duration of Service</label>
                      <input
                        type="text"
                        value={stateForm.serviceDuration || ''}
                        onChange={(e) => updateStateForm('serviceDuration', e.target.value)}
                        placeholder="e.g., 30 days, 6 weeks"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Provider Information Section */}
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
                    👨‍⚕️ Provider Information
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Attending Physician *</label>
                      <input
                        type="text"
                        value={stateForm.attendingPhysician || ''}
                        onChange={(e) => updateStateForm('attendingPhysician', e.target.value)}
                        required
                        placeholder="Dr. Name"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Physician NPI Number</label>
                      <input
                        type="text"
                        value={stateForm.physicianNPI || ''}
                        onChange={(e) => updateStateForm('physicianNPI', e.target.value)}
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
                        value={stateForm.physicianPhone || ''}
                        onChange={(e) => updateStateForm('physicianPhone', e.target.value)}
                        placeholder="Physician contact number"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Hospital/Facility Name</label>
                      <input
                        type="text"
                        value={stateForm.facilityName || ''}
                        onChange={(e) => updateStateForm('facilityName', e.target.value)}
                        placeholder="Hospital or facility name"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Facility Address</label>
                    <textarea
                      value={stateForm.facilityAddress || ''}
                      onChange={(e) => updateStateForm('facilityAddress', e.target.value)}
                      rows={2}
                      placeholder="Hospital/facility address"
                      style={{...inputStyle, minHeight: '60px', resize: 'vertical'}}
                    />
                  </div>
                </div>

                {/* Authorization Details Section */}
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
                    📋 Authorization Details
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Authorization Type *</label>
                      <select
                        value={stateForm.authorizationType || ''}
                        onChange={(e) => updateStateForm('authorizationType', e.target.value)}
                        required
                        style={inputStyle}
                      >
                        <option value="">Select authorization type</option>
                        <option value="prior-authorization">Prior Authorization</option>
                        <option value="pre-certification">Pre-Certification</option>
                        <option value="concurrent-review">Concurrent Review</option>
                        <option value="retrospective-review">Retrospective Review</option>
                        <option value="emergency-authorization">Emergency Authorization</option>
                        <option value="appeal">Appeal</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Urgency Level</label>
                      <select
                        value={stateForm.urgencyLevel || ''}
                        onChange={(e) => updateStateForm('urgencyLevel', e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Select urgency</option>
                        <option value="routine">Routine</option>
                        <option value="urgent">Urgent</option>
                        <option value="emergent">Emergent</option>
                        <option value="stat">STAT</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Requested Start Date</label>
                      <input
                        type="date"
                        value={stateForm.requestedStartDate || ''}
                        onChange={(e) => updateStateForm('requestedStartDate', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Requested End Date</label>
                      <input
                        type="date"
                        value={stateForm.requestedEndDate || ''}
                        onChange={(e) => updateStateForm('requestedEndDate', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Previous Authorization Number</label>
                    <input
                      type="text"
                      value={stateForm.previousAuthNumber || ''}
                      onChange={(e) => updateStateForm('previousAuthNumber', e.target.value)}
                      placeholder="Previous authorization number (if applicable)"
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Clinical Justification</label>
                    <textarea
                      value={stateForm.clinicalJustification || ''}
                      onChange={(e) => updateStateForm('clinicalJustification', e.target.value)}
                      rows={4}
                      placeholder="Provide clinical justification for the requested authorization..."
                      style={{...inputStyle, minHeight: '120px', resize: 'vertical'}}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>
                    Specific State Authorization Concern *
                  </label>
                  <textarea
                    value={stateForm.concern || ''}
                    onChange={(e) => updateStateForm('concern', e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe specific insurance authorization needs, state program applications, coverage issues, or authorization concerns for discharge planning..."
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
                    value={stateForm.notes || ''}
                    onChange={(e) => updateStateForm('notes', e.target.value)}
                    rows={3}
                    placeholder="Any additional information, supporting documentation, special circumstances, or authorization details..."
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
                      Processing Authorization...
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '18px' }}>📋</span>
                      Generate Authorization Form
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
                  State Authorization Form Generated Successfully!
                </div>

                {/* Display State-specific results */}
                {stateForm.result && (
                  <div style={resultCardStyle}>
                    <h3 style={{ 
                      color: '#7c3aed', 
                      marginBottom: '20px',
                      fontSize: '18px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '20px' }}>📋</span>
                      Insurance & State Authorization Recommendations
                    </h3>
                    
                    {stateForm.result.recommendations && (
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#374151',
                          marginBottom: '10px'
                        }}>
                          Authorization Recommendations:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
                          {stateForm.result.recommendations.map((rec: string, i: number) => (
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
                                color: '#7c3aed',
                                fontWeight: '600'
                              }}>•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {stateForm.result.next_steps && (
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
                          {stateForm.result.next_steps.map((step: string, i: number) => (
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

                    {stateForm.result.external_referrals && (
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
                          {stateForm.result.external_referrals.map((ref: string, i: number) => (
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
                        onClick={() => setStateForm((prev: any) => ({
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
                          alert('Print/Export functionality - Coming Soon!\n\nThis will allow you to print or export the state authorization form.');
                        }}
                        style={{
                          backgroundColor: '#7c3aed',
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
                        Print Authorization
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

export default StateAuthorizationForm;
