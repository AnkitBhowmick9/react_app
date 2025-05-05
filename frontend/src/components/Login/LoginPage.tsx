import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import hrLogo from './rrms_login.jpg';
import hrLogo from '../Client/HR_track_Logo.jpg';
import './LoginPage.css';

interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
  usertype: string;
  client_id?: string;
}

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post<LoginResponse>('http://127.0.0.1:8000/login/', {
        username,
        password,
      });

      const { usertype, client_id } = response.data;

      if (usertype === 'Employee') {
        navigate('/hr-dashboard', { state: { username, usertype, client_id } });
      } else if (usertype === 'Client') {
        navigate('/client-page', { state: { username, usertype, client_id } });
      } else if (usertype === 'Candidate') {
        navigate('/candidate-page', { state: { username, usertype, client_id } });
      } else {
        setError('Invalid user type received.');
      }
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-wrapper" style={{ backgroundImage: `url(${hrLogo})` }}>
      <div className="login-glass">
        <h2>Welcome to HR Track</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Login</button>
        </form>
        <p className="login-footer">© 2025 HR Track Solution</p>
      </div>
    </div>
  );
}

export default LoginPage;