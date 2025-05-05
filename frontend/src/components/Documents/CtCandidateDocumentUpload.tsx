import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  IconButton,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LogoutIcon from "@mui/icons-material/Logout";
import logo from "../Client/HR_track_Logo_Cropped.jpg";
import { useNavigate } from "react-router-dom";

const CandidateDocumentUpload: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [documentStatus, setDocumentStatus] = useState<any[]>([]); // <-- new state
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch hired candidates (for upload dropdown)
    axios.get("http://127.0.0.1:8000/hired-candidates/")
      .then((res) => {
        console.log("Fetched candidates:", res.data);
        setCandidates(res.data);
      })
      .catch(err => console.error("Error fetching candidates:", err));
  }, []);

  useEffect(() => {
    // Fetch document status where candidate_id is not null
    axios.get("http://127.0.0.1:8000/document-status-candidates/")
      .then((res) => {
        console.log("Fetched document status entries:", res.data);
        setDocumentStatus(res.data);
      })
      .catch(err => console.error("Error fetching document status:", err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedCandidate) {
      setMessage("Please select a candidate and upload a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("candidate_id", selectedCandidate.candidate_id);
    formData.append("client_id", selectedCandidate.client_id);
    formData.append("job_id", selectedCandidate.job_id);

    try {
      const res = await axios.post("http://127.0.0.1:8000/upload-contract/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setMessage("Document uploaded and saved successfully.");
      } else {
        setMessage("Upload failed.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("Upload error occurred.");
    }
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img src={logo} alt="Logo" style={{ height: "40px", marginRight: "10px" }} />
            <Typography variant="h6" component="div">
              HR Document Upload
            </Typography>
          </Box>
          <Box>
            <Button color="inherit">About Us</Button>
            <Button color="inherit">Contact</Button>
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Document Status Table Section */}
      <Container maxWidth="md" sx={{ marginTop: 5 }}>
        <Paper elevation={3} sx={{ padding: 4, borderRadius: 4 }}>
          <Typography variant="h5" gutterBottom>
            Documents Status Linked to Candidates
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Candidate Name</TableCell>
                  <TableCell>Document Name</TableCell>
                  <TableCell>Document Status</TableCell>
                  <TableCell>Job Status At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documentStatus.map((doc) => (
                  <TableRow key={doc.doc_store_id}>
                    <TableCell>{doc.candidate_name}</TableCell>
                    <TableCell>{doc.document_name || "N/A"}</TableCell>
                    <TableCell>{doc.status}</TableCell>
                    <TableCell>{doc.job_status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* Upload Form Section */}
      <Container maxWidth="sm" sx={{ marginTop: 5 }}>
        <Paper elevation={3} sx={{ padding: 4, borderRadius: 4 }}>
          <Typography variant="h5" gutterBottom>
            Upload Contract for Hired Candidate
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Candidate</InputLabel>
            <Select
              value={selectedCandidate?.candidate_id || ""}
              onChange={(e) => {
                const candidate = candidates.find(
                  (cand) => cand.candidate_id === e.target.value
                );
                setSelectedCandidate(candidate);
              }}
            >
              {candidates.map((cand) => (
                <MenuItem key={cand.candidate_id} value={cand.candidate_id}>
                  {cand.candidate_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                id="contract-upload"
                style={{ display: "none" }}
              />
              <label htmlFor="contract-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<UploadFileIcon />}
                  color="primary"
                >
                  Upload Contract
                </Button>
              </label>
            </Grid>
            {file && (
              <Grid item>
                <Typography variant="body2" color="textSecondary">
                  {file.name}
                </Typography>
              </Grid>
            )}
          </Grid>

          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={handleUpload}
          >
            Submit
          </Button>

          {message && (
            <Typography color="primary" sx={{ mt: 2 }}>
              {message}
            </Typography>
          )}
        </Paper>
      </Container>

      
    </>
  );
};

export default CandidateDocumentUpload;