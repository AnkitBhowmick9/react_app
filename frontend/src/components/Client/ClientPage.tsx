import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ClientPage.css"; // Enhanced CSS
import logo from "./HR_track_Logo_Cropped.jpg"; // Ensure you have a logo in assets

const ClientPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, client_id, usertype } = location.state || {};

  const [formData, setFormData] = useState({
    role_title: "",
    job_description: "",
    client_id: client_id || "",
    username: username || "",
  });

  const [message, setMessage] = useState<string | null>(null);
  const [clients, setClients] = useState<{ client_id: string; client_name: string }[]>([]);
  const [users, setUsers] = useState<{ client_id: string; username: string }[]>([]);

  useEffect(() => {
    if (usertype === "Employee") {
      axios.get("http://127.0.0.1:8000/get-clients/").then((res) => setClients(res.data.clients));
      axios.get("http://127.0.0.1:8000/get-users/").then((res) => setUsers(res.data.users));
    }
  }, [usertype]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/save-job/", formData);
      setMessage(res.data.success ? "Job saved successfully!" : "Error saving job.");
    } catch (err) {
      console.error("Submit Error:", err);
      setMessage("An error occurred while saving the job.");
    }
  };

  const handleRefresh = () => {
    setFormData({
      role_title: "",
      job_description: "",
      client_id: client_id || "",
      username: username || "",
    });
    setMessage(null);
  };

  return (
    <div className="client-page-container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="HR Track Logo" className="logo" />
          <h1>HR Track Solution</h1>
        </div>
        <button className="btn-logout" onClick={() => { sessionStorage.removeItem("authToken"); navigate("/"); }}>
          Logout
        </button>
      </header>

      {/* Navigation Bar */}
      <nav className="nav-bar">
        {/* <button onClick={() => navigate("/client-page")}>Upload Requirement</button> */}
        <button onClick={() => navigate("/requirements-page", { state: { username, client_id, usertype } })}>View Requirement</button>
        <button onClick={() => navigate("/client-docs", { state: { client_id } })}>View Documents</button>
        <button onClick={() => document.getElementById("about-us")?.scrollIntoView({ behavior: "smooth" })}>About Us</button>
        <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>Contact</button>
      </nav>

      {/* Requirement Form */}
      <div className="client-form-container">
        <h2>Requirement Form</h2>
        {message && <p className="success-message">{message}</p>}

        <form onSubmit={handleSubmit} className="requirement-form">
          <div className="form-group">
            <label>Role Title:</label>
            <input
              type="text"
              name="role_title"
              value={formData.role_title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Job Description:</label>
            <textarea
              name="job_description"
              value={formData.job_description}
              onChange={handleChange}
              required
            />
          </div>

          {usertype === "Employee" && (
            <>
              <div className="form-group">
                <label>Select Client:</label>
                <select name="client_id" value={formData.client_id} onChange={handleChange} required>
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client.client_id} value={client.client_id}>
                      {client.client_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Username:</label>
                <select name="username" value={formData.username} onChange={handleChange} required>
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.username} value={user.username}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="button-group">
            <button type="submit" className="btn-submit">Submit</button>
            <button type="button" className="btn-refresh" onClick={handleRefresh}>Refresh</button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div id="about-us" className="footer-section about">
            <h2>About Us</h2>
            <p>
              HR Track Solution provides top-notch hiring and recruitment solutions, connecting businesses with the right talent.
            </p>
          </div>

          <div id="contact" className="footer-section contact">
            <h2>Contact Us</h2>
            <p>Email: support@hrtrack.com</p>
            <p>Phone: +1 234 567 890</p>
            <p>Address: 123 HR Street, TechCity, TX</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 HR Track Solution - All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default ClientPage;