import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, AlertTriangle, CheckCircle, Clock, BarChart3, Download, Loader
} from 'lucide-react';
import { complianceService } from '../utils/complianceService';
import { adminService } from '../utils/adminService';
import { transformRecordsForCSV, downloadCSVFromData } from '../utils/csvExport';
import AuditTrail from './AuditTrail';


const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
        <div className="flex items-center">
            <div className={`p-2 rounded-md bg-${color}-500/20`}>
                <Icon className={`h-6 w-6 text-${color}-400`} />
            </div>
            <div className="ml-4">
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-xl font-bold text-white">{value}</p>
            </div>
        </div>
    </div>
);

const AlertItem = ({ alert }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg flex items-center justify-between border border-gray-700/50 hover:bg-gray-800/60 transition-colors">
        <div>
            <p className="font-semibold text-white">{alert.message}</p>
            <p className="text-sm text-gray-400">
                Type: {alert.alert_type.replace(/_/g, ' ')} | Severity: {alert.severity} | Confidence: {Math.round(alert.confidence_score * 100)}%
            </p>
        </div>
        <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold">View Details</button>
    </div>
);

// ================================
// 🛡️ AML/KYC COMPLIANCE DASHBOARD
// ================================
const ComplianceDashboard = () => {
  const [complianceStats, setComplianceStats] = useState(null);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [stats, alerts] = await Promise.all([
        complianceService.getStats(),
        complianceService.getAlerts()
      ]);
      setComplianceStats(stats);
      setFraudAlerts(alerts);
    } catch (err) {
      setError(err.message || 'Failed to fetch compliance data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const recordsToExport = await adminService.exportRecords();
      if (recordsToExport && recordsToExport.length > 0) {
        const csvData = transformRecordsForCSV(recordsToExport);
        downloadCSVFromData(csvData, `kyc_compliance_report_${new Date().toISOString().split('T')[0]}.csv`);
      }
    } catch (err) {
      setError(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4">Loading Compliance Data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return <div className="min-h-[400px] flex items-center justify-center text-red-400 bg-red-900/20 rounded-lg border border-red-500/30 p-8">Error: {error}</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center">
                    <Shield className="h-6 w-6 mr-3 text-blue-400" />
                    AML/KYC Compliance Overview
                </h2>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="mt-4 md:mt-0 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-50"
                >
                  {isExporting ? <Loader className="animate-spin h-5 w-5 mr-2" /> : <Download className="h-5 w-5 mr-2" />}
                  {isExporting ? 'Exporting...' : 'Export All Records (CSV)'}
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Records" value={complianceStats?.total_records || 0} icon={BarChart3} />
                <StatCard title="Active Alerts" value={complianceStats?.active_alerts || 0} icon={AlertTriangle} color="red" />
                <StatCard title="Compliance Score" value={`${Math.round(complianceStats?.compliance_score || 0)}%`} icon={CheckCircle} color="green" />
                <StatCard title="Alerts (24h)" value={complianceStats?.recent_alerts_24h || 0} icon={Clock} color="yellow" />
            </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Active Fraud Alerts</h3>
            <div className="space-y-3">
                {fraudAlerts.length > 0 ? fraudAlerts.map(alert => (
                    <AlertItem key={alert.alert_id} alert={alert} />
                )) : <p className="text-gray-400">No active alerts found.</p>}
            </div>
        </div>

        <AuditTrail />
    </div>
  );
};

export default ComplianceDashboard;