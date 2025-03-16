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
  job_id: string;
}

interface OpenJob {
  job_id: string;
  job_title: string;
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
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  const navigate = useNavigate();

  // Fetch candidates, open jobs, and clients from API
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/candidates/")
      .then(response => setCandidates(response.data))
      .catch(error => console.error("Error fetching candidates:", error));

    axios.get("http://127.0.0.1:8000/open-jobs/")
      .then(response => setOpenJobs(response.data))
      .catch(error => console.error("Error fetching open jobs:", error));

    axios.get("http://127.0.0.1:8000/get_client_ids/")
    .then(response => {
      if (Array.isArray(response.data.clients)) {
        setClients(response.data.clients);  // Ensure data is extracted correctly
      } else {
        console.error("Unexpected response structure:", response.data);
      }
     })
    .catch(error => console.error("Error fetching clients:", error));
  }, []);

  // Update Client ID for a Candidate
  const updateClientId = (candidate_id: string) => {
    const newClientId = selectedClient[candidate_id];
    const newJobId = selectedJobId;

    if (!newClientId) {
      alert("Please select a client.");
      return;
    }

    axios.put(`http://127.0.0.1:8000/candidate/${candidate_id}/update-client/`, { client_id: newClientId, job_id: newJobId })
      .then(() => {
        alert("Client ID updated successfully!");
        setCandidates(prev =>
          prev.map(c => c.candidate_id === candidate_id ? { ...c, client_id: newClientId, job_id: newJobId } : c)
        );
      })
      .catch(error => console.error("Error updating client ID:", error));
  };

  // // Assign Candidate to an Open Job
  // const assignCandidateToJob = () => {
  //   if (!selectedCandidateId || !selectedJobId) {
  //     alert("Please select a candidate and job.");
  //     return;
  //   }

  //   axios.put(`http://127.0.0.1:8000/open-jobs/${selectedJobId}/assign-candidate/`, { candidate_id: selectedCandidateId })
  //     .then(() => {
  //       alert("Candidate assigned to job successfully!");
  //       setSelectedCandidateId("");
  //       setSelectedJobId("");
  //     })
  //     .catch(error => console.error("Error assigning candidate:", error));
  // };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Candidate Submitted Page</h1>

      {/* Candidate List Table */}
      <table className="w-full border-collapse border border-gray-300 rounded-lg shadow-lg">
        <thead className="bg-blue-500 text-white">
          <tr>
            <th className="p-3">Candidate ID</th>
            <th className="p-3">Name</th>
            <th className="p-3">Role</th>
            <th className="p-3">Location</th>
            <th className="p-3">Selection Status</th>
            <th className="p-3">Client ID</th>
            <th className="p-3">Update Client ID</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map(candidate => (
            <tr key={candidate.candidate_id} className="border-b hover:bg-gray-100">
              <td className="p-3">{candidate.candidate_id}</td>
              <td className="p-3">{candidate.candidate_name}</td>
              <td className="p-3">{candidate.role}</td>
              <td className="p-3">{candidate.location}</td>
              <td className="p-3">{candidate.selection_status}</td>
              <td className="p-3">{candidate.client_id}</td>
              <td className="p-3">
              <select
                  className="border p-2 rounded"
                  value={selectedClient[candidate.candidate_id] || ""}
                  onChange={(e) => setSelectedClient(prev => ({ ...prev, [candidate.candidate_id]: e.target.value }))}
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client.client_id} value={client.client_id}>
                      {client.client_name} ({client.client_id})
                    </option>
                  ))}
                </select>
                <td className="p-3">{candidate.job_id}</td>
                <select
                  className="border p-2 rounded"
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  value={selectedJobId}
                >
                  <option value="">Select Job</option>
                  {openJobs.map(job => (
                    <option key={job.job_id} value={job.job_id}>
                      {job.job_title} ({job.job_id})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => updateClientId(candidate.candidate_id)}
                  className="ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Assign Candidate to Open Job
      <h2 className="text-xl font-bold mt-6">Assign Candidate to Open Job</h2>
      <div className="flex items-center gap-4 mt-4">
        <select
          className="border p-2 rounded"
          onChange={(e) => setSelectedCandidateId(e.target.value)}
          value={selectedCandidateId}
        >
          <option value="">Select Candidate</option>
          {candidates.map(candidate => (
            <option key={candidate.candidate_id} value={candidate.candidate_id}>
              {candidate.candidate_name} ({candidate.candidate_id})
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          onChange={(e) => setSelectedJobId(e.target.value)}
          value={selectedJobId}
        >
          <option value="">Select Job</option>
          {openJobs.map(job => (
            <option key={job.job_id} value={job.job_id}>
              {job.job_title} ({job.job_id})
            </option>
          ))}
        </select>

        <button
          onClick={assignCandidateToJob}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Assign Candidate to Job
        </button>
      </div> */}

      <button
        onClick={() => navigate("/hr-dashboard")}
        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default CandidateSubmittedPage;
