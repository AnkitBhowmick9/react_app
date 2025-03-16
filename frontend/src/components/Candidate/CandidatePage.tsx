import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, TextField, Button, Typography, Paper, Grid, IconButton } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LogoutIcon from "@mui/icons-material/Logout";

const CandidateForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, usertype } = location.state || {}; // Get username and usertype from login

  const [formData, setFormData] = useState({
    candidate_name: "",
    role: "",
    location: "",
    email: "",
    phone: "",
    cv_file_name: "" // Store file name
  });

  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setFormData({ ...formData, cv_file_name: e.target.files[0].name }); // Update file name
    }
  };

  const handleUploadCV = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await axios.post("http://127.0.0.1:8000/upload-cv/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.file_id) {
            return response.data.file_id; // Return Google Drive file ID
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error uploading CV:", error);
        return null;
    }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload a CV.");
      return;
    }

    let cvFileId = await handleUploadCV(file); // Upload file and get ID

    if (!cvFileId) {
      alert("CV upload failed.");
      return;
    }

    if (!formData.candidate_name || !formData.email || !formData.phone) {
      setMessage("Please fill in all required fields.");
      return;
    }

    // Submit candidate data with the Google Drive File ID
    const payload = { ...formData, cv_file_name: cvFileId };

    try {
      const response = await axios.post("http://127.0.0.1:8000/register_candidate/", payload);
      if (response.data.success) {
        setMessage("Candidate registered successfully!");
      } else {
        setMessage("Error registering candidate.");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      setMessage("An error occurred while submitting the form.");
    }
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "40px" }}>
      <Paper elevation={3} style={{ padding: "30px", borderRadius: "10px" }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Typography variant="h5" gutterBottom>
            Candidate Registration
          </Typography>
          <IconButton color="secondary" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Grid>

        {message && <Typography color="success" sx={{ mb: 2 }}>{message}</Typography>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Candidate Name"
            name="candidate_name"
            value={formData.candidate_name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          {/* File Upload */}
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
                <Button variant="contained" color="primary" component="span" startIcon={<UploadFileIcon />}>
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

          {/* Submit Button */}
          <Button type="submit" fullWidth variant="contained" color="success" style={{ marginTop: "20px" }}>
            Submit
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default CandidateForm;