// FILE: frontend/src/components/AdminPanel.jsx
import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, CheckCircle, XCircle, Loader, Inbox } from 'lucide-react';
import { adminService } from '../utils/adminService';

// Reusable component for a table row representing a pending record
const RecordRow = memo(({ record, onViewRecord, onAction }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleActionClick = async (action) => {
    setIsProcessing(true);
    await onAction(record._id, action);
    // The parent component will handle UI updates, so we don't need to set isProcessing back to false.
  };

  const riskColor = record.risk_category === 'high' ? 'text-red-400'
                  : record.risk_category === 'medium' ? 'text-yellow-400'
                  : 'text-gray-400';

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
      className="border-b border-gray-700/50 hover:bg-gray-700/20"
    >
      <td className="p-4 align-middle">
        <div className="font-medium text-white">{record.filename}</div>
        <div className="text-sm text-gray-400 capitalize">{record.document_type}</div>
      </td>
      <td className="p-4 align-middle text-sm text-gray-300">{new Date(record.created_at).toLocaleString()}</td>
      <td className="p-4 align-middle font-semibold">
        <span className={riskColor}>{record.risk_category?.toUpperCase() || 'N/A'} ({record.fraud_score?.toFixed(0) || 0}%)</span>
      </td>
      <td className="p-4 align-middle text-right">
        <div className="flex justify-end items-center gap-2">
          {isProcessing ? (
            <Loader className="h-5 w-5 animate-spin text-blue-400" />
          ) : (
            <>
              <button onClick={() => onViewRecord(record)} className="p-2 text-gray-300 hover:bg-gray-600/50 hover:text-white rounded-md transition-colors" title="View Details"><Eye className="h-5 w-5" /></button>
              <button onClick={() => handleActionClick('approve')} className="p-2 text-green-400 hover:bg-green-500/10 rounded-md transition-colors" title="Approve"><CheckCircle className="h-5 w-5" /></button>
              <button onClick={() => handleActionClick('reject')} className="p-2 text-red-400 hover:bg-red-500/10 rounded-md transition-colors" title="Reject"><XCircle className="h-5 w-5" /></button>
            </>
          )}
        </div>
      </td>
    </motion.tr>
  );
});


const AdminPanel = ({ adminQueue = [], loading, onRefreshQueue, onViewRecord, addNotification }) => {
  
  const handleAction = async (recordId, action) => {
    try {
      await adminService.updateRecordStatus(recordId, action, 'Quick decision from panel.');
      addNotification(`Record successfully ${action === 'approve' ? 'approved' : 'rejected'}.`, 'success');
      onRefreshQueue(); // Tell the parent to re-fetch the queue
    } catch (err) {
      addNotification(`Failed to ${action} record: ${err.message}`, 'error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800/50 rounded-xl shadow-xl p-6 border border-gray-700">
      <h2 className="text-3xl font-bold text-white mb-4 flex items-center tracking-tight">
        <Shield className="h-8 w-8 mr-3 text-blue-400" />
        Admin Review Queue
      </h2>
      <p className="text-gray-400 mb-6">Documents flagged by the AI for manual verification are listed below.</p>
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="border-b border-gray-600 text-sm text-gray-300 uppercase">
            <tr>
              <th className="p-4 font-semibold">Document</th>
              <th className="p-4 font-semibold">Submitted At</th>
              <th className="p-4 font-semibold">AI Risk Assessment</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center p-16"><Loader className="h-10 w-10 animate-spin text-blue-400 mx-auto" /></td></tr>
            ) : adminQueue.length > 0 ? (
              <AnimatePresence>
                {adminQueue.map((record) => (
                  <RecordRow key={record._id} record={record} onViewRecord={onViewRecord} onAction={handleAction} />
                ))}
              </AnimatePresence>
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-16 text-gray-500">
                  <Inbox className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-300">The review queue is empty.</h3>
                  <p className="mt-1">All pending documents have been processed.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AdminPanel;