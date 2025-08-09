import React, { useState, useEffect } from 'react';
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
    // Get results and patient data from navigation state
    if (location.state && location.state.results && location.state.patientData) {
      setResults(location.state.results);
    } else {
      // If no data, redirect back to results page
      navigate('/results');
    }
  }, [location.state, navigate]);

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
            </div>

            {!pharmacyForm.submitted ? (
              <form onSubmit={handlePharmacyFormSubmit}>
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
