// FILE: frontend/src/components/StatusBadge.jsx
import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'verified':
    case 'approve':
      return <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-medium flex items-center"><CheckCircle className="h-3 w-3 mr-1" />Approved</span>;
    case 'rejected':
      return <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs font-medium flex items-center"><XCircle className="h-3 w-3 mr-1" />Rejected</span>;
    case 'pending':
    default:
      return <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs font-medium flex items-center"><Clock className="h-3 w-3 mr-1" />Pending</span>;
  }
};

export default StatusBadge;