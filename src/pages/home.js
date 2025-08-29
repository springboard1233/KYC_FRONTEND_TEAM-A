import React, { useState } from "react";

function Home() {
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [aadhaarUrl, setAadhaarUrl] = useState(null);

  const [panFile, setPanFile] = useState(null);
  const [panUrl, setPanUrl] = useState(null);

  // Aadhaar Upload
  const handleAadhaarUpload = (e) => {
    const selectedFile = e.target.files[0];
    setAadhaarFile(selectedFile);
    setAadhaarUrl(selectedFile ? URL.createObjectURL(selectedFile) : null);
  };

  // PAN Upload
  const handlePanUpload = (e) => {
    const selectedFile = e.target.files[0];
    setPanFile(selectedFile);
    setPanUrl(selectedFile ? URL.createObjectURL(selectedFile) : null);
  };

  // Helpers
  const isImage = (file) => file && file.type.startsWith("image/");
  const isPdf = (file) => file && file.type === "application/pdf";

  // Save Aadhaar
  const handleSaveAadhaar = () => {
    if (!aadhaarFile) {
      alert("Please upload Aadhaar before saving!");
      return;
    }
    // Later: API call to save Aadhaar file
    alert(`Aadhaar file "${aadhaarFile.name}" saved to database!`);
  };

  // Save PAN
  const handleSavePan = () => {
    if (!panFile) {
      alert("Please upload PAN before saving!");
      return;
    }
    // Later: API call to save PAN file
    alert(`PAN file "${panFile.name}" saved to database!`);
  };

  return (
    <div className="home-container">
      {/* Aadhaar Section */}
      <div className="upload-card">
        <h2>KYC Aadhaar Upload</h2>
        <label><b>Upload Aadhaar (JPG/PNG/PDF):</b></label>
        <input
          type="file"
          accept=".jpeg,.jpg,.png,.pdf,image/jpeg,image/png,application/pdf"
          onChange={handleAadhaarUpload}
        />
        {aadhaarUrl && (
          <div className="preview-box">
            <h3>Preview Aadhaar</h3>
            <p><b>File name:</b> {aadhaarFile.name}</p>
            {isImage(aadhaarFile) && (
              <img src={aadhaarUrl} alt="Aadhaar Preview" />
            )}
            {isPdf(aadhaarFile) && (
              <embed src={aadhaarUrl} type="application/pdf" width="100%" height="250px" />
            )}
            <button className="save-btn" onClick={handleSaveAadhaar}>
              Save Aadhaar to Database
            </button>
          </div>
        )}
      </div>

      {/* PAN Section */}
      <div className="upload-card">
        <h2>KYC PAN Upload</h2>
        <label><b>Upload PAN (JPG/PNG/PDF):</b></label>
        <input
          type="file"
          accept=".jpeg,.jpg,.png,.pdf,image/jpeg,image/png,application/pdf"
          onChange={handlePanUpload}
        />
        {panUrl && (
          <div className="preview-box">
            <h3>Preview PAN</h3>
            <p><b>File name:</b> {panFile.name}</p>
            {isImage(panFile) && (
              <img src={panUrl} alt="PAN Preview" />
            )}
            {isPdf(panFile) && (
              <embed src={panUrl} type="application/pdf" width="100%" height="250px" />
            )}
            <button className="save-btn" onClick={handleSavePan}>
              Save PAN to Database
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
