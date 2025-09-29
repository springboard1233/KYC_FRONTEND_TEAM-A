// FILE: frontend/src/components/RecordsList.jsx
import React from 'react';
import { Clock, FileText, Eye, Trash2, Database } from 'lucide-react';
import { recordsService } from '../utils/recordsService';

const RecordsList = ({ records, StatusBadgeComponent, onViewRecord, addNotification, fetchDashboardData }) => {
    const handleDeleteRecord = async (recordId) => {
        if (!window.confirm('Are you sure you want to permanently delete this record?')) {
            return;
        }
        try {
            await recordsService.deleteRecord(recordId);
            fetchDashboardData(); // Refresh stats and records list
            addNotification('Record deleted successfully', 'success');
        } catch (err) {
            addNotification(`Failed to delete record: ${err.message}`, 'error');
        }
    };

    return (
      <div className="space-y-6">
        {/* Records Header */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-100 flex items-center">
                <Database className="h-8 w-8 mr-3 text-blue-400" />
                Document Records
              </h2>
              <p className="text-blue-200 mt-1">All processed documents with AI analysis results</p>
            </div>
          </div>
        </div>

        {/* Records Display */}
        {records && records.length > 0 ? (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record._id} className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
                          <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-100 capitalize">
                            {record.document_type} Document
                          </h3>
                          <p className="text-sm text-gray-400">{record.filename}</p>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <StatusBadgeComponent status={record.status} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-300">Uploaded:</span>
                        <span className="ml-2 text-gray-400">{new Date(record.created_at).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-300">Fraud Score:</span>
                        <span className="ml-2 text-gray-400">{record.fraud_score != null ? `${record.fraud_score}%` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-300">Risk Category:</span>
                        <span className="ml-2 text-gray-400 capitalize">{record.risk_category || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-300">Verified Name:</span>
                        <span className="ml-2 text-gray-400">{record.verified_name || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <button
                      className="flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition mb-2"
                      onClick={() => onViewRecord(record)}
                    >
                      <Eye className="h-4 w-4 mr-2" /> View Result
                    </button>
                    <button
                      className="flex items-center px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-semibold transition"
                      onClick={() => handleDeleteRecord(record._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 p-8">No records found. Upload a document to get started.</div>
        )}
      </div>
    );
};

export default RecordsList;