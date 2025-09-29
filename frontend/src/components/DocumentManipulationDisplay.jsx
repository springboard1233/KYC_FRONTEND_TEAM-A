// CHANGELOG: Redesigned with a visual risk gauge and a detailed analysis checklist for improved clarity and user insight.
import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Microscope, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// --- STYLING & CONFIGURATION ---

const useStatusConfig = (riskLevel) => {
  return useMemo(() => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return { text: 'High Risk Detected', icon: AlertTriangle, color: 'red', textClass: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      case 'medium':
        return { text: 'Potential Anomalies', icon: AlertTriangle, color: 'yellow', textClass: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
      case 'low':
        return { text: 'Likely Authentic', icon: CheckCircle, color: 'green', textClass: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
      default:
        return { text: 'Analysis Inconclusive', icon: Shield, color: 'gray', textClass: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' };
    }
  }, [riskLevel]);
};

// --- REUSABLE SUB-COMPONENTS ---

const RiskGauge = memo(({ score = 0, color }) => {
  const rotation = (score / 100) * 180 - 90; // Map 0-100 to -90deg to 90deg

  return (
    <div className="relative w-48 h-24 overflow-hidden mx-auto">
      <div className="absolute top-0 left-0 w-full h-full border-[12px] border-gray-700 border-b-0 rounded-t-full"></div>
      <div className={`absolute top-0 left-0 w-full h-full border-[12px] border-b-0 rounded-t-full border-${color}-500`} style={{ clipPath: `inset(0 ${100 - score}% 0 0)` }}></div>
      <motion.div
        className="absolute bottom-0 left-1/2 w-1 h-20 bg-white rounded-t-full origin-bottom"
        style={{ transform: `translateX(-50%) rotate(0deg)`}}
        animate={{ rotate: rotation }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full"></div>
    </div>
  );
});

const AnalysisChecklistItem = memo(({ check, isDetected }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className={`flex items-center justify-between p-3 rounded-lg text-sm ${isDetected ? 'bg-red-500/10' : 'bg-gray-700/20'}`}
  >
    <span className="font-medium text-gray-300">{check}</span>
    {isDetected ? (
      <div className="flex items-center gap-1.5 text-red-400 font-semibold">
        <XCircle className="h-4 w-4" /> Detected
      </div>
    ) : (
      <div className="flex items-center gap-1.5 text-green-400">
        <CheckCircle className="h-4 w-4" /> Clear
      </div>
    )}
  </motion.div>
));

// --- MAIN COMPONENT ---

const DocumentManipulationDisplay = ({ manipulationResult }) => {
  if (!manipulationResult) return null;

  const { risk_level, manipulation_score, confidence, details = [] } = manipulationResult;
  const statusConfig = useStatusConfig(risk_level);
  
  // A simulated list of common checks. The component shows the status of each.
  const commonChecks = [
    'EXIF Metadata Tampering',
    'Pixel Level Anomalies (ELA)',
    'Font & Text Inconsistencies',
    'Signature Forgery Analysis',
    'Compression Signature Mismatch',
  ];

  const detectedChecks = new Set(details.map(d => d.type || d));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-xl shadow-lg p-6 border ${statusConfig.bg} ${statusConfig.border}`}
    >
      <header className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100 flex items-center">
          <Microscope className="h-5 w-5 mr-2 text-purple-400" />
          Document Integrity Analysis
        </h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${statusConfig.bg} ${statusConfig.textClass}`}>
          <statusConfig.icon className="h-4 w-4" />
          {statusConfig.text}
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="text-center">
          <RiskGauge score={manipulation_score} color={statusConfig.color} />
          <p className="mt-2 text-4xl font-bold text-white">{manipulation_score}<span className="text-2xl text-gray-400">%</span></p>
          <p className="text-sm text-gray-400">Manipulation Risk Score</p>
          <p className="text-xs text-gray-500 mt-1">(Confidence: {confidence}%)</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-200 mb-2">Analysis Checklist</h4>
          <motion.div 
            className="space-y-2"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.07 }}
          >
            {commonChecks.map(check => (
              <AnalysisChecklistItem key={check} check={check} isDetected={detectedChecks.has(check)} />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(DocumentManipulationDisplay);


