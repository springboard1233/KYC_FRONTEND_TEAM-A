// CHANGELOG: Re-engineered with variants, sizing options, accessibility (ARIA), and animated value labels for enhanced reusability.
import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

// --- CONFIGURATION & STYLING ---

const useProgressBarConfig = (value, variant) => {
  return useMemo(() => {
    const clampedValue = Math.max(0, Math.min(100, value));

    if (variant === 'risk') {
      if (clampedValue >= 70) return { color: 'bg-red-500', textColor: 'text-red-100' };
      if (clampedValue >= 35) return { color: 'bg-yellow-500', textColor: 'text-yellow-100' };
      return { color: 'bg-green-500', textColor: 'text-green-100' };
    }
    
    // Default 'completion' variant
    return { color: 'bg-blue-500', textColor: 'text-blue-100' };
  }, [value, variant]);
};

const sizeClasses = {
  sm: { bar: 'h-2', label: 'text-xs' },
  md: { bar: 'h-4', label: 'text-sm' },
  lg: { bar: 'h-6', label: 'text-base' },
};

// --- MAIN COMPONENT ---

const EnhancedProgressBar = ({ 
  value = 0, 
  label = '', 
  variant = 'completion', // 'completion' or 'risk'
  size = 'md', // 'sm', 'md', 'lg'
  showValueLabel = true
}) => {
  const { color, textColor } = useProgressBarConfig(value, variant);
  const { bar: barHeight, label: labelSize } = sizeClasses[size] || sizeClasses.md;
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className="w-full"
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={label || 'Progress'}
    >
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-200">{label}</span>
        </div>
      )}

      <div className={`w-full bg-gray-700 rounded-full ${barHeight} relative overflow-hidden`}>
        <motion.div
          className={`h-full rounded-full ${color} flex items-center justify-end px-2`}
          initial={{ width: '0%' }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {showValueLabel && (
            <motion.span 
              className={`font-bold ${labelSize} ${textColor} absolute`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {clampedValue}%
            </motion.span>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default memo(EnhancedProgressBar);


