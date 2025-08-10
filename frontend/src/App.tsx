import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import IntegratedLoginScreen from './pages/IntegratedLoginScreen';
import IntegratedDashboard from './pages/IntegratedDashboard';
import IntegratedPatientDetails from './pages/IntegratedPatientDetails';
import EnhancedDashboard from './pages/EnhancedDashboard';
import ForcedForm from './pages/ForcedForm';
import ResultsPage from './pages/ResultsPage';
import NursingOrderForm from './pages/NursingOrderForm';
import DMEOrderForm from './pages/DMEOrderForm';
import PharmacyOrderForm from './pages/PharmacyOrderForm';
import StateAuthorizationForm from './pages/StateAuthorizationForm';
import ManageData from './pages/ManageData';

// Component to handle conditional navbar rendering
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={<IntegratedLoginScreen />} />
        <Route path="/" element={
          <ProtectedRoute>
            <IntegratedDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <IntegratedDashboard />
          </ProtectedRoute>
        } />
        <Route path="/patient-details" element={
          <ProtectedRoute>
            <IntegratedPatientDetails />
          </ProtectedRoute>
        } />
        <Route path="/enhanced-dashboard" element={
          <ProtectedRoute>
            <EnhancedDashboard />
          </ProtectedRoute>
        } />
        <Route path="/original-dashboard" element={
          <ProtectedRoute>
            <ForcedForm />
          </ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute>
            <ResultsPage />
          </ProtectedRoute>
        } />
        <Route path="/nursing-order" element={
          <ProtectedRoute>
            <NursingOrderForm />
          </ProtectedRoute>
        } />
        <Route path="/dme-order" element={
          <ProtectedRoute>
            <DMEOrderForm />
          </ProtectedRoute>
        } />
        <Route path="/pharmacy-order" element={
          <ProtectedRoute>
            <PharmacyOrderForm />
          </ProtectedRoute>
        } />
        <Route path="/state-authorization" element={
          <ProtectedRoute>
            <StateAuthorizationForm />
          </ProtectedRoute>
        } />
        <Route path="/manage-data" element={
          <ProtectedRoute>
            <ManageData />
          </ProtectedRoute>
        } />
        {/* Redirect any unknown routes to login or dashboard */}
        <Route path="*" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
