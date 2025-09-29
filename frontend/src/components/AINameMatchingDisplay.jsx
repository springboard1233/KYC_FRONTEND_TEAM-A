// frontend/src/components/AINameMatchingDisplay.jsx
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, UserCheck } from 'lucide-react';

const AINameMatchingDisplay = ({ nameMatchingResult, userEnteredName, ocrName }) => {
  if (!nameMatchingResult) return null;

  const { score, match_status } = nameMatchingResult;

  const statusConfig = {
    high: { text: 'High Match', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    partial: { text: 'Partial Match', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    low: { text: 'Low Match', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
    default: { text: 'Not Available', icon: AlertTriangle, color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/30' },
  };

  const { text, icon: Icon, color, bg } = statusConfig[match_status] || statusConfig.default;

  return (
    <div className={`rounded-xl shadow-xl p-6 border ${bg}`}>
      <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
        <UserCheck className="h-5 w-5 mr-2 text-purple-400" />
        AI Name Matching
      </h3>
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="text-center">
          <p className="text-sm text-gray-400">User Entered Name</p>
          <p className="text-lg font-medium text-white">{userEnteredName || 'N/A'}</p>
        </div>
        <div className="text-center p-4 rounded-lg">
          <Icon className={`h-8 w-8 mx-auto ${color}`} />
          <p className={`mt-2 text-lg font-bold ${color}`}>{text}</p>
          <p className="text-sm text-gray-400">({score}% Similarity)</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">Document Extracted Name</p>
          <p className="text-lg font-medium text-white">{ocrName || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default AINameMatchingDisplay;