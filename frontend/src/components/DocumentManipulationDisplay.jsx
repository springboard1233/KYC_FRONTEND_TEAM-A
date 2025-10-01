// FILE: frontend/src/components/DocumentManipulationDisplay.jsx
import React, { memo } from 'react';
import { FileWarning, ShieldCheck, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DocumentManipulationDisplay = ({ manipulationResult }) => {
  const manipulationScore = manipulationResult?.manipulation_risk_score ?? 0;
  const confidence = manipulationResult?.confidence_score ?? 0;
  const checklist = manipulationResult?.analysis_checklist || {};
  const overallStatus = manipulationResult?.overall_status || 'Analysis Inconclusive';

  let statusColorClass = 'text-gray-400';
  if (manipulationScore > 60) {
    statusColorClass = 'text-red-400';
  } else if (manipulationScore > 30) {
    statusColorClass = 'text-yellow-400';
  } else if (manipulationScore > 0) { // Any score above 0 implies some risk, but low
    statusColorClass = 'text-blue-400';
  } else {
    statusColorClass = 'text-green-400';
  }

  const getChecklistItem = (itemKey, itemStatus) => {
    let icon, textClass;
    switch (itemStatus) {
      case 'clear':
        icon = <CheckCircle className="h-4 w-4 text-green-400" />;
        textClass = 'text-gray-300';
        break;
      case 'detected':
        icon = <XCircle className="h-4 w-4 text-red-400" />;
        textClass = 'text-red-400';
        break;
      case 'inconclusive':
      default:
        icon = <HelpCircle className="h-4 w-4 text-yellow-400" />;
        textClass = 'text-yellow-400';
        break;
    }
    return (
      <li key={itemKey} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
        <span className="flex items-center capitalize text-sm">
          {icon}
          <span className="ml-3">{itemKey.replace(/_/g, ' ')}</span>
        </span>
        <span className={`text-sm font-medium ${textClass}`}>
          {itemStatus.replace(/_/g, ' ')}
        </span>
      </li>
    );
  };

  const gaugeRotation = Math.min(Math.max(manipulationScore, 0), 100) * 1.8; // Map 0-100 to 0-180 degrees

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, delay: 0.45 }}
      className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
        <FileWarning className="h-5 w-5 mr-3 text-orange-400" />
        Document Integrity Analysis
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex flex-col items-center justify-center space-y-4 p-4">
          <div className="relative w-32 h-16 overflow-hidden">
            {/* Semicircle background */}
            <div className="absolute top-0 left-0 w-32 h-16 rounded-b-[64px] rounded-t-none bg-gray-700"></div>
            {/* Animated score arc */}
            <div 
              className="absolute origin-bottom-center w-32 h-16 rounded-b-[64px] rounded-t-none bg-gradient-to-r from-green-500 to-red-500 transition-transform duration-1000 ease-out"
              style={{ transform: `rotate(${gaugeRotation}deg)`, transformOrigin: 'bottom center' }}
            ></div>
            {/* Inner circle mask */}
            <div className="absolute top-2 left-2 w-28 h-14 rounded-b-[56px] rounded-t-none bg-gray-800"></div>
            {/* Central score display */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-white text-2xl font-bold">
              {manipulationScore}%
            </div>
          </div>
          <p className={`text-xl font-bold mt-4 ${statusColorClass}`}>Manipulation Risk Score</p>
          <p className="text-sm text-gray-400">Confidence: <span className="font-medium text-white">{confidence}%</span></p>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-gray-700 md:pl-6 pt-6 md:pt-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-semibold text-gray-200 flex items-center">
              <ShieldCheck className="h-4 w-4 mr-2 text-green-400" /> Analysis Checklist
            </h4>
            <span className="text-sm text-gray-400 font-medium">
                {overallStatus === 'Analysis Inconclusive' ? (
                    <span className="flex items-center text-yellow-400"><HelpCircle className="h-4 w-4 mr-1" /> Inconclusive</span>
                ) : (
                    overallStatus
                )}
            </span>
          </div>
          <ul className="divide-y divide-gray-700">
            {Object.keys(checklist).length > 0 ? (
              Object.entries(checklist).map(([key, status]) => getChecklistItem(key, status))
            ) : (
              <li className="text-sm text-gray-500 py-2">No integrity analysis details available.</li>
            )}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(DocumentManipulationDisplay);