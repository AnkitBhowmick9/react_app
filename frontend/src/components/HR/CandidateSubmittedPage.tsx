import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CandidateSubmittedPage.css";
import logo from "../Client/HR_track_Logo_Cropped.jpg";

interface Candidate {
  candidate_id: string;
  candidate_name: string;
  client_id: string;
  role: string;
  location: string;
  selection_status: string;
  email: string;
  phone: string;
  job_id: string;
}

interface OpenJob {
  job_id: string;
  role_title: string;
}

interface Client {
  client_id: string;
  client_name: string;
}

const CandidateSubmittedPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [openJobs, setOpenJobs] = useState<OpenJob[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<{ [key: string]: string }>({});
  const [selectedJobIds, setSelectedJobIds] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/candidates/").then((res) => setCandidates(res.data));
    axios.get("http://127.0.0.1:8000/open-jobs/").then((res) => setOpenJobs(res.data));
    axios.get("http://127.0.0.1:8000/get_client_ids/").then((res) => {
      if (Array.isArray(res.data.clients)) setClients(res.data.clients);
    });
  }, []);

  const updateClientId = (candidate_id: string) => {
    const newClientId = selectedClient[candidate_id];
    const selectedJobId = selectedJobIds[candidate_id]; // Get the specific candidate's jobId

    if (!newClientId || !selectedJobId) {
      alert("Please select both a client and a job.");
      return;
    }

    axios
      .put(`http://127.0.0.1:8000/candidate/${candidate_id}/update-client/`, {
        client_id: newClientId,
        job_id: selectedJobId,
      })
      .then(() => {
        alert("Client and Job updated successfully!");
        setCandidates((prev) =>
          prev.map((c) =>
            c.candidate_id === candidate_id
              ? { ...c, client_id: newClientId, job_id: selectedJobId }
              : c
          )
        );
      })
      .catch((error) => console.error("Error updating:", error));
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo-img" />
          <h1>HR Track Solution</h1>
        </div>
        <button className="logout-btn" onClick={() => navigate("/")}>
          Logout
        </button>
      </header>

      {/* Navigation */}
      <nav className="navbar">
        <button onClick={() => navigate("/hr-dashboard")}>Back to Dashboard</button>
        <button onClick={() => navigate("/candidate-documents")}>Candidate Documents</button>
        <button onClick={() => scrollTo("about")}>About Us</button>
        <button onClick={() => scrollTo("contact")}>Contact Us</button>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <h2>Update Candidate Info</h2>

        {candidates.map((candidate) => (
          <div key={candidate.candidate_id} className="candidate-card">
            <h3>
              {candidate.candidate_name} ({candidate.candidate_id})
            </h3>

            <div className="form-grid">
              <div>
                <label>Role</label>
                <input value={candidate.role} disabled />
              </div>
              <div>
                <label>Location</label>
                <input value={candidate.location} disabled />
              </div>
              <div>
                <label>Client</label>
                <select
                  value={selectedClient[candidate.candidate_id] || ""}
                  onChange={(e) =>
                    setSelectedClient((prev) => ({
                      ...prev,
                      [candidate.candidate_id]: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client.client_id} value={client.client_id}>
                      {client.client_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Job</label>
                <select
                  value={selectedJobIds[candidate.candidate_id] || ""}
                  onChange={(e) =>
                    setSelectedJobIds((prev) => ({
                      ...prev,
                      [candidate.candidate_id]: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Job</option>
                  {openJobs.map((job) => (
                    <option key={job.job_id} value={job.job_id}>
                      {job.role_title+','+job.job_id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="update-btn"
              onClick={() => updateClientId(candidate.candidate_id)}
            >
              Update
            </button>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div id="about">
            <h4>About Us</h4>
            <p>
              HR Track Solution streamlines hiring and candidate tracking.
            </p>
            <p>
              Empowering HR professionals to manage recruitment efficiently.
            </p>
          </div>
          <div id="contact">
            <h4>Contact Us</h4>
            <p>Email: support@hrtrack.com</p>
            <p>Phone: +1 234 567 890</p>
            <p>Address: 123 HR Street, TechCity, TX</p>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2025 HR Track Solution. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default CandidateSubmittedPage;

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}
