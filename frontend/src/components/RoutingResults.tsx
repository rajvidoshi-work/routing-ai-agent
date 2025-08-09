import React, { useState } from 'react';
import { Card, Row, Col, Badge, ProgressBar, Button, Collapse, ListGroup, Alert } from 'react-bootstrap';
import { CompleteCase, agentUtils } from '../services/api';

interface RoutingResultsProps {
  results: CompleteCase;
}

const RoutingResults: React.FC<RoutingResultsProps> = ({ results }) => {
  const { routing_decision, agent_responses } = results;
  const [expandedAgents, setExpandedAgents] = useState<{ [key: string]: boolean }>({});

  const toggleAgentExpansion = (agentType: string) => {
    setExpandedAgents(prev => ({
      ...prev,
      [agentType]: !prev[agentType]
    }));
  };

  const getAgentCardClass = (agentType: string) => {
    switch (agentType.toLowerCase()) {
      case 'nursing': return 'nursing-card';
      case 'dme': return 'dme-card';
      case 'pharmacy': return 'pharmacy-card';
      case 'state': return 'state-card';
      default: return 'agent-card';
    }
  };

  const renderRecommendationsList = (recommendations: string[], agentType: string) => {
    const processedRecs = agentUtils.processAgentRecommendations(recommendations);
    
    return (
      <ListGroup variant="flush">
        {processedRecs.map((rec, idx) => (
          <ListGroup.Item key={idx} className="border-0 px-0 py-2">
            <div className="d-flex align-items-start">
              <i className="fas fa-check-circle text-success me-2 mt-1" style={{ fontSize: '0.9rem' }}></i>
              <span className="flex-grow-1">{rec}</span>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  };

  const renderNextStepsList = (nextSteps: string[], agentType: string) => {
    return (
      <ListGroup variant="flush">
        {nextSteps.map((step, idx) => (
          <ListGroup.Item key={idx} className="border-0 px-0 py-2">
            <div className="d-flex align-items-start">
              <i className="fas fa-arrow-right text-primary me-2 mt-1" style={{ fontSize: '0.9rem' }}></i>
              <span className="flex-grow-1">{step}</span>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  };

  const renderExternalReferrals = (referrals: string[]) => {
    if (!referrals || referrals.length === 0) return null;
    
    return (
      <div className="mt-3">
        <h6 className="mb-2">
          <i className="fas fa-external-link-alt me-2"></i>
          External Referrals
        </h6>
        <div>
          {referrals.map((referral, idx) => (
            <Badge key={idx} bg="info" className="me-2 mb-2 p-2">
              <i className="fas fa-hospital me-1"></i>
              {referral}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  const getTimelineIcon = (timeline: string) => {
    if (timeline.includes('24') || timeline.includes('immediate')) return 'fas fa-clock text-danger';
    if (timeline.includes('48') || timeline.includes('2 day')) return 'fas fa-clock text-warning';
    return 'fas fa-calendar text-success';
  };

  return (
    <div className="result-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <i className="fas fa-clipboard-list me-2"></i>
          Discharge Planning Results
        </h4>
        <Badge bg="primary" className="p-2">
          {agent_responses.length} Agent{agent_responses.length !== 1 ? 's' : ''} Processed
        </Badge>
      </div>

      {/* Routing Decision Card */}
      <Card className="routing-decision-card mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-route me-2"></i>
            AI Routing Decision
          </h5>
          <Badge 
            bg={agentUtils.getPriorityVariant(routing_decision.priority_score)} 
            className="p-2"
          >
            Priority: {routing_decision.priority_score}/10
          </Badge>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="mb-4">
                <h6 className="mb-3">
                  <i className="fas fa-users me-2"></i>
                  Recommended Agents ({routing_decision.recommended_agents.length})
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  {routing_decision.recommended_agents.map((agent, index) => (
                    <Badge 
                      key={index} 
                      bg="light" 
                      text="dark" 
                      className="p-2 d-flex align-items-center"
                      style={{ 
                        borderLeft: `4px solid ${agentUtils.getAgentColor(agent)}`,
                        fontSize: '0.9rem'
                      }}
                    >
                      <i className={`${agentUtils.getAgentIcon(agent)} me-2`}></i>
                      {agentUtils.getAgentDisplayName(agent)}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h6 className="mb-2">
                  <i className={getTimelineIcon(routing_decision.estimated_timeline)} me-2></i>
                  Estimated Timeline
                </h6>
                <p className="mb-0 fw-bold text-primary">
                  {agentUtils.formatTimeline(routing_decision.estimated_timeline)}
                </p>
              </div>
            </Col>
            
            <Col md={6}>
              <div className="mb-3">
                <h6 className="mb-2">
                  <i className="fas fa-tachometer-alt me-2"></i>
                  Priority Score
                </h6>
                <ProgressBar 
                  now={routing_decision.priority_score * 10} 
                  variant={agentUtils.getPriorityVariant(routing_decision.priority_score)}
                  label={`${routing_decision.priority_score}/10`}
                  style={{ height: '25px' }}
                />
              </div>
              
              <div>
                <h6 className="mb-2">
                  <i className="fas fa-brain me-2"></i>
                  AI Reasoning
                </h6>
                <Alert variant="light" className="mb-0 small">
                  {routing_decision.reasoning}
                </Alert>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Agent Responses */}
      <Row>
        {agent_responses.map((response, index) => {
          const isExpanded = expandedAgents[response.agent_type] || false;
          const agentColor = agentUtils.getAgentColor(response.agent_type);
          
          return (
            <Col md={6} key={index} className="mb-4">
              <Card 
                className={`agent-response-card ${getAgentCardClass(response.agent_type)} h-100`}
                style={{ borderLeftColor: agentColor }}
              >
                <Card.Header 
                  className="d-flex justify-content-between align-items-center"
                  style={{ backgroundColor: `${agentColor}15` }}
                >
                  <div className="d-flex align-items-center">
                    <i 
                      className={`${agentUtils.getAgentIcon(response.agent_type)} me-2`}
                      style={{ color: agentColor }}
                    ></i>
                    <h6 className="mb-0">
                      {agentUtils.getAgentDisplayName(response.agent_type)}
                    </h6>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {response.priority_level && (
                      <Badge bg="secondary" className="small">
                        {response.priority_level}
                      </Badge>
                    )}
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => toggleAgentExpansion(response.agent_type)}
                    >
                      <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                    </Button>
                  </div>
                </Card.Header>
                
                <Card.Body>
                  {/* Always Visible Summary */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold text-muted small">RECOMMENDATIONS</span>
                      <Badge bg="primary" pill>{response.recommendations.length}</Badge>
                    </div>
                    {response.recommendations.slice(0, 2).map((rec, idx) => (
                      <div key={idx} className="d-flex align-items-start mb-2">
                        <i className="fas fa-check-circle text-success me-2 mt-1" style={{ fontSize: '0.8rem' }}></i>
                        <span className="small">{rec}</span>
                      </div>
                    ))}
                    {response.recommendations.length > 2 && !isExpanded && (
                      <div className="text-muted small">
                        +{response.recommendations.length - 2} more recommendations...
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold text-muted small">NEXT STEPS</span>
                      <Badge bg="info" pill>{response.next_steps.length}</Badge>
                    </div>
                    {response.next_steps.slice(0, 2).map((step, idx) => (
                      <div key={idx} className="d-flex align-items-start mb-2">
                        <i className="fas fa-arrow-right text-primary me-2 mt-1" style={{ fontSize: '0.8rem' }}></i>
                        <span className="small">{step}</span>
                      </div>
                    ))}
                    {response.next_steps.length > 2 && !isExpanded && (
                      <div className="text-muted small">
                        +{response.next_steps.length - 2} more steps...
                      </div>
                    )}
                  </div>

                  {/* Expandable Detailed Content */}
                  <Collapse in={isExpanded}>
                    <div>
                      {response.recommendations.length > 2 && (
                        <div className="mb-3">
                          <h6 className="text-success">
                            <i className="fas fa-list-check me-2"></i>
                            All Recommendations
                          </h6>
                          {renderRecommendationsList(response.recommendations, response.agent_type)}
                        </div>
                      )}

                      {response.next_steps.length > 2 && (
                        <div className="mb-3">
                          <h6 className="text-primary">
                            <i className="fas fa-tasks me-2"></i>
                            All Next Steps
                          </h6>
                          {renderNextStepsList(response.next_steps, response.agent_type)}
                        </div>
                      )}

                      {renderExternalReferrals(response.external_referrals)}

                      {response.estimated_completion_time && (
                        <div className="mt-3">
                          <h6 className="mb-2">
                            <i className="fas fa-stopwatch me-2"></i>
                            Estimated Completion
                          </h6>
                          <Badge bg="warning" className="p-2">
                            {response.estimated_completion_time}
                          </Badge>
                        </div>
                      )}

                      {response.forms && response.forms.length > 0 && (
                        <div className="mt-3">
                          <h6 className="mb-2">
                            <i className="fas fa-file-alt me-2"></i>
                            Required Forms
                          </h6>
                          <div>
                            {response.forms.map((form, idx) => (
                              <Badge key={idx} bg="secondary" className="me-2 mb-2">
                                {form.name || form}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Collapse>

                  {/* Action Buttons */}
                  <div className="mt-3 pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => toggleAgentExpansion(response.agent_type)}
                      >
                        {isExpanded ? 'Show Less' : 'Show More'}
                      </Button>
                      <div className="text-muted small">
                        <i className="fas fa-clock me-1"></i>
                        {response.estimated_completion_time || 'Processing time varies'}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Summary Footer */}
      <Card className="mt-4 bg-light">
        <Card.Body>
          <Row className="text-center">
            <Col md={3}>
              <div className="fw-bold text-primary fs-4">{routing_decision.recommended_agents.length}</div>
              <div className="text-muted small">Agents Recommended</div>
            </Col>
            <Col md={3}>
              <div className="fw-bold text-success fs-4">{agent_responses.length}</div>
              <div className="text-muted small">Agents Processed</div>
            </Col>
            <Col md={3}>
              <div className="fw-bold text-warning fs-4">
                {agent_responses.reduce((total, agent) => total + agent.recommendations.length, 0)}
              </div>
              <div className="text-muted small">Total Recommendations</div>
            </Col>
            <Col md={3}>
              <div className="fw-bold text-info fs-4">
                {agent_responses.reduce((total, agent) => total + agent.next_steps.length, 0)}
              </div>
              <div className="text-muted small">Action Items</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default RoutingResults;
