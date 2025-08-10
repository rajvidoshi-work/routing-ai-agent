import React from 'react';
import './PatientDetails.css';

const PatientDetails = ({ patient, onBack, onAIAnalysis }) => {
  return (
    <div className="patient-details-container">
      <header className="patient-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">+</div>
            <span className="logo-text">Adonix Medical</span>
          </div>
          <button onClick={onBack} className="back-btn">← Back to Dashboard</button>
        </div>
      </header>
      
      <main className="patient-main">
        <div className="patient-title-section">
          <div className="title-info">
            <h1 className="patient-title">John Miller - Patient Profile</h1>
            <p className="patient-subtitle">Room 302A • MRN: 123456789 • DOB: 03/15/1965</p>
          </div>
          <div className="action-buttons">
            <button className="ai-analysis-btn" onClick={onAIAnalysis}>Run AI Analysis</button>
            <button className="print-btn">Print Summary</button>
          </div>
        </div>
        
        <div className="details-grid">
          <div className="details-section">
            <h3>Patient Information</h3>
            <div className="info-card">
              <h4>Primary Diagnosis</h4>
              <p>Congestive Heart Failure</p>
            </div>
            <div className="info-card">
              <h4>Secondary Conditions</h4>
              <textarea readOnly value="Diabetes Type 2, Hypertension, COPD" />
            </div>
            <div className="info-card">
              <h4>Allergies</h4>
              <p>Penicillin, Shellfish</p>
            </div>
            <div className="info-card">
              <h4>Insurance</h4>
              <p>Medicare Primary, BCBS Second</p>
            </div>
          </div>
          
          <div className="details-section">
            <h3>Discharge Planning</h3>
            <div className="info-card">
              <h4>Planned Discharge Date</h4>
              <div className="date-input">
                <input type="date" defaultValue="2025-08-08" />
                <input type="time" defaultValue="14:00" />
              </div>
            </div>
            <div className="info-card">
              <h4>Discharge Destination</h4>
              <select defaultValue="home">
                <option value="home">Home with Home Health</option>
                <option value="rehab">Rehabilitation Facility</option>
                <option value="nursing">Nursing Home</option>
              </select>
            </div>
            <div className="info-card">
              <h4>Transportation</h4>
              <select defaultValue="family">
                <option value="family">Family</option>
                <option value="ambulance">Ambulance</option>
                <option value="taxi">Medical Taxi</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="details-grid">
          <div className="details-section">
            <h3>Care Team</h3>
            <div className="info-card">
              <h4>Primary Physician</h4>
              <p>Dr. James Wilson, MD</p>
            </div>
            <div className="info-card">
              <h4>Cardiologist</h4>
              <p>Dr. Sarah Kim, MD</p>
            </div>
            <div className="info-card">
              <h4>Primary Contact</h4>
              <p>Jane Miller (Daughter) - (555) 123-4567</p>
            </div>
            <div className="info-card">
              <h4>Emergency Contact</h4>
              <p>Mike Miller (Son) - (555) 987-6543</p>
            </div>
          </div>
          
          <div className="details-section">
            <h3>Current Medications</h3>
            <div className="medications-list">
              <div className="medication-item">
                <strong>Lisinopril 10mg</strong> - Once daily
              </div>
              <div className="medication-item">
                <strong>Metformin 500mg</strong> - Twice daily with meals
              </div>
              <div className="medication-item">
                <strong>Furosemide 20mg</strong> - Once daily morning
              </div>
              <div className="medication-item">
                <strong>Carvedilol 3.125mg</strong> - Twice daily
              </div>
            </div>
            <button className="update-medications-btn">Update Medications</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDetails;
