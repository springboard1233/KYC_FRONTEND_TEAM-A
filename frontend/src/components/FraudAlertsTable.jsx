// CHANGELOG: Transformed into an interactive data grid with sorting, responsive card layout, and rich visual cues for scannability.
import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Eye, ArrowDownUp, Info } from 'lucide-react';

// --- CUSTOM HOOKS ---

const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = key => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

// --- REUSABLE SUB-COMPONENTS ---

const RiskBadge = memo(({ risk }) => {
  const config = useMemo(() => {
    switch (risk?.toLowerCase()) {
      case 'high': return { text: 'High', style: 'bg-red-500/20 text-red-300' };
      case 'medium': return { text: 'Medium', style: 'bg-yellow-500/20 text-yellow-300' };
      case 'low': return { text: 'Low', style: 'bg-green-500/20 text-green-300' };
      default: return { text: 'Unknown', style: 'bg-gray-500/20 text-gray-300' };
    }
  }, [risk]);

  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.style}`}>{config.text}</span>;
});

const TableHeader = memo(({ label, sortKey, requestSort, sortConfig }) => (
    <th scope="col" className="p-4 font-semibold">
        <button onClick={() => requestSort(sortKey)} className="flex items-center gap-2 group">
            {label}
            <ArrowDownUp className={`h-3 w-3 text-gray-500 group-hover:text-white transition-colors ${sortConfig?.key === sortKey ? 'text-white' : ''}`} />
        </button>
    </th>
));

// --- MAIN COMPONENT ---

const FraudAlertsTable = ({ fetchAlerts, onViewRecord }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchAlerts();
        setAlerts(data.alerts || []);
      } catch (err) {
        setError(err.message || 'Failed to load alerts.');
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };
    loadAlerts();
  }, [fetchAlerts]);

  const { items: sortedAlerts, requestSort, sortConfig } = useSortableData(alerts, { key: 'timestamp', direction: 'descending' });
  
  if (loading) return <div className="text-center p-8 text-gray-400">Loading alerts...</div>;
  if (error) return <div className="text-center p-8 text-red-400">{error}</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800/50 rounded-xl shadow-lg p-6 border border-gray-700"
    >
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
        <ShieldAlert className="h-6 w-6 text-red-400"/>
        Fraud & Compliance Alerts
      </h2>

      {sortedAlerts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
            <Info className="h-12 w-12 mx-auto mb-2"/>
            <p className="font-semibold">No recent alerts.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="text-xs text-gray-300 uppercase bg-gray-900/60">
              <tr>
                <TableHeader label="Alert" sortKey="message" requestSort={requestSort} sortConfig={sortConfig} />
                <TableHeader label="Risk" sortKey="risk" requestSort={requestSort} sortConfig={sortConfig} />
                <TableHeader label="Document" sortKey="document_type" requestSort={requestSort} sortConfig={sortConfig} />
                <TableHeader label="Fraud Score" sortKey="fraud_score" requestSort={requestSort} sortConfig={sortConfig} />
                <TableHeader label="Timestamp" sortKey="timestamp" requestSort={requestSort} sortConfig={sortConfig} />
                <th scope="col" className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              <AnimatePresence>
                {sortedAlerts.map((alert) => (
                  <motion.tr 
                    key={alert.record_id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-700/30"
                  >
                    <td className="p-4">
                        <p className="font-medium text-white">{alert.message}</p>
                        <p className="text-xs text-gray-400 capitalize">{alert.alert_type.replace(/_/g, ' ')}</p>
                    </td>
                    <td className="p-4"><RiskBadge risk={alert.risk} /></td>
                    <td className="p-4 text-gray-300 capitalize">{alert.document_type}</td>
                    <td className="p-4 font-mono font-semibold text-white">{alert.fraud_score}%</td>
                    <td className="p-4 text-gray-400">{new Date(alert.timestamp).toLocaleString()}</td>
                    <td className="p-4 text-right">
                        <button onClick={() => onViewRecord(alert.record_id)} className="text-sm font-semibold flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors">
                            <Eye className="h-4 w-4" /> Review
                        </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default FraudAlertsTable;


