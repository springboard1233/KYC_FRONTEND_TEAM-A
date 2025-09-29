// frontend/src/components/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, XCircle, Loader } from 'lucide-react';
import { adminService } from '../utils/adminService';

const AdminPanel = ({ adminQueue = [], loading, onRefreshQueue }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleAction = async (recordId, action) => {
    setActionLoading(true);
    try {
      await adminService.updateRecordStatus(recordId, action);
      setNotification(`Record ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      onRefreshQueue && onRefreshQueue();
      setSelectedRecord(null);
    } catch (err) {
      setNotification(`Failed to ${action} record: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100 mb-4">Admin Fraud Review Panel</h2>
      {notification && (
        <div className="mb-4 text-center text-blue-400 bg-blue-900/30 rounded-lg py-2">{notification}</div>
      )}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="animate-spin h-8 w-8 text-blue-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {adminQueue.length === 0 ? (
            <div className="text-center text-gray-400">No pending records for review.</div>
          ) : (
            adminQueue.map((record) => (
              <div key={record._id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-gray-200">{record.document_type} - {record.filename}</span>
                    <span className="ml-4 text-sm text-gray-400">Status: {record.status}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded flex items-center"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </button>
                    <button
                      className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded flex items-center"
                      onClick={() => handleAction(record._id, 'approve')}
                      disabled={actionLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </button>
                    <button
                      className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded flex items-center"
                      onClick={() => handleAction(record._id, 'reject')}
                      disabled={actionLoading}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </button>
                  </div>
                </div>
                {selectedRecord && selectedRecord._id === record._id && (
                  <div className="mt-4 bg-gray-900/60 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-gray-200 mb-2">Extracted Fields</h4>
                        <div className="space-y-1 text-gray-400">
                          {Object.entries(record.extracted_fields).map(([key, value]) => (
                            <div key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {value}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-200 mb-2">Fraud Analysis</h4>
                        <div className="space-y-1 text-gray-400">
                          <div><strong>Fraud Score:</strong> {record.fraud_score}%</div>
                          <div><strong>Risk Category:</strong> {record.risk_category}</div>
                          {record.risk_factors?.length > 0 && <div><strong>Factors:</strong> {record.risk_factors.join(', ')}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;