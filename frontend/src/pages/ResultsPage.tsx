import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
        setMessage(`✅ ${agentType.toUpperCase()} agent processed successfully!`);
      } else {
        setMessage(`❌ ${agentType.toUpperCase()} agent processing failed`);
      }
    } catch (err) {
      setMessage(`❌ Error processing ${agentType} agent`);
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
    maxWidth: '1200px',
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

  const resultsCardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #d1fae5',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    marginBottom: '24px'
  };

  const routingDecisionStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
    padding: '24px',
    margin: '24px',
    borderRadius: '10px',
    border: '1px solid #a7f3d0'
  };

  const agentCardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '10px',
    marginBottom: '16px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    margin: '0 24px 16px 24px'
  };

  const agentFormsStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #fbbf24',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  };

  const agentFormsHeaderStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: 'white',
    padding: '20px 24px',
    fontSize: '20px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
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
    backgroundColor: '#ffffff'
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
      <style>{spinnerCSS}</style>
      <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={titleStyle}>
            <span style={{ fontSize: '32px' }}>📋</span>
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
                color: '#065f46', 
                marginBottom: '20px',
                fontSize: '18px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>🎯</span>
                AI Routing Decision
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '12px 16px', 
                  borderRadius: '8px',
                  border: '1px solid #a7f3d0'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>PATIENT ID</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#065f46' }}>
                    {results.routing_decision.patient_id}
                  </div>
                </div>
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '12px 16px', 
                  borderRadius: '8px',
                  border: '1px solid #a7f3d0'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>PRIORITY SCORE</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#065f46' }}>
                    {results.routing_decision.priority_score}/10
                  </div>
                </div>
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '12px 16px', 
                  borderRadius: '8px',
                  border: '1px solid #a7f3d0'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>TIMELINE</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#065f46' }}>
                    {results.routing_decision.estimated_timeline}
                  </div>
                </div>
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '12px 16px', 
                  borderRadius: '8px',
                  border: '1px solid #a7f3d0'
                }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>RECOMMENDED AGENTS</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#065f46' }}>
                    {results.routing_decision.recommended_agents?.join(', ')}
                  </div>
                </div>
              </div>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '16px', 
                borderRadius: '8px',
                border: '1px solid #a7f3d0'
              }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '8px' }}>
                  AI REASONING
                </div>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px', 
                  lineHeight: '1.5', 
                  color: '#374151',
                  fontStyle: 'italic'
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
                color: '#1f2937', 
                marginBottom: '20px',
                fontSize: '18px',
                fontWeight: '600',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>🤖</span>
                Agent Recommendations ({results.agent_responses.length} agents)
              </h3>
              {results.agent_responses.map((response: any, index: number) => (
                <div key={index} style={agentCardStyle}>
                  <h4 style={{ 
                    color: '#2563eb', 
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
                      {response.agent_type === 'nursing' ? '👩‍⚕️' :
                       response.agent_type === 'dme' ? '🏥' :
                       response.agent_type === 'pharmacy' ? '💊' :
                       response.agent_type === 'state' ? '📋' : '🤖'}
                    </span>
                    {response.agent_type || `Agent ${index + 1}`}
                  </h4>
                  
                  {response.recommendations && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#059669',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>📝</span> Recommendations
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
                              color: '#059669',
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
                        color: '#f59e0b',
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
                              color: '#f59e0b',
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
                        color: '#dc2626',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>🔗</span> External Referrals
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
                              color: '#dc2626',
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
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
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
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>📋</span>
                        Create Order Form
                      </button>
                    </div>
                  )}

                  {/* Create Order Form Button - Only for DME Agent */}
                  {response.agent_type === 'dme' && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                      <button
                        onClick={() => {
                          // Handle create DME order form functionality
                          alert('Create DME Order Form functionality - Coming Soon!\n\nThis will generate a DME order form based on the equipment recommendations.');
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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
                          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>🏥</span>
                        Create DME Order Form
                      </button>
                    </div>
                  )}

                  {/* Create Order Form Button - Only for Pharmacy Agent */}
                  {response.agent_type === 'pharmacy' && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                      <button
                        onClick={() => {
                          // Handle create pharmacy order form functionality
                          alert('Create Pharmacy Order Form functionality - Coming Soon!\n\nThis will generate a medication order form based on the pharmacy recommendations.');
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
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
                          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>💊</span>
                        Create Pharmacy Order Form
                      </button>
                    </div>
                  )}

                  {/* Create Order Form Button - Only for State Agent */}
                  {response.agent_type === 'state' && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                      <button
                        onClick={() => {
                          // Handle create state order form functionality
                          alert('Create State Authorization Form functionality - Coming Soon!\n\nThis will generate an insurance/state authorization form based on the coverage recommendations.');
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
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
                          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>📋</span>
                        Create Authorization Form
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Downstream Agent Forms */}
        {results.routing_decision && results.routing_decision.recommended_agents && (
          <div style={agentFormsStyle}>
            <div style={agentFormsHeaderStyle}>
              <span style={{ fontSize: '24px' }}>📝</span>
              Downstream Agent Forms
            </div>
            <div style={{ padding: '24px', color: '#92400e', fontSize: '14px', lineHeight: '1.5' }}>
              Complete the forms below for each recommended agent to get specific recommendations:
            </div>

            {results.routing_decision.recommended_agents
              .filter((agentType: string) => agentType !== 'nursing') // Exclude nursing agent
              .map((agentType: string) => (
              <div key={agentType} style={{
                backgroundColor: '#ffffff',
                padding: '24px',
                margin: '24px',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <h3 style={{ 
                  color: '#2563eb', 
                  marginBottom: '20px',
                  fontSize: '18px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>
                    {agentType === 'nursing' ? '👩‍⚕️' :
                     agentType === 'dme' ? '🏥' :
                     agentType === 'pharmacy' ? '💊' :
                     agentType === 'state' ? '📋' : '🤖'}
                  </span>
                  {agentType === 'dme' ? 'DME (Durable Medical Equipment)' : 
                   agentType === 'state' ? 'Insurance & State Programs' : 
                   agentType.charAt(0).toUpperCase() + agentType.slice(1)} Agent
                </h3>

                {!agentForms[agentType]?.submitted ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleAgentFormSubmit(agentType, agentForms[agentType] || {});
                  }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={labelStyle}>
                        Specific Concern for {agentType.toUpperCase()} *
                      </label>
                      <textarea
                        value={agentForms[agentType]?.concern || ''}
                        onChange={(e) => updateAgentForm(agentType, 'concern', e.target.value)}
                        required
                        rows={3}
                        placeholder={`Describe specific ${agentType} requirements...`}
                        style={{
                          ...inputStyle,
                          minHeight: '90px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={labelStyle}>
                        Additional Notes
                      </label>
                      <textarea
                        value={agentForms[agentType]?.notes || ''}
                        onChange={(e) => updateAgentForm(agentType, 'notes', e.target.value)}
                        rows={2}
                        placeholder={`Any additional information for ${agentType} agent...`}
                        style={{
                          ...inputStyle,
                          minHeight: '60px'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        background: loading ? 
                          'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 
                          'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: loading ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.3)'
                      }}
                    >
                      {loading ? (
                        <>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid #ffffff',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <span>🚀</span>
                          Process {agentType.toUpperCase()} Agent
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div>
                    <div style={{
                      backgroundColor: '#ecfdf5',
                      color: '#065f46',
                      padding: '16px 20px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      border: '1px solid #a7f3d0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      <span>✅</span>
                      {agentType.toUpperCase()} agent processed successfully!
                    </div>

                    {/* Display agent-specific results */}
                    {agentForms[agentType]?.result && (
                      <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <h4 style={{ 
                          color: '#059669', 
                          marginBottom: '16px',
                          fontSize: '16px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span>📋</span>
                          {agentType.toUpperCase()} Recommendations
                        </h4>
                        
                        {agentForms[agentType].result.recommendations && (
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ 
                              fontSize: '14px', 
                              fontWeight: '600', 
                              color: '#374151',
                              marginBottom: '8px'
                            }}>
                              Recommendations:
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
                              {agentForms[agentType].result.recommendations.map((rec: string, i: number) => (
                                <li key={i} style={{ 
                                  marginBottom: '6px',
                                  fontSize: '14px',
                                  lineHeight: '1.5',
                                  color: '#4b5563',
                                  position: 'relative',
                                  paddingLeft: '16px'
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

                        {agentForms[agentType].result.next_steps && (
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ 
                              fontSize: '14px', 
                              fontWeight: '600', 
                              color: '#374151',
                              marginBottom: '8px'
                            }}>
                              Next Steps:
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
                              {agentForms[agentType].result.next_steps.map((step: string, i: number) => (
                                <li key={i} style={{ 
                                  marginBottom: '6px',
                                  fontSize: '14px',
                                  lineHeight: '1.5',
                                  color: '#4b5563',
                                  position: 'relative',
                                  paddingLeft: '16px'
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

                        {agentForms[agentType].result.external_referrals && (
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ 
                              fontSize: '14px', 
                              fontWeight: '600', 
                              color: '#374151',
                              marginBottom: '8px'
                            }}>
                              External Referrals:
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '20px', listStyle: 'none' }}>
                              {agentForms[agentType].result.external_referrals.map((ref: string, i: number) => (
                                <li key={i} style={{ 
                                  marginBottom: '6px',
                                  fontSize: '14px',
                                  lineHeight: '1.5',
                                  color: '#4b5563',
                                  position: 'relative',
                                  paddingLeft: '16px'
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

                        <button
                          onClick={() => setAgentForms(prev => ({
                            ...prev,
                            [agentType]: { ...prev[agentType], submitted: false }
                          }))}
                          style={{
                            backgroundColor: '#6b7280',
                            color: 'white',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
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
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {message && (
          <div style={{
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
