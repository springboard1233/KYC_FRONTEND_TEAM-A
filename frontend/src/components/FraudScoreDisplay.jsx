// CHANGELOG: Replaced linear progress bar with an animated SVG risk gauge for a more impactful and intuitive data visualization.
import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle } from 'lucide-react';

// --- CONFIGURATION & STYLING ---

const useRiskConfig = (riskCategory) => {
  return useMemo(() => {
    switch (riskCategory?.toLowerCase()) {
      case 'high':
        return { text: 'High Risk', icon: AlertTriangle, color: 'red', textClass: 'text-red-400', strokeClass: 'stroke-red-500', bg: 'bg-red-500/10' };
      case 'medium':
        return { text: 'Medium Risk', icon: AlertTriangle, color: 'yellow', textClass: 'text-yellow-400', strokeClass: 'stroke-yellow-500', bg: 'bg-yellow-500/10' };
      default:
        return { text: 'Low Risk', icon: Shield, color: 'green', textClass: 'text-green-400', strokeClass: 'stroke-green-500', bg: 'bg-green-500/10' };
    }
  }, [riskCategory]);
};

// --- REUSABLE SUB-COMPONENTS ---

const RiskGauge = memo(({ score = 0, strokeClass }) => {
    const size = 180;
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2;
    const circumference = Math.PI * radius; // Half circle
    const progress = Math.max(0, Math.min(100, score));
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size / 2 }}>
            <svg className="w-full h-full" viewBox={`0 0 ${size} ${size / 2}`}>
                {/* Background Arc */}
                <path
                    d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
                    className="stroke-gray-700"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                />
                {/* Foreground Arc */}
                <motion.path
                    d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
                    className={strokeClass}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                />
            </svg>
        </div>
    );
});

const RiskFactorItem = memo(({ factor }) => (
    <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-start text-sm text-red-300 bg-red-500/10 p-2.5 rounded-md"
    >
        <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-red-400" />
        <span>{factor}</span>
    </motion.div>
));

// --- MAIN COMPONENT ---

const FraudScoreDisplay = ({ analysis }) => {
  if (!analysis) return null;

  const { fraud_score = 0, risk_category = 'low', risk_factors = [] } = analysis;
  const config = useRiskConfig(risk_category);

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700 h-full flex flex-col"
    >
      <h3 className="text-lg font-semibold text-gray-100 flex items-center mb-4">
        <Shield className={`h-5 w-5 mr-2 ${config.textClass}`} />
        Fraud Risk Analysis
      </h3>
      
      <div className="flex flex-col items-center justify-center text-center">
        <RiskGauge score={fraud_score} strokeClass={config.strokeClass} />
        <p className="text-5xl font-bold text-white -mt-8">{fraud_score}<span className="text-3xl text-gray-400">%</span></p>
        <div className={`mt-2 flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${config.bg} ${config.textClass}`}>
            <config.icon className="h-4 w-4" />
            {config.text}
        </div>
      </div>

      {risk_factors.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700 flex-grow">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Key Risk Factors Detected ({risk_factors.length})
          </h4>
          <motion.div 
            className="space-y-2"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1 }}
          >
            {risk_factors.map((factor, index) => (
              <RiskFactorItem key={index} factor={factor} />
            ))}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default memo(FraudScoreDisplay);
