import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import logo from "../Client/HR_track_Logo_Cropped.jpg";
import "./RequirementPage.css";

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
  const { username, client_id, usertype } = location.state || {};

  useEffect(() => {
    if (client_id) {
      axios
        .get(`http://127.0.0.1:8000/jobs/${client_id}/${usertype}/`)
        .then((response) => setJobs(response.data))
        .catch((error) => console.error("Error fetching jobs:", error));
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
      window.open(`http://127.0.0.1:8000/download-cv/${jobId}`, "_blank");
    } catch (error) {
      console.error("Error downloading CV:", error);
      alert("Failed to download CV.");
    }
  };

  return (
    <div className="requirement-wrapper">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <img src={logo} alt="Logo" className="logo" />
          <h1 className="app-title">HR Track Solution</h1>
        </div>
        <div className="header-actions">
          <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
          <button className="logout-btn" onClick={() => navigate("/login")}>Logout</button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav-bar">
        {/* <button onClick={() => navigate("/dashboard", { state: { username, client_id, usertype } })}>Dashboard</button>
        <button onClick={() => navigate("/hr-company-docs")}>Documents</button>
        <button onClick={() => navigate("/client-page", { state: { username, client_id, usertype } })}>Client Jobs</button>
        <button onClick={() => navigate("/candidates-submitted", { state: { username, client_id, usertype } })}>Candidates</button> */}
        <button onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}>About</button>
        <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>Contact</button>
      </nav>

      {/* Content */}
      <Container maxWidth="lg" style={{ marginTop: "30px", marginBottom: "50px" }}>
        <Paper elevation={4} style={{ padding: "30px", borderRadius: "16px" }}>
          <Typography variant="h5" gutterBottom style={{ color: "#1e3a8a", fontWeight: "bold", marginBottom: "20px" }}>
            Job Requirements
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Job ID</strong></TableCell>
                  <TableCell><strong>Role Title</strong></TableCell>
                  <TableCell><strong>Job Description</strong></TableCell>
                  <TableCell><strong>Client ID</strong></TableCell>
                  <TableCell><strong>Username</strong></TableCell>
                  <TableCell><strong>Candidate Name</strong></TableCell>
                  <TableCell><strong>Download CV</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
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
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleDownloadCV(job.job_id)}
                        >
                          Download
                        </Button>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Not Available
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleNextStatus(job.job_id, job.client_id, usertype)}
                      >
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

      {/* Footer */}
      <footer className="footer">
        <div className="info-grid">
          <div id="about">
            <h3>About Us</h3>
            <p>
              We streamline hiring by connecting clients and HRs on a modern, collaborative platform. Efficiency, quality, and results—delivered.
            </p>
          </div>
          <div id="contact">
            <h3>Contact Us</h3>
            <p>Email: support@hrtrack.com</p>
            <p>Phone: +1-800-787878</p>
            <p>Address: 123 Avenue, Bengaluru, India</p>
          </div>
        </div>
        <p className="copyright">
          &copy; 2025 HR Track Solution. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default RequirementPage;
