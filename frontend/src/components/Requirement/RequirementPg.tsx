import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Button, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";

interface Job {
  job_id: string;
  role_title: string;
  job_description: string;
  client_id: string;
  username: string;
  candidate_name?: string;
  cv_file_name?: string;
}

const RequirementPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { username, client_id, usertype } = location.state || {}; // Extract values safely

  useEffect(() => {
    console.log("Request received:", { username, usertype, client_id });

    if (client_id) {
      axios.get(`http://127.0.0.1:8000/jobs/${client_id}/${usertype}/`)
        .then(response => setJobs(response.data))
        .catch(error => console.error("Error fetching jobs:", error));
    }
  }, [client_id, usertype]);

  const handleNextStatus = (jobId: string, client_id: string, usertype: string) => {
    navigate(`/status-page/${jobId}/${client_id}/${usertype}`);
  };

  const handleDownloadCV = async (jobId: string) => {
    if (!jobId) {
      alert("CV not available for this candidate.");
      return;
    }
  
    try {
      // Open the redirected Google Drive download link
      window.open(`http://127.0.0.1:8000/download-cv/${jobId}`, "_blank");
    } catch (error) {
      console.error("Error downloading CV:", error);
      alert("Failed to download CV.");
    }
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: "20px" }}>
      <Paper elevation={3} style={{ padding: "20px", borderRadius: "10px" }}>
        <Typography variant="h5" gutterBottom>
          Job Requirements
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job ID</TableCell>
                <TableCell>Role Title</TableCell>
                <TableCell>Job Description</TableCell>
                <TableCell>Client ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Candidate Name</TableCell>
                <TableCell>Download CV</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.job_id}>
                  <TableCell>{job.job_id}</TableCell>
                  <TableCell>{job.role_title}</TableCell>
                  <TableCell>{job.job_description}</TableCell>
                  <TableCell>{job.client_id}</TableCell>
                  <TableCell>{job.username}</TableCell>
                  <TableCell>{job.candidate_name || "N/A"}</TableCell>
                  <TableCell>
                    {job.cv_file_name ? (
                      <Button variant="contained" color="primary" onClick={() => handleDownloadCV(job.cv_file_name)}>
                        Download CV
                      </Button>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No CV Available
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="contained" color="success" onClick={() => handleNextStatus(job.job_id, job.client_id, usertype)}>
                      Next Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default RequirementPage;