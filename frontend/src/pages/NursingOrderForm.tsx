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

interface NursingOrderFormProps {}

const NursingOrderForm: React.FC<NursingOrderFormProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [nursingForm, setNursingForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [results, setResults] = useState<any>(null);
  const [nurseRecommendations, setNurseRecommendations] = useState<any>(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Get results and patient data from navigation state
    if (location.state && location.state.results && location.state.patientData) {
      setResults(location.state.results);
      
      // Auto-fill form with nursing agent data and get nurse recommendations
      const patientData = location.state.patientData;
      autofillNursingForm(patientData);
    } else {
      // If no data, redirect back to results page
      navigate('/results');
    }
  }, [location.state, navigate]);

  // Function to autofill Nursing form and get nurse recommendations
  const autofillNursingForm = useCallback(async (patientData: any) => {
    try {
      // Make API call to get nursing agent data with nurse recommendations
      const requestData = {
        patient_data: patientData,
        caregiver_input: {
          patient_id: patientData?.patient_id,
          urgency_level: "medium",
          primary_concern: "Home health nursing needed for discharge planning",
          requested_services: ['nursing'],
          additional_notes: "Enhanced nursing agent with RAG-based nurse matching"
        }
      };

      const response = await fetch('http://localhost:8000/api/process-nursing-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Extract nurse recommendations from form_data
        if (result.form_data && result.form_data.nurse_recommendations) {
          setNurseRecommendations(result.form_data.nurse_recommendations);
        }
        
        // Auto-fill form fields
        const formData = result.form_data || {};
        const fields = formData.fields || [];
        
        const autoFilledData: any = {};
        fields.forEach((field: any) => {
          autoFilledData[field.field_name] = field.value || '';
        });
        
        // Add additional nursing-specific fields
        autoFilledData.visit_frequency = result.structured_data?.visit_frequency || 'weekly';
        autoFilledData.first_visit_target = result.structured_data?.first_visit_target || 'within 24 hours';
        autoFilledData.care_plan_485_required = result.structured_data?.care_plan_485_required || true;
        autoFilledData.vital_signs_monitoring = result.structured_data?.vital_signs_monitoring || true;
        autoFilledData.caregiver_education_needed = result.structured_data?.caregiver_education_needed || true;
        
        setNursingForm(autoFilledData);
        
      } else {
        console.error('Failed to get nursing agent data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error getting nursing agent data:', error);
    }
  }, []);

  // Handle nursing form submission
  const handleNursingFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setMessage('Processing nursing order form...');

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setNursingForm((prev: any) => ({
        ...prev,
        submitted: true
      }));
      setMessage('✅ Nursing order form submitted successfully!');
    } catch (err) {
      setMessage('❌ Error submitting nursing order form');
    } finally {
      setLoading(false);
    }
  };

  const updateNursingForm = (field: string, value: string) => {
    setNursingForm((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Styles - Updated to match DME form styling
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
    padding: '32px',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#475569',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 20px',
    border: '2px solid #f1f5f9',
    borderRadius: '16px',
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
    backgroundColor: message.includes('success') ? '#f0fdf4' : '#fef2f2',
    color: message.includes('success') ? '#16a34a' : '#dc2626',
    border: `1px solid ${message.includes('success') ? '#bbf7d0' : '#fecaca'}`,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(20px)'
  };

  const resultCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
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
              Nursing Order Form
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

          {/* Nursing Form Card */}
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
                🏥 Home Health Nursing Order Form
              </h2>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: '8px 0 0 0',
                lineHeight: '1.5'
              }}>
                Coordinate skilled nursing services for post-discharge home care with AI-matched nurse recommendations
              </p>
            </div>

            {/* Nurse Recommendations Section */}
            {nurseRecommendations && nurseRecommendations.success && nurseRecommendations.recommendations.length > 0 && (
              <div style={resultCardStyle}>
                <h3 style={{ 
                  color: '#0ea5e9', 
                  marginBottom: '16px',
                  fontSize: '18px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🤖 AI-Recommended Nurses
                </h3>
                <p style={{
                  color: '#0284c7',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  {nurseRecommendations.message} - Ranked by compatibility with patient needs
                </p>
                
                {nurseRecommendations.recommendations.map((rec: any, index: number) => (
                  <div key={rec.nurse.nurse_id} style={{
                    backgroundColor: 'white',
                    border: '1px solid #bae6fd',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{
                          color: '#1e293b',
                          fontSize: '16px',
                          fontWeight: '600',
                          margin: '0 0 4px 0'
                        }}>
                          #{index + 1}. {rec.nurse.name} ({rec.nurse.license_type})
                        </h4>
                        <p style={{
                          color: '#64748b',
                          fontSize: '14px',
                          margin: '0'
                        }}>
                          {rec.nurse.years_experience} years experience • {rec.nurse.service_area_zip} area
                        </p>
                      </div>
                      <div style={{
                        backgroundColor: '#0ea5e9',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {rec.match_score}/100
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{
                        color: '#374151',
                        fontSize: '14px',
                        margin: '0 0 8px 0',
                        lineHeight: '1.4'
                      }}>
                        <strong>Rationale:</strong> {rec.rationale}
                      </p>
                      
                      {rec.key_strengths && rec.key_strengths.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#0ea5e9', fontSize: '14px' }}>Key Strengths:</strong>
                          <ul style={{ margin: '4px 0 0 20px', padding: '0' }}>
                            {rec.key_strengths.map((strength: string, i: number) => (
                              <li key={i} style={{ color: '#374151', fontSize: '13px', marginBottom: '2px' }}>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                      <div>
                        <strong style={{ color: '#0ea5e9' }}>Specialties:</strong>
                        <p style={{ margin: '2px 0', color: '#64748b' }}>
                          {rec.nurse.specialties.join(', ')}
                        </p>
                      </div>
                      <div>
                        <strong style={{ color: '#0ea5e9' }}>Languages:</strong>
                        <p style={{ margin: '2px 0', color: '#64748b' }}>
                          {rec.nurse.languages.join(', ')}
                        </p>
                      </div>
                      <div>
                        <strong style={{ color: '#0ea5e9' }}>Availability:</strong>
                        <p style={{ margin: '2px 0', color: '#64748b' }}>
                          {rec.availability_match}
                        </p>
                      </div>
                      <div>
                        <strong style={{ color: '#0ea5e9' }}>Rate:</strong>
                        <p style={{ margin: '2px 0', color: '#64748b' }}>
                          ${rec.nurse.hourly_rate}/hour
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div style={{
                  backgroundColor: '#e0f2fe',
                  padding: '12px',
                  borderRadius: '12px',
                  marginTop: '16px'
                }}>
                  <p style={{
                    color: '#0369a1',
                    fontSize: '13px',
                    margin: '0',
                    fontWeight: '500'
                  }}>
                    💡 These recommendations are generated using AI analysis of patient needs, nurse qualifications, and availability. 
                    Final selection should consider additional factors like patient preferences and care team coordination.
                  </p>
                </div>
              </div>
            )}

            {!nursingForm.submitted ? (
              <form onSubmit={handleNursingFormSubmit}>
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={buttonStyle}
                >
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
                      <span>📋</span>
                      Submit Nursing Order Form
                    </>
                  )}
                </button>

                {message && (
                  <div style={messageStyle}>
                    {message}
                  </div>
                )}
              </form>
            ) : (
              <div>
                <div style={{
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  padding: '20px',
                  borderRadius: '16px',
                  marginBottom: '24px',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  <span style={{ fontSize: '24px' }}>✅</span>
                  Nursing Order Form Submitted Successfully!
                </div>

                <div style={resultCardStyle}>
                  <h3 style={{
                    color: '#1e293b',
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '16px'
                  }}>
                    📋 Next Steps
                  </h3>
                  <ul style={{
                    color: '#64748b',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    paddingLeft: '20px'
                  }}>
                    <li>Review the AI-recommended nurses above</li>
                    <li>Contact your preferred nurse directly</li>
                    <li>Coordinate care plan and scheduling</li>
                    <li>Verify insurance coverage and authorization</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NursingOrderForm;
