import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../Client/HR_track_Logo_Cropped.jpg";
import "./RequirementPage.css"; // Reusing same CSS as RequirementPage

const interviewStages = [
  "Application Received",
  "Shortlisted",
  "Interview Scheduled",
  "Client Review",
  "Offer Extended",
  "Hired"
];

interface Status {
  job_id: string;
  stage_status: Record<string, string | null>;
}

const StatusPage: React.FC = () => {
  const { jobId, client_id, usertype } = useParams<{ jobId: string, client_id: string, usertype: string }>();
  const [statusData, setStatusData] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/status/${jobId}`)
      .then(response => {
        setStatusData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching status:", error);
        setError("Failed to load status data");
        setLoading(false);
      });
  }, [jobId]);

  const updateStatus = (stage: string, value: string) => {
    if (!statusData) return;
    const updatedStatus = { ...statusData.stage_status, [stage]: value };
    setStatusData({ ...statusData, stage_status: updatedStatus });
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`http://127.0.0.1:8000/status/updates/${jobId}`, {
        stage_status: statusData?.stage_status
      });
      alert("Status updated successfully!");
      setHasChanges(false);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const handleBack = () => navigate(-1);
  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="requirement-wrapper">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <img src={logo} alt="Logo" className="logo" />
          <h1 className="app-title">HR Track Solution</h1>
        </div>
        <div className="header-actions">
          <button className="back-btn" onClick={handleBack}>Back</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Status Table */}
      <div style={{ padding: "30px", maxWidth: "1000px", margin: "0 auto" }}>
        <h2 style={{ color: "#1e3a8a", marginBottom: "20px" }}>
          Status for Job ID: {jobId}
        </h2>

        <table className="status-table">
          <thead>
            <tr>
              <th>Stage</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {interviewStages.map(stage => {
              const currentStatus = statusData?.stage_status[stage] ?? "Null";
              return (
                <tr key={stage}>
                  <td>{stage}</td>
                  <td style={{
                    backgroundColor: currentStatus === "Yes" ? "#4caf50" :
                      currentStatus === "No" ? "#f44336" : "#9e9e9e",
                    color: "white",
                    textAlign: "center",
                    padding: "6px",
                    borderRadius: "4px"
                  }}>
                    {currentStatus}
                  </td>
                  <td>
                    <button onClick={() => updateStatus(stage, "Yes")} className="status-btn yes">Yes</button>
                    <button onClick={() => updateStatus(stage, "No")} className="status-btn no">No</button>
                    <button onClick={() => updateStatus(stage, "Null")} className="status-btn reset">Reset</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ marginTop: "20px" }}>
          <button
            onClick={handleSubmit}
            disabled={!hasChanges}
            className={`submit-btn ${hasChanges ? "active" : "disabled"}`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
