import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector} from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { LogOut, Home } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const SOCKET_URL = "http://localhost:5000";


const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const { user } = useSelector((state) => state.auth); 
  const adminUser = JSON.parse(localStorage.getItem("adminUser")) || user;
  const navigate= useNavigate();
  
  // Fetch submissions 
  const token = localStorage.getItem("adminToken");

useEffect(() => {
  const fetchSubmissions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/submissions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data);
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
      toast.error("Failed to fetch submissions.");
    }
  };

  if (token) {
    fetchSubmissions();
  }
}, [token]);

// Total submissions
    const totalSubmissions = submissions.length;

    const statusCounts = submissions.reduce(
      (acc, sub) => {
        acc[sub.status] = (acc[sub.status] || 0) + 1;
        return acc;
        },
      {}
    );
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

    const COLORS = ['#4ade80', '#facc15', '#f87171']; // green, yellow, red

    // Setup Socket.IO for real-time updates
    useEffect(() => {
      const socket = io(SOCKET_URL);

      socket.on("submission-updated", (updatedSubmission) => {
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub._id === updatedSubmission._id ? updatedSubmission : sub
          )
        );
        toast.info(
          `Submission by ${updatedSubmission.userName} is now ${updatedSubmission.status}`
        );
      });

      return () => socket.disconnect();
    }, []);

    // Approve or Reject submission
    const handleStatusChange = async (id, status) => {
      try {
        const res = await axios.patch(
          `http://localhost:5000/api/submissions/${id}`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update local state immediately
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub._id === id ? { ...sub, status: res.data.status } : sub
          )
        );

        toast.success(`Submission ${status}`);
      } catch (err) {
        console.error(err);
        toast.error("Failed to update status");
      }
    };

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/admin/login");
        toast.info("You have been logged out.");
      };

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white">
     
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
      <h1 className="text-3xl font-bold mb-6">
        Welcome to your dashboard, {adminUser?.name || "Admin"}!
      </h1>
      

      <div className="mb-6 ml-96 grid grid-cols-2 md:grid-cols-3 gap-24 ">
        <div className="bg-gray-800 p-4 rounded-md shadow-md text-center ">
          <h3 className="text-lg font-bold">Total Submissions</h3>
          <p className="text-2xl">{totalSubmissions}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-md shadow-md text-center">
          <h3 className="text-lg font-bold">Approval Rate</h3>
          <p className="text-2xl text-green-400">{approvalRate}%</p>
        </div>
      </div>
<div className="my-6 grid md:grid-cols-2 gap-6">
  {/* Pie Chart */}
  <div className="bg-gray-800 p-4 rounded-md shadow-md">
    <h2 className="text-xl font-bold mb-4">Submission Status</h2>
    <PieChart width={300} height={300}>
      <Pie
        data={pieData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label
      >
        {pieData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </div>

  {/* Bar Graph */}
  <div className="bg-gray-800 p-4 rounded-md shadow-md">
    <h2 className="text-xl font-bold mb-4">Submission Status</h2>
    <BarChart width={400} height={300} data={barData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="status" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      <Legend />
      <Bar dataKey="count" fill="#4ade80">
        {barData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Bar>
    </BarChart>
  </div>
</div>




      {submissions.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <div
              key={submission._id}
              className="bg-gray-800 p-4 rounded-md shadow-md"
            >
              <p>
                <strong>User Name:</strong> {submission.userName}
              </p>
              <p>
                <strong>User ID:</strong> {submission.userId}
              </p>
              <p>
                <strong>Document Type:</strong> {submission.docType}
              </p>
              <p>
                <strong>Fraud Score:</strong> {submission.fraudScore}
              </p>
              <p>
                <strong>Status:</strong> {submission.status}
              </p>
              <p>
                <strong>Reasons:</strong> {submission.reasons.join(", ")}
              </p>

              {/* Approve / Reject Buttons */}
              {submission.status === "Pending" && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() =>
                      handleStatusChange(submission._id, "Approved")
                    }
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(submission._id, "Rejected")
                    }
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
