import React, { useState, useEffect } from 'react';

interface Patient {
  patient_id: string;
  name: string;
  primary_diagnosis: string;
}

const WorkingDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [primaryConcern, setPrimaryConcern] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/patients');
      const data = await response.json();
      setPatients(data.patients || []);
    } catch (err) {
      setError('Failed to load patients');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !primaryConcern) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const patient = patients.find(p => p.patient_id === selectedPatient);
      
      if (!patient) {
        throw new Error('Selected patient not found');
      }

      const requestData = {
        patient_data: {
          patient_id: patient.patient_id,
          name: patient.name,
          primary_diagnosis: patient.primary_diagnosis,
          primary_icu_diagnosis: patient.primary_diagnosis, // Add the missing field
          age: 65,
          gender: "Male",
          admission_date: "2024-01-01",
          expected_discharge_date: "2024-01-02",
          skilled_nursing_needed: "Yes",
          equipment_needed: "Hospital bed, IV pole",
          medications: ["Heart medication"],
          insurance_type: "Medicare",
          discharge_destination: "Home"
        },
        caregiver_input: {
          patient_id: patient.patient_id,
          urgency_level: urgencyLevel,
          primary_concern: primaryConcern,
          requested_services: ["nursing", "equipment"],
          additional_notes: "Processed via dashboard"
        }
      };

      console.log('Sending request:', requestData);

      const response = await fetch('http://localhost:8000/api/process-complete-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        // Extract meaningful error message
        let errorMessage = 'Processing failed';
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const missingFields = errorData.detail
            .filter((err: any) => err.type === 'missing')
            .map((err: any) => err.loc.join('.'));
          if (missingFields.length > 0) {
            errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('API Success:', result);
      setResults(result);
      
      // Show success message
      if (result.routing_decision) {
        const agents = result.routing_decision.recommended_agents || [];
        alert(`✅ Processing Complete!\nRecommended agents: ${agents.join(', ')}\nCheck results below.`);
      }
      
    } catch (err: any) {
      console.error('Processing error:', err);
      setError(err.message || 'Processing failed - please check console for details');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setSelectedPatient('');
    setPrimaryConcern('');
    setError('');
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <h1 style={{
          color: '#007bff',
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '28px'
        }}>
          🏥 Discharge Planning Dashboard
        </h1>

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Form Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          marginBottom: '30px',
          border: '2px solid #007bff',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            color: '#007bff',
            marginBottom: '25px',
            fontSize: '22px'
          }}>
            📋 Patient Information
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Select Patient *
                </label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #ddd',
                    borderRadius: '5px'
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

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Urgency Level
                </label>
                <select
                  value={urgencyLevel}
                  onChange={(e) => setUrgencyLevel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #ddd',
                    borderRadius: '5px'
                  }}
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🔴 High Priority</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Primary Concern *
              </label>
              <textarea
                value={primaryConcern}
                onChange={(e) => setPrimaryConcern(e.target.value)}
                rows={4}
                required
                placeholder="Describe the primary concern for discharge planning..."
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '5px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#6c757d' : '#28a745',
                  color: 'white',
                  padding: '15px 40px',
                  fontSize: '18px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  marginRight: '10px'
                }}
              >
                {loading ? '⏳ Processing...' : '🚀 Process Discharge Planning'}
              </button>

              {results && (
                <button
                  type="button"
                  onClick={clearResults}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    padding: '15px 30px',
                    fontSize: '16px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Clear & Start New
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Section */}
        {results && (
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            border: '2px solid #28a745',
            marginBottom: '20px'
          }}>
            <h2 style={{
              color: '#28a745',
              marginBottom: '20px'
            }}>
              ✅ Discharge Planning Results
            </h2>
            
            {/* Routing Decision */}
            {results.routing_decision && (
              <div style={{
                backgroundColor: '#e8f5e8',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#155724', marginBottom: '15px' }}>
                  🎯 AI Routing Decision
                </h3>
                <p><strong>Patient:</strong> {results.routing_decision.patient_id}</p>
                <p><strong>Recommended Agents:</strong> {results.routing_decision.recommended_agents?.join(', ')}</p>
                <p><strong>Priority Score:</strong> {results.routing_decision.priority_score}/10</p>
                <p><strong>Timeline:</strong> {results.routing_decision.estimated_timeline}</p>
                <p><strong>Reasoning:</strong> {results.routing_decision.reasoning}</p>
              </div>
            )}

            {/* Agent Responses */}
            {results.agent_responses && results.agent_responses.length > 0 && (
              <div>
                <h3 style={{ color: '#28a745', marginBottom: '15px' }}>
                  🤖 Agent Recommendations
                </h3>
                {results.agent_responses.map((response: any, index: number) => (
                  <div key={index} style={{
                    backgroundColor: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    border: '1px solid #dee2e6'
                  }}>
                    <h4 style={{ color: '#007bff', marginBottom: '10px' }}>
                      {response.agent_type || `Agent ${index + 1}`}
                    </h4>
                    
                    {response.recommendations && (
                      <div style={{ marginBottom: '15px' }}>
                        <strong>Recommendations:</strong>
                        <ul style={{ marginTop: '5px' }}>
                          {response.recommendations.map((rec: string, i: number) => (
                            <li key={i} style={{ marginBottom: '5px' }}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {response.next_steps && (
                      <div style={{ marginBottom: '15px' }}>
                        <strong>Next Steps:</strong>
                        <ul style={{ marginTop: '5px' }}>
                          {response.next_steps.map((step: string, i: number) => (
                            <li key={i} style={{ marginBottom: '5px' }}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {response.external_referrals && (
                      <div>
                        <strong>External Referrals:</strong>
                        <ul style={{ marginTop: '5px' }}>
                          {response.external_referrals.map((ref: string, i: number) => (
                            <li key={i} style={{ marginBottom: '5px' }}>{ref}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Raw JSON for debugging */}
            <details style={{ marginTop: '20px' }}>
              <summary style={{ cursor: 'pointer', color: '#6c757d' }}>
                🔍 View Raw Response (Debug)
              </summary>
              <pre style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '5px',
                overflow: 'auto',
                fontSize: '12px',
                marginTop: '10px'
              }}>
                {JSON.stringify(results, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          color: '#666'
        }}>
          <p>Patients loaded: {patients.length} | Backend: http://localhost:8000</p>
        </div>
      </div>
    </div>
  );
};

export default WorkingDashboard;
