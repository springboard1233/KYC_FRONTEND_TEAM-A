// CHANGELOG: Upgraded dashboard with a visual compliance gauge, a filterable alerts table, and a cleaner hook-based architecture.
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Clock, BarChart3, Download, Loader, Eye, ChevronDown } from 'lucide-react';
import { complianceService } from '../utils/complianceService';
import { adminService } from '../utils/adminService';
import { transformRecordsForCSV, downloadCSVFromData } from '../utils/csvExport';

// --- CUSTOM HOOK ---

const useComplianceData = () => {
  const [state, setState] = useState({
    stats: null,
    alerts: [],
    loading: true,
    error: '',
  });

  const fetchData = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: '' }));
    try {
      const [statsData, alertsData] = await Promise.all([
        complianceService.getStats(),
        complianceService.getAlerts(),
      ]);
      setState({ stats: statsData, alerts: alertsData, loading: false, error: '' });
    } catch (err) {
      setState({ stats: null, alerts: [], loading: false, error: err.message || 'Failed to fetch compliance data.' });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
};


// --- REUSABLE SUB-COMPONENTS ---

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
    const size = 120;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 90 ? 'text-green-400' : score >= 75 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 flex flex-col items-center justify-center text-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
                    <circle className="text-gray-700" stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={size/2} cy={size/2} />
                    <motion.circle
                        className={color}
                        stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        fill="transparent" r={radius} cx={size/2} cy={size/2} transform={`rotate(-90 ${size/2} ${size/2})`}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-bold text-white`}>{score}<span className="text-xl">%</span></span>
                </div>
            </div>
            <p className="text-sm text-gray-300 font-semibold mt-3">Compliance Score</p>
        </div>
    );
});


// --- MAIN COMPONENT ---

const ComplianceDashboard = ({ addNotification, onViewDetails }) => {
  const { stats, alerts, loading, error, refetch } = useComplianceData();
  const [isExporting, setIsExporting] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');
  
  const filteredAlerts = useMemo(() => {
    if (severityFilter === 'all') return alerts;
    return alerts.filter(alert => alert.severity.toLowerCase() === severityFilter);
  }, [alerts, severityFilter]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const recordsToExport = await adminService.exportRecords();
      if (recordsToExport?.length > 0) {
        const csvData = transformRecordsForCSV(recordsToExport);
        downloadCSVFromData(csvData, `kyc_compliance_report_${new Date().toISOString().split('T')[0]}.csv`);
        addNotification('Report exported successfully!', 'info');
      } else {
        addNotification('No records available for export.', 'warning');
      }
    } catch (err) {
      addNotification(`Export failed: ${err.message}`, 'error');
    } finally {
      setIsExporting(false);
    }
  }, [addNotification]);
  
  if (loading) return <div className="min-h-[400px] flex items-center justify-center"><Loader className="h-12 w-12 animate-spin text-blue-400" /></div>;
  if (error) return <div className="min-h-[400px] flex items-center justify-center text-red-400 bg-red-900/20 rounded-lg p-8">Error: {error}</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h2 className="text-3xl font-bold text-white flex items-center tracking-tight">
                <Shield className="h-8 w-8 mr-3 text-blue-400" />
                Compliance Overview
            </h2>
            <button
                onClick={handleExport} disabled={isExporting}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-50 transition-colors"
            >
                {isExporting ? <Loader className="animate-spin h-5 w-5 mr-2" /> : <Download className="h-5 w-5 mr-2" />}
                {isExporting ? 'Exporting...' : 'Export All Records (CSV)'}
            </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1"><ComplianceGauge score={Math.round(stats?.compliance_score || 0)} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:col-span-3 gap-6">
              <StatCard title="Total Records" value={stats?.total_records || 0} icon={BarChart3} color="blue" />
              <StatCard title="Active Alerts" value={stats?.active_alerts || 0} icon={AlertTriangle} color="red" />
              <StatCard title="Alerts (24h)" value={stats?.recent_alerts_24h || 0} icon={Clock} color="yellow" />
            </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                <h3 className="text-xl font-bold text-white">Active Fraud Alerts</h3>
                <div className="relative">
                    <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="bg-gray-700/50 border border-gray-600 rounded-lg pl-3 pr-8 py-2 text-white appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="all">All Severities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
                </div>
            </div>
            <div className="space-y-3">
                {filteredAlerts.length > 0 ? (
                    filteredAlerts.map(alert => (
                        <div key={alert.alert_id} className="bg-gray-900/50 p-4 rounded-lg flex items-center justify-between border border-gray-700/50 hover:border-blue-500/50 transition-colors">
                            <div>
                                <p className="font-semibold text-white">{alert.message}</p>
                                <p className="text-sm text-gray-400">Severity: {alert.severity} | Confidence: {alert.confidence_score}%</p>
                            </div>
                            <button onClick={() => onViewDetails(alert.record_id)} className="text-sm font-semibold flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors">
                                <Eye className="h-4 w-4" /> View
                            </button>
                        </div>
                    ))
                ) : <p className="text-gray-400 text-center py-8">No active alerts match the current filter.</p>}
            </div>
        </div>
    </motion.div>
  );
};

export default ComplianceDashboard;


