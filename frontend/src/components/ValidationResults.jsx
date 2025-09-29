// CHANGELOG: Redesigned into a high-impact "verdict" card with a clear primary status and organized supporting details.
import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

// --- CONFIGURATION & STYLING ---

const useValidationConfig = (result) => {
    return useMemo(() => {
        if (!result) return null;

        if (!result.valid) {
            return {
                icon: XCircle,
                text: "Validation Failed",
                colorClass: "red",
                bgClass: "bg-red-500/10",
                headerBgClass: "bg-red-500/20",
                borderClass: "border-red-500/30",
            };
        }
        if (result.is_duplicate) {
            return {
                icon: AlertTriangle,
                text: "Duplicate Submission",
                colorClass: "yellow",
                bgClass: "bg-yellow-500/10",
                headerBgClass: "bg-yellow-500/20",
                borderClass: "border-yellow-500/30",
            };
        }
        return {
            icon: CheckCircle,
            text: "Document Validated",
            colorClass: "green",
            bgClass: "bg-green-500/10",
            headerBgClass: "bg-green-500/20",
            borderClass: "border-green-500/30",
        };
    }, [result]);
};


// --- REUSABLE SUB-COMPONENTS ---

const DetailItem = memo(({ icon: Icon, text, type = 'default' }) => {
    const colorClass = type === 'error' ? 'text-red-300' : 'text-gray-300';
    const iconColorClass = type === 'error' ? 'text-red-400' : 'text-blue-400';
    return (
        <motion.div 
            variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
            className="flex items-start gap-3"
        >
            <Icon className={`h-4 w-4 mt-1 flex-shrink-0 ${iconColorClass}`} />
            <p className={`text-sm ${colorClass}`}>{text}</p>
        </motion.div>
    );
});


// --- MAIN COMPONENT ---

const ValidationResults = ({ validationResult }) => {
  const config = useValidationConfig(validationResult);

  if (!config) {
    return (
      <div className="text-center p-8 text-gray-400 bg-gray-800/50 rounded-xl border border-gray-700">
        Validation results are not yet available.
      </div>
    );
  }

  const { valid, error, is_duplicate, duplicate_message, fraud_score, risk_factors } = validationResult;
  const { icon: StatusIcon, text: statusText, colorClass, headerBgClass, borderClass } = config;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-xl shadow-xl border ${borderClass} overflow-hidden`}
    >
      <div className={`p-6 flex flex-col items-center justify-center text-center ${headerBgClass}`}>
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 150 }}>
          <StatusIcon className={`h-16 w-16 text-${colorClass}-400`} />
        </motion.div>
        <h2 className={`text-2xl font-bold text-white mt-4`}>{statusText}</h2>
      </div>

      <div className="p-6 bg-gray-800/50">
        <h3 className="font-semibold text-gray-200 mb-3">Key Findings</h3>
        <motion.div 
            className="space-y-3"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1 }}
        >
          {!valid && error && (
            <DetailItem icon={AlertTriangle} text={error} type="error" />
          )}
          {is_duplicate && (
            <DetailItem icon={Info} text={duplicate_message || "This document has already been processed."} />
          )}
          {fraud_score !== undefined && (
            <DetailItem icon={ShieldAlert} text={`AI detected a fraud risk score of ${fraud_score}%.`} />
          )}
          {risk_factors?.length > 0 && (
            <DetailItem icon={AlertTriangle} text={`Risk factors include: ${risk_factors.join(', ')}.`} type="error" />
          )}
          {valid && !is_duplicate && (
             <DetailItem icon={CheckCircle} text="The document passed all primary validation checks." />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default memo(ValidationResults);


