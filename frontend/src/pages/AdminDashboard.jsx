import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { LogOut, Home } from "lucide-react";
import { useNavigate, Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5001/api/admin/submissions')
      .then(res => setSubmissions(res.data))
      .catch(() => toast.error("Failed to fetch submissions."));
  }, []);

  const handleAction = (id, action) => {
    axios.post('http://localhost:5001/api/admin/action', { id, action })
      .then(res => {
        setSubmissions(prev => prev.map(sub => sub.id === id ? { ...sub, status: res.data.newStatus } : sub));
        toast.success(`Submission ${id} has been ${action}.`);
      })
      .catch(() => toast.error("Action failed."));
  };

  // Data for charts
  const statusCounts = submissions.reduce((acc, sub) => {
    acc[sub.status] = (acc[sub.status] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = {
    labels: Object.keys(statusCounts),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: ['#FBBF24', '#34D399', '#F87171'],
    }],
  };

  const riskCategories = submissions.reduce((acc, sub) => {
      if(sub.fraudScore <= 30) acc['Low Risk'] += 1;
      else if (sub.fraudScore <= 70) acc['Medium Risk'] += 1;
      else acc['High Risk'] += 1;
      return acc;
  }, {'Low Risk': 0, 'Medium Risk': 0, 'High Risk': 0});

  const barChartData = {
      labels: Object.keys(riskCategories),
      datasets: [{
          label: 'Number of Submissions',
          data: Object.values(riskCategories),
          backgroundColor: ['#34D399', '#FBBF24', '#F87171'],
      }],
  };

  const handleLogout = () => {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/admin/login');
      toast.info("You have been logged out.");
    };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white min-h-screen p-8">
      <div className="flex justify-end mt-4 mr-4 gap-2">
        <Link to="/" className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          <Home className="w-5 h-5" />
        </Link>
        <button className="p-2 rounded bg-red-600 hover:bg-red-700" onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
        </button>
      </div>
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Admin KYC Dashboard</h1>
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="text-center text-xl mb-4">Submissions by Status</h3>
                <Pie data={pieChartData} />
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h3 className="text-center text-xl mb-4">Submissions by Risk</h3>
                <Bar data={barChartData} options={{ responsive: true }} />
            </div>
        </div>

        {/* Submissions Table */}
        <div className="overflow-x-auto bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-3">ID</th><th className="p-3">User Name</th><th className="p-3">Fraud Score</th><th className="p-3">Status</th><th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="p-3">{sub.id}</td>
                  <td className="p-3">{sub.userName}</td>
                  <td className="p-3 font-bold" style={{ color: sub.fraudScore > 70 ? '#F87171' : sub.fraudScore > 30 ? '#FBBF24' : '#34D399' }}>{sub.fraudScore}%</td>
                  <td className="p-3">{sub.status}</td>
                  <td className="p-3">
                    {sub.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(sub.id, 'Approved')} className="bg-green-600 px-3 py-1 rounded">Approve</button>
                        <button onClick={() => handleAction(sub.id, 'Rejected')} className="bg-red-600 px-3 py-1 rounded">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;