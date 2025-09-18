import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import { LogOut, Home } from "lucide-react";
import { io } from "socket.io-client";

import DocumentUploader from "../components/DocumentUploader";
import { extractText, verifyDocument } from "../api/verificationService";
import DarkVeil from "../components/reactComponents/Darkveil/DarkVeil";
import Loader from "../components/Loader";
import VerificationReport from "../components/FraudReport"; 

import { submitSubmission } from "../api/submissionService";

const DOC_TYPES = {
  AADHAAR: "Aadhaar Card",
  PAN: "PAN Card",
  DL: "Driving License",
};

const DashboardPage = () => {
  const SOCKET_URL = "http://localhost:5000"; 
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on("submission-updated", (updatedSubmission) => {
      if (
        updatedSubmission.userId === user?._id ||
        updatedSubmission.userId === user?.id
      ) {
        toast.info(
          `Your submission ${updatedSubmission._id || updatedSubmission.id} was ${updatedSubmission.status}`
        );
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [user]);

  const [documents, setDocuments] = useState({
    AADHAAR: {
      file: null,
      extractedText: null,
      verificationData: null,
      isExtracting: false,
      isVerifying: false,
      error: null,
    },
    PAN: {
      file: null,
      extractedText: null,
      verificationData: null,
      isExtracting: false,
      isVerifying: false,
      error: null,
    },
    DL: {
      file: null,
      extractedText: null,
      verificationData: null,
      isExtracting: false,
      isVerifying: false,
      error: null,
    },
  });

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
    toast.info("You have been logged out.");
  };

  const handleFileSelect = (file, docType) => {
    setDocuments((prev) => ({
      ...prev,
      [docType]: {
        file,
        extractedText: null,
        verificationData: null,
        isExtracting: false,
        isVerifying: false,
        error: null,
      },
    }));
  };

  // --- Extract Text ---
  const handleExtract = async (docType) => {
    const doc = documents[docType];
    if (!doc.file) return toast.error("Please upload a document first.");

    setDocuments((prev) => ({
      ...prev,
      [docType]: { ...doc, isExtracting: true, error: null },
    }));
    try {
      const textData = await extractText(doc.file);
      setDocuments((prev) => ({
        ...prev,
        [docType]: { ...doc, extractedText: textData, isExtracting: false },
      }));
    } catch (err) {
      setDocuments((prev) => ({
        ...prev,
        [docType]: { ...doc, isExtracting: false, error: err.message },
      }));
    }
  };

  // --- Verify + Submit ---
  const handleVerify = async (docType) => {
    const doc = documents[docType];
    if (!doc.file) return toast.error("Cannot verify without a document.");

    setDocuments((prev) => ({
      ...prev,
      [docType]: { ...doc, isVerifying: true, error: null },
    }));

    try {
      const verificationResponse = await verifyDocument(doc.file, user.name);

      setDocuments((prev) => ({
        ...prev,
        [docType]: {
          ...doc,
          verificationData: verificationResponse,
          isVerifying: false,
        },
      }));

      const fraudScore = verificationResponse.verification?.fraudScore ?? 0;
      const reasons =
        verificationResponse.verification?.reasons ?? ["No reasons provided"];

      const submissionResponse = await submitSubmission({
        file: doc.file,
        docType: DOC_TYPES[docType],
        fraudScore,
        reasons,
      });

      setDocuments((prev) => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          submitted: true,
          submissionData: submissionResponse,
        },
      }));

      toast.success("Document submitted for admin review.");
    } catch (err) {
      setDocuments((prev) => ({
        ...prev,
        [docType]: { ...doc, isVerifying: false, error: err.message },
      }));
    }
  };

  const handleSavePdf = (docType) => {
    const docData = documents[docType].extractedText;
    if (!docData) return;
    const pdf = new jsPDF();
    pdf.setFontSize(12);
    pdf.text(`Extracted Data - ${docType}`, 10, 10);
    let y = 20;
    Object.entries(docData).forEach(([key, value]) => {
      pdf.text(`${key}: ${value || "N/A"}`, 10, y);
      y += 10;
    });
    pdf.save(`${docType}_extracted_data.pdf`);
  };

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 bg-black bg-opacity-70 -z-10">
        <DarkVeil />
      </div>

      {/* Top Bar */}
      <div className="flex justify-end mt-4 mr-4 gap-2">
        <Link
          to="/"
          className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          <Home className="w-5 h-5" />
        </Link>
        <button
          className="p-2 rounded bg-red-600 hover:bg-red-700"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Header */}
      <header className="text-center py-10">
        <h1 className="text-4xl font-bold">KYC Document Upload</h1>
        <p className="text-lg text-gray-200">
          Welcome, {user?.name}! Extract details, then submit for verification.
        </p>
      </header>

      {/* Document Upload Cards */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-16 pb-10">
        {Object.keys(DOC_TYPES).map((docKey) => {
          const docState = documents[docKey];
          return (
            <div
              key={docKey}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-6 flex flex-col"
            >
              <DocumentUploader
                docName={DOC_TYPES[docKey]}
                onFileUpload={(file) => handleFileSelect(file, docKey)}
              />

              <div className="mt-4 flex flex-col space-y-2">
                <button
                  onClick={() => handleExtract(docKey)}
                  disabled={!docState.file || docState.isExtracting}
                  className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded-lg disabled:opacity-50"
                >
                  {docState.isExtracting ? "Extracting..." : "Extract Data"}
                </button>
                {docState.extractedText && (
                  <button
                    onClick={() => handleVerify(docKey)}
                    disabled={docState.isVerifying}
                    className="w-full bg-green-600 hover:bg-green-700 font-bold py-2 px-4 rounded-lg disabled:opacity-50"
                  >
                    {docState.isVerifying ? "Submitting..." : "Submit for Verification"}
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="mt-4 flex-grow">
                {docState.isExtracting && <Loader />}
                {docState.error && (
                  <p className="text-red-400 text-center">{docState.error}</p>
                )}

                {docState.verificationData ? (
                  <VerificationReport
                    verification={docState.verificationData.verification}
                    extractedText={docState.verificationData.extractedText}
                  />
                ) : (
                  docState.extractedText && (
                    <div className="mt-4 border-t border-gray-700 pt-4">
                      <h4 className="font-bold mb-2">Extracted Text:</h4>
                      <ul className="text-sm space-y-1">
                        {Object.entries(docState.extractedText).map(
                          ([key, value]) => (
                            <li key={key}>
                              <strong>{key}:</strong> {value || "N/A"}
                            </li>
                          )
                        )}
                      </ul>
                      <button
                        onClick={() => handleSavePdf(docKey)}
                        className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-xs font-bold py-2 px-4 rounded-lg"
                      >
                        Save as PDF
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default DashboardPage;
