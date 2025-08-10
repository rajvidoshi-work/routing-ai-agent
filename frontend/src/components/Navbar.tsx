import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, logout } = useAuth();
  
  const isDashboardPage = location.pathname === '/' || location.pathname === '/dashboard';
  const isPatientDetailsPage = location.pathname === '/patient-details';
  const isManageDataPage = location.pathname === '/manage-data';
  const isEnhancedDashboardPage = location.pathname === '/enhanced-dashboard';

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <BootstrapNavbar bg="primary" variant="dark" expand="lg">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          <i className="fas fa-route me-2"></i>
          Routing AI Agent - Healthcare MVP
        </BootstrapNavbar.Brand>
        
        <Nav className="ms-auto d-flex align-items-center">
          {/* User info */}
          <span className="text-white me-3">
            <i className="fas fa-user me-1"></i>
            {userId}
          </span>

          {/* Navigation buttons */}
          {isDashboardPage ? (
            <Nav.Link as={Link} to="/manage-data" className="btn btn-outline-light me-2">
              <i className="fas fa-database me-2"></i>
              Manage Data
            </Nav.Link>
          ) : isPatientDetailsPage ? (
            <Nav.Link as={Link} to="/" className="btn btn-outline-light me-2">
              <i className="fas fa-arrow-left me-2"></i>
              Back to Dashboard
            </Nav.Link>
          ) : isManageDataPage ? (
            <Nav.Link as={Link} to="/" className="btn btn-outline-light me-2">
              <i className="fas fa-tachometer-alt me-2"></i>
              Dashboard
            </Nav.Link>
          ) : isEnhancedDashboardPage ? (
            <Nav.Link as={Link} to="/patient-details" className="btn btn-outline-light me-2">
              <i className="fas fa-arrow-left me-2"></i>
              Back to Patient Details
            </Nav.Link>
          ) : (
            <>
              <Nav.Link as={Link} to="/" className="btn btn-outline-light me-2">
                <i className="fas fa-tachometer-alt me-2"></i>
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/manage-data" className="btn btn-outline-light me-2">
                <i className="fas fa-database me-2"></i>
                Manage Data
              </Nav.Link>
            </>
          )}

          {/* Logout button */}
          <button 
            onClick={handleLogout}
            className="btn btn-outline-danger"
            style={{ border: '1px solid #dc3545', color: '#dc3545' }}
          >
            <i className="fas fa-sign-out-alt me-2"></i>
            Logout
          </button>
        </Nav>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
