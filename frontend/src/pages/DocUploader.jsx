// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; 
// import axios from 'axios'; 
// import DocumentUploader from '../components/DocumentUploader';
// import { extractTextFromImage } from '../api/ocrService';
// import { jsPDF } from 'jspdf';
// import DarkVeil from '../components/reactComponents/Darkveil/DarkVeil';
// import { LogOut } from "lucide-react";

// const DOC_TYPES = {
//   AADHAAR: 'Aadhaar Card',
//   PAN: 'PAN Card',
//   DL: 'Driving License'
// };

// const DashboardPage = () => {
//   const [documents, setDocuments] = useState({
//     AADHAAR: { file: null, data: null, isLoading: false, error: null },
//     PAN: { file: null, data: null, isLoading: false, error: null },
//     DL: { file: null, data: null, isLoading: false, error: null },
//   });

//   const navigate = useNavigate(); 

//   const handleLogout = async () => {
//     try {
//       await axios.post("http://localhost:5000/api/users/logout");
      
//       sessionStorage.removeItem('isAuthenticated');
//       localStorage.removeItem('user');
      
//       navigate('/login');
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   const handleFileUpload = async (file, docType) => {
//     setDocuments(prev => ({ ...prev, [docType]: { ...prev[docType], isLoading: true, error: null } }));
//     try {
//       const extractedData = await extractTextFromImage(file);
//       setDocuments(prev => ({ ...prev, [docType]: { file, data: extractedData, isLoading: false, error: null } }));
//     } catch (err) {
//       setDocuments(prev => ({ ...prev, [docType]: { ...prev[docType], isLoading: false, error: err.message } }));
//     }
//   };

//   const handleSavePdf = (data) => {
//     const doc = new jsPDF();
//     doc.setFontSize(16);
//     doc.text('Extracted Data', 10, 10);

//     let y = 20;
//     Object.entries(data).forEach(([key, value]) => {
//       doc.text(`${key}: ${value}`, 10, y);
//       y += 10;
//     });

//     doc.save('extracted_data.pdf');
//   };

//   return (
//     <div className="relative min-h-screen text-white" style={{ position: 'relative', speed:1.9}}>
//       <div className="fixed inset-0 bg-black bg-opacity-70 -z-10 overflow-y-autoo">
//         <DarkVeil />
//       </div>
//       <div className="flex justify-end mt-4 mr-4">
//         <button className="p-2 rounded bg-red-500 text-white hover:bg-red-800"
//           onClick={() => {
//           localStorage.removeItem("token");
//           window.location.href = "/";
//         }}
//   >
//     <LogOut className="w-5 h-5" />
//   </button>
// </div>

//       <header className="text-center py-10">
//         <h1 className="text-4xl font-bold">KYC Document Upload</h1>
//         <p className="text-lg text-gray-200">Upload your documents for real-time verification.</p>
        
//       </header>
//       <main className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-16">
//         {Object.keys(DOC_TYPES).map(docKey => (
//           <div
//             key={docKey}
//             className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-6"
//           >
//             <DocumentUploader
//               docName={DOC_TYPES[docKey]}
//               onFileUpload={(file) => handleFileUpload(file, docKey)}
//               isLoading={documents[docKey].isLoading}
//               extractedData={documents[docKey].data}
//               uploadError={documents[docKey].error}
//               onSavePdf={handleSavePdf}
//             />
//           </div>
//         ))}
//       </main>
//     </div>
//   );
// };

// export default DashboardPage;



import React, { useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import { LogOut, Home } from "lucide-react";

import DocumentUploader from '../components/DocumentUploader';
import { extractText, verifyDocument } from '../api/verificationService';
import DarkVeil from '../components/reactComponents/Darkveil/DarkVeil';
import Loader from '../components/Loader';
import VerificationReport from '../components/FraudReport'; // Assuming FraudReport.jsx exists

const DOC_TYPES = {
  AADHAAR: 'Aadhaar Card',
  PAN: 'PAN Card',
  DL: 'Driving License'
};

const DashboardPage = () => {
  const [documents, setDocuments] = useState({
    AADHAAR: { file: null, extractedText: null, verificationData: null, isExtracting: false, isVerifying: false, error: null },
    PAN: { file: null, extractedText: null, verificationData: null, isExtracting: false, isVerifying: false, error: null },
    DL: { file: null, extractedText: null, verificationData: null, isExtracting: false, isVerifying: false, error: null },
  });

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
    toast.info("You have been logged out.");
  };

  const handleFileSelect = (file, docType) => {
    // When a new file is selected, reset the state for that uploader
    setDocuments(prev => ({
      ...prev,
      [docType]: { file, extractedText: null, verificationData: null, isExtracting: false, isVerifying: false, error: null }
    }));
  };

  // --- ACTION 1: EXTRACT TEXT (User facing) ---
  const handleExtract = async (docType) => {
    const doc = documents[docType];
    if (!doc.file) return toast.error("Please upload a document first.");
    
    setDocuments(prev => ({ ...prev, [docType]: { ...doc, isExtracting: true, error: null } }));
    try {
      const textData = await extractText(doc.file);
      setDocuments(prev => ({ ...prev, [docType]: { ...doc, extractedText: textData, isExtracting: false } }));
    } catch (err) {
      setDocuments(prev => ({ ...prev, [docType]: { ...doc, isExtracting: false, error: err.message } }));
    }
  };

  // --- ACTION 2: VERIFY DOCUMENT (Admin facing logic) ---
  const handleVerify = async (docType) => {
    const doc = documents[docType];
    if (!doc.file) return toast.error("Cannot verify without a document.");

    setDocuments(prev => ({ ...prev, [docType]: { ...doc, isVerifying: true, error: null } }));
    try {
      const verificationResponse = await verifyDocument(doc.file, user.name);
      setDocuments(prev => ({ ...prev, [docType]: { ...doc, verificationData: verificationResponse, isVerifying: false } }));
    } catch (err) {
      setDocuments(prev => ({ ...prev, [docType]: { ...doc, isVerifying: false, error: err.message } }));
    }
  };
  
  const handleSavePdf = (docType) => {
    const docData = documents[docType].extractedText;
    if (!docData) return;
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(`Extracted Data - ${docType}`, 10, 10);
    let y = 20;
    Object.entries(docData).forEach(([key, value]) => {
      doc.text(`${key}: ${value || 'N/A'}`, 10, y);
      y += 10;
    });
    doc.save(`${docType}_extracted_data.pdf`);
  };

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 bg-black bg-opacity-70 -z-10"><DarkVeil /></div>
      <div className="flex justify-end mt-4 mr-4 gap-2">
        <Link to="/" className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          <Home className="w-5 h-5" />
        </Link>
        <button className="p-2 rounded bg-red-600 hover:bg-red-700" onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <header className="text-center py-10">
        <h1 className="text-4xl font-bold">KYC Document Upload</h1>
        <p className="text-lg text-gray-200">Welcome, {user?.name}! Extract details, then submit for verification.</p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-16 pb-10">
        {Object.keys(DOC_TYPES).map(docKey => {
          const docState = documents[docKey];
          return (
            <div key={docKey} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-6 flex flex-col">
              <DocumentUploader
                docName={DOC_TYPES[docKey]}
                onFileUpload={(file) => handleFileSelect(file, docKey)}
              />

              <div className="mt-4 flex flex-col space-y-2">
                <button 
                  onClick={() => handleExtract(docKey)} 
                  disabled={!docState.file || docState.isExtracting} 
                  className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                  {docState.isExtracting ? 'Extracting...' : 'Extract Data'}
                </button>
                {docState.extractedText && (
                  <button 
                    onClick={() => handleVerify(docKey)} 
                    disabled={docState.isVerifying} 
                    className="w-full bg-green-600 hover:bg-green-700 font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                    {docState.isVerifying ? 'Submitting...' : 'Submit for Verification'}
                  </button>
                )}
              </div>

              {/* --- Results Area --- */}
              <div className="mt-4 flex-grow">
                {docState.isExtracting && <Loader />}
                {docState.error && <p className="text-red-400 text-center">{docState.error}</p>}
                
                {/* Show verification report if it exists */}
                {docState.verificationData ? (
                  <VerificationReport 
                    verification={docState.verificationData.verification} 
                    extractedText={docState.verificationData.extractedText} 
                  />
                ) : docState.extractedText && ( // Otherwise, show simple extracted text
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <h4 className="font-bold mb-2">Extracted Text:</h4>
                    <ul className="text-sm space-y-1">
                      {Object.entries(docState.extractedText).map(([key, value]) => (
                        <li key={key}><strong>{key}:</strong> {value || 'N/A'}</li>
                      ))}
                    </ul>
                    <button onClick={() => handleSavePdf(docKey)} className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-xs font-bold py-2 px-4 rounded-lg">
                      Save as PDF
                    </button>
                  </div>
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



// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import { Doughnut } from 'react-chartjs-2';

// import DocumentUploader from '../components/DocumentUploader';
// import { verifyDocument } from '../api/verificationService'; 
// import DarkVeil from '../components/reactComponents/Darkveil/DarkVeil';
// import { LogOut } from "lucide-react";
// import Loader from '../components/Loader'; 

// ChartJS.register(ArcElement, Tooltip, Legend);

// const DOC_TYPES = {
//   AADHAAR: 'Aadhaar Card',
//   PAN: 'PAN Card',
//   DL: 'Driving License'
// };

// const VerificationReport = ({ data }) => {
//   const { verification, extractedText } = data;
//   const { fraudScore, reasons, documentStatus } = verification;

//   const scoreColor = fraudScore > 70 ? '#F87171' : fraudScore > 30 ? '#FBBF24' : '#34D399';

//   const chartData = {
//     datasets: [{
//       data: [fraudScore, 100 - fraudScore],
//       backgroundColor: [scoreColor, '#4A5568'],
//       borderColor: ['#1F2937'],
//       circumference: 180,
//       rotation: 270,
//       borderWidth: 0,
//     }],
//   };
  
//   return (
//     <div className="mt-6 border-t border-gray-700 pt-4">
//       <h4 className="font-bold text-lg mb-4 text-center">Verification Report</h4>
//       <div className="text-center mb-4">
//         <div className="relative inline-block w-40 h-20">
//             <Doughnut data={chartData} options={{ cutout: '70%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }} />
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 text-center">
//                 <div className="text-3xl font-bold" style={{ color: scoreColor }}>{fraudScore}%</div>
//                 <div className="text-sm text-gray-400">Fraud Risk</div>
//             </div>
//         </div>
//       </div>
//       <div className="text-sm">
//         <h5 className="font-semibold mb-2">Breakdown:</h5>
//         <ul className="list-disc list-inside space-y-1 text-gray-300">
//             <li>
//                 Document Status: <span className="font-bold" style={{ color: documentStatus === 'Valid' ? '#34D399' : '#F87171' }}>{documentStatus}</span>
//             </li>
//             {reasons.map((reason, i) => <li key={i}>{reason}</li>)}
//         </ul>
//       </div>
//     </div>
//   );
// };


// const DashboardPage = () => {
//   const [documents, setDocuments] = useState({
//     AADHAAR: { file: null, data: null, isLoading: false, error: null },
//     PAN: { file: null, data: null, isLoading: false, error: null },
//     DL: { file: null, data: null, isLoading: false, error: null },
//   });

//   const { user } = useSelector((state) => state.auth); // <-- Get user from Redux
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     // This should dispatch a logout action from your authSlice
//     // For now, clearing storage and navigating works.
//     sessionStorage.removeItem('isAuthenticated');
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//     navigate('/login');
//     toast.info("You have been logged out.");
//   };

//   const handleFileUpload = async (file, docType) => {
//     setDocuments(prev => ({ ...prev, [docType]: { ...prev[docType], isLoading: true, error: null } }));
//     try {
//       // Use the new verification service, passing the user's name
//       const responseData = await verifyDocument(file, user.name);
//       setDocuments(prev => ({ ...prev, [docType]: { file, data: responseData, isLoading: false, error: null } }));
//     } catch (err) {
//       setDocuments(prev => ({ ...prev, [docType]: { ...prev[docType], isLoading: false, error: err.message } }));
//     }
//   };

//   return (
//     <div className="relative min-h-screen text-white">
//       <div className="fixed inset-0 bg-black bg-opacity-70 -z-10 overflow-y-auto">
//         <DarkVeil />
//       </div>
//       <div className="flex justify-end mt-4 mr-4">
//         <button className="p-2 rounded bg-red-600 text-white hover:bg-red-700" onClick={handleLogout}>
//           <LogOut className="w-5 h-5" />
//         </button>
//       </div>

//       <header className="text-center pt-10 pb-4">
//         <h1 className="text-4xl font-bold">KYC Document Upload</h1>
//         <p className="text-lg text-gray-200">Welcome, {user?.name}! Upload your documents for real-time verification.</p>
//       </header>
//       <main className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-16 pb-10">
//         {Object.keys(DOC_TYPES).map(docKey => (
//           <div key={docKey} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-6">
//             <DocumentUploader
//               docName={DOC_TYPES[docKey]}
//               onFileUpload={(file) => handleFileUpload(file, docKey)}
//               // Note: We are no longer passing data props to DocumentUploader
//               // as the results will be displayed here directly.
//             />
            
//             {/* --- NEW: Verification Results Display --- */}
//             <div className="mt-4">
//               {documents[docKey].isLoading && <Loader />}
//               {documents[docKey].error && <p className="text-red-400 text-center">{documents[docKey].error}</p>}
//               {documents[docKey].data && <VerificationReport data={documents[docKey].data} />}
//             </div>
//           </div>
//         ))}
//       </main>
//     </div>
//   );
// };

// export default DashboardPage;