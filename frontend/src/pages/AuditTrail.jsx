import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileSearch,
  Clock,
  User,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";
import Navbar from "../components/Navbar";

export default function AuditTrail() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Mock data for demonstration
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/audit-logs");

        console.log("Raw response:", res); // Log raw response object
        const data = await res.json();
        console.log("Fetched audit logs:", data); // Log the fetched data
        setAuditLogs(data);
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "warning":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "error":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "error":
        return XCircle;
      default:
        return Shield;
    }
  };

  const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();

  const filteredLogs =
    filter === "all"
      ? auditLogs
      : auditLogs.filter((log) => log.status === filter);

  return (
    <div className="min-h-screen bg-black relative">
      <AnimatedBackground />
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto">
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
            Complete verification history and compliance tracking
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[
            { key: "all", label: "All Events" },
            { key: "success", label: "Success" },
            { key: "warning", label: "Warnings" },
            { key: "error", label: "Errors" },
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                filter === filterOption.key
                  ? "bg-amber-500 text-black"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Audit Logs */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
              <p className="text-amber-400 mt-4">Loading audit trail...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileSearch className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No audit logs found</p>
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const StatusIcon = getStatusIcon(log.status);
              return (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-2xl p-6 hover:border-amber-400/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center ${getStatusColor(
                          log.status
                        )}`}
                      >
                        <StatusIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {log.action}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              log.status
                            )}`}
                          >
                            {log.status}
                          </span>
                        </div>
                        <p className="text-slate-300 mb-3">{log.details}</p>
                        <div className="flex items-center space-x-6 text-sm text-slate-400">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{log.user}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatTimestamp(log.timestamp)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4" />
                            <span>{log.ipAddress}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
