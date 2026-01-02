import React from "react";
import { useLocation } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { motion } from "framer-motion";
import {
  CheckCircle,
  AlertTriangle,
  Shield,
  BadgeAlert,
  FileText,
} from "lucide-react";
import "chart.js/auto";

import AnimatedBackground from "../components/AnimatedBackground";
import Navbar from "../components/Navbar";
import VerificationSummary from "../components/VerificationSummary.jsx";

export default function VerificationDashboard() {
  const location = useLocation();
  const verificationResult = location.state?.verificationResult || [];

  const getValidScore = (score) => {
    const num = Number(score);
    return isNaN(num) ? 0 : Math.max(0, Math.min(100, num));
  };

  const createBarData = (score) => ({
    labels: ["Low Risk", "Medium Risk", "High Risk"],
    datasets: [
      {
        label: "Fraud Risk Score",
        data: [
          score <= 30 ? score : 0,
          score > 30 && score <= 70 ? score : 0,
          score > 70 ? score : 0,
        ],
        backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
      },
    ],
  });

  const createPieData = (isValid) => ({
    labels: ["Verified", "Unverified"],
    datasets: [
      {
        label: "Document Status",
        data: isValid ? [1, 0] : [0, 1],
        backgroundColor: ["#4ade80", "#f87171"],
      },
    ],
  });

  const renderResultCard = (result, index) => {
    const score = getValidScore(result.fraudScore);
    const isValid = score <= 30;

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.2 }}
        className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-xl p-6 md:p-8 text-white"
      >
        <h2 className="text-xl md:text-2xl font-semibold mb-4 flex items-center gap-3 capitalize">
          <FileText className="w-6 h-6 text-amber-400" />
          {result.type} Verification
        </h2>

        <div className="space-y-2 text-base md:text-lg">
          <p>
            <strong>Status:</strong>{" "}
            {isValid ? (
              <span className="text-green-400 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Valid Document
              </span>
            ) : (
              <span className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Invalid Document
              </span>
            )}
          </p>

          <p>
            <strong>Fraud Score:</strong>{" "}
            <span
              className={`font-bold ${
                score > 70
                  ? "text-red-400"
                  : score > 30
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {score}%
            </span>
          </p>

          <p>
            <strong>Risk Level:</strong>{" "}
            <span className="text-white">{result.riskLevel || "--"}</span>
          </p>

          {result.reason?.length > 0 ? (
            <div className="text-yellow-300 text-sm mt-2">
              <BadgeAlert className="w-5 h-5 inline-block mr-2" />
              Reasons:
              <ul className="list-disc ml-6 mt-1">
                {result.reason.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-400 italic text-sm">No reasons provided.</p>
          )}
        </div>

        {/* ✅ Chart Section Updated */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Bar Chart */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 h-[300px] overflow-hidden relative">
            <h3 className="text-white font-semibold mb-4">Fraud Risk Score</h3>
            <div className="w-full h-[220px]">
              <Bar
                data={createBarData(score)}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, max: 100 },
                  },
                  plugins: {
                    legend: { display: false },
                  },
                }}
              />
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 h-[300px] overflow-hidden relative">
            <h3 className="text-white font-semibold mb-4">Document Validity</h3>
            <div className="w-full h-[220px]">
              <Pie
                data={createPieData(isValid)}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        color: "#fff",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-black relative">
      <AnimatedBackground />

      <Navbar />
      <VerificationSummary results={verificationResult} />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-10 flex items-center gap-3"></h1>

        {verificationResult.length > 0 ? (
          <>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
              {verificationResult.map(renderResultCard)}
            </div>
            {/* 
            <div className="mt-16">
              <VerificationSummary results={verificationResult} />
            </div> */}
          </>
        ) : (
          <div className="text-center text-white text-lg mt-12">
            No verification data available.
          </div>
        )}
      </div>
    </div>
  );
}
