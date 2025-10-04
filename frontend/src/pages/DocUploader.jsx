import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import { LogOut, Home } from "lucide-react";
import { io } from "socket.io-client";
import api from '../api/apiService';
import { logout } from '../redux/features/authSlice';

import DocumentUploader from '../components/DocumentUploader';
import VerificationReport from '../components/FraudReport';
import Loader from '../components/Loader';
import DarkVeil from '../components/reactComponents/Darkveil/DarkVeil';
import SubmissionHistory from '../components/SubmissionHistory';


const SOCKET_URL = "http://localhost:5000";

const StatusDisplay = ({ status, message }) => (
  <div className="col-span-full flex flex-col items-center justify-center text-center p-8 bg-white/10 rounded-lg backdrop-blur-md border border-white/20">
    <h2 className="text-2xl font-bold mb-4">{status}</h2>
    <p className="text-gray-300">{message}</p>
  </div>
);

const DashboardPage = () => {
  const [kycStatus, setKycStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('Aadhaar');
  const [verificationReport, setVerificationReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submissionHistory, setSubmissionHistory] = useState([]);
  
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchHistory = () => {
    if (user) {
      setIsLoading(true);
      api.get('/submissions/status')
        .then(res => {
          const submissions = res.data;
          setSubmissionHistory(submissions);
          setKycStatus(submissions[0]?.status || 'Not Submitted');
        })
        .catch(() => toast.error("Could not fetch submission history."))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  useEffect(() => {
    if (!user) return; 

    const socket = io(SOCKET_URL);

    socket.on('submission-updated', (updatedSubmission) => {
      if (updatedSubmission.userId === user._id) {
        toast.info(`Your KYC submission status has been updated to: ${updatedSubmission.status}`);
        fetchHistory();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setVerificationReport(null);
  };
  
  const handleAnalyze = async () => {
    if (!file) return toast.error("Please upload a document.");
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userEnteredName', user.name);
    console.log("Form Data for analysis:", formData);

    try {
      const response = await axios.post('http://localhost:5001/api/analyze-document', formData);
      setVerificationReport(response.data);
      toast.info("Analysis complete. Please review and submit.");
    } catch (error) {
      toast.error(error.response?.data?.error || "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleSubmitToAdmin = async () => {
    if (!file) return toast.error("File not found for submission.");
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);

    try {
      await api.post('/submissions/verify', formData);
      // console.log("Form Data submitted:", formData);
      fetchHistory();
      setKycStatus('Pending');
      toast.success("Successfully submitted for admin review!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save as PDF
  const handleSavePdf = () => {
    if (!verificationReport?.extractedText) return;
    const doc = new jsPDF();
    const data = verificationReport.extractedText;
    doc.setFontSize(12);
    doc.text(`Extracted Data - ${docType}`, 10, 10);
    let y = 20;
    Object.entries(data).forEach(([key, value]) => {
      doc.text(`${key}: ${value || 'N/A'}`, 10, y);
      y += 10;
    });
    doc.save(`${user.name}_${docType}.pdf`);
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const renderUploader = () => (
    <div className="col-span-full max-w-2xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Submit a New Document</h2>
      <div className="mb-4">
        <label htmlFor="docType" className="block text-sm font-medium text-gray-300 mb-2">Select Document Type</label>
        <select
          id="docType"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 text-white"
        >
          <option value="Aadhaar">Aadhaar Card</option>
          <option value="PAN">PAN Card</option>
        </select>
      </div>
      <DocumentUploader docName={`Upload Your ${docType}`} onFileUpload={handleFileSelect} />
      <button onClick={handleAnalyze} disabled={!file || isAnalyzing} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 font-bold py-3 px-4 rounded-lg disabled:opacity-50">
        {isAnalyzing ? 'Analyzing...' : 'Analyze Document'}
      </button>
      {isAnalyzing && <Loader />}
      {verificationReport && (
        <div className="mt-4">
          <VerificationReport verification={verificationReport.verification} extractedText={verificationReport.extractedText} />
          <div className="flex gap-4 mt-4">
            <button onClick={handleSavePdf} className="w-full bg-gray-600 hover:bg-gray-700 font-bold py-3 px-4 rounded-lg">Save as PDF</button>
            <button onClick={handleSubmitToAdmin} disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 font-bold py-3 px-4 rounded-lg disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit to Admin for Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 bg-black bg-opacity-70 -z-10"><DarkVeil /></div>
      <div className="flex justify-end mt-4 mr-4 gap-2">
        <Link to="/" className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700"><Home className="w-5 h-5" /></Link>
        <button className="p-2 rounded bg-red-600 hover:bg-red-700" onClick={handleLogout}><LogOut className="w-5 h-5" /></button>
      </div>
      <header className="text-center py-10">
        <h1 className="text-4xl font-bold">KYC Document Verification</h1>
        <p className="text-lg text-gray-200">Welcome, {user?.name}!</p>
      </header>
      <main className="grid grid-cols-1 gap-8 px-6 md:px-16 pb-10">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            {kycStatus === 'Pending' ? (
              <StatusDisplay status="Submission Pending" message="Your document is under review." />
            ) : (
              renderUploader()
            )}
            
            <SubmissionHistory submissions={submissionHistory} />
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;