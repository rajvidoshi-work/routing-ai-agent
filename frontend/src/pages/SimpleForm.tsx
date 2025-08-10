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
      background: 'linear-gradient(135deg, #e8f4fd 0%, #f0f9ff 100%)',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '40px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          color: '#1e293b',
          textAlign: 'center',
          marginBottom: '40px',
          fontSize: '32px',
          fontWeight: '700'
        }}>
          Discharge Planning Form
        </h1>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Patient Name:
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '16px',
                border: '2px solid #f1f5f9',
                borderRadius: '16px',
                background: '#f8fafc',
                transition: 'all 0.3s ease',
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
              fontSize: '14px',
              fontWeight: '600',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Primary Concern:
            </label>
            <textarea
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              rows={5}
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '16px',
                border: '2px solid #f1f5f9',
                borderRadius: '16px',
                boxSizing: 'border-box',
                background: '#f8fafc',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit',
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
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                color: 'white',
                padding: '18px 32px',
                fontSize: '16px',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                fontWeight: '600',
                boxShadow: '0 8px 24px rgba(14, 165, 233, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              Submit Form
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
