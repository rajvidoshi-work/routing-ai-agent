import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

import Navbar from './components/Navbar';
import IntegratedPatientDetails from './pages/IntegratedPatientDetails';
import EnhancedDashboard from './pages/EnhancedDashboard';
import ForcedForm from './pages/ForcedForm';
import ResultsPage from './pages/ResultsPage';
import NursingOrderForm from './pages/NursingOrderForm';
import DMEOrderForm from './pages/DMEOrderForm';
import PharmacyOrderForm from './pages/PharmacyOrderForm';
import StateAuthorizationForm from './pages/StateAuthorizationForm';
import ManageData from './pages/ManageData';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<IntegratedPatientDetails />} />
          <Route path="/dashboard" element={<EnhancedDashboard />} />
          <Route path="/original-dashboard" element={<ForcedForm />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/nursing-order" element={<NursingOrderForm />} />
          <Route path="/dme-order" element={<DMEOrderForm />} />
          <Route path="/pharmacy-order" element={<PharmacyOrderForm />} />
          <Route path="/state-authorization" element={<StateAuthorizationForm />} />
          <Route path="/manage-data" element={<ManageData />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
