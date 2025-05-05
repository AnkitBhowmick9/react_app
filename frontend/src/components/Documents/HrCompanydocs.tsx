import React, { useState, useEffect } from "react";
import axios from "axios";
import './HrCompanydocs.css';
import hrLogo from "../Client/HR_track_Logo_Cropped.jpg";

interface Client {
  client_id: string;
  client_name: string;
}

interface Document {
  name: string;
  file: File | null;
  status: string;
}

const documentTypes = [
  "Service Level Agreement",
  "Non-Disclosure Agreement",
  "Partnership Document",
];

const HrCompanydocs: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [documents, setDocuments] = useState<Document[]>(
    documentTypes.map((doc) => ({ name: doc, file: null, status: "Not Started" }))
  );
  const [searchClicked, setSearchClicked] = useState<boolean>(false);
  const [documentStatusList, setDocumentStatusList] = useState<any[]>([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/get-clients/").then((response) => {
      setClients(response.data.clients);
    });
  }, []);

  const fetchDocumentStatus = async () => {
    if (!selectedClient) return alert("Please select a client.");
    try {
      const res = await axios.get(`http://127.0.0.1:8000/get-document-status/?client_id=${selectedClient}`);
      const statusMap = res.data;
      const updatedDocs = documentTypes.map((docName) => {
        const match = statusMap.find((d: any) => d.document_id === docName);
        return { name: docName, file: null, status: match ? match.status : "Not Started" };
      });
      setDocuments(updatedDocs);
      setDocumentStatusList(statusMap);
      setSearchClicked(true);
    } catch (err) {
      console.error("Error fetching document status:", err);
    }
  };

  const handleFileChange = (index: number, file: File | null) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc, i) => (i === index ? { ...doc, file: file } : doc))
    );
  };

  const handleSubmit = async () => {
    if (!selectedClient) return alert("Please select a client.");
    for (const doc of documents) {
      if (doc.file && doc.status !== "Approved") {
        const formData = new FormData();
        formData.append("file", doc.file);
        try {
          const uploadResponse = await axios.post("http://127.0.0.1:8000/upload-cv/", formData);
          const docStoreId = uploadResponse.data.file_id;
          await axios.post("http://127.0.0.1:8000/hr-document-status/", {
            client_id: selectedClient,
            document_id: doc.name,
            candidate_id: null,
            status: doc.status,
            doc_store_id: docStoreId,
          });
        } catch (error) {
          console.error("Upload error:", doc.name, error);
        }
      }
    }
    alert("Documents submitted successfully!");
    fetchDocumentStatus();
  };

  const handleClear = () => {
    setSelectedClient("");
    setDocuments(documentTypes.map((doc) => ({ name: doc, file: null, status: "Not Started" })));
    setSearchClicked(false);
  };

  return (
    <div className="hrdocs-container">
      <header className="hrdocs-header">
        <img src={hrLogo} alt="logo" className="hrdocs-logo" />
        <h1 className="hrdocs-title">Client Document Management</h1>
        <div className="hrdocs-nav">
          <button onClick={() => window.history.back()}>Back</button>
          <button onClick={handleClear}>Clear</button>
          <button onClick={() => (window.location.href = "/login")}>Logout</button>
        </div>
      </header>

      <div className="form-area">
        <label>Client Name:</label>
        <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
          <option value="">Select Client</option>
          {clients.map((client) => (
            <option key={client.client_id} value={client.client_id}>
              {client.client_name}
            </option>
          ))}
        </select>
        <button className="primary-btn" onClick={fetchDocumentStatus}>
          Search
        </button>
      </div>

      {searchClicked && documentStatusList.length > 0 && (
        <div className="table-section">
          <h2>Submitted Document Status</h2>
          <table>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Document Name</th>
                <th>Document Status</th>
                <th>Client Status</th>
              </tr>
            </thead>
            <tbody>
              {documentStatusList.map((item, index) => (
                <tr key={index}>
                  <td>{item.Client_name}</td>
                  <td>{item.document_name}</td>
                  <td>{item.status}</td>
                  <td>{item.Client_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {searchClicked && (
        <>
          <div className="table-section">
            <h2>Upload New Documents</h2>
            <table>
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Upload</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <tr key={doc.name}>
                    <td>{doc.name}</td>
                    <td>
                      <input
                        type="file"
                        disabled={doc.status === "Approved"}
                        onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                      />
                    </td>
                    <td>
                      <select
                        value={doc.status}
                        disabled={doc.status === "Approved"}
                        onChange={(e) =>
                          setDocuments((prevDocs) =>
                            prevDocs.map((d, i) =>
                              i === index ? { ...d, status: e.target.value } : d
                            )
                          )
                        }
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="submit-button" onClick={handleSubmit}>
            Submit Documents
          </button>
        </>
      )}
    </div>
  );
};

export default HrCompanydocs;