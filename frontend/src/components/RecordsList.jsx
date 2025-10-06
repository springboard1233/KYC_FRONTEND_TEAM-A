// FILE: frontend/src/components/RecordsList.jsx
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Database, FileText, Eye, Trash2, Upload, ShieldCheck } from 'lucide-react';
import { recordsService } from '../utils/recordsService';

// Reusable component for a single record card
const RecordCard = memo(({ record, StatusBadgeComponent, onViewRecord, onDeleteRecord }) => {
    const riskColor = record.risk_category === 'high' ? 'border-red-500/50' 
                    : record.risk_category === 'medium' ? 'border-yellow-500/50' 
                    : 'border-gray-700/80';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`bg-gray-800/50 rounded-xl p-5 border ${riskColor} hover:bg-gray-800/80 transition-all duration-300`}
        >
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-center gap-4 flex-grow">
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-300" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs" title={record.filename}>
                            {record.filename}
                        </h3>
                        <p className="text-xs text-gray-400 capitalize">{record.document_type} Card</p>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <StatusBadgeComponent status={record.status} />
                </div>
            </div>
            <div className="border-t border-gray-700/50 my-4"></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-center">
                <div>
                    <p className="text-gray-400 text-xs">Submitted</p>
                    <p className="font-medium text-gray-200 mt-1">{new Date(record.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs">Fraud Score</p>
                    <p className="font-bold text-lg text-white mt-1">{record.fraud_score?.toFixed(0) ?? 'N/A'}%</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs">Risk Level</p>
                    <p className="font-medium text-gray-200 mt-1 capitalize">{record.risk_category || 'N/A'}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs">Confidence</p>
                    <p className="font-medium text-gray-200 mt-1">{record.confidence_score?.toFixed(0) ?? 'N/A'}%</p>
                </div>
            </div>
            <div className="border-t border-gray-700/50 my-4"></div>
                {/* Admin Review Section */}
                {(record.admin_comment || record.decision) && (
                    <>
                        <div className="border-t border-gray-700/50 my-4"></div>
                        <div className="bg-gray-900/40 rounded-lg p-4 mt-2">
                            <h4 className="text-md font-semibold text-purple-300 mb-2 flex items-center">
                                <ShieldCheck className="h-5 w-5 mr-2 text-green-400" />
                                Admin Review
                            </h4>
                            {record.decision && (
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-gray-400 text-xs">Decision:</span>
                                    <span className="font-bold text-white capitalize">{record.decision}</span>
                                </div>
                            )}
                            {record.admin_comment && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-xs">Comment:</span>
                                    <span className="text-white text-sm">{record.admin_comment}</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            <div className="flex justify-end gap-3">
                <button
                    onClick={() => onDeleteRecord(record._id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                    <Trash2 className="h-4 w-4" /> Delete
                </button>
                <button
                    onClick={() => onViewRecord(record)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                    <Eye className="h-4 w-4" /> View Details
                </button>
            </div>
        </motion.div>
    );
});

const RecordsList = ({ records, StatusBadgeComponent, onViewRecord, addNotification, fetchDashboardData, setCurrentView }) => {
    
    const handleDeleteRecord = async (recordId) => {
        if (!window.confirm('Are you sure you want to permanently delete this record? This action cannot be undone.')) {
            return;
        }
        try {
            await recordsService.deleteRecord(recordId);
            fetchDashboardData(); // This will re-fetch both records and stats
            addNotification('Record deleted successfully.', 'success');
        } catch (err) {
            addNotification(`Failed to delete record: ${err.message}`, 'error');
        }
    };

    return (
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold text-white flex items-center tracking-tight">
                    <Database className="h-8 w-8 mr-3 text-purple-400" />
                    My Document Records
                </h2>
                <p className="text-gray-400 mt-1">A complete history of your verification submissions.</p>
            </div>
            <button
                onClick={() => setCurrentView('upload')}
                className="flex items-center justify-center gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors"
            >
                <Upload className="h-5 w-5" /> Upload New Document
            </button>
        </header>

        {records && records.length > 0 ? (
            <div className="space-y-4">
                {records.map((record) => (
                    <RecordCard 
                        key={record._id} 
                        record={record} 
                        StatusBadgeComponent={StatusBadgeComponent} 
                        onViewRecord={onViewRecord}
                        onDeleteRecord={handleDeleteRecord} 
                    />
                ))}
            </div>
        ) : (
            <div className="text-center text-gray-500 py-20 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-600"/>
                <h3 className="text-xl font-semibold text-gray-300">No Records Found</h3>
                <p className="mt-2">Upload a document to begin your KYC verification.</p>
            </div>
        )}
      </div>
    );
};

export default RecordsList;