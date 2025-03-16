import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import hrLogo from './hr_logo.jpg';
import './LoginPage.css';

interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
  usertype: string;
  client_id?: string; // Only applicable for clients
}

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error before making a request

    try {
      const response = await axios.post<LoginResponse>('http://127.0.0.1:8000/login/', {
        username,
        password,
      });

      const { usertype, client_id } = response.data; // Extracting user type and client_id

      console.log(usertype)
      // Redirect based on user type
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
    <div className="login-container" style={{ backgroundImage: `url(${hrLogo})` }}>
      <div className="login-form">
        <h1>Login</h1>
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
      </div>
    </div>
  );
}

export default LoginPage;
