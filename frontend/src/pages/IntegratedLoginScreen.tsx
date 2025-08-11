import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { useAuth } from '../contexts/AuthContext';
import './LoginScreen.css';

interface IntegratedLoginScreenProps {}

const IntegratedLoginScreen: React.FC<IntegratedLoginScreenProps> = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Scroll to top when component mounts
  useScrollToTop();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Demo credentials - in a real app, this would be handled by a backend API
  const validCredentials = [
    { userId: 'demo', password: 'DemoUser2024@' },
    { userId: 'Admin', password: 'password' },
    { userId: 'admin', password: 'AdonixAdmin2024!' },
    { userId: 'doctor', password: 'MedDoc2024#' },
    { userId: 'nurse', password: 'NurseSecure2024$' },
    { userId: 'test', password: 'TestSecure2024%' }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!userId || !password) {
      setError('Please enter both User ID and Password');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check credentials
      const isValidUser = validCredentials.some(
        cred => cred.userId === userId && cred.password === password
      );

      if (isValidUser) {
        setSuccess('Login successful! Redirecting to dashboard...');
        
        // Use AuthContext login method for proper session management
        login(userId);
        
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError('Invalid User ID or Password. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Demo credentials:\n\nUser ID: demo\nPassword: DemoUser2024@\n\nOr try:\nUser ID: Admin\nPassword: password');
  };

  const handleNeedHelp = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Demo Application Help:\n\n1. Use demo/DemoUser2024@ for quick access\n2. Or Admin/password for admin access\n3. This is a demonstration of the healthcare discharge planning system');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <div className="logo">
            <div className="logo-icon">+</div>
            <span className="logo-text">Adonix Medical</span>
          </div>
          <p style={{ 
            color: '#64748b', 
            fontSize: '14px', 
            marginTop: '8px',
            textAlign: 'center'
          }}>
            Healthcare Discharge Planning System
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {success}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="userId">USER ID</label>
            <input
              type="text"
              id="userId"
              placeholder="Enter your user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                )}
              </button>
            </div>
            <button
              type="button"
              className="forgot-password"
              onClick={handleForgotPassword}
              style={{
                background: 'none',
                border: 'none',
                color: '#0ea5e9',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'block',
                textAlign: 'right',
                marginTop: '8px',
                padding: 0
              }}
            >
              Forgot Password?
            </button>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>
                <div 
                  style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderRadius: '50%',
                    borderTopColor: 'transparent',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px'
                  }}
                />
                LOGGING IN...
              </>
            ) : (
              'LOGIN'
            )}
          </button>
          
          <div className="form-footer">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              Remember me
            </label>
            <button
              type="button"
              className="need-help"
              onClick={handleNeedHelp}
              style={{
                background: 'none',
                border: 'none',
                color: '#0ea5e9',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                padding: 0
              }}
            >
              Need Help?
            </button>
          </div>
        </form>

        {/* Demo credentials hint */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{
            fontSize: '12px',
            color: '#64748b',
            textAlign: 'center',
            margin: '0 0 8px 0',
            fontWeight: '600'
          }}>
            Demo Credentials:
          </p>
          <p style={{
            fontSize: '12px',
            color: '#475569',
            textAlign: 'center',
            margin: '0 0 8px 0',
            fontFamily: 'monospace'
          }}>
            User ID: <strong>demo</strong> | Password: <strong>DemoUser2024@</strong>
          </p>
          <p style={{
            fontSize: '10px',
            color: '#64748b',
            textAlign: 'center',
            margin: '0',
            fontStyle: 'italic'
          }}>
            Note: Secure passwords used to avoid browser security warnings
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default IntegratedLoginScreen;
