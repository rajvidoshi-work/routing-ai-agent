import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge, ProgressBar } from 'react-bootstrap';
import { dataAPI, routingAPI, Patient, RoutingRequest, CompleteCase, PatientData, CaregiverInput, handleApiError } from '../services/api';
import RoutingResults from '../components/RoutingResults';

const Dashboard: React.FC = () => {
  // State Management
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [primaryConcern, setPrimaryConcern] = useState<string>('');
  const [requestedServices, setRequestedServices] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  
  // Processing State
  const [loading, setLoading] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [results, setResults] = useState<CompleteCase | null>(null);
  const [error, setError] = useState<string>('');
  
  // Data Status
  const [dataStatus, setDataStatus] = useState<{ total: number; loaded: boolean }>({ total: 0, loaded: false });

  useEffect(() => {
    // Clear any existing results on page load
    setResults(null);
    setError('');
    setLoading(false);
    
    loadPatients();
    checkDataStatus();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await dataAPI.getPatients();
      setPatients(response.patients);
      setDataStatus({ total: response.total, loaded: response.total > 0 });
    } catch (error) {
      console.error('Error loading patients:', error);
      setError('Failed to load patients. Please check if data is loaded in Manage Data.');
    }
  };

  const checkDataStatus = async () => {
    try {
      const status = await dataAPI.getDataStatus();
      setDataStatus({ total: status.total_patients, loaded: status.total_patients > 0 });
    } catch (error) {
      console.error('Error checking data status:', error);
    }
  };

  const getSelectedPatientData = (): PatientData | null => {
    const patient = patients.find(p => p.patient_id === selectedPatient);
    if (!patient) return null;

    return {
      patient_id: patient.patient_id,
      name: patient.name,
      gender: patient.gender || 'Unknown',
      primary_icu_diagnosis: patient.primary_diagnosis,
      secondary_diagnoses: '',
      age: patient.age,
      mrn: patient.mrn,
      address: patient.address,
      phone: patient.phone,
      allergies: patient.allergies,
      medication: patient.medication,
      skilled_nursing_needed: patient.skilled_nursing_needed,
      equipment_needed: patient.equipment_needed,
      insurance_coverage_status: patient.insurance_coverage_status
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      setError('Please select a patient');
      return;
    }

    const patientData = getSelectedPatientData();
    if (!patientData) {
      setError('Selected patient data not found');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    setProcessingStep('Initializing discharge planning workflow...');

    try {
      const caregiverInput: CaregiverInput = {
        patient_id: patientData.patient_id,
        urgency_level: urgencyLevel,
        primary_concern: primaryConcern,
        requested_services: requestedServices.split(',').map(s => s.trim()).filter(s => s),
        additional_notes: additionalNotes
      };

      const request: RoutingRequest = {
        patient_data: patientData,
        caregiver_input: caregiverInput
      };

      setProcessingStep('Analyzing patient case and determining routing...');
      
      // Process complete case with all agents
      const response = await routingAPI.processCompleteCase(request);
      
      setProcessingStep('Processing complete! Generating recommendations...');
      setResults(response);
      
      // Scroll to top to show both form and results
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error: any) {
      console.error('Error processing case:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
      setProcessingStep('');
    }
  };

  const handleQuickAction = async (action: 'route-only' | 'nursing' | 'dme' | 'pharmacy' | 'state') => {
    if (!selectedPatient) {
      setError('Please select a patient first');
      return;
    }

    const patientData = getSelectedPatientData();
    if (!patientData) {
      setError('Selected patient data not found');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const caregiverInput: CaregiverInput = {
        patient_id: patientData.patient_id,
        urgency_level: urgencyLevel,
        primary_concern: primaryConcern || 'Quick action processing',
        requested_services: requestedServices.split(',').map(s => s.trim()).filter(s => s),
        additional_notes: additionalNotes
      };

      const request: RoutingRequest = {
        patient_data: patientData,
        caregiver_input: caregiverInput
      };

      let response;
      switch (action) {
        case 'route-only':
          setProcessingStep('Getting routing decision...');
          const routingDecision = await routingAPI.routePatient(request);
          setResults({ routing_decision: routingDecision, agent_responses: [] });
          break;
        case 'nursing':
          setProcessingStep('Processing nursing agent...');
          response = await routingAPI.processNursingAgent(request);
          setResults({ 
            routing_decision: { 
              patient_id: patientData.patient_id, 
              recommended_agents: ['nursing'], 
              reasoning: 'Direct nursing agent processing',
              priority_score: 7,
              estimated_timeline: 'Within 24 hours'
            }, 
            agent_responses: [response] 
          });
          break;
        case 'dme':
          setProcessingStep('Processing DME agent...');
          response = await routingAPI.processDMEAgent(request);
          setResults({ 
            routing_decision: { 
              patient_id: patientData.patient_id, 
              recommended_agents: ['dme'], 
              reasoning: 'Direct DME agent processing',
              priority_score: 6,
              estimated_timeline: 'Within 48 hours'
            }, 
            agent_responses: [response] 
          });
          break;
        case 'pharmacy':
          setProcessingStep('Processing pharmacy agent...');
          response = await routingAPI.processPharmacyAgent(request);
          setResults({ 
            routing_decision: { 
              patient_id: patientData.patient_id, 
              recommended_agents: ['pharmacy'], 
              reasoning: 'Direct pharmacy agent processing',
              priority_score: 6,
              estimated_timeline: 'Within 24 hours'
            }, 
            agent_responses: [response] 
          });
          break;
        case 'state':
          setProcessingStep('Processing state/insurance agent...');
          response = await routingAPI.processStateAgent(request);
          setResults({ 
            routing_decision: { 
              patient_id: patientData.patient_id, 
              recommended_agents: ['state'], 
              reasoning: 'Direct state agent processing',
              priority_score: 5,
              estimated_timeline: 'Within 72 hours'
            }, 
            agent_responses: [response] 
          });
          break;
      }
    } catch (error: any) {
      console.error('Error in quick action:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
      setProcessingStep('');
    }
  };

  const selectedPatientInfo = patients.find(p => p.patient_id === selectedPatient);

  return (
    <Container className="mt-4">
      {/* Data Status Alert */}
      {!dataStatus.loaded && (
        <Alert variant="warning" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>No patient data loaded.</strong> Please go to{' '}
          <Alert.Link href="/manage-data">Manage Data</Alert.Link> to load patient information.
        </Alert>
      )}

      {dataStatus.loaded && (
        <Alert variant="info" className="mb-4">
          <i className="fas fa-info-circle me-2"></i>
          <strong>{dataStatus.total} patients loaded</strong> and ready for discharge planning.
        </Alert>
      )}

      {/* Caregiver Input Section - Always Show */}
      <Card className="mb-4" style={{ position: 'relative', zIndex: 10 }}>
        <Card.Header style={{ backgroundColor: '#007bff', color: 'white' }}>
          <h4 className="mb-0">
            <i className="fas fa-user-nurse me-2"></i>
            Discharge Planning Workflow
          </h4>
        </Card.Header>
        <Card.Body style={{ backgroundColor: '#ffffff', minHeight: '400px' }}>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Patient *</Form.Label>
                  <Form.Select 
                    value={selectedPatient} 
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    required
                  >
                    <option value="">Choose patient...</option>
                    {patients.map(patient => (
                      <option key={patient.patient_id} value={patient.patient_id}>
                        {patient.name} - {patient.primary_diagnosis}
                      </option>
                    ))}
                  </Form.Select>
                  {selectedPatientInfo && (
                    <Form.Text className="text-muted">
                      <i className="fas fa-user me-1"></i>
                      ID: {selectedPatientInfo.patient_id} | 
                      Nursing: <Badge bg={selectedPatientInfo.skilled_nursing_needed === 'Yes' ? 'success' : 'secondary'}>
                        {selectedPatientInfo.skilled_nursing_needed || 'No'}
                      </Badge> | 
                      Equipment: {selectedPatientInfo.equipment_needed || 'None'}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Urgency Level</Form.Label>
                <Form.Select 
                  value={urgencyLevel} 
                  onChange={(e) => setUrgencyLevel(e.target.value as 'low' | 'medium' | 'high')}
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🔴 High Priority</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Requested Services</Form.Label>
                <Form.Control
                  type="text"
                  value={requestedServices}
                  onChange={(e) => setRequestedServices(e.target.value)}
                  placeholder="nursing, equipment, pharmacy"
                />
                <Form.Text className="text-muted">
                  Comma-separated services
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Primary Concern *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={primaryConcern}
                  onChange={(e) => setPrimaryConcern(e.target.value)}
                  placeholder="Describe the primary concern for discharge planning (e.g., patient needs home health coordination, equipment setup, medication management)..."
                  required
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Additional Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any additional information, special considerations, or discharge planning requirements..."
                />
              </Form.Group>
            </Col>
          </Row>
          
          <div className="mt-3">
            <Row>
              <Col md={6}>
                <Button 
                  type="submit" 
                  variant="success" 
                  size="lg" 
                  disabled={loading}
                  className="me-2 mb-2"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-route me-2"></i>
                      Complete Discharge Planning
                    </>
                  )}
                </Button>
              </Col>
              
              <Col md={6}>
                <div className="d-flex flex-wrap gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => handleQuickAction('route-only')}
                    disabled={loading || !selectedPatient}
                  >
                    <i className="fas fa-route me-1"></i>
                    Route Only
                  </Button>
                  <Button 
                    variant="outline-success" 
                    size="sm"
                    onClick={() => handleQuickAction('nursing')}
                    disabled={loading || !selectedPatient}
                  >
                    <i className="fas fa-user-nurse me-1"></i>
                    Nursing
                  </Button>
                  <Button 
                    variant="outline-warning" 
                    size="sm"
                    onClick={() => handleQuickAction('dme')}
                    disabled={loading || !selectedPatient}
                  >
                    <i className="fas fa-wheelchair me-1"></i>
                    DME
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleQuickAction('pharmacy')}
                    disabled={loading || !selectedPatient}
                  >
                    <i className="fas fa-pills me-1"></i>
                    Pharmacy
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => handleQuickAction('state')}
                    disabled={loading || !selectedPatient}
                  >
                    <i className="fas fa-file-medical me-1"></i>
                    Insurance
                  </Button>
                </div>
                <Form.Text className="text-muted">
                  Quick actions for individual agent processing
                </Form.Text>
              </Col>
            </Row>
          </div>
        </Form>
        </Card.Body>
      </Card>

      {/* Processing Status */}
      {loading && processingStep && (
        <Card className="mt-4">
          <Card.Body className="text-center">
            <Spinner animation="border" variant="primary" className="me-3" />
            <strong>{processingStep}</strong>
            <ProgressBar 
              animated 
              now={100} 
              className="mt-2" 
              style={{ height: '8px' }}
            />
          </Card.Body>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="danger" className="mt-3" dismissible onClose={() => setError('')}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {/* Results Section */}
      {results && (
        <div className="result-section">
          <div className="d-flex justify-content-end mb-3">
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => {
                setResults(null);
                setSelectedPatient('');
                setPrimaryConcern('');
                setRequestedServices('');
                setAdditionalNotes('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <i className="fas fa-times me-1"></i>
              Clear Results & Start New Case
            </Button>
          </div>
          <RoutingResults results={results} />
        </div>
      )}
    </Container>
  );
};

export default Dashboard;
