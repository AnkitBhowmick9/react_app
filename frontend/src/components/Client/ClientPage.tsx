import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ClientPage.css"; // Enhanced CSS

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
      axios.get("http://127.0.0.1:8000/get-clients/").then((response) => {
        setClients(response.data.clients);
      });

      axios.get("http://127.0.0.1:8000/get-users/").then((response) => {
        setUsers(response.data.users);
      });
    }
  }, [usertype]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/save-job/", formData);

      setMessage(response.data.success ? "Job saved successfully!" : "Error saving job.");
    } catch (error) {
      setMessage("An error occurred while saving the job.");
      console.error("Submission error:", error);
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

  const goToRequirementsPage = () => {
    if (!client_id || !username || !usertype) {
      console.error("Missing data: Cannot navigate to requirements page", { username, client_id, usertype });
      return;
    }

    navigate("/requirements-page", {
      state: { username, client_id, usertype },
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <div className="client-form-container">
      <h2>Client Job Form</h2>
      {message && <p className="success-message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>Role Title:</label>
        <input type="text" name="role_title" value={formData.role_title} onChange={handleChange} required />

        <label>Job Description:</label>
        <textarea name="job_description" value={formData.job_description} onChange={handleChange} required />

        {usertype === "Employee" && (
          <>
            <label>Select Client:</label>
            <select name="client_id" value={formData.client_id} onChange={handleChange} required>
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.client_id} value={client.client_id}>
                  {client.client_name}
                </option>
              ))}
            </select>

            <label>Select Username:</label>
            <select name="username" value={formData.username} onChange={handleChange} required>
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.username} value={user.username}>
                  {user.username}
                </option>
              ))}
            </select>
          </>
        )}

        <div className="button-group">
          <button type="submit" className="btn-submit">Submit</button>
          <button type="button" className="btn-refresh" onClick={handleRefresh}>Refresh</button>
          <button type="button" className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </form>

      <div className="requirement-button">
        <button onClick={goToRequirementsPage} className="btn-view">View Requirements</button>
      </div>
    </div>
  );
};

export default ClientPage;
