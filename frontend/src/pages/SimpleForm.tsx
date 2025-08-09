import React, { useState } from 'react';

const SimpleForm: React.FC = () => {
  const [patientName, setPatientName] = useState('');
  const [concern, setConcern] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Patient: ${patientName}\nConcern: ${concern}`);
  };

  return (
    <div style={{
      padding: '40px',
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#f8f9fa',
        padding: '40px',
        borderRadius: '10px',
        border: '3px solid #007bff'
      }}>
        <h1 style={{
          color: '#007bff',
          textAlign: 'center',
          marginBottom: '40px',
          fontSize: '32px'
        }}>
          🏥 Discharge Planning Form
        </h1>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Patient Name:
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter patient name..."
              required
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Primary Concern:
            </label>
            <textarea
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              rows={5}
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '5px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
              placeholder="Describe the discharge planning concern..."
              required
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '20px 50px',
                fontSize: '20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🚀 Submit Form
            </button>
          </div>
        </form>

        <div style={{
          marginTop: '40px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px'
        }}>
          <p>✅ This is a simple HTML form with inline styles</p>
          <p>🌐 Running on: http://localhost:3003</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleForm;
