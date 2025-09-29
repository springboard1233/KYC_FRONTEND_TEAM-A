// CHANGELOG: Corrected the import statement for EnhancedProgressBar from named to default.
import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import EnhancedProgressBar from './EnhancedProgressBar'; 

// --- CONFIGURATION & STYLING ---

const useRiskConfig = (riskCategory) => {
  return useMemo(() => {
    switch (riskCategory?.toLowerCase()) {
      case 'critical':
      case 'high':
        return { text: 'High Risk', textClass: 'text-red-400', bg: 'bg-red-500/10' };
      case 'medium':
        return { text: 'Medium Risk', textClass: 'text-yellow-400', bg: 'bg-yellow-500/10' };
      default:
        return { text: 'Low Risk', textClass: 'text-green-400', bg: 'bg-green-500/10' };
    }
  }, [riskCategory]);
};

// --- REUSABLE SUB-COMPONENTS ---

const RiskFactorItem = memo(({ factor }) => (
    <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-start text-sm text-yellow-300 bg-yellow-500/10 p-2.5 rounded-md"
    >
        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-yellow-400" />
        <span>{factor}</span>
    </motion.div>
));

// --- MAIN COMPONENT ---

const FraudScoreProgressBar = ({ fraudScore = 0, riskCategory = 'low', riskFactors = [] }) => {
  const config = useRiskConfig(riskCategory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full p-6 bg-gray-800/50 rounded-xl border border-gray-700 space-y-4"
    >
      <header>
        <div className="flex justify-between items-baseline">
          <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            <ShieldAlert className={`h-5 w-5 ${config.textClass}`} />
            Fraud Score
          </h3>
          <span className={`text-4xl font-bold ${config.textClass}`}>{fraudScore}</span>
        </div>
        <p className={`text-right font-semibold text-sm ${config.textClass}`}>{config.text}</p>
      </header>

      {/* Leverages the redesigned EnhancedProgressBar's 'risk' variant for color logic */}
      <EnhancedProgressBar
        value={fraudScore}
        variant="risk"
        size="md"
        showValueLabel={false}
      />

      {riskFactors?.length > 0 && (
        <div className="pt-3 border-t border-gray-700/50">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Key Risk Factors Detected:
          </h4>
          <motion.div 
            className="space-y-2"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.07 }}
          >
            {riskFactors.map((factor, index) => (
              <RiskFactorItem key={index} factor={factor} />
            ))}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default memo(FraudScoreProgressBar);