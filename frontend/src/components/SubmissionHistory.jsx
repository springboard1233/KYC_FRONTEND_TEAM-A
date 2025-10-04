import React, { useState, useMemo } from 'react';
import { ArrowUpDown } from 'lucide-react';

const SubmissionHistory = ({ submissions }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });

  const sortedSubmissions = useMemo(() => {
    let sortableItems = [...submissions];
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
  }, [submissions, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'text-green-400';
      case 'Rejected': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  return (
    <div className="col-span-full max-w-4xl mx-auto mt-10 w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">Submission History</h2>
      <div className="overflow-x-auto bg-gray-800/50 p-4 rounded-lg border border-gray-700">
        
        {/* ✅ FIX: Conditionally render table or empty message */}
        {submissions.length === 0 ? (
          <p className="text-gray-400 text-center py-4">You have no past submissions.</p>
        ) : (
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-3 cursor-pointer" onClick={() => requestSort('createdAt')}>
                  Date <ArrowUpDown size={14} className="inline-block ml-1" />
                </th>
                <th className="p-3">Document Type</th>
                <th className="p-3 cursor-pointer" onClick={() => requestSort('fraudScore')}>
                  Risk Score <ArrowUpDown size={14} className="inline-block ml-1" />
                </th>
                <th className="p-3">Decision</th>
                <th className="p-3">Reasons</th>
              </tr>
            </thead>
            <tbody>
              {sortedSubmissions.map(sub => (
                <tr key={sub._id} className="border-b border-gray-700">
                  <td className="p-3">{new Date(sub.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">{sub.docType}</td>
                  <td className="p-3 font-bold">{sub.fraudScore}%</td>
                  <td className={`p-3 font-bold ${getStatusColor(sub.status)}`}>{sub.status}</td>
                  <td className="p-3 text-gray-400">{(sub.riskReasons || []).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
};

export default SubmissionHistory;