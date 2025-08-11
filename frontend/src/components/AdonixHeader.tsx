import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdonixHeaderProps {
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
  showManageData?: boolean;
}

const AdonixHeader: React.FC<AdonixHeaderProps> = ({ 
  showBackButton = false, 
  backButtonText = "← Back",
  backButtonPath = "/",
  showManageData = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      // AuthContext will handle the redirect to login page
    }
  };

  const handleBack = () => {
    navigate(backButtonPath);
  };

  const handleManageData = () => {
    navigate('/manage-data');
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="logo" onClick={handleHome} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">+</div>
          <span className="logo-text">Adonix Medical</span>
        </div>
        
        <div className="user-section">
          {/* Navigation buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '16px' }}>
            {showBackButton && (
              <button 
                onClick={handleBack}
                className="nav-btn"
                style={{
                  background: 'transparent',
                  border: '2px solid #0ea5e9',
                  color: '#0ea5e9',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#0ea5e9';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#0ea5e9';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {backButtonText}
              </button>
            )}
            
            {showManageData && (
              <button 
                onClick={handleManageData}
                className="nav-btn"
                style={{
                  background: 'transparent',
                  border: '2px solid #0ea5e9',
                  color: '#0ea5e9',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#0ea5e9';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#0ea5e9';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <i className="fas fa-database" style={{ marginRight: '8px' }}></i>
                Manage Data
              </button>
            )}
          </div>

          {/* User info and logout */}
          <span className="welcome-text">Welcome, {userId}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </header>
  );
};

export default AdonixHeader;
