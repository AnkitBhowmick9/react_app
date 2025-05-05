
// App.js (or your main routing file)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from "./components/Login/LoginPage";
import DashboardPage from './components/HR/Dashboard';
import CandidateSubmittedPage from './components/HR/CandidateSubmittedPage';
import ClientPage from './components/Client/ClientPage'; // Import your ClientPage component
import CandidateForm from './components/Candidate/CandidatePage';
// import Requirement from './components/Requirement/RequirementPg';
import RequirementPage from './components/Requirement/RequirementPg'
import Status from './components/Requirement/StatusPg';
import ConfirmationPage from './components/Client/ConfirmationPage';
import CandidateDocumentUpload from './components/Documents/CtCandidateDocumentUpload';
import ClientDocumentSignPage from './components/Documents/client_docs';
import Companydocs from './components/Documents/company_docs';

import HrCompanydocs from './components/Documents/HrCompanydocs';
import CandidateContractUploadPage from './components/Candidate/CandidateSignedPage';


function App() {
  const isAuthenticated = () => {
    // Check if the user is logged in (e.g., check localStorage)
    return localStorage.getItem('userType') !== null;
  };

  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login"/>; // Redirect to login if not authenticated
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/hr-dashboard" element={<DashboardPage />} />
        <Route path="/hr-company-docs" element={<HrCompanydocs />} />/* Protected route */


        <Route path="/candidates-submitted" element={<CandidateSubmittedPage />} />
        
        <Route path="/client-page/" element={<ClientPage />} /> /* Protected route */
        <Route path="/candidate-page" element={<CandidateForm />} />/* Protected route */
        <Route path="/requirements-page" element={<RequirementPage />} />/* Protected route */
        <Route path="/status-page/:jobId/:client_id/:usertype" element={<Status />} />/* Protected route */
        <Route path="/confirm-page" element={<ConfirmationPage />} />/* Protected route */

        <Route path="/candidate-documents" element={<CandidateDocumentUpload />} />/* Protected route */
        <Route path="/client-docs" element={<ClientDocumentSignPage />} />/* Protected route */
        <Route path="/company-docs" element={<Companydocs />} />/* Protected route */

        <Route path="/upload-signed-contract-document" element={<CandidateContractUploadPage />} />/* Protected route */




        {/* Add more routes as needed */}
        <Route path="*" element={<Navigate to="/login" />} /> {/* Catch-all redirect to login */}

      </Routes>
    </Router>
  );
}

export default App;



