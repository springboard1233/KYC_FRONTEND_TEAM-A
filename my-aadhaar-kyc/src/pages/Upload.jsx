import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("❌ Invalid file type. Only PDF, JPG, or PNG allowed.");
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
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("⚠️ Please upload a valid Aadhaar/PAN file before proceeding.");
      return;
    }

    setUploading(true);
    setProgress(0);

    // Simulate upload delay and progress
    let simulatedProgress = 0;
    const interval = setInterval(() => {
      simulatedProgress += 20;
      setProgress(simulatedProgress);
      if (simulatedProgress >= 100) {
        clearInterval(interval);
        // After "upload", navigate with dummy data
        navigate("/result", {
          state: {
            data: {
              name: "John Doe",
              aadhaar_number: "1234-5678-9012",
              dob: "1990-01-01",
              address: "1234 Main St, City, Country"
            }
          }
        });
        setUploading(false);
      }
    }, 300);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-200 to-blue-200 px-4 py-10">
      <motion.div
        className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-lg text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-purple-700 mb-6">
          Upload Aadhaar / PAN
        </h1>

        <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-500 rounded-xl bg-purple-50 hover:bg-purple-100 cursor-pointer transition">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <p className="text-gray-600">
            📂 Drag & drop your file here or{" "}
            <span className="text-purple-600 font-semibold">browse</span>
          </p>
        </label>

        {error && (
          <motion.p
            className="text-red-600 font-medium mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {file && !error && (
          <motion.div
            className="mt-6 p-4 bg-green-100 rounded-xl shadow-inner relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-green-700 font-semibold">✅ File ready: {file.name}</p>
            <p className="text-green-700 text-sm">
              {(file.size / 1024).toFixed(2)} KB
            </p>
            {file.type.startsWith("image/") && (
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="mt-3 rounded-lg max-h-48 mx-auto shadow-md"
              />
            )}
            {uploading && (
              <div className="absolute bottom-2 left-0 w-full px-4">
                <div className="h-2 bg-purple-300 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-purple-700 text-xs mt-1">{progress}% uploaded</p>
              </div>
            )}
          </motion.div>
        )}

        <button
          onClick={handleSubmit}
          disabled={uploading}
          className={`mt-6 w-full py-3 text-white font-bold rounded-xl transition transform hover:scale-105 ${
            uploading
              ? "bg-purple-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {uploading ? "Uploading..." : "Extract Data"}
        </button>
      </motion.div>
    </div>
  );
}
