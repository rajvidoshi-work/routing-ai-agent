import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  login: (userId: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuthStatus = () => {
      try {
        const authStatus = localStorage.getItem('isAuthenticated');
        const storedUserId = localStorage.getItem('userId');
        const loginTime = localStorage.getItem('loginTime');

        if (authStatus === 'true' && storedUserId && loginTime) {
          // Check if session is still valid (24 hours)
          const loginDate = new Date(loginTime);
          const now = new Date();
          const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);

          if (hoursDiff < 24) {
            setIsAuthenticated(true);
            setUserId(storedUserId);
          } else {
            // Session expired, clear storage
            logout();
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (userId: string) => {
    setIsAuthenticated(true);
    setUserId(userId);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userId', userId);
    localStorage.setItem('loginTime', new Date().toISOString());
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserId(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('rememberMe');
  };

  const value = {
    isAuthenticated,
    userId,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
