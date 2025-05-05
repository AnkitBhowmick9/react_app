import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../Documents/DocumentSignPage.css"; // Reuse the same styling


type Document = {
  status_id: string;
  document_id: string;
  doc_store_id: string;
  status: string;
};


const CandidateContractUploadPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [documentURL, setDocumentURL] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const location = useLocation();
  const {client_id ,username, usertype } = location.state || {};
  
  console.log(client_id)
  useEffect(() => {
    if (client_id) {
      fetchCandidateContracts(client_id);
    }
  }, [client_id]);

  const fetchCandidateContracts = async (client_id: string) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/get-candidate-contracts/", {
        params: { client_id },
      });
      if (response.data && response.data.candidates) {
        setDocuments(response.data.candidates);
      }
    } catch (err) {
      console.error("Error fetching candidates", err);
    }
  };

  const handleSelect = (doc: Document) => {
    console.log("Selected doc:", doc); // DEBUG
    setSelectedDoc(doc);
    setDocumentURL(`https://drive.google.com/uc?export=view&id=${doc.doc_store_id}`);
  };

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadFile(file || null);
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedDoc) {
      alert("Please select a document and upload file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("old_doc_store_id", selectedDoc.doc_store_id);

    try {
      const response = await axios.post("http://127.0.0.1:8000/replace-signed-document/", formData);
      if (response.data.success) {
        alert("Signed contract uploaded successfully.");
        setSelectedDoc(null);
        setUploadFile(null);
        const updated = await axios.get("http://127.0.0.1:8000/get-candidate-contracts/",{params: { client_id },
        });
        setDocuments(updated.data.documents || []);
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Something went wrong during upload.");
    }
  };

  return (
    <div className="document-sign-container">
      <h2>📄 Upload Signed Contract</h2>

      {documents.length === 0 ? (
        <p>No contract documents available.</p>
      ) : (
        <div className="doc-list">
          <h3>Available Contract(s)</h3>
          {documents.map((doc) => (
            <div key={doc.status_id} className="doc-row">
              <span>{doc.document_id}</span>
              <button onClick={() => handleSelect(doc)}>View & Upload</button>
            </div>
          ))}
        </div>
      )}

      {selectedDoc && (
        <div className="upload-section">
          <h3>Download Contract</h3>
          <a href={documentURL} download target="_blank" rel="noopener noreferrer">
            <button className="download-btn">📥 Download Contract</button>
          </a>

          <h3>Upload Signed Contract</h3>
          <input type="file" accept="application/pdf,image/*" onChange={handleUploadChange} />
          <button className="upload-btn" onClick={handleUpload}>
            Upload & Replace
          </button>
        </div>
      )}
    </div>
  );
};

export default CandidateContractUploadPage;
