// FILE: frontend/src/components/AINameMatchingDisplay.jsx
import React, { memo } from 'react';
import { UserCheck, UserX, Info, Smile, Frown } from 'lucide-react';
import { motion } from 'framer-motion';

const AINameMatchingDisplay = ({ nameMatchingResult, userEnteredName, extractedFields }) => {
  const extractedName = extractedFields?.name || extractedFields?.full_name || 'N/A';
  const matchStatus = nameMatchingResult?.match_status || 'unknown';
  const similarityScore = nameMatchingResult?.similarity_score ?? 0;
  const matchDetails = nameMatchingResult?.details || 'No specific details provided.';

  let statusIcon;
  let statusText;
  let statusColorClass;

  switch (matchStatus) {
    case 'matched':
      statusIcon = <UserCheck className="h-8 w-8 text-green-400" />;
      statusText = 'Name Matched';
      statusColorClass = 'text-green-400';
      break;
    case 'not_matched':
      statusIcon = <UserX className="h-8 w-8 text-red-400" />;
      statusText = 'Name Not Matched';
      statusColorClass = 'text-red-400';
      break;
    case 'partial_match':
      statusIcon = <UserCheck className="h-8 w-8 text-yellow-400" />;
      statusText = 'Partial Match';
      statusColorClass = 'text-yellow-400';
      break;
    default:
      statusIcon = <Info className="h-8 w-8 text-gray-400" />;
      statusText = 'No Match Data';
      statusColorClass = 'text-gray-400';
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}
      className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
        <UserCheck className="h-5 w-5 mr-3 text-purple-400" />
        AI Name Matching
      </h3>
      
      <div className="flex flex-col sm:flex-row items-center sm:justify-around text-center sm:text-left space-y-4 sm:space-y-0 py-4">
        <div className="flex flex-col items-center">
          {statusIcon}
          <p className={`text-xl font-bold mt-2 ${statusColorClass}`}>{statusText}</p>
          {matchStatus !== 'unknown' && (
            <p className="text-sm text-gray-400">Similarity: <span className="font-medium text-white">{similarityScore.toFixed(2)}%</span></p>
          )}
        </div>
        <div className="w-px h-16 bg-gray-700 hidden sm:block"></div> {/* Separator */}
        <div className="text-sm space-y-2">
          <p className="text-gray-300"><span className="font-semibold">User-Entered Name:</span> <span className="text-white">{userEnteredName || 'N/A'}</span></p>
          <p className="text-gray-300"><span className="font-semibold">Extracted Name:</span> <span className="text-white">{extractedName}</span></p>
        </div>
      </div>
      
      {matchStatus !== 'unknown' && (
        <div className="mt-6 border-t border-gray-700 pt-4">
          <h4 className="text-md font-semibold text-gray-200 mb-2 flex items-center">
            <Info className="h-4 w-4 mr-2 text-blue-400" /> Match Details
          </h4>
          <p className="text-sm text-gray-400">{matchDetails}</p>
        </div>
      )}
    </motion.div>
  );
};

export default memo(AINameMatchingDisplay);