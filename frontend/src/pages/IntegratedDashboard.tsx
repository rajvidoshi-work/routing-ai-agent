import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollToTop } from '../hooks/useScrollToTop';
import './Dashboard.css';

interface IntegratedDashboardProps {}

const IntegratedDashboard: React.FC<IntegratedDashboardProps> = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Scroll to top when component mounts
  useScrollToTop();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/patients');
      const data = await response.json();
      
      if (data.patients && data.patients.length > 0) {
        setPatients(data.patients);
      } else {
        setError('No patients found. Please load patient data first.');
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
      setError('Failed to load patients. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = (patientId: string) => {
    const selectedPatient = patients.find(p => p.patient_id === patientId);
    if (selectedPatient) {
      // Navigate to patient details page with the selected patient
      navigate('/patient-details', { 
        state: { 
          selectedPatientId: patientId,
          fromDashboard: true 
        } 
      });
    }
  };

  const handleManageData = () => {
    navigate('/manage-data');
  };

  const getStatusBadge = (patient: any) => {
    // Determine status based on patient data
    if (patient.skilled_nursing_needed === 'Yes' && patient.equipment_needed) {
      return { class: 'urgent', text: 'URGENT' };
    } else if (patient.skilled_nursing_needed === 'Yes') {
      return { class: 'planning', text: 'PLANNING' };
    } else {
      return { class: 'ready', text: 'READY' };
    }
  };

  const getPriority = (patient: any) => {
    // Determine priority based on patient data
    if (patient.skilled_nursing_needed === 'Yes' && patient.equipment_needed) {
      return 'High';
    } else if (patient.skilled_nursing_needed === 'Yes') {
      return 'Medium';
    } else {
      return 'Low';
    }
  };

  const getRoom = (patientId: string) => {
    // Generate room numbers based on patient ID for demo
    const roomNumbers = ['302A', '415B', '201C', '318D', '205A', '412B'];
    const index = parseInt(patientId.replace(/\D/g, '')) % roomNumbers.length;
    return `Room ${roomNumbers[index]}`;
  };

  const getDischargeDate = (index: number) => {
    const dates = [
      'Today, 2:00 PM',
      'Tomorrow, 10:00 AM',
      'Aug 10, 9:00 AM',
      'Aug 11, 3:00 PM',
      'Aug 12, 11:00 AM'
    ];
    return dates[index % dates.length];
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-main">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading patient data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-main">
          <div className="alert alert-warning text-center">
            <h4>No Patient Data Available</h4>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={handleManageData}>
              Load Patient Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">+</div>
            <span className="logo-text">Adonix Medical</span>
          </div>
          <div className="user-section">
            <span className="welcome-text">Welcome, Healthcare Professional</span>
            <button onClick={handleManageData} className="logout-btn">Manage Data</button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Patients</h3>
            <p className="card-number">{patients.length}</p>
            <p className="card-subtitle">Active patients</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Discharging Today</h3>
            <p className="card-number">{Math.ceil(patients.length / 3)}</p>
            <p className="card-subtitle">Today's schedule</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Pending Reviews</h3>
            <p className="card-number">{Math.ceil(patients.length / 2)}</p>
            <p className="card-subtitle">Pending reviews</p>
          </div>
          
          <div className="dashboard-card">
            <h3>Alerts</h3>
            <p className="card-number">{patients.filter(p => p.skilled_nursing_needed === 'Yes' && p.equipment_needed).length}</p>
            <p className="card-subtitle">Urgent notifications</p>
          </div>
        </div>
        
        <div className="priority-patients">
          <h2 className="section-title">Priority Patients</h2>
          <div className="patients-table">
            <div className="table-header">
              <div className="header-cell">Patient</div>
              <div className="header-cell">Room</div>
              <div className="header-cell">Discharge Date</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Priority</div>
              <div className="header-cell">Actions</div>
            </div>
            
            {patients.map((patient, index) => {
              const status = getStatusBadge(patient);
              const priority = getPriority(patient);
              const room = getRoom(patient.patient_id);
              const dischargeDate = getDischargeDate(index);
              
              return (
                <div key={patient.patient_id} className="table-row">
                  <div className="patient-info">
                    <div className="patient-name">{patient.name}</div>
                    <div className="patient-dob">ID: {patient.patient_id}</div>
                  </div>
                  <div className="room-info">{room}</div>
                  <div className="discharge-date">{dischargeDate}</div>
                  <div className="status-cell">
                    <span className={`status-badge ${status.class}`}>{status.text}</span>
                  </div>
                  <div className="priority-cell">{priority}</div>
                  <div className="actions-cell">
                    <button 
                      className="view-details-btn" 
                      onClick={() => handleViewPatient(patient.patient_id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default IntegratedDashboard;
