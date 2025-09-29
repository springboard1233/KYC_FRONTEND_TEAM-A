// FILE: frontend/src/components/DashboardOverview.jsx
import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle, AlertTriangle, Star, Upload, FileText, Eye } from 'lucide-react';

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

// --- REUSABLE SUB-COMPONENTS ---

const StatCard = memo(({ title, value, icon: Icon, color }) => (
  <motion.div
    variants={itemVariants}
    className={`bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-gray-700/60 hover:border-${color}-500/50 hover:bg-gray-800/80 transition-all group`}
  >
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-lg bg-${color}-500/10 group-hover:bg-${color}-500/20 transition-colors`}>
        <Icon className={`h-6 w-6 text-${color}-400`} />
      </div>
    </div>
  </motion.div>
));

const RecentRecordItem = memo(({ record, StatusBadgeComponent, onViewRecord }) => (
    <motion.div
        variants={itemVariants}
        className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-700/40 transition-colors"
    >
        <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-700/50 rounded-md">
                <FileText className="h-5 w-5 text-gray-300" />
            </div>
            <div>
                <p className="font-medium text-gray-200 truncate max-w-[200px] sm:max-w-xs" title={record.filename}>{record.filename}</p>
                <p className="text-xs text-gray-400">{new Date(record.created_at).toLocaleString()}</p>
            </div>
        </div>
        <div className="flex items-center space-x-4">
            <StatusBadgeComponent status={record.status} />
            <button
                onClick={() => onViewRecord(record)}
                className="text-blue-400 hover:text-blue-300 font-semibold text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-blue-500/10"
            >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">View</span>
            </button>
        </div>
    </motion.div>
));

// --- MAIN COMPONENT ---

const DashboardOverview = ({ user, stats, records, setCurrentView, StatusBadgeComponent, onViewRecord }) => {
  const recentRecords = useMemo(() => records.slice(0, 5), [records]);

  const statCards = useMemo(() => [
    { title: "Total Records", value: stats.total_records || 0, icon: BarChart3, color: "blue" },
    { title: "Verified Documents", value: stats.verified_count || 0, icon: CheckCircle, color: "green" },
    { title: "High-Risk Flags", value: stats.high_risk_count || 0, icon: AlertTriangle, color: "red" },
    { title: "Avg. Confidence", value: `${Math.round(stats.avg_confidence || 0)}%`, icon: Star, color: "yellow" }
  ], [stats]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name || 'User'}!</h1>
        <p className="text-gray-400 mt-1">Here's a summary of your KYC activity.</p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statCards.map(card => <StatCard key={card.title} {...card} />)}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-gray-700/60"
        >
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {recentRecords.length > 0 ? (
              recentRecords.map(record => (
                <RecentRecordItem key={record._id} record={record} StatusBadgeComponent={StatusBadgeComponent} onViewRecord={onViewRecord} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2"/>
                <p className="font-semibold">No recent activity.</p>
                <p className="text-sm">Upload a document to get started.</p>
              </div>
            )}
          </motion.div>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-blue-600/50 to-purple-600/50 rounded-xl shadow-2xl p-8 flex flex-col items-center justify-center text-center border border-blue-500/50"
        >
          <motion.div
            className="bg-white/10 p-4 rounded-full mb-4"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, repeatDelay: 5 }}
          >
            <Upload className="h-8 w-8 text-white" />
          </motion.div>
          <h3 className="text-xl font-bold text-white">Start a New Verification</h3>
          <p className="text-blue-200/80 mt-2 mb-6 text-sm max-w-xs">
            Upload an Aadhaar or PAN card for instant AI-powered analysis and fraud detection.
          </p>
          <button
            onClick={() => setCurrentView('upload')}
            className="w-full bg-white text-blue-600 font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-white/50"
          >
            Upload Document
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default memo(DashboardOverview);