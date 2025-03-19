import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

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
  stage_status: Record<string, string | null>; // Dynamic key-value mapping
}

const StatusPage: React.FC = () => {
  const { jobId , client_id, usertype} = useParams<{ jobId: string , client_id: string, usertype: string}>();
  // const location = useLocation();
  // const { jobId_niu, client_id } = location.state || {}; // Extract values safely
  const [statusData, setStatusData] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();
  console.log(client_id)

  useEffect(() => {
    // Fetch status from Django API

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


  const goToRequirementsPage = () => {
    if (!client_id  || !usertype) {
      console.error("Status page to req page  data: Cannot navigate to requirements page", {  client_id, usertype });
      return;
    }
  
    navigate("/requirements-page", {
      state: { client_id, usertype },
    });
  };

  // Handle status update
  const updateStatus = (stage: string, value: string) => {
    if (!statusData) return;

    const updatedStatus = { ...statusData.stage_status, [stage]: value };
    setStatusData({ ...statusData, stage_status: updatedStatus });
    setHasChanges(true);
  };

  // Submit updated status to backend
  const handleSubmit = async () => {
    try {
      await axios.post(`http://127.0.0.1:8000/status/updates/${jobId}`, {
        // job_id: jobId,
        stage_status: statusData?.stage_status
      });
      alert("Status updated successfully!");
      setHasChanges(false);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Status for Job ID: {jobId}</h2>

      <table border={1} style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
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
                  backgroundColor: currentStatus === "Yes" ? "green" :
                    currentStatus === "No" ? "red" : "gray",
                  color: "white",
                  textAlign: "center",
                  padding: "5px"
                }}>
                  {currentStatus}
                </td>
                <td>
                  <button onClick={() => updateStatus(stage, "Yes")} style={{ marginRight: "5px" }}>Yes</button>
                  <button onClick={() => updateStatus(stage, "No")} style={{ marginRight: "5px" }}>No</button>
                  <button onClick={() => updateStatus(stage, "Null")}>Reset</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: "15px" }}>
        <button onClick={handleSubmit} disabled={!hasChanges} style={{ marginRight: "10px", backgroundColor: hasChanges ? "blue" : "gray", color: "white" }}>
          Submit
        </button>
        <button onClick={goToRequirementsPage} style={{ marginRight: "10px" }}>
          Return to Requirements
        </button>
        <button onClick={() => { sessionStorage.clear(); navigate("/"); }} style={{ backgroundColor: "red", color: "white" }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default StatusPage;
