// components/AdminFraudReview.jsx - CORRECTED VERSION
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock, Eye, MessageSquare, FileText, User, Calendar, Filter } from 'lucide-react';

const AdminFraudReview = () => {
  const [reviewQueue, setReviewQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [decision, setDecision] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  const fetchReviewQueue = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('access_token');
      
      // ✅ CORRECTED: Changed from /api/admin/fraud-review to /api/admin/queue
      const response = await fetch('http://localhost:5000/api/admin/queue', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReviewQueue(data.review_queue || []);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch review queue:', error);
      setError('Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  const submitDecision = async (recordId) => {
    if (!decision || !recordId) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // ✅ CORRECTED: Updated endpoint to match backend
      const response = await fetch(`http://localhost:5000/api/admin/review/${recordId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          decision: decision,
          notes: adminNotes
        })
      });

      if (response.ok) {
        alert('Decision submitted successfully!');
        setSelectedRecord(null);
        setDecision('');
        setAdminNotes('');
        await fetchReviewQueue();
      } else {
        throw new Error('Failed to submit decision');
      }
    } catch (error) {
      console.error('Decision submission error:', error);
      alert('Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskBadgeColor = (riskCategory) => {
    switch (riskCategory?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredQueue = reviewQueue.filter(record => {
    if (filterPriority === 'all') return true;
    return record.priority === filterPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading review queue...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchReviewQueue}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Review Panel</h2>
          <p className="text-gray-600">Review high-risk documents requiring manual verification</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
          </select>
          <button
            onClick={fetchReviewQueue}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {filteredQueue.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All documents processed</h3>
          <p className="text-gray-600">
            {filterPriority === 'all' 
              ? 'All high-risk documents have been reviewed' 
              : 'Try adjusting your filters to see more results'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-semibold text-gray-900">Pending Reviews ({filteredQueue.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredQueue.map((record) => (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRecord?.id === record.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {record.extracted_fields?.name || 'Unknown'}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getRiskBadgeColor(record.risk_category)
                    }`}>
                      {record.risk_category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {record.document_type?.toUpperCase()} • Fraud Score: {record.fraud_score?.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Submitted: {formatDate(record.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Document Review Panel */}
          <div className="lg:col-span-2">
            {selectedRecord ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Document Review</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    getRiskBadgeColor(selectedRecord.risk_category)
                  }`}>
                    {selectedRecord.risk_category} Risk
                  </span>
                </div>

                {/* Document Details */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Document Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <span className="ml-2">{selectedRecord.document_type?.toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fraud Score:</span>
                      <span className="ml-2">{selectedRecord.fraud_score?.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Confidence:</span>
                      <span className="ml-2">{selectedRecord.confidence_score}%</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Submitted:</span>
                      <span className="ml-2">{formatDate(selectedRecord.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Extracted Fields */}
                {selectedRecord.extracted_fields && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Extracted Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(selectedRecord.extracted_fields).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium text-gray-700 capitalize">
                            {key.replace('_', ' ')}:
                          </span>
                          <span className="ml-2">{value || 'Not detected'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Factors */}
                {selectedRecord.risk_factors && selectedRecord.risk_factors.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Risk Factors</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {selectedRecord.risk_factors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Decision Section */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Admin Decision</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Decision
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="approve"
                            checked={decision === 'approve'}
                            onChange={(e) => setDecision(e.target.value)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Approve</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="reject"
                            checked={decision === 'reject'}
                            onChange={(e) => setDecision(e.target.value)}
                            className="h-4 w-4 text-red-600 focus:ring-red-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Reject</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="flag"
                            checked={decision === 'flag'}
                            onChange={(e) => setDecision(e.target.value)}
                            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Flag for Review</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add any additional notes or reasoning for your decision..."
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setSelectedRecord(null);
                          setDecision('');
                          setAdminNotes('');
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => submitDecision(selectedRecord.id)}
                        disabled={!decision || submitting}
                        className={`px-4 py-2 rounded-md ${
                          decision && !submitting
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {submitting ? 'Submitting...' : 'Submit Decision'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-12 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Document</h3>
                <p className="text-gray-600">Choose a document from the list to review</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFraudReview;
