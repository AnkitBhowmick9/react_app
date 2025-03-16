import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Candidate {
  candidate_id: string;
  candidate_name: string;
  client_id: string;
  role: string;
  location: string;
  selection_status: string;
  email: string;
  phone: string;
}

interface OpenJob {
  job_id: string;
  job_title: string;
}

const CandidateSubmittedPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [openJobs, setOpenJobs] = useState<OpenJob[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const navigate = useNavigate();

  // Fetch candidates and open jobs from API
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/candidates/")
      .then(response => setCandidates(response.data))
      .catch(error => console.error("Error fetching candidates:", error));

    axios.get("http://127.0.0.1:8000/open-jobs/")
      .then(response => setOpenJobs(response.data))
      .catch(error => console.error("Error fetching open jobs:", error));
  }, []);

  // Update Client ID for Candidate
  const updateClientId = (candidate_id: string, newClientId: string) => {
    axios.put(`http://127.0.0.1:8000/candidate/${candidate_id}/update-client/`, { client_id: newClientId })
      .then(() => {
        alert("Client ID updated successfully!");
        setCandidates(prev =>
          prev.map(c => c.candidate_id === candidate_id ? { ...c, client_id: newClientId } : c)
        );
      })
      .catch(error => console.error("Error updating client ID:", error));
  };

  // Assign Candidate to an Open Job
  const assignCandidateToJob = () => {
    if (!selectedCandidateId || !selectedJobId) {
      alert("Please select a candidate and job.");
      return;
    }

    axios.put(`http://127.0.0.1:8000/open-jobs/${selectedJobId}/assign-candidate/`, { candidate_id: selectedCandidateId })
      .then(() => {
        alert("Candidate assigned to job successfully!");
        setSelectedCandidateId("");
        setSelectedJobId("");
      })
      .catch(error => console.error("Error assigning candidate:", error));
  };

  return (
    <div className="candidate-submitted-container">
      <h1>Candidate Submitted Page</h1>

      {/* Candidate List Table */}
      <table>
        <thead>
          <tr>
            <th>Candidate ID</th>
            <th>Name</th>
            <th>Role</th>
            <th>Location</th>
            <th>Selection Status</th>
            <th>Client ID</th>
            <th>Update Client ID</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map(candidate => (
            <tr key={candidate.candidate_id}>
              <td>{candidate.candidate_id}</td>
              <td>{candidate.candidate_name}</td>
              <td>{candidate.role}</td>
              <td>{candidate.location}</td>
              <td>{candidate.selection_status}</td>
              <td>{candidate.client_id}</td>
              <td>
                <input
                  type="text"
                  placeholder="Enter new Client ID"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                />
                <button onClick={() => updateClientId(candidate.candidate_id, selectedClientId)}>
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Assign Candidate to Open Job */}
      <h2>Assign Candidate to Open Job</h2>
      <select onChange={(e) => setSelectedCandidateId(e.target.value)} value={selectedCandidateId}>
        <option value="">Select Candidate</option>
        {candidates.map(candidate => (
          <option key={candidate.candidate_id} value={candidate.candidate_id}>
            {candidate.candidate_name} ({candidate.candidate_id})
          </option>
        ))}
      </select>

      <select onChange={(e) => setSelectedJobId(e.target.value)} value={selectedJobId}>
        <option value="">Select Job</option>
        {openJobs.map(job => (
          <option key={job.job_id} value={job.job_id}>
            {job.job_title} ({job.job_id})
          </option>
        ))}
      </select>

      <button onClick={assignCandidateToJob}>Assign Candidate to Job</button>

      <button onClick={() => navigate("/hr-dashboard")}>Back to Dashboard</button>
      
    </div>
  );
};

export default CandidateSubmittedPage;
