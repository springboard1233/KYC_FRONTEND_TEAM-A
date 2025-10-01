// FILE: frontend/src/components/FraudScoreDisplay.jsx
import React, { memo } from 'react';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const FraudScoreDisplay = ({ analysis }) => {
  const fraudScore = analysis?.fraud_score ?? 0;
  const riskCategory = analysis?.risk_category || 'Unknown';
  const confidence = analysis?.confidence_score ?? 0;

  let scoreColorClass = 'text-green-400';
  let scoreBgClass = 'bg-green-500/20';
  let icon = <CheckCircle2 className="h-5 w-5 text-green-400 mr-3" />;

  if (fraudScore > 60) {
    scoreColorClass = 'text-red-400';
    scoreBgClass = 'bg-red-500/20';
    icon = <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />;
  } else if (fraudScore > 30) {
    scoreColorClass = 'text-yellow-400';
    scoreBgClass = 'bg-yellow-500/20';
    icon = <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />;
  }

  const gaugeRotation = Math.min(Math.max(fraudScore, 0), 100) * 1.8; // Map 0-100 to 0-180 degrees

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700 h-full flex flex-col"
    >
      <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
        <Shield className="h-5 w-5 mr-3 text-red-400" />
        Fraud Risk Analysis
      </h3>
      <div className="flex flex-col items-center justify-center flex-grow space-y-4">
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
          {/* Needle - if you want one */}
          {/* <div 
            className="absolute bottom-0 left-1/2 w-0.5 h-full bg-white transition-transform duration-1000 ease-out transform -translate-x-1/2"
            style={{ transform: `translateX(-50%) rotate(${gaugeRotation}deg)`, transformOrigin: 'bottom center' }}
          ></div> */}
          {/* Central score display */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-white text-2xl font-bold">
            {fraudScore}%
          </div>
        </div>

        <div className="flex items-center mt-6">
          {icon}
          <p className={`text-xl font-bold ${scoreColorClass}`}>
            {riskCategory} Risk
          </p>
        </div>
        <p className="text-sm text-gray-400 mt-2 text-center">
          Confidence Score: <span className="font-medium text-white">{confidence}%</span>
        </p>
      </div>
    </motion.div>
  );
};

export default memo(FraudScoreDisplay);