import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Navbar from "../Navbar";

const CandidateForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { client_id ,username, usertype } = location.state || {};

  const [formData, setFormData] = useState({
    candidate_name: "",
    role: "",
    location: "",
    email: "",
    phone: "",
    cv_file_name: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setFormData({ ...formData, cv_file_name: e.target.files[0].name });
    }
  };

  const handleUploadCV = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post("http://127.0.0.1:8000/upload-cv/", formData);
      return response.data.file_id || null;
    } catch (error) {
      console.error("Upload CV error:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please upload a CV.");
    const cvFileId = await handleUploadCV(file);
    if (!cvFileId) return alert("CV upload failed.");

    const payload = { ...formData, cv_file_name: cvFileId };
    try {
      const response = await axios.post("http://127.0.0.1:8000/register_candidate/", payload);
      setMessage(response.data.success ? "Candidate registered!" : "Error occurred.");
    } catch (error) {
      console.error("Submit error:", error);
      setMessage("Error submitting the form.");
    }
  };

  const handleUploadPage = () => {
    navigate("/upload-signed-contract-document", { state: { client_id, username, usertype } });
  };

  const handleLogout = () => navigate("/login");

  // ✅ Button passed to Navbar
  const uploadButton = (
    <Button
      variant="outlined"
      color="secondary"
      onClick={handleUploadPage}
      sx={{ textTransform: "none" }}
    >
      Upload Signed Contract
    </Button>
  );

  return (
    <>
      <Navbar username={username} usertype={usertype} onLogout={handleLogout} extraButtons={uploadButton} />

      <Container maxWidth="sm" style={{ marginTop: "30px" }}>
        <Paper elevation={3} style={{ padding: "30px", borderRadius: "10px" }}>
          <Typography variant="h5" gutterBottom>
            Candidate Registration
          </Typography>

          {message && <Typography color="success.main">{message}</Typography>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth margin="normal" name="candidate_name" label="Candidate Name" value={formData.candidate_name} onChange={handleChange} required />
            <TextField fullWidth margin="normal" name="role" label="Role" value={formData.role} onChange={handleChange} required />
            <TextField fullWidth margin="normal" name="location" label="Location" value={formData.location} onChange={handleChange} />
            <TextField fullWidth margin="normal" name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
            <TextField fullWidth margin="normal" name="phone" label="Phone" value={formData.phone} onChange={handleChange} required />

            <Grid container alignItems="center" spacing={2} style={{ marginTop: "15px" }}>
              <Grid item>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="cv-upload"
                />
                <label htmlFor="cv-upload">
                  <Button
                    variant="contained"
                    color="primary"
                    component="span"
                    startIcon={<UploadFileIcon />}
                  >
                    Upload CV
                  </Button>
                </label>
              </Grid>
              {formData.cv_file_name && (
                <Grid item>
                  <Typography variant="body2" color="textSecondary">
                    {formData.cv_file_name}
                  </Typography>
                </Grid>
              )}
            </Grid>

            <Button type="submit" fullWidth variant="contained" color="success" style={{ marginTop: "20px" }}>
              Submit
            </Button>
          </form>
        </Paper>
      </Container>
    </>
  );
};

export default CandidateForm;