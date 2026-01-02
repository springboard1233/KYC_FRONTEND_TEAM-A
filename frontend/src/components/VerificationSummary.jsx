import React from "react";
import { motion } from "framer-motion";
import { Doughnut } from "react-chartjs-2";
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

export default function VerificationSummary({ results }) {
  if (!results || results.length === 0) {
    return null;
  }

  // Calculate summary statistics
  const totalDocuments = results.length;
  const validDocuments = results.filter(
    (r) => (r.fraudScore || 0) <= 30
  ).length;
  const highRiskDocuments = results.filter(
    (r) => (r.fraudScore || 0) > 70
  ).length;
  const averageFraudScore =
    results.reduce((sum, r) => sum + (r.fraudScore || 0), 0) / totalDocuments;

  // Create summary chart data
  const summaryData = {
    labels: ["Valid", "Medium Risk", "High Risk"],
    datasets: [
      {
        data: [
          results.filter((r) => (r.fraudScore || 0) <= 30).length,
          results.filter(
            (r) => (r.fraudScore || 0) > 30 && (r.fraudScore || 0) <= 70
          ).length,
          results.filter((r) => (r.fraudScore || 0) > 70).length,
        ],
        backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#fff",
          padding: 20,
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-2xl p-8"
    >
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-amber-400" />
        Verification Summary
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Statistics */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {totalDocuments}
              </div>
              <div className="text-slate-400 text-sm">Total Documents</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {validDocuments}
              </div>
              <div className="text-slate-400 text-sm">Valid Documents</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">
                {highRiskDocuments}
              </div>
              <div className="text-slate-400 text-sm">High Risk</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">
                {averageFraudScore.toFixed(1)}%
              </div>
              <div className="text-slate-400 text-sm">Avg. Fraud Score</div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              Risk Assessment
            </h3>
            <div className="space-y-2">
              {averageFraudScore <= 30 ? (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>Low Risk - Documents appear legitimate</span>
                </div>
              ) : averageFraudScore <= 70 ? (
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Medium Risk - Manual review recommended</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span>High Risk - Immediate attention required</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Chart */}
        <div className="bg-slate-800/50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">
            Risk Distribution
          </h3>
          <div className="h-64">
            <Doughnut data={summaryData} options={chartOptions} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
