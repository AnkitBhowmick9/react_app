// ConfirmationPage.js (or ConfirmationPage.tsx)
import React from 'react';
import { useLocation } from 'react-router-dom';

function Companydocs() {
  const location = useLocation();
  const formData = location.state?.formData; // Access the passed form data

  return (
    <div>
      <h1>Form Submitted!</h1>
      {formData && ( // Conditionally render if formData exists
        <div>
          <p>Name: {formData.name}</p>
          <p>Email: {formData.email}</p>
          <p>Fixed Field: {formData.fixedField}</p>
          {/* ... display other form data ... */}
        </div>
      )}
      {/* ... other confirmation page content ... */}
    </div>
  );
}

export default Companydocs;