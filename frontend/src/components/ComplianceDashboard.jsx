// Loading spinner for async states
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64 w-full">
    <Loader className="animate-spin h-12 w-12 text-blue-400" />
  </div>
);

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Clock, BarChart3, Download, Loader, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { complianceService } from '../utils/complianceService';
import { adminService } from '../utils/adminService';
import { transformRecordsForCSV, downloadCSVFromData } from '../utils/csvExport';

// --- Reusable Sub-Components ---
const StatCard = memo(({ title, value, icon: Icon, color = 'blue' }) => (
  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 h-full flex flex-col justify-between">
  <div className="flex items-center justify-between text-gray-400">
    <p className="text-sm font-medium">{title}</p>
    <Icon className={`h-5 w-5 text-${color}-500`} />
  </div>
  <p className="text-3xl font-bold text-white mt-2">{value}</p>
  </div>
));

const ComplianceGauge = memo(({ score = 0 }) => {
  const color = score >= 90 ? 'text-green-400' : score >= 75 ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 flex flex-col items-center justify-center text-center h-full">
      <p className="text-sm text-gray-300 font-semibold mb-3">Overall Compliance Score</p>
      <div className={`text-5xl font-bold ${color}`}>{score.toFixed(0)}<span className="text-3xl">%</span></div>
    </div>
  );
});

// NEW: Audit Trail component integrated directly into the dashboard
const AuditTrail = memo(() => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });

  const fetchLogs = useCallback(async (page) => {
    setLoading(true);
    try {
      const data = await adminService.getAuditTrail(page);
      setLogs(data.logs || []);
      setPagination({ page: data.page, total_pages: data.total_pages });
    } catch (error) {
      console.error("Failed to fetch audit trail:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">System Audit Trail</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          {/* Table Head */}
          <thead className="text-xs text-gray-400 uppercase">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">User ID</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {loading ? (
              <tr><td colSpan="4" className="text-center p-8"><Loader className="h-6 w-6 animate-spin mx-auto" /></td></tr>
            ) : logs.length > 0 ? (
              logs.map(log => (
                <tr key={log._id} className="hover:bg-gray-700/20">
                  <td className="py-3 px-4 text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-300 font-mono text-xs">{log.user_id}</td>
                  <td className="py-3 px-4 font-semibold text-blue-300">{log.action.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4 text-gray-400 font-mono text-xs">{JSON.stringify(log.details)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="text-center p-8 text-gray-500">No audit logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
        <span>Page {pagination.page} of {pagination.total_pages}</span>
        <div className="flex gap-2">
          <button onClick={() => fetchLogs(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 bg-gray-700 rounded-md disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => fetchLogs(pagination.page + 1)} disabled={pagination.page >= pagination.total_pages} className="p-2 bg-gray-700 rounded-md disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
});


// --- Main Compliance Dashboard Component ---
const ComplianceDashboard = ({ addNotification, onViewDetails }) => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState({});

  const fetchAlertsAndStats = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, alertsData] = await Promise.all([
        complianceService.getStats(),
        complianceService.getAlerts()
      ]);
      setStats(statsData);
      setAlerts(alertsData);
    } catch (err) {
      addNotification(err.message || 'Failed to fetch compliance data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchAlertsAndStats();
  }, [fetchAlertsAndStats]);

  const handleResolve = async (alertId) => {
    if (!alertId) {
      addNotification('Cannot resolve: Alert ID is missing.', 'error');
      return;
    }
    setResolving((prev) => ({ ...prev, [alertId]: true }));
    try {
      await complianceService.resolveAlert(alertId, 'Resolved by admin');
      addNotification('Alert resolved successfully.', 'success');
      // Refresh alerts and stats
      fetchAlertsAndStats();
    } catch (err) {
      addNotification(err.message || 'Failed to resolve alert.', 'error');
    } finally {
      setResolving((prev) => ({ ...prev, [alertId]: false }));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h2 className="text-3xl font-bold text-white tracking-tight">Compliance Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1"><ComplianceGauge score={stats?.compliance_score || 0} /></div>
        <StatCard title="Total Records Processed" value={stats?.total_records || 0} icon={BarChart3} color="blue" />
        <StatCard title="Active High-Risk Alerts" value={stats?.active_alerts || 0} icon={AlertTriangle} color="red" />
        <StatCard title="Alerts in Last 24h" value={stats?.recent_alerts_24h || 0} icon={Clock} color="yellow" />
      </div>

      {/* --- Fraud Alerts Table --- */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 mt-6">
        <h3 className="text-xl font-bold text-white mb-4">Active Fraud Alerts</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs text-gray-400 uppercase">
              <tr>
                <th className="py-2 px-3">Alert ID</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Severity</th>
                <th className="py-2 px-3">Message</th>
                <th className="py-2 px-3">Created</th>
                <th className="py-2 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {alerts.length === 0 ? (
                <tr><td colSpan="6" className="text-center p-8 text-gray-500">No active alerts.</td></tr>
              ) : (
                alerts.map(alert => (
                  <tr key={alert.alert_id} className="hover:bg-gray-700/20">
                    <td className="py-2 px-3 font-mono text-xs text-gray-300">{alert.alert_id}</td>
                    <td className="py-2 px-3 text-gray-400">{alert.alert_type}</td>
                    <td className={`py-2 px-3 font-bold ${alert.severity === 'critical' ? 'text-red-400' : alert.severity === 'high' ? 'text-yellow-400' : 'text-gray-300'}`}>{alert.severity}</td>
                    <td className="py-2 px-3 text-gray-300">{alert.message}</td>
                    <td className="py-2 px-3 text-gray-400">{new Date(alert.created_at).toLocaleString()}</td>
                    <td className="py-2 px-3">
                      <button
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
                        disabled={!!resolving[alert.alert_id]}
                        onClick={() => handleResolve(alert.alert_id)}
                      >
                        {resolving[alert.alert_id] ? 'Resolving...' : 'Resolve'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AuditTrail />
    </motion.div>
  );
};

export default ComplianceDashboard;


