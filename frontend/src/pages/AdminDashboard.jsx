import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { LogOut, Home } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import api from "../api/apiService"; 
import SubmissionDetailModal from "../components/SubmissionDetailModal";

const SOCKET_URL = "http://localhost:5000";

const SubmissionDetailView = ({ submission, onAction }) => {
  if (!submission) {
    return (
      <div className="bg-gray-800 p-6 rounded-md shadow-md h-full flex items-center justify-center">
        <p className="text-gray-400">Select a submission from the list to see details.</p>
      </div>
    );
  }

  const { fraudScore, riskReasons, status, userName } = submission;
  const scoreColor = fraudScore > 70 ? '#f87171' : fraudScore > 30 ? '#facc15' : '#4ade80';

  const pieData = [
    { name: 'Risk', value: fraudScore },
    { name: 'Safe', value: 100 - fraudScore },
  ];
  const COLORS = [scoreColor, '#4b5563']; // Risk color, gray for the rest

  return (
    <div className="bg-gray-800 p-6 rounded-md shadow-md">
      <h3 className="text-2xl font-bold mb-4">Reviewing Submission for {userName}:</h3>
      <div className="flex flex-col items-center">
        <PieChart width={200} height={200}>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill={scoreColor} fontSize="24" fontWeight="bold">
            {fraudScore}%
          </text>
          <text x="50%" y="65%" textAnchor="middle" fill="#9ca3af" fontSize="14">
            Fraud Risk
          </text>
        </PieChart>
        {/* <div className="w-full mt-4">
          <h4 className="font-semibold mb-2">Breakdown:</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li>Status: <span className="font-bold">{status}</span></li>
            <li>Reasons: {reasons?.map((reason, i) => <li key={i}>{reason}</li>)}</li>
          </ul>
        </div> */}
        <ul style={{ listStyleType: 'none' }}>
          <li style={{ display: 'flex' }}>
            <span className="font-bold">- Status:&nbsp;</span>
            <span> {status}</span>
          </li>
          {riskReasons.map((reason, i) => <li key={i}>- {reason}</li>)}
        </ul> 
        {status === "Pending" && (
          <div className="mt-6 flex gap-4 w-full">
            <button onClick={() => onAction(submission._id, "Approved")} className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Approve</button>
            <button onClick={() => onAction(submission._id, "Rejected")} className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Reject</button>
          </div>
        )}
      </div>
    </div>
  );
};


const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  
  // Rely ONLY on Redux for user data. This is the single source of truth.
  const { user } = useSelector((state) => state.auth); 
  const navigate = useNavigate();

  // Fetch initial submissions once on component mount

  useEffect(() => {
    api.get("/submissions")
      .then(res => setSubmissions(res.data))
      .catch(error => toast.error("Failed to fetch submissions."));
  }, []);

  // Setup Socket.IO for real-time updates
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("new-submission", (newSubmission) => {
      setSubmissions((prev) => [newSubmission, ...prev]);
      toast.info(`New submission from ${newSubmission.userName}!`);
    });

    socket.on("submission-updated", (updatedSubmission) => {
      setSubmissions((prev) =>
        prev.map((sub) => (sub._id === updatedSubmission._id ? updatedSubmission : sub))
      );
    });

    // Disconnect when the component unmounts to prevent memory leaks
    return () => socket.disconnect();
  }, []);

  // Approve or Reject submission
  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/submissions/${id}`, { status });
      toast.success(`Submission has been ${status}.`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/admin/login");
    toast.info("You have been logged out.");
  };

  const totalSubmissions = submissions.length;
  const statusCounts = submissions.reduce((acc, sub) => {
    acc[sub.status] = (acc[sub.status] || 0) + 1;
    return acc;
  }, {});
  const approvedCount = statusCounts['Approved'] || 0;
  const approvalRate = totalSubmissions > 0 ? ((approvedCount / totalSubmissions) * 100).toFixed(2) : 0;
  const pieData = [
    { name: 'Approved', value: statusCounts['Approved'] || 0 },
    { name: 'Pending', value: statusCounts['Pending'] || 0 },
    { name: 'Rejected', value: statusCounts['Rejected'] || 0 },
  ];
  const barData = [
    { status: 'Approved', count: statusCounts['Approved'] || 0 },
    { status: 'Pending', count: statusCounts['Pending'] || 0 },
    { status: 'Rejected', count: statusCounts['Rejected'] || 0 },
  ];
  const COLORS = ['#4ade80', '#facc15', '#f87171'];


return (
    <div className="p-6 min-h-screen bg-gray-900 text-white">
      <div className="flex justify-end items-center mb-4">
        <h1 className="text-3xl font-bold mr-auto">Welcome, {user?.name || "Admin"}!</h1>
        <div className="flex gap-2">
          <Link to="/" className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700"><Home className="w-5 h-5" /></Link>
          <button className="p-2 rounded bg-red-600 hover:bg-red-700" onClick={handleLogout}><LogOut className="w-5 h-5" /></button>
        </div>
      </div>
      
      {/* KPI Cards can go here if you want them back */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-6">
         <div className="bg-gray-800 p-4 rounded-md shadow-md text-center"><h3 className="text-lg font-bold">Total Submissions</h3><p className="text-2xl">{totalSubmissions}</p></div>
         <div className="bg-gray-800 p-4 rounded-md shadow-md text-center"><h3 className="text-lg font-bold">Approval Rate</h3><p className="text-2xl text-green-400">{approvalRate}%</p></div>
        <div className="bg-gray-800 p-4 rounded-md shadow-md text-center"><h3 className="text-lg font-bold">Pending Reviews</h3><p className="text-2xl text-yellow-400">{statusCounts['Pending'] || 0}</p></div>
       </div>

      <div className="my-6 grid md:grid-cols-2 gap-6">
         <div className="bg-gray-800 p-4 rounded-md shadow-md">
           <h2 className="text-xl font-bold mb-4 text-center">Submission Status</h2>
           <PieChart width={400} height={300} className="mx-auto">
             <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
               {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
             </Pie>
             <Tooltip />
             <Legend />
           </PieChart>
         </div>
         <div className="bg-gray-800 p-4 rounded-md shadow-md">
           <h2 className="text-xl font-bold mb-4 text-center">Submission Breakdown</h2>
           <BarChart width={400} height={300} data={barData} className="mx-auto">
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis dataKey="status" />
             <YAxis allowDecimals={false} />
             <Tooltip />
             <Legend />
             <Bar dataKey="count" fill="#8884d8">
               {barData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
             </Bar>
           </BarChart>
         </div>
       </div> 

      {/* --- 2. THE MAIN LAYOUT IS NOW A TWO-COLUMN GRID --- */}
      <div className="my-6 grid md:grid-cols-2 gap-6" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
        
        {/* --- 3. THE LEFT COLUMN NOW LISTS THE SUBMISSIONS --- */}
        <div className="bg-gray-800 p-4 rounded-md shadow-md">
          <h2 className="text-xl font-bold mb-4">Submission Queue</h2>
          <div className="grid gap-3">
            {submissions.map((submission) => (
              <div 
                key={submission._id} 
                className={`p-3 rounded-md flex justify-between items-center cursor-pointer transition ${selectedSubmission?._id === submission._id ? 'bg-blue-600/60' : submission.status === 'Pending' ? 'bg-yellow-600/50 hover:bg-yellow-700/20' : submission.status === 'Approved' ? 'bg-green-600/50 hover:bg-green-700/20' : 'bg-red-600 hover:bg-red-700'}`}
                // --- 5. ONCLICK UPDATES THE SELECTED SUBMISSION ---
                onClick={() => setSelectedSubmission(submission)}
              >
                <div>
                  <p className="font-bold">{submission.userName}</p>
                  <p className="text-sm text-gray-400">Status: {submission.status}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: submission.fraudScore > 70 ? '#f87171' : submission.fraudScore > 30 ? '#facc15' : '#4ade80' }}>
                    {submission.fraudScore}%
                  </p>
                  <p className="text-sm text-gray-400">Risk</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- 4. THE RIGHT COLUMN RENDERS THE NEW DETAIL VIEW --- */}
        <div>
          <SubmissionDetailView submission={selectedSubmission} onAction={handleStatusChange} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;