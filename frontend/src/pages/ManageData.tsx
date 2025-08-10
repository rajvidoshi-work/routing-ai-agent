import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, ListGroup, Modal, Badge, Form } from 'react-bootstrap';
import { dataAPI, DataStatus, FileInfo, Patient, handleApiError } from '../services/api';
import AdonixHeader from '../components/AdonixHeader';

const ManageData: React.FC = () => {
  const [dataStatus, setDataStatus] = useState<DataStatus | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger' | 'info' | 'warning'; text: string } | null>(null);
  const [showFormatModal, setShowFormatModal] = useState<boolean>(false);
  const [showDirectoryModal, setShowDirectoryModal] = useState<boolean>(false);
  const [newDirectory, setNewDirectory] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [statusResponse, patientsResponse, filesResponse] = await Promise.all([
        dataAPI.getDataStatus(),
        dataAPI.getPatients(),
        dataAPI.getAvailableFiles()
      ]);
      
      setDataStatus(statusResponse);
      setPatients(patientsResponse.patients);
      setFiles(filesResponse.files);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'danger', text: handleApiError(error) });
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadFile = async (filename: string) => {
    setLoading(true);
    try {
      const response = await dataAPI.loadFile(filename);
      setMessage({ type: 'success', text: response.message });
      await loadData(); // Refresh data
    } catch (error: any) {
      setMessage({ type: 'danger', text: handleApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      const response = await dataAPI.refreshData();
      setMessage({ type: 'success', text: response.message });
      await loadData(); // Refresh data
    } catch (error: any) {
      setMessage({ type: 'danger', text: handleApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDirectory = async () => {
    if (!newDirectory.trim()) {
      setMessage({ type: 'warning', text: 'Please enter a valid directory path' });
      return;
    }

    setLoading(true);
    try {
      const response = await dataAPI.setDataDirectory(newDirectory.trim());
      setMessage({ type: 'success', text: response.message });
      setShowDirectoryModal(false);
      setNewDirectory('');
      await loadData(); // Refresh data
    } catch (error: any) {
      setMessage({ type: 'danger', text: handleApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  const copyDirectoryPath = () => {
    if (dataStatus?.data_directory) {
      navigator.clipboard.writeText(dataStatus.data_directory);
      setMessage({ type: 'info', text: `Directory path copied to clipboard: ${dataStatus.data_directory}` });
    }
  };

  const getPatientStatusBadge = (patient: Patient) => {
    const badges = [];
    
    if (patient.skilled_nursing_needed === 'Yes') {
      badges.push(<Badge key="nursing" bg="success" className="me-1">Nursing</Badge>);
    }
    
    if (patient.equipment_needed && patient.equipment_needed !== 'None') {
      badges.push(<Badge key="equipment" bg="warning" className="me-1">Equipment</Badge>);
    }
    
    if (patient.medication) {
      badges.push(<Badge key="medication" bg="info" className="me-1">Medication</Badge>);
    }
    
    if (patient.insurance_coverage_status === 'Pending' || patient.insurance_coverage_status === 'Denied') {
      badges.push(<Badge key="insurance" bg="danger" className="me-1">Insurance Issue</Badge>);
    }
    
    return badges.length > 0 ? badges : <Badge bg="secondary">Standard</Badge>;
  };

  const getFileStatusIcon = (file: FileInfo) => {
    const now = new Date();
    const fileDate = new Date(file.modified);
    const hoursDiff = (now.getTime() - fileDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff < 1) return <i className="fas fa-circle text-success me-2" title="Recently modified"></i>;
    if (hoursDiff < 24) return <i className="fas fa-circle text-warning me-2" title="Modified today"></i>;
    return <i className="fas fa-circle text-muted me-2" title="Older file"></i>;
  };

  const nursingCount = patients.filter(p => p.skilled_nursing_needed?.toLowerCase() === 'yes').length;
  const equipmentCount = patients.filter(p => p.equipment_needed && p.equipment_needed !== 'None').length;
  const insuranceIssues = patients.filter(p => 
    p.insurance_coverage_status === 'Pending' || p.insurance_coverage_status === 'Denied'
  ).length;

  return (
    <>
      <AdonixHeader 
        showBackButton={true}
        backButtonText="← Back to Dashboard"
        backButtonPath="/"
      />
      <Container className="mt-4">
      {/* Page Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <i className="fas fa-database me-2"></i>
                Manage Patient Data
              </h2>
              <p className="text-muted">
                Manage Excel files, monitor data loading status, and view loaded patients
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              {refreshing && <i className="fas fa-sync fa-spin text-primary"></i>}
              <Badge bg={dataStatus?.total_patients ? 'success' : 'warning'} className="p-2">
                {dataStatus?.total_patients || 0} Patients Loaded
              </Badge>
            </div>
          </div>
        </Col>
      </Row>

      {/* Message Display */}
      {message && (
        <Alert 
          variant={message.type} 
          dismissible 
          onClose={() => setMessage(null)}
          className="mb-4"
        >
          <i className={`fas fa-${
            message.type === 'success' ? 'check-circle' : 
            message.type === 'danger' ? 'exclamation-triangle' : 
            message.type === 'warning' ? 'exclamation-triangle' :
            'info-circle'
          } me-2`}></i>
          {message.text}
        </Alert>
      )}

      {/* Data Management Section */}
      <Row className="mb-4">
        <Col>
          <Card className="data-card">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5>
                  <i className="fas fa-folder-open me-2"></i>
                  Patient Data Management
                </h5>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setShowDirectoryModal(true)}
                  >
                    <i className="fas fa-cog me-1"></i>
                    Settings
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                {/* Data Directory */}
                <Col md={8} className="mb-3">
                  <label className="form-label">Data Directory</label>
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      value={dataStatus?.data_directory || ''} 
                      readOnly 
                    />
                    <Button variant="outline-secondary" onClick={loadData} disabled={refreshing}>
                      <i className={`fas fa-sync ${refreshing ? 'fa-spin' : ''} me-1`}></i>
                      Refresh
                    </Button>
                  </div>
                  <div className="form-text">Excel files are automatically loaded from this directory</div>
                </Col>

                {/* Quick Actions */}
                <Col md={4} className="mb-3">
                  <label className="form-label">Quick Actions</label>
                  <div className="d-flex flex-column gap-2">
                    <Button 
                      variant="primary" 
                      onClick={handleRefreshData}
                      disabled={loading}
                    >
                      <i className="fas fa-sync me-1"></i>
                      Reload Latest File
                    </Button>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-info" 
                        size="sm"
                        onClick={() => setShowFormatModal(true)}
                      >
                        <i className="fas fa-info-circle me-1"></i>
                        Format Guide
                      </Button>
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={copyDirectoryPath}
                      >
                        <i className="fas fa-copy me-1"></i>
                        Copy Path
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Data Status Overview */}
              {dataStatus && (
                <Row className="mb-3">
                  <Col>
                    <Alert variant={dataStatus.total_patients > 0 ? 'success' : 'warning'} className="mb-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <i className={`fas fa-${dataStatus.total_patients > 0 ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
                          <strong>{dataStatus.status}</strong>
                        </div>
                        <div className="d-flex gap-3">
                          <span><strong>{dataStatus.total_patients}</strong> Total Patients</span>
                          <span><strong>{files.length}</strong> Available Files</span>
                        </div>
                      </div>
                    </Alert>
                  </Col>
                </Row>
              )}

              {/* Available Files */}
              <Row>
                <Col>
                  <h6>
                    <i className="fas fa-file-excel me-2"></i>
                    Available Files ({files.length})
                  </h6>
                  <ListGroup>
                    {files.length > 0 ? (
                      files.map((file, index) => (
                        <ListGroup.Item 
                          key={index} 
                          className="file-item d-flex justify-content-between align-items-center"
                        >
                          <div className="d-flex align-items-center">
                            {getFileStatusIcon(file)}
                            <div>
                              <strong>
                                <i className="fas fa-file-excel text-success me-2"></i>
                                {file.filename}
                              </strong>
                              <br />
                              <small className="text-muted">
                                Modified: {file.modified} | Size: {(file.size / 1024).toFixed(1)} KB
                              </small>
                            </div>
                          </div>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleLoadFile(file.filename)}
                            disabled={loading}
                          >
                            <i className="fas fa-upload me-1"></i>
                            Load File
                          </Button>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <ListGroup.Item className="text-muted text-center py-4">
                        <i className="fas fa-folder-open fa-3x mb-3 d-block"></i>
                        <strong>No Excel files found</strong>
                        <br />
                        <small>Place your Excel files in: {dataStatus?.data_directory}</small>
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Patient Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <i className="fas fa-users fa-2x text-primary mb-2"></i>
              <h3 className="text-primary">{patients.length}</h3>
              <p className="mb-0 text-muted">Total Patients</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <i className="fas fa-user-nurse fa-2x text-success mb-2"></i>
              <h3 className="text-success">{nursingCount}</h3>
              <p className="mb-0 text-muted">Need Nursing</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <i className="fas fa-wheelchair fa-2x text-warning mb-2"></i>
              <h3 className="text-warning">{equipmentCount}</h3>
              <p className="mb-0 text-muted">Need Equipment</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <i className="fas fa-exclamation-triangle fa-2x text-danger mb-2"></i>
              <h3 className="text-danger">{insuranceIssues}</h3>
              <p className="mb-0 text-muted">Insurance Issues</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Loaded Patients Section */}
      <Row>
        <Col>
          <Card className="patient-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>
                <i className="fas fa-users me-2"></i>
                Loaded Patients ({patients.length})
              </h5>
              <Button variant="outline-primary" size="sm" onClick={loadData} disabled={refreshing}>
                <i className={`fas fa-sync ${refreshing ? 'fa-spin' : ''} me-1`}></i>
                Refresh
              </Button>
            </Card.Header>
            <Card.Body>
              {patients.length > 0 ? (
                <Row>
                  {patients.map((patient, index) => (
                    <Col md={6} lg={4} key={index} className="mb-3">
                      <Card className="h-100 border-start border-4" style={{ borderLeftColor: '#0ea5e9' }}>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Card.Title className="h6 mb-0">
                              <i className="fas fa-user me-2"></i>
                              {patient.name}
                            </Card.Title>
                            {getPatientStatusBadge(patient)}
                          </div>
                          <Card.Text className="small">
                            <div className="mb-1">
                              <strong>ID:</strong> {patient.patient_id || 'N/A'}
                            </div>
                            <div className="mb-1">
                              <strong>Diagnosis:</strong> {patient.primary_diagnosis}
                            </div>
                            <div className="mb-1">
                              <strong>Nursing:</strong>{' '}
                              <span className={`badge ${patient.skilled_nursing_needed === 'Yes' ? 'bg-success' : 'bg-secondary'}`}>
                                {patient.skilled_nursing_needed || 'No'}
                              </span>
                            </div>
                            <div className="mb-1">
                              <strong>Equipment:</strong> {patient.equipment_needed || 'None'}
                            </div>
                            {patient.medication && (
                              <div className="mb-1">
                                <strong>Medication:</strong> {patient.medication}
                              </div>
                            )}
                            {patient.insurance_coverage_status && (
                              <div>
                                <strong>Insurance:</strong>{' '}
                                <span className={`badge ${
                                  patient.insurance_coverage_status === 'Active' ? 'bg-success' :
                                  patient.insurance_coverage_status === 'Pending' ? 'bg-warning' :
                                  patient.insurance_coverage_status === 'Denied' ? 'bg-danger' :
                                  'bg-secondary'
                                }`}>
                                  {patient.insurance_coverage_status}
                                </span>
                              </div>
                            )}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="fas fa-users fa-4x mb-3"></i>
                  <h5>No patients loaded yet</h5>
                  <p>Load an Excel file to see patient information here.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Directory Settings Modal */}
      <Modal show={showDirectoryModal} onHide={() => setShowDirectoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-cog me-2"></i>
            Data Directory Settings
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current Directory</Form.Label>
              <Form.Control 
                type="text" 
                value={dataStatus?.data_directory || ''} 
                readOnly 
                className="bg-light"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Directory Path</Form.Label>
              <Form.Control
                type="text"
                value={newDirectory}
                onChange={(e) => setNewDirectory(e.target.value)}
                placeholder="Enter new directory path..."
              />
              <Form.Text className="text-muted">
                Enter the full path to the directory containing your Excel files.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDirectoryModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSetDirectory}
            disabled={loading || !newDirectory.trim()}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin me-1"></i>
                Updating...
              </>
            ) : (
              <>
                <i className="fas fa-save me-1"></i>
                Update Directory
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Format Guide Modal */}
      <Modal show={showFormatModal} onHide={() => setShowFormatModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-table me-2"></i>
            Excel File Format Guide
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Instructions:</strong> Place your Excel files (.xlsx or .xls) in the data directory. 
            The system will automatically load the most recent file.
          </Alert>
          
          <h6>Required Excel Columns:</h6>
          <Row>
            <Col md={6}>
              <h6 className="text-primary">Patient Information</h6>
              <ul className="list-unstyled small">
                <li>• <code>PatientID</code> or <code>Patient ID</code></li>
                <li>• <code>Name</code></li>
                <li>• <code>Gender</code></li>
                <li>• <code>Date of Birth</code> or <code>Age</code></li>
                <li>• <code>MRN</code></li>
                <li>• <code>Address</code></li>
                <li>• <code>Contact Number</code> or <code>Phone</code></li>
              </ul>
              
              <h6 className="text-success">Medical Information</h6>
              <ul className="list-unstyled small">
                <li>• <code>Primary ICU Diagnosis</code></li>
                <li>• <code>Secondary Diagnoses</code></li>
                <li>• <code>Allergies</code></li>
                <li>• <code>ICU Admission Date</code></li>
                <li>• <code>ICU Discharge Date</code></li>
                <li>• <code>Length of Stay (Days)</code></li>
              </ul>
            </Col>
            <Col md={6}>
              <h6 className="text-warning">Medication & Care</h6>
              <ul className="list-unstyled small">
                <li>• <code>Medication</code></li>
                <li>• <code>Dosage</code></li>
                <li>• <code>Frequency</code></li>
                <li>• <code>Route</code></li>
                <li>• <code>Prescriber Name</code></li>
                <li>• <code>NPI Number</code></li>
                <li>• <code>Skilled Nursing Needed</code></li>
                <li>• <code>Nursing Visit Frequency</code></li>
              </ul>
              
              <h6 className="text-danger">Equipment & Services</h6>
              <ul className="list-unstyled small">
                <li>• <code>Equipment Needed</code></li>
                <li>• <code>DME Supplier</code></li>
                <li>• <code>Physical Therapy</code></li>
                <li>• <code>Transportation Needed</code></li>
                <li>• <code>Insurance Coverage Status</code></li>
                <li>• <code>Special Instructions</code></li>
              </ul>
            </Col>
          </Row>
          
          <Alert variant="success">
            <i className="fas fa-check-circle me-2"></i>
            <strong>Flexible Column Names:</strong> The system supports multiple column name variations 
            (e.g., "PatientID", "Patient ID", "patient_id" all work for patient identification).
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFormatModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
    </>
  );
};

export default ManageData;
