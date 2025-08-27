import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import apiClient from "../utils/apiClient";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    const allowedTypes = ["image/jpeg", "image/jpg"];
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("❌ Invalid file type. Only JPG is allowed.");
      setFile(null);
      return false;
    }
    if (selectedFile.size > maxSize) {
      setError("❌ File too large. Maximum size is 2MB.");
      setFile(null);
      return false;
    }
    setError("");
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      setExtractedData(null); // reset previous data
    }
  };

  // Confirm button: send file to /api/extract endpoint
  const handleExtract = async () => {
    if (!file) {
      setError("⚠️ Please upload a valid Aadhaar JPG file first.");
      return;
    }
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post("/extract", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });
      setExtractedData(response.data);
      setError("");
    } catch (err) {
      setError("Extraction failed: " + (err.response?.data?.message || err.message));
      setExtractedData(null);
    } finally {
      setUploading(false);
    }
  };

  // Save button: send extracted data to /api/save
  const handleSave = async () => {
    if (!extractedData) {
      setError("No extracted data to save");
      return;
    }
    try {
      const response = await apiClient.post("/save", extractedData);
      alert(response.data.message || "Data saved successfully!");
      // Optionally clear states or navigate somewhere
      setFile(null);
      setExtractedData(null);
      setError("");
    } catch (err) {
      setError("Save failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <motion.div className="p-6 max-w-3xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Aadhaar Upload and Extraction</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <input type="file" accept="image/jpeg,image/jpg" onChange={handleFileChange} />
      {error && <p className="text-red-600 mt-2">{error}</p>}

      {file && (
        <div className="my-4">
          <p>✅ File ready: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
          {uploading && <p>Uploading and extracting: {progress}%</p>}
        </div>
      )}

      <button
        onClick={handleExtract}
        disabled={!file || uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
      >
        Confirm Extract
      </button>

      {extractedData && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl mb-2">Extracted Aadhaar Details</h2>
          <pre className="whitespace-pre-wrap">{JSON.stringify(extractedData, null, 2)}</pre>
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4"
          >
            Save Details
          </button>
        </div>
      )}
    </motion.div>
  );
}
