import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import DocumentUploader from '../components/DocumentUploader';
import { extractTextFromImage } from '../api/ocrService';

const DOC_TYPES = {
  AADHAAR: 'Aadhaar Card',
  PAN: 'PAN Card',
  DL: 'Driving License'
};

const DashboardPage = () => {
  const [documents, setDocuments] = useState({
    AADHAAR: { file: null, data: null, isLoading: false, error: null },
    PAN: { file: null, data: null, isLoading: false, error: null },
    DL: { file: null, data: null, isLoading: false, error: null },
  });

  const navigate = useNavigate(); 

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/users/logout");
      
      sessionStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleFileUpload = async (file, docType) => {
    setDocuments(prev => ({ ...prev, [docType]: { ...prev[docType], isLoading: true, error: null } }));
    try {
      const extractedData = await extractTextFromImage(file);
      setDocuments(prev => ({ ...prev, [docType]: { file, data: extractedData, isLoading: false, error: null } }));
    } catch (err) {
      setDocuments(prev => ({ ...prev, [docType]: { ...prev[docType], isLoading: false, error: err.message } }));
    }
  };

  return (
    <div className="dashboard-container">
      <header>
        <h1>KYC Document Upload</h1>
        <p>Upload your documents for real-time verification.</p>
        {/* <button 
          onClick={handleLogout} // 5. Use the new logout function
          className="btn btn-outline btn-error"
        >
          Logout
        </button> */}
      </header>
      <main className="upload-grid">
        {Object.keys(DOC_TYPES).map(docKey => (
          <DocumentUploader
            key={docKey}
            docName={DOC_TYPES[docKey]}
            onFileUpload={(file) => handleFileUpload(file, docKey)}
            isLoading={documents[docKey].isLoading}
            extractedData={documents[docKey].data}
            uploadError={documents[docKey].error}
          />
        ))}
      </main>
    </div>
  );
};

export default DashboardPage;