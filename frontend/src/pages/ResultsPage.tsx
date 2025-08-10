import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdonixHeader from '../components/AdonixHeader';

// Add CSS animation for spinner
const spinnerCSS = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface ResultsPageProps {}

const ResultsPage: React.FC<ResultsPageProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [agentForms, setAgentForms] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Get results from navigation state
    if (location.state && location.state.results) {
      setResults(location.state.results);
    } else {
      // If no results, redirect back to dashboard
      navigate('/');
    }
  }, [location.state, navigate]);

  // Handle agent form submissions
  const handleAgentFormSubmit = async (agentType: string, formData: any) => {
    setLoading(true);
    try {
      const patientData = location.state?.patientData;
      const requestData = {
        patient_data: patientData,
        caregiver_input: {
          patient_id: patientData?.patient_id,
          urgency_level: "medium",
          primary_concern: formData.concern,
          requested_services: [agentType],
          additional_notes: formData.notes || ""
        }
      };

      let endpoint = '';
      switch(agentType) {
        case 'nursing':
          endpoint = 'http://localhost:8000/api/process-nursing-agent';
          break;
        case 'dme':
          endpoint = 'http://localhost:8000/api/process-dme-agent';
          break;
        case 'pharmacy':
          endpoint = 'http://localhost:8000/api/process-pharmacy-agent';
          break;
        case 'state':
          endpoint = 'http://localhost:8000/api/process-state-agent';
          break;
        default:
          throw new Error('Unknown agent type');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        setAgentForms(prev => ({
          ...prev,
          [agentType]: { ...formData, result, submitted: true }
        }));
        setMessage(`${agentType.toUpperCase()} agent processed successfully!`);
      } else {
        setMessage(`${agentType.toUpperCase()} agent processing failed`);
      }
    } catch (err) {
      setMessage(`Error processing ${agentType} agent`);
    } finally {
      setLoading(false);
    }
  };

  const updateAgentForm = (agentType: string, field: string, value: string) => {
    setAgentForms(prev => ({
      ...prev,
      [agentType]: {
        ...prev[agentType],
        [field]: value
      }
    }));
  };

  // Styles - Updated to match professional design
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
    letterSpacing: '-0.5px'
  };

  const contentStyle: React.CSSProperties = {
    maxWidth: '1200px',
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

  const resultsCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    marginBottom: '24px'
  };

  const routingDecisionStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '32px',
    margin: '24px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
  };

  const agentCardStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '32px',
    borderRadius: '16px',
    marginBottom: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
    margin: '0 24px 16px 24px'
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

  if (!results) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={titleStyle}>Loading Results...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdonixHeader 
        showBackButton={true}
        backButtonText="← Back to Discharge Planning"
        backButtonPath="/enhanced-dashboard"
      />
      <style>{spinnerCSS}</style>
      <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={titleStyle}>
            Discharge Planning Results
          </h1>
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          style={backButtonStyle}
        >
          <span>←</span>
          Back to Dashboard
        </button>

        {/* Results Display */}
        <div style={resultsCardStyle}>
          {/* AI Routing Decision */}
          {results.routing_decision && (
            <div style={routingDecisionStyle}>
              <h3 style={{ 
                color: '#1e293b', 
                marginBottom: '20px',
                fontSize: '24px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                AI Routing Decision
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '16px 20px', 
                  borderRadius: '12px',
                  border: '2px solid #f1f5f9'
                }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PATIENT ID</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginTop: '4px' }}>
                    {results.routing_decision.patient_id}
                  </div>
                </div>
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '16px 20px', 
                  borderRadius: '12px',
                  border: '2px solid #f1f5f9'
                }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PRIORITY SCORE</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginTop: '4px' }}>
                    {results.routing_decision.priority_score}/10
                  </div>
                </div>
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '16px 20px', 
                  borderRadius: '12px',
                  border: '2px solid #f1f5f9'
                }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TIMELINE</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginTop: '4px' }}>
                    {results.routing_decision.estimated_timeline}
                  </div>
                </div>
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '16px 20px', 
                  borderRadius: '12px',
                  border: '2px solid #f1f5f9'
                }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>RECOMMENDED AGENTS</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginTop: '4px' }}>
                    {results.routing_decision.recommended_agents?.join(', ')}
                  </div>
                </div>
              </div>
              <div style={{ 
                background: '#f8fafc', 
                padding: '20px', 
                borderRadius: '12px',
                border: '2px solid #f1f5f9',
                marginTop: '16px'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  AI REASONING
                </div>
                <p style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  lineHeight: '1.6', 
                  color: '#1e293b'
                }}>
                  {results.routing_decision.reasoning}
                </p>
              </div>
            </div>
          )}

          {/* Agent Responses */}
          {results.agent_responses && results.agent_responses.length > 0 && (
            <div style={{ padding: '0 0 24px 0' }}>
              <h3 style={{ 
                color: '#1e293b', 
                marginBottom: '20px',
                fontSize: '24px',
                fontWeight: '700',
                padding: '0 24px'
              }}>
                Agent Recommendations ({results.agent_responses.length} agents)
              </h3>
              {results.agent_responses.map((response: any, index: number) => (
                <div key={index} style={agentCardStyle}>
                  <h4 style={{ 
                    color: '#0ea5e9', 
                    marginBottom: '16px',
                    fontSize: '16px',
                    fontWeight: '600',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '18px' }}>
                      {response.agent_type === 'nursing' ? '' :
                       response.agent_type === 'dme' ? '' :
                       response.agent_type === 'pharmacy' ? '' :
                       response.agent_type === 'state' ? '' : ''}
                    </span>
                    {(response.agent_type === 'nursing' ? 'Nursing' : 
                      response.agent_type === 'dme' ? 'DME Equipments' : 
                      response.agent_type === 'pharmacy' ? 'Pharmacy' :
                      response.agent_type === 'state' ? 'State Resources' :
                      response.agent_type) || `Agent ${index + 1}`}
                  </h4>
                  
                  {response.recommendations && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#0ea5e9',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span></span> Recommendations
                      </div>
                      <ul style={{ 
                        margin: 0, 
                        paddingLeft: '20px',
                        listStyle: 'none'
                      }}>
                        {response.recommendations.map((rec: string, i: number) => (
                          <li key={i} style={{ 
                            marginBottom: '8px', 
                            lineHeight: '1.5',
                            fontSize: '14px',
                            color: '#374151',
                            position: 'relative',
                            paddingLeft: '16px'
                          }}>
                            <span style={{ 
                              position: 'absolute', 
                              left: '0', 
                              color: '#0ea5e9',
                              fontWeight: '600'
                            }}>•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {response.next_steps && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#0ea5e9',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>👉</span> Next Steps
                      </div>
                      <ul style={{ 
                        margin: 0, 
                        paddingLeft: '20px',
                        listStyle: 'none'
                      }}>
                        {response.next_steps.map((step: string, i: number) => (
                          <li key={i} style={{ 
                            marginBottom: '8px', 
                            lineHeight: '1.5',
                            fontSize: '14px',
                            color: '#374151',
                            position: 'relative',
                            paddingLeft: '16px'
                          }}>
                            <span style={{ 
                              position: 'absolute', 
                              left: '0', 
                              color: '#0ea5e9',
                              fontWeight: '600'
                            }}>•</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {response.external_referrals && (
                    <div>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#0ea5e9',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span></span> External Referrals
                      </div>
                      <ul style={{ 
                        margin: 0, 
                        paddingLeft: '20px',
                        listStyle: 'none'
                      }}>
                        {response.external_referrals.map((ref: string, i: number) => (
                          <li key={i} style={{ 
                            marginBottom: '8px', 
                            lineHeight: '1.5',
                            fontSize: '14px',
                            color: '#374151',
                            position: 'relative',
                            paddingLeft: '16px'
                          }}>
                            <span style={{ 
                              position: 'absolute', 
                              left: '0', 
                              color: '#0ea5e9',
                              fontWeight: '600'
                            }}>•</span>
                            {ref}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Create Order Form Button - Only for Nursing Agent */}
                  {response.agent_type === 'nursing' && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                      <button
                        onClick={() => {
                          // Navigate to dedicated nursing order form page
                          navigate('/nursing-order', {
                            state: {
                              results: results,
                              patientData: location.state?.patientData
                            }
                          });
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
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
                          boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
                        }}
                      >
                        <span style={{ fontSize: '16px' }}></span>
                        View Nurse Recommendations
                      </button>
                    </div>
                  )}

                  {/* Create Order Form Button - Only for DME Agent */}
                  {response.agent_type === 'dme' && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                      <button
                        onClick={() => {
                          // Navigate to dedicated DME order form page
                          navigate('/dme-order', {
                            state: {
                              results: results,
                              patientData: location.state?.patientData
                            }
                          });
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
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
                          boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
                        }}
                      >
                        <span style={{ fontSize: '16px' }}></span>
                        Create DME Order Form
                      </button>
                    </div>
                  )}

                  {/* Create Order Form Button - Only for Pharmacy Agent */}
                  {response.agent_type === 'pharmacy' && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                      <button
                        onClick={() => {
                          // Navigate to dedicated pharmacy order form page
                          navigate('/pharmacy-order', {
                            state: {
                              results: results,
                              patientData: location.state?.patientData
                            }
                          });
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
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
                          boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
                        }}
                      >
                        <span style={{ fontSize: '16px' }}></span>
                        Create Pharmacy Order Form
                      </button>
                    </div>
                  )}

                  {/* Create Order Form Button - Only for State Agent */}
                  {response.agent_type === 'state' && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                      <button
                        onClick={() => {
                          // Navigate to dedicated state authorization form page
                          navigate('/state-authorization', {
                            state: {
                              results: results,
                              patientData: location.state?.patientData
                            }
                          });
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
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
                          boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
                        }}
                      >
                        <span style={{ fontSize: '16px' }}></span>
                        Create Authorization Form
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
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
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ResultsPage;
