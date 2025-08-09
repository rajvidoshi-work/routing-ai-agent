import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';

const NewDashboard: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [primaryConcern, setPrimaryConcern] = useState<string>('');
  const [urgencyLevel, setUrgencyLevel] = useState<string>('medium');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Load patients from API
    fetch('http://localhost:8000/api/patients')
      .then(res => res.json())
      .then(data => {
        setPatients(data.patients || []);
      })
      .catch(err => {
        console.error('Error loading patients:', err);
        setError('Failed to load patients');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simple form submission
      alert(`Processing discharge planning for patient: ${selectedPatient}\nConcern: ${primaryConcern}\nUrgency: ${urgencyLevel}`);
    } catch (err) {
      setError('Processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Container>
        <h1 style={{ color: '#007bff', marginBottom: '30px' }}>
          🏥 Discharge Planning Dashboard
        </h1>

        {error && (
          <Alert variant="danger" style={{ marginBottom: '20px' }}>
            {error}
          </Alert>
        )}

        <Card style={{ marginBottom: '30px', border: '2px solid #007bff' }}>
          <Card.Header style={{ backgroundColor: '#007bff', color: 'white' }}>
            <h3 style={{ margin: 0 }}>📋 Patient Discharge Form</h3>
          </Card.Header>
          <Card.Body style={{ padding: '30px' }}>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group style={{ marginBottom: '20px' }}>
                    <Form.Label style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      Select Patient *
                    </Form.Label>
                    <Form.Select
                      value={selectedPatient}
                      onChange={(e) => setSelectedPatient(e.target.value)}
                      required
                      style={{ padding: '10px', fontSize: '16px' }}
                    >
                      <option value="">Choose a patient...</option>
                      {patients.map((patient, index) => (
                        <option key={index} value={patient.patient_id}>
                          {patient.name} - {patient.primary_diagnosis}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group style={{ marginBottom: '20px' }}>
                    <Form.Label style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      Urgency Level
                    </Form.Label>
                    <Form.Select
                      value={urgencyLevel}
                      onChange={(e) => setUrgencyLevel(e.target.value)}
                      style={{ padding: '10px', fontSize: '16px' }}
                    >
                      <option value="low">🟢 Low Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="high">🔴 High Priority</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <Form.Group style={{ marginBottom: '20px' }}>
                    <Form.Label style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      Primary Concern *
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={primaryConcern}
                      onChange={(e) => setPrimaryConcern(e.target.value)}
                      placeholder="Describe the primary concern for discharge planning..."
                      required
                      style={{ padding: '15px', fontSize: '16px' }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  disabled={loading}
                  style={{ 
                    padding: '15px 40px', 
                    fontSize: '18px',
                    minWidth: '250px'
                  }}
                >
                  {loading ? '⏳ Processing...' : '🚀 Process Discharge Planning'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <div style={{ textAlign: 'center', color: '#666' }}>
          <p>Patients loaded: {patients.length}</p>
          <p>Backend API: http://localhost:8000</p>
        </div>
      </Container>
    </div>
  );
};

export default NewDashboard;
