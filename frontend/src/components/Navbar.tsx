import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isDashboardPage = location.pathname === '/';
  const isPatientDetailsPage = location.pathname === '/patient-details';
  const isManageDataPage = location.pathname === '/manage-data';
  const isEnhancedDashboardPage = location.pathname === '/dashboard';

  return (
    <BootstrapNavbar bg="primary" variant="dark" expand="lg">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          <i className="fas fa-route me-2"></i>
          Routing AI Agent - Healthcare MVP
        </BootstrapNavbar.Brand>
        
        <Nav className="ms-auto">
          {isDashboardPage ? (
            <Nav.Link as={Link} to="/manage-data" className="btn btn-outline-light">
              <i className="fas fa-database me-2"></i>
              Manage Data
            </Nav.Link>
          ) : isPatientDetailsPage ? (
            <Nav.Link as={Link} to="/" className="btn btn-outline-light">
              <i className="fas fa-arrow-left me-2"></i>
              Back to Dashboard
            </Nav.Link>
          ) : isManageDataPage ? (
            <Nav.Link as={Link} to="/" className="btn btn-outline-light">
              <i className="fas fa-tachometer-alt me-2"></i>
              Dashboard
            </Nav.Link>
          ) : isEnhancedDashboardPage ? (
            <Nav.Link as={Link} to="/patient-details" className="btn btn-outline-light">
              <i className="fas fa-arrow-left me-2"></i>
              Back to Patient Details
            </Nav.Link>
          ) : (
            <>
              <Nav.Link as={Link} to="/" className="btn btn-outline-light me-2">
                <i className="fas fa-tachometer-alt me-2"></i>
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/manage-data" className="btn btn-outline-light">
                <i className="fas fa-database me-2"></i>
                Manage Data
              </Nav.Link>
            </>
          )}
        </Nav>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
