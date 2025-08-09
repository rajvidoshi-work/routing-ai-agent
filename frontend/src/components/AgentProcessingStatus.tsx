import React from 'react';
import { Card, ProgressBar, Spinner, Badge } from 'react-bootstrap';
import { AgentProcessingStatus as StatusType, agentUtils } from '../services/api';

interface AgentProcessingStatusProps {
  statuses: StatusType[];
  currentStep?: string;
}

const AgentProcessingStatus: React.FC<AgentProcessingStatusProps> = ({ statuses, currentStep }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'fas fa-clock text-muted';
      case 'processing': return 'fas fa-spinner fa-spin text-primary';
      case 'completed': return 'fas fa-check-circle text-success';
      case 'error': return 'fas fa-exclamation-triangle text-danger';
      default: return 'fas fa-question-circle text-muted';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'primary';
      case 'completed': return 'success';
      case 'error': return 'danger';
      default: return 'light';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Waiting';
      case 'processing': return 'Processing';
      case 'completed': return 'Complete';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  const completedCount = statuses.filter(s => s.status === 'completed').length;
  const totalCount = statuses.length;
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className="mt-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="fas fa-tasks me-2"></i>
          Agent Processing Status
        </h6>
        <Badge bg="info">
          {completedCount}/{totalCount} Complete
        </Badge>
      </Card.Header>
      <Card.Body>
        {/* Overall Progress */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold">Overall Progress</span>
            <span className="text-muted">{Math.round(overallProgress)}%</span>
          </div>
          <ProgressBar 
            now={overallProgress} 
            variant={overallProgress === 100 ? 'success' : 'primary'}
            animated={overallProgress < 100}
            style={{ height: '10px' }}
          />
        </div>

        {/* Current Step */}
        {currentStep && (
          <div className="mb-4 p-3 bg-light rounded">
            <div className="d-flex align-items-center">
              <Spinner animation="border" size="sm" className="me-3" />
              <span className="fw-bold">{currentStep}</span>
            </div>
          </div>
        )}

        {/* Individual Agent Statuses */}
        <div className="row">
          {statuses.map((agentStatus, index) => (
            <div key={index} className="col-md-6 mb-3">
              <div className="d-flex align-items-center p-3 border rounded">
                <div className="me-3">
                  <i 
                    className={agentUtils.getAgentIcon(agentStatus.agent_type)}
                    style={{ 
                      color: agentUtils.getAgentColor(agentStatus.agent_type),
                      fontSize: '1.5rem'
                    }}
                  ></i>
                </div>
                
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold">
                      {agentUtils.getAgentDisplayName(agentStatus.agent_type)}
                    </span>
                    <Badge bg={getStatusVariant(agentStatus.status)}>
                      {getStatusText(agentStatus.status)}
                    </Badge>
                  </div>
                  
                  {agentStatus.progress !== undefined && (
                    <ProgressBar 
                      now={agentStatus.progress} 
                      variant={getStatusVariant(agentStatus.status)}
                      className="mb-1"
                      style={{ height: '8px' }}
                    />
                  )}
                  
                  {agentStatus.message && (
                    <div className="text-muted small">
                      {agentStatus.message}
                    </div>
                  )}
                </div>
                
                <div className="ms-2">
                  <i className={getStatusIcon(agentStatus.status)}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Processing Timeline */}
        {statuses.length > 0 && (
          <div className="mt-4">
            <h6 className="mb-3">Processing Timeline</h6>
            <div className="timeline">
              {statuses.map((agentStatus, index) => (
                <div key={index} className="timeline-item d-flex align-items-center mb-2">
                  <div className="timeline-marker me-3">
                    <i 
                      className={getStatusIcon(agentStatus.status)}
                      style={{ fontSize: '1.2rem' }}
                    ></i>
                  </div>
                  <div className="timeline-content flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">
                        {agentUtils.getAgentDisplayName(agentStatus.agent_type)}
                      </span>
                      <span className="text-muted small">
                        {agentStatus.status === 'processing' && 'In Progress...'}
                        {agentStatus.status === 'completed' && 'Completed'}
                        {agentStatus.status === 'pending' && 'Waiting...'}
                        {agentStatus.status === 'error' && 'Failed'}
                      </span>
                    </div>
                    {agentStatus.message && (
                      <div className="text-muted small mt-1">
                        {agentStatus.message}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default AgentProcessingStatus;
