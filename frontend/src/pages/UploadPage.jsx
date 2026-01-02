import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "../components/Navbar";
import {
  Upload,
  FileText,
  Shield,
  CheckCircle,
  AlertTriangle,
  Lock,
  Clock,
  X,
  Sparkles,
  User,
  Mail,
  Phone,
} from "lucide-react";

export default function UploadPage({ onExtract }) {
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
  });

  const [uploadedFileNames, setUploadedFileNames] = useState([]);

  const [formErrors, setFormErrors] = useState({});
  const [extractedData, setExtractedData] = useState({});
  const [verificationResult, setVerificationResult] = useState(null);

  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [aadhaarError, setAadhaarError] = useState("");

  const [panFile, setPanFile] = useState(null);
  const [panPreview, setPanPreview] = useState(null);
  const [panError, setPanError] = useState("");

  const [processing, setProcessing] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const aadhaarInputRef = useRef(null);
  const panInputRef = useRef(null);
  const navigate = useNavigate();

  const allowedTypes = ["image/jpeg", "image/png"];
  const maxSize = 2 * 1024 * 1024;

  const validateForm = () => {
    const errors = {};
    if (!userInfo.fullName.trim()) errors.fullName = "Full Name is required.";
    if (!userInfo.dob) errors.dob = "Date of Birth is required.";
    if (!userInfo.gender) errors.gender = "Gender is required.";

    if (!/^\d{10}$/.test(userInfo.phone))
      errors.phone = "Enter valid 10-digit phone.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const makePreview = (f) => {
    if (!f) return null;
    if (f.type === "application/pdf") return "pdf";
    return URL.createObjectURL(f);
  };

  const validateFile = (f) => {
    if (!f) return "No file selected.";
    if (!allowedTypes.includes(f.type))
      return "Only JPEG, PNG files are supported.";
    if (f.size > maxSize) return "File size must be ≤ 2MB.";
    return "";
  };

  const handleFile = (f, type) => {
    const error = validateFile(f);
    if (type === "aadhaar") {
      if (error) {
        setAadhaarError(error);
        setAadhaarFile(null);
        setAadhaarPreview(null);
      } else {
        setAadhaarError("");
        setAadhaarFile(f);
        setAadhaarPreview(makePreview(f));
      }
    } else if (type === "pan") {
      if (error) {
        setPanError(error);
        setPanFile(null);
        setPanPreview(null);
      } else {
        setPanError("");
        setPanFile(f);
        setPanPreview(makePreview(f));
      }
    }
  };

  // ------------------ AI Verification ------------------
  const handleVerifyDocs = async () => {
    if (!aadhaarFile && !panFile) {
      toast.error("Please upload at least one document to verify.");
      return;
    }

    setVerifying(true);
    toast.info("Running AI-based fraud detection...");

    try {
      const results = [];

      if (aadhaarFile) {
        const formData = new FormData();
        formData.append("documentImage", aadhaarFile);
        formData.append("documentType", "aadhaar");
        formData.append("userName", userInfo.fullName || "");

        const aadhaarResult = await api.aiVerifyDoc(formData);
        results.push({ type: "aadhaar", ...aadhaarResult });
      }

      if (panFile) {
        const formData = new FormData();
        formData.append("documentImage", panFile);
        formData.append("documentType", "pan");
        formData.append("userName", userInfo.fullName || "");

        const panResult = await api.aiVerifyDoc(formData);
        results.push({ type: "pan", ...panResult });
      }

      setVerificationResult(results);
      console.log("Verification Result:", results);
      toast.success("Document(s) verified successfully!");
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(
        error?.response?.data?.error ||
          "Verification failed due to server error"
      );
    } finally {
      setVerifying(false);
    }
  };

  const submitKYC = async () => {
    if (!validateForm()) {
      toast.error("Please fill in missing required personal information.");
      return;
    }

    if (!verificationResult || !Array.isArray(verificationResult)) {
      toast.error("Please verify your document before submitting KYC.");
      return;
    }
    let filesToUse = uploadedFileNames;

    if (filesToUse.length === 0) {
      toast.info("Uploading documents first...");
      filesToUse = await handleExtract();
    }
    const combinedExtractedData = {};
    const fraudInfos = [];

    verificationResult.forEach((result) => {
      if (result.extractedData && typeof result.extractedData === "object") {
        if (result.type) {
          const docData = result.extractedData;
          if (docData && typeof docData === "object") {
            combinedExtractedData[result.type.toLowerCase()] = docData;
          }
        }
      }

      fraudInfos.push({
        type: result.type,
        fraudScore: result.fraudScore,
        riskLevel: result.riskLevel,
        reasons: result.reason,
      });
    });

    const kycData = {
      userInfo,
      extractedData: combinedExtractedData,
      fraudInfo: fraudInfos,
      verificationResult,
      filenames: filesToUse,
    };

    try {
      const res = await api.submitKYC(kycData);
      toast.success("KYC submitted successfully!");
      console.log("📤 Submitting KYC with filenames:", filesToUse);
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Unknown error submitting KYC";
      toast.error("Error submitting KYC: " + message);
    }
  };

  // ------------------ Extraction ------------------ (if still needed)
  const handleExtract = async () => {
    if (!aadhaarFile && !panFile) {
      toast.error("Please upload at least one document to extract.");
      return;
    }
    setProcessing(true);
    // Remove navigate("/loading"); — no navigation now

    try {
      const extractedData = {};
      const filenames = [];

      if (aadhaarFile) {
        const data = await api.uploadDocument(aadhaarFile);
        extractedData.aadhaar = data;
        filenames.push(aadhaarFile.name); // Use the original file name here
      }

      if (panFile) {
        const data = await api.uploadDocument(panFile);
        extractedData.pan = data;
        filenames.push(panFile.name); // Use the original file name here
      }

      // Don't navigate, just update state
      setExtractedData(extractedData);
      setUploadedFileNames(filenames);
      toast.success("Data extracted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to extract document data.");
    } finally {
      setProcessing(false);
    }
  };

  const removeFile = (type) => {
    if (type === "aadhaar") {
      setAadhaarFile(null);
      setAadhaarPreview(null);
      setAadhaarError("");
      if (aadhaarInputRef.current) aadhaarInputRef.current.value = "";
    }
    if (type === "pan") {
      setPanFile(null);
      setPanPreview(null);
      setPanError("");
      if (panInputRef.current) panInputRef.current.value = "";
    }
  };

  // ------------------ UI ------------------

  // Then in detailItems use combinedExtractedData:
  const detailItems = [
    {
      label: "Full Name",
      value:
        extractedData?.aadhaar?.name ||
        extractedData?.pan?.name ||
        userInfo.fullName,
      icon: User, // import an icon or choose one
    },
    {
      label: "Date of Birth",
      value:
        extractedData?.aadhaar?.dob || extractedData?.pan?.dob || userInfo.dob,
      icon: Clock,
    },
    {
      label: "Gender",
      value:
        extractedData?.aadhaar?.gender ||
        extractedData?.pan?.gender ||
        userInfo.gender,
      icon: User,
    },

    // {
    //   label: "Phone",
    //   value: userInfo.phone,
    //   icon: Phone,
    // },
    {
      label: "Aadhaar Number",
      value: extractedData?.aadhaar?.aadhaar || "N/A",
      icon: Shield,
    },
    {
      label: "PAN Number",
      value: extractedData?.pan?.pan || "N/A",
      icon: Lock,
    },
    {
      label: "Address",
      value:
        extractedData?.aadhaar?.address || extractedData?.pan?.address || "N/A",
      icon: FileText,
    },
  ];

  const renderUploader = (
    label,
    file,
    preview,
    error,
    inputRef,
    onFileChange,
    removeClick
  ) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative bg-slate-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800 p-8 mb-10"
    >
      <h2 className="text-xl font-bold text-white mb-6">{label}</h2>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        onChange={onFileChange}
        className="hidden"
        id={`upload-${label}`}
      />
      <label
        htmlFor={`upload-${label}`}
        className={`relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 group ${
          file
            ? "border-amber-400 bg-amber-400/10"
            : "border-slate-700 bg-slate-800/30 hover:border-yellow-500/50 hover:bg-yellow-500/5"
        }`}
      >
        {!file ? (
          <div className="text-center p-8">
            <Upload className="w-16 h-16 text-slate-500 group-hover:text-yellow-400 mx-auto mb-6 transition-colors" />
            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-yellow-300 transition-colors">
              Drop your document here
            </h3>
            <p className="text-slate-400 mb-4 group-hover:text-slate-300 transition-colors">
              or click to browse files
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-slate-800/50 rounded-xl text-sm text-slate-400 border border-slate-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Supports: JPEG, PNG • Max size: 2MB
            </div>
          </div>
        ) : preview === "pdf" ? (
          <div className="text-center p-8">
            <FileText className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-white mb-3">
              PDF Document Selected
            </h3>
            <p className="text-slate-400 text-sm">{file.name}</p>
          </div>
        ) : (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-contain rounded-2xl"
          />
        )}
        {file && (
          <motion.button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              removeClick();
            }}
            className="absolute top-4 right-4 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            whileHover={{ rotate: 90 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </label>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center p-4 bg-red-500/10 border border-red-500/30 rounded-2xl mt-4 backdrop-blur-sm"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black">
      <AnimatedBackground />
      <Navbar />
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl mx-auto">
        {/* Personal Info Form */}
        <div className="bg-slate-900/70 p-8 rounded-3xl shadow-xl mb-12 border border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-6">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Full Name", name: "fullName", type: "text" },
              { label: "Date of Birth", name: "dob", type: "date" },
              { label: "Gender", name: "gender", type: "select" },

              { label: "Mobile Number", name: "phone", type: "tel" },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  {label}
                </label>
                {type === "select" ? (
                  <select
                    value={userInfo[name]}
                    onChange={(e) =>
                      setUserInfo((prev) => ({
                        ...prev,
                        [name]: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-700"
                  >
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                ) : (
                  <input
                    type={type}
                    value={userInfo[name]}
                    onChange={(e) =>
                      setUserInfo((prev) => ({
                        ...prev,
                        [name]: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-700"
                  />
                )}
                {formErrors[name] && (
                  <p className="text-red-400 text-sm mt-1">
                    {formErrors[name]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Aadhaar uploader */}
        {renderUploader(
          "Aadhaar Card Upload",
          aadhaarFile,
          aadhaarPreview,
          aadhaarError,
          aadhaarInputRef,
          (e) => handleFile(e.target.files?.[0], "aadhaar"),
          () => removeFile("aadhaar")
        )}

        {/* PAN uploader */}
        {renderUploader(
          "PAN Card Upload",
          panFile,
          panPreview,
          panError,
          panInputRef,
          (e) => handleFile(e.target.files?.[0], "pan"),
          () => removeFile("pan")
        )}

        {Object.keys(extractedData).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative bg-slate-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800 p-8 mt-10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/5 to-yellow-400/5 rounded-3xl" />

            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-8">
                Extracted Information
              </h2>

              <div className="space-y-4">
                {detailItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-center justify-between p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-yellow-400/30 transition-all duration-300 group"
                    whileHover={{ scale: 1.01, x: 5 }}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl flex items-center justify-center mr-4 group-hover:from-yellow-500/30 group-hover:to-amber-500/30 transition-all">
                        <item.icon className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-yellow-300 transition-colors">
                          {item.label}
                        </div>
                        <div className="text-sm text-slate-400">
                          {/* You could show a confidence level if backend provides */}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-slate-200 group-hover:text-white transition-colors">
                        {item.value || "N/A"}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {/* AI Fraud Results */}
        {verificationResult && verificationResult.length > 0 && (
          <div className="mt-6 text-white">
            <h3 className="text-xl font-semibold mb-4">
              Fraud Verification Result
            </h3>
            {verificationResult.map((result, idx) => (
              <div
                key={idx}
                className="mb-6 bg-slate-800 p-6 rounded-xl border border-yellow-400"
              >
                <h4 className="text-lg font-bold mb-2 capitalize">
                  {result.type} Document
                </h4>
                <p>
                  Fraud Score: <strong>{result.fraudScore}</strong>
                </p>
                <p>
                  Risk Level: <strong>{result.riskLevel}</strong>
                </p>
                {result.reason && result.reason.length > 0 ? (
                  <div className="mt-2">
                    <p>Reasons:</p>
                    <ul className="list-disc list-inside ml-5 text-sm text-yellow-200">
                      {result.reason.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-400 italic">
                    No reasons provided.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Buttons */}
        <div className="mt-10 flex flex-col items-center gap-6">
          {/* Action Buttons: Extract, Verify, Submit */}
          <div className="flex flex-col md:flex-row flex-wrap justify-center gap-4 w-full md:w-auto">
            <button
              disabled={processing || verifying}
              onClick={handleExtract}
              className={`flex items-center justify-center gap-3 rounded-xl px-10 py-4 text-lg font-semibold transition-colors ${
                processing
                  ? "bg-yellow-400/70 cursor-wait text-black"
                  : "bg-yellow-400 hover:bg-yellow-500 text-black"
              }`}
            >
              <Sparkles className="w-6 h-6" />
              {processing ? "Extracting Data..." : "Extract Data"}
            </button>

            <button
              disabled={verifying || processing}
              onClick={handleVerifyDocs}
              className={`flex items-center justify-center gap-3 rounded-xl px-10 py-4 text-lg font-semibold transition-colors ${
                verifying
                  ? "bg-emerald-400/70 cursor-wait text-black"
                  : "bg-emerald-400 hover:bg-emerald-500 text-black"
              }`}
            >
              <Shield className="w-6 h-6" />
              {verifying ? "Verifying..." : "Verify with AI"}
            </button>

            <button
              disabled={processing || verifying}
              onClick={submitKYC}
              className="flex items-center justify-center gap-3 rounded-xl px-10 py-4 text-lg font-semibold transition-colors bg-blue-500 hover:bg-blue-600 text-white"
            >
              <CheckCircle className="w-6 h-6" />
              Submit KYC
            </button>
          </div>

          {/* View Dashboard Button (placed separately below) */}
          {verificationResult?.length > 0 && (
            <button
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold"
              onClick={() =>
                navigate("/verify", { state: { verificationResult } })
              }
            >
              View Verification Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
