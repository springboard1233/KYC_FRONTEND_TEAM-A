import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  AlertCircle,
  ShieldX,
  ShieldCheck,
  FileSearch,
  User,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  MapPin,
} from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";
import Navbar from "../components/Navbar";

// Import Recharts components
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";

const API_BASE = "http://localhost:5000/api";

export default function AdminPanel() {
  const [kycRequests, setKycRequests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/admin/kyc-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch KYC data");
        return res.json();
      })
      .then((data) => data.map((req) => ({ id: req._id || req.id, ...req })))
      .then(setKycRequests)
      .catch(() => setError("Failed to load KYC requests"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(
        `${API_BASE}/admin/kyc-requests/${id}/${action}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Action failed");

      setKycRequests((prev) =>
        prev.map((req) =>
          (req._id || req.id) === id
            ? {
                ...req,
                status:
                  action === "approve"
                    ? "approved"
                    : action === "reject"
                    ? "rejected"
                    : action === "flag-review"
                    ? "manual_review"
                    : req.status,
              }
            : req
        )
      );
    } catch (err) {
      console.error("Action error:", err);
      setError("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-400";
      case "rejected":
        return "text-red-400";
      case "manual_review":
        return "text-yellow-300";
      case "pending":
        return "text-yellow-400";
      default:
        return "text-slate-400";
    }
  };

  const getFraudScoreColor = (score) => {
    if (score <= 30) return "text-green-400";
    if (score <= 70) return "text-yellow-400";
    return "text-red-400";
  };

  const renderUserInfo = (userInfo) => {
    if (!userInfo) return <span className="text-slate-400">No user info</span>;

    return (
      <div className="space-y-2">
        <div className="flex items-center text-sm">
          <User className="w-4 h-4 mr-2 text-amber-400" />
          <span className="text-white font-medium">
            {userInfo.fullName || "N/A"}
          </span>
        </div>
        {userInfo.email && (
          <div className="flex items-center text-sm">
            <Mail className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-slate-300">{userInfo.email}</span>
          </div>
        )}
        {userInfo.phone && (
          <div className="flex items-center text-sm">
            <Phone className="w-4 h-4 mr-2 text-green-400" />
            <span className="text-slate-300">{userInfo.phone}</span>
          </div>
        )}
        {userInfo.dob && (
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-2 text-purple-400" />
            <span className="text-slate-300">{userInfo.dob}</span>
          </div>
        )}
      </div>
    );
  };

  const renderExtractedData = (extractedData) => {
    if (!extractedData || Object.keys(extractedData).length === 0) {
      return <span className="text-slate-400 italic">No extracted data</span>;
    }

    return (
      <div className="space-y-3">
        {Object.entries(extractedData).map(([docType, data]) => (
          <div
            key={docType}
            className="bg-slate-800/50 p-3 rounded-lg border border-slate-700"
          >
            <h4 className="text-amber-400 font-semibold mb-2 capitalize">
              {docType}
            </h4>
            <div className="space-y-1 text-sm">
              {data.name && (
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-2 text-blue-400" />
                  <span className="text-slate-300">{data.name}</span>
                </div>
              )}
              {data.aadhaar && (
                <div className="flex items-center">
                  <CreditCard className="w-3 h-3 mr-2 text-green-400" />
                  <span className="text-slate-300">
                    Aadhaar: {data.aadhaar}
                  </span>
                </div>
              )}
              {data.pan && (
                <div className="flex items-center">
                  <CreditCard className="w-3 h-3 mr-2 text-purple-400" />
                  <span className="text-slate-300">PAN: {data.pan}</span>
                </div>
              )}
              {data.dob && (
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-2 text-yellow-400" />
                  <span className="text-slate-300">DOB: {data.dob}</span>
                </div>
              )}
              {data.address && (
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-2 text-red-400" />
                  <span className="text-slate-300">
                    Address: {data.address}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFraudInfo = (fraudInfo) => {
    if (!fraudInfo || fraudInfo.length === 0) {
      return <span className="text-slate-400 italic">No fraud analysis</span>;
    }

    return (
      <div className="space-y-2">
        {fraudInfo.map((info, index) => (
          <div
            key={index}
            className="bg-slate-800/50 p-3 rounded-lg border border-slate-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 font-semibold capitalize">
                {info.type}
              </span>
              <span
                className={`font-bold ${getFraudScoreColor(info.fraudScore)}`}
              >
                {info.fraudScore}%
              </span>
            </div>
            <div className="text-sm">
              <span className="text-slate-300">Risk: </span>
              <span
                className={`font-medium ${getFraudScoreColor(info.fraudScore)}`}
              >
                {info.riskLevel || "Unknown"}
              </span>
            </div>
            {info.reasons && info.reasons.length > 0 && (
              <div className="mt-2">
                <span className="text-slate-400 text-xs">Reasons:</span>
                <ul className="list-disc list-inside ml-2 text-xs text-slate-300">
                  {info.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // ========== CHART DATA PREPARATION ==========

  const chartData = useMemo(() => {
    // 1. KYC Status Distribution (Pie)
    const statusCounts = {};
    kycRequests.forEach((req) => {
      const status = req.status || "unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    const kycStatusData = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // 2. Fraud Score Ranges (Bar)
    const fraudRanges = [
      { range: "0-30", count: 0 },
      { range: "31-70", count: 0 },
      { range: "71-100", count: 0 },
    ];
    kycRequests.forEach((req) => {
      req.fraudInfo?.forEach(({ fraudScore }) => {
        if (fraudScore <= 30) fraudRanges[0].count++;
        else if (fraudScore <= 70) fraudRanges[1].count++;
        else fraudRanges[2].count++;
      });
    });

    // 3. Requests Over Time (Line)
    const dateCounts = {};
    kycRequests.forEach((req) => {
      if (!req.createdAt) return;
      const d = new Date(req.createdAt).toLocaleDateString();
      dateCounts[d] = (dateCounts[d] || 0) + 1;
    });
    const timeSeries = Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      kycStatusData,
      fraudRanges,
      timeSeries,
    };
  }, [kycRequests]);

  const STATUS_COLORS = {
    approved: "#22c55e",
    rejected: "#ef4444",
    pending: "#facc15",
    manual_review: "#fbbf24",
    unknown: "#94a3b8",
  };

  return (
    <div className="relative min-h-screen bg-black">
      <AnimatedBackground />
      <Navbar />
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl shadow-2xl mb-6">
            <FileSearch className="w-10 h-10 text-black" />
          </div>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Monitor and manage identity verification requests with detailed
            fraud analysis
          </p>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center p-4 mb-6 rounded-xl border border-red-500 bg-red-500/10 text-red-300 backdrop-blur-sm shadow-lg"
          >
            <AlertCircle className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Pie Chart: KYC Status Distribution */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg text-amber-400 font-semibold mb-4">
              KYC Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData.kycStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {chartData.kycStatusData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={STATUS_COLORS[entry.name] || "#8884d8"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart: Fraud Score Ranges */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg text-amber-400 font-semibold mb-4">
              Fraud Score Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.fraudRanges}>
                <XAxis dataKey="range" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#facc15" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart: Requests over time */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 md:col-span-2">
            <h3 className="text-lg text-amber-400 font-semibold mb-4">
              KYC Requests Over Time
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData.timeSeries}>
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#f59e0b"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KYC Requests List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
              <p className="text-amber-400 mt-4">Loading KYC requests...</p>
            </div>
          ) : kycRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileSearch className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No KYC requests found</p>
            </div>
          ) : (
            kycRequests.map((req, i) => (
              <motion.div
                key={req._id || req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-2xl p-6 hover:border-amber-400/30 transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* User Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-amber-400 mb-3">
                      User Information
                    </h3>
                    {renderUserInfo(req.userInfo)}
                  </div>

                  {/* Extracted Data */}
                  <div>
                    <h3 className="text-lg font-semibold text-amber-400 mb-3">
                      Extracted Data
                    </h3>
                    <div className="max-h-48 overflow-y-auto">
                      {renderExtractedData(req.extractedData)}
                    </div>
                  </div>

                  {/* Fraud Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold text-amber-400 mb-3">
                      Fraud Analysis
                    </h3>
                    <div className="max-h-48 overflow-y-auto">
                      {renderFraudInfo(req.fraudInfo)}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-amber-400 mb-3">
                      Status & Actions
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-slate-400 text-sm">
                          Current Status:
                        </span>
                        <div
                          className={`font-semibold capitalize ${getStatusColor(
                            req.status
                          )}`}
                        >
                          {req.status}
                        </div>
                      </div>

                      {req.status === "pending" ? (
                        <div className="space-y-2">
                          <button
                            onClick={() =>
                              handleAction(req._id || req.id, "approve")
                            }
                            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleAction(req._id || req.id, "reject")
                            }
                            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-colors"
                          >
                            <ShieldX className="w-4 h-4 mr-2" />
                            Reject
                          </button>
                          <button
                            onClick={() =>
                              handleAction(req._id || req.id, "flag-review")
                            }
                            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center justify-center transition-colors"
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Flag for Manual Review
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center text-slate-400">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm">Action completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
