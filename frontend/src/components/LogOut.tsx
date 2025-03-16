// Any component where you want to add logout functionality (e.g., Dashboard, ClientPage, CandidatePage)
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() { // Replace MyComponent with the name of your component
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove user info from localStorage (or wherever you stored it)
    localStorage.removeItem('userType'); // Example: Remove user type

    // Redirect to the login page
    navigate('/login');
  };

  return (
    <div>
      {/* ... your component content ... */}
      <button onClick={handleLogout}>Logout</button> {/* Add a logout button */}
    </div>
  );
}

export default Logout;