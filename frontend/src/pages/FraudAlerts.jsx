import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground.jsx";
import Navbar from "../components/Navbar.jsx";

export default function FraudAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  // Mock data in case API fails or for dev testing
  //   const mockAlerts = [
  //     {
  //       caseId: "FR-2024-001",
  //       riskLevel: "High",
  //       reason: "Document tampering detected",
  //       timestamp: new Date("2024-01-15T10:30:00"),
  //       documentType: "Aadhaar",
  //       userId: "user_123",
  //       confidence: 95,
  //     },
  //     {
  //       caseId: "FR-2024-002",
  //       riskLevel: "Medium",
  //       reason: "Inconsistent personal information",
  //       timestamp: new Date("2024-01-15T09:15:00"),
  //       documentType: "PAN Card",
  //       userId: "user_456",
  //       confidence: 78,
  //     },
  //     {
  //       caseId: "FR-2024-003",
  //       riskLevel: "High",
  //       reason: "Duplicate document submission",
  //       timestamp: new Date("2024-01-14T16:45:00"),
  //       documentType: "Aadhaar",
  //       userId: "user_789",
  //       confidence: 92,
  //     },
  //     {
  //       caseId: "FR-2024-004",
  //       riskLevel: "Low",
  //       reason: "Minor quality issues detected",
  //       timestamp: new Date("2024-01-14T14:20:00"),
  //       documentType: "Driving License",
  //       userId: "user_101",
  //       confidence: 65,
  //     },
  //     {
  //       caseId: "FR-2024-005",
  //       riskLevel: "Medium",
  //       reason: "Cross-reference mismatch",
  //       timestamp: new Date("2024-01-13T11:30:00"),
  //       documentType: "Passport",
  //       userId: "user_202",
  //       confidence: 82,
  //     },
  //   ];

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/alerts");
        const apiAlerts = res.data.map((alert) => ({
          ...alert,
          timestamp: new Date(alert.timestamp),
        }));
        setAlerts(apiAlerts);
        setFilteredAlerts(apiAlerts);
      } catch (err) {
        console.error("Error fetching alerts:", err);
        // fallback to mock data on error
        setAlerts(mockAlerts);
        setFilteredAlerts(mockAlerts);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  // Filter alerts based on search and risk level
  useEffect(() => {
    let filtered = alerts;

    if (searchTerm) {
      filtered = filtered.filter(
        (alert) =>
          alert.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alert.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alert.userId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (riskFilter !== "all") {
      filtered = filtered.filter((alert) => alert.riskLevel === riskFilter);
    }

    setFilteredAlerts(filtered);
  }, [alerts, searchTerm, riskFilter]);

  const getRiskBadge = (risk) => {
    const colors = {
      High: "bg-red-500/20 text-red-400 border-red-500/30",
      Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      Low: "bg-green-500/20 text-green-400 border-green-500/30",
    };
    return colors[risk] || colors.Low;
  };

  const getRiskIcon = (risk) => {
    if (risk === "High") return "🔴";
    if (risk === "Medium") return "🟡";
    return "🟢";
  };

  const exportToCSV = () => {
    const csvContent = [
      [
        "Case ID",
        "Risk Level",
        "Reason",
        "Timestamp",
        "Document Type",
        "User ID",
        "Confidence",
      ],
      ...filteredAlerts.map((alert) => [
        alert.caseId,
        alert.riskLevel,
        alert.reason,
        alert.timestamp.toISOString(),
        alert.documentType,
        alert.userId,
        alert.confidence,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fraud_alerts.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    high: alerts.filter((a) => a.riskLevel === "High").length,
    medium: alerts.filter((a) => a.riskLevel === "Medium").length,
    low: alerts.filter((a) => a.riskLevel === "Low").length,
    total: alerts.length,
  };

  return (
    <div className="min-h-screen bg-black relative">
      <AnimatedBackground />
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-400 mt-1">
                Monitor and manage security incidents in real-time
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "High Risk",
                value: stats.high,
                color: "red-400",
                icon: TrendingUp,
              },
              {
                label: "Medium Risk",
                value: stats.medium,
                color: "yellow-400",
                icon: Shield,
              },
              {
                label: "Low Risk",
                value: stats.low,
                color: "green-400",
                icon: Eye,
              },
              {
                label: "Total Alerts",
                value: stats.total,
                color: "blue-400",
                icon: AlertTriangle,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className={`w-8 h-8 text-${stat.color}`} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search case ID, reason, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="High">High Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="Low">Low Risk</option>
                </select>
              </div>
            </div>

            {/* Export Button */}
            <motion.button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </motion.button>
          </div>
        </motion.div>

        {/* Alerts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-2xl overflow-hidden"
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading fraud alerts...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Case ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Risk Level
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Reason
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Document Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredAlerts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-slate-400"
                      >
                        No fraud alerts found
                      </td>
                    </tr>
                  ) : (
                    filteredAlerts.map((alert, index) => (
                      <motion.tr
                        key={alert.caseId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-white font-mono text-sm">
                            {alert.caseId}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getRiskBadge(
                              alert.riskLevel
                            )}`}
                          >
                            <span>{getRiskIcon(alert.riskLevel)}</span>
                            {alert.riskLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white text-sm">
                            {alert.reason}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-300 text-sm">
                            {alert.documentType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-300 text-sm">
                            <Clock className="w-4 h-4" />
                            {alert.timestamp.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-yellow-400 font-semibold text-sm">
                            {alert.confidence}%
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
