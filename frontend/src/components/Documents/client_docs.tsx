import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import SignaturePad from "react-signature-canvas";
import "./DocumentSignPage.css";

type Document = {
  status_id: string;
  document_id: string;
  doc_store_id: string;
  status: string;
};

const ClientDocumentSignPage: React.FC = () => {
  const location = useLocation();
  const { client_id } = location.state || {};
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [documentURL, setDocumentURL] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const sigCanvasRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    console.log("Client ID:", client_id);  // 👈 Check this in browser console
  
    const fetchDocuments = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/get-client-documents/${client_id}/`
        );
        console.log("Fetched documents:", response.data); // 👈
        setDocuments(response.data.documents || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchDocuments();
  }, [client_id]);

  const handleSelect = (doc: Document) => {
    setSelectedDoc(doc);
    const gDriveURL = `https://drive.google.com/uc?export=view&id=${doc.doc_store_id}`;
    setDocumentURL(gDriveURL);
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedDoc) {
      alert("Please select a document and a file to upload.");
      return;
    }
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("old_doc_store_id", selectedDoc.doc_store_id);

    try {
      const response = await axios.post("http://127.0.0.1:8000/replace-signed-document/", formData);
      if (response.data.success) {
        alert("Document uploaded and updated successfully.");
        // Refresh list
        setSelectedDoc(null);
        setUploadFile(null);
        axios
          .get(`http://127.0.0.1:8000/get-client-documents/${client_id}`)
          .then((res) => setDocuments(res.data.documents));
      } else {
        alert("Error replacing document.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Something went wrong while uploading the document.");
    }
  };

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadFile(file || null);
  };

  const handleClear = () => {
    sigCanvasRef.current?.clear();
  };

  // const handleSave = async () => {
  //   if (!selectedDoc || !sigCanvasRef.current) return;

  //   const signatureData = sigCanvasRef.current
  //     .getTrimmedCanvas()
  //     .toDataURL("image/png");

  //   try {
  //     const response = await axios.post("http://127.0.0.1:8000/sign-document/", {
  //       status_id: selectedDoc.status_id,
  //       signature: signatureData,
  //       doc_store_id: selectedDoc.doc_store_id,
  //     });

  //     if (response.data.success) {
  //       alert("Document signed and saved successfully!");
  //     } else {
  //       alert("Failed to save signed document.");
  //     }
  //   } catch (error) {
  //     console.error("Signing error:", error);
  //     alert("An error occurred while signing.");
  //   }
  // };

  return (
    <div className="document-sign-container">
      <h2>📄 Client Document Signing</h2>

      {loading ? (
        <p>Loading documents...</p>
      ) : documents.length === 0 ? (
        <p>No documents available for signing.</p>
      ) : (
        <div className="doc-list">
          <h3>Available Documents</h3>
          {documents.map((doc) => (
            <div key={doc.status_id} className="doc-row">
              <span>{doc.document_id}</span>
              <button onClick={() => handleSelect(doc)}>View & Sign</button>
            </div>
          ))}
        </div>
      )}

      {selectedDoc && (
        <div className="upload-section">
          <h3>Download Document</h3>
          <a href={documentURL} download target="_blank" rel="noopener noreferrer">
            <button className="download-btn">📥 Download Document</button>
          </a>

          <h3>Upload Signed Document</h3>
          <input type="file" accept="application/pdf,image/*" onChange={handleUploadChange} />
          <button className="upload-btn" onClick={handleUpload}>
            Upload & Replace
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientDocumentSignPage;
