// CHANGELOG: Redesigned with a modern, component-based architecture, featuring animated score donuts and enhanced UI clarity.
import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Brain, Target, Activity, FileSearch, Lock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// --- STYLING UTILITIES & CONSTANTS ---

const getRiskStyles = (riskLevel) => {
  switch (riskLevel?.toLowerCase()) {
    case 'critical': return { text: 'text-red-800', bg: 'bg-red-100', border: 'border-red-200' };
    case 'high': return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
    case 'medium': return { text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    case 'low': return { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' };
    default: return { text: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200' };
  }
};

const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
};

const TABS = [
  { id: 'authenticity', name: 'Document Authenticity', icon: FileSearch },
  { id: 'behavior', name: 'Behavioral Analysis', icon: Activity },
  { id: 'recommendations', name: 'Recommendations', icon: Target }
];

// --- REUSABLE SUB-COMPONENTS ---

const ScoreDonut = memo(({ score, title, size = 100, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
          <circle className="text-gray-200" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size/2} cy={size/2} />
          <motion.circle
            className={getScoreColor(score)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size/2}
            cy={size/2}
            transform={`rotate(-90 ${size/2} ${size/2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
    </div>
  );
});

const FindingItem = memo(({ icon: Icon, text, type }) => {
    const styles = {
        success: { icon: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
        warning: { icon: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
        danger: { icon: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' }
    };
    const style = styles[type] || styles.warning;
    return (
        <div className={`flex items-start p-3 ${style.bg} border ${style.border} rounded-lg`}>
            <Icon className={`h-5 w-5 ${style.icon} mr-3 mt-0.5 flex-shrink-0`} />
            <span className={`text-sm ${style.text}`}>{text}</span>
        </div>
    );
});

const Section = memo(({ title, icon: Icon, children }) => (
    <div>
        <h4 className="font-bold text-gray-800 mb-3 flex items-center">
            <Icon className="h-5 w-5 mr-2 text-gray-500" />
            {title}
        </h4>
        <div className="space-y-3">{children}</div>
    </div>
));

// --- TAB PANEL COMPONENTS ---

const AuthenticityPanel = memo(({ data }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
        {data.security_features_detected?.length > 0 && (
            <Section title="Security Features Detected" icon={Lock}>
                {data.security_features_detected.map((feature, i) => <FindingItem key={i} icon={CheckCircle} text={feature} type="success" />)}
            </Section>
        )}
        {data.fraud_indicators?.length > 0 && (
            <Section title="Fraud Indicators" icon={AlertTriangle}>
                {data.fraud_indicators.map((indicator, i) => <FindingItem key={i} icon={XCircle} text={indicator} type="danger" />)}
            </Section>
        )}
        {data.metadata_anomalies?.length > 0 && (
            <Section title="Metadata Anomalies" icon={AlertCircle}>
                {data.metadata_anomalies.map((anomaly, i) => <FindingItem key={i} icon={AlertCircle} text={anomaly} type="warning" />)}
            </Section>
        )}
    </motion.div>
));

const BehaviorPanel = memo(({ data }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
        {data.session_analysis && (
             <Section title="Session Analysis" icon={Activity}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(data.session_analysis).map(([key, value]) => (
                        <div key={key} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{key.replace(/_/g, ' ')}</div>
                            <div className="text-sm font-semibold text-gray-800">{value}</div>
                        </div>
                    ))}
                </div>
            </Section>
        )}
        {data.behavior_flags?.length > 0 && (
             <Section title="Behavioral Red Flags" icon={AlertTriangle}>
                {data.behavior_flags.map((flag, i) => <FindingItem key={i} icon={AlertTriangle} text={flag} type="warning" />)}
             </Section>
        )}
    </motion.div>
));

const RecommendationsPanel = memo(({ data, overallRisk }) => {
    const riskStyles = getRiskStyles(overallRisk?.risk_level);
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <h4 className="font-bold text-gray-800 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    AI-Generated Recommendations
                </h4>
                <p className="text-sm text-gray-600 mt-1">Based on comprehensive analysis and risk assessment.</p>
            </div>
            <div className="space-y-3">
                {data.map((rec, i) => (
                    <div key={i} className="flex items-start p-4 border border-gray-200 bg-white rounded-lg shadow-sm">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-4 mt-0.5">{i + 1}</div>
                        <p className="text-sm text-gray-700 font-medium">{rec}</p>
                    </div>
                ))}
            </div>
            <div className={`p-4 rounded-lg ${riskStyles.bg} border ${riskStyles.border}`}>
                <div className={`font-bold ${riskStyles.text}`}>Overall Risk: {overallRisk?.risk_level?.toUpperCase()}</div>
                <p className={`text-sm mt-1 ${riskStyles.text}`}>Confidence: {((overallRisk?.confidence || 0) * 100).toFixed(0)}%</p>
            </div>
        </motion.div>
    );
});


// --- MAIN COMPONENT ---

const AdvancedFraudAnalysis = ({ advancedAnalysis }) => {
  const [activeTab, setActiveTab] = useState('authenticity');

  const { 
    document_authenticity, 
    behavioral_analysis, 
    overall_risk_assessment,
    recommendations 
  } = advancedAnalysis || {};

  const riskStyles = useMemo(() => getRiskStyles(overall_risk_assessment?.risk_level), [overall_risk_assessment]);

  if (!advancedAnalysis) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden font-sans">
      <header className="bg-gradient-to-r from-gray-700 via-gray-800 to-black px-6 py-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Brain className="h-7 w-7 text-blue-300" />
                <div>
                    <h3 className="text-lg font-bold text-white">Advanced Fraud Analysis</h3>
                    <p className="text-gray-300 text-sm">AI-Powered Document & Behavior Insights</p>
                </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${riskStyles.bg} ${riskStyles.text} border ${riskStyles.border}`}>
                {overall_risk_assessment?.risk_level?.toUpperCase()} RISK
            </div>
        </div>
      </header>
      
      <div className="p-6 border-b border-gray-200 bg-gray-50/50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <ScoreDonut score={overall_risk_assessment?.overall_risk_score || 0} title="Overall Risk Score" />
          <ScoreDonut score={document_authenticity?.authenticity_score || 0} title="Doc Authenticity" />
          <ScoreDonut score={100 - (behavioral_analysis?.risk_score || 0)} title="Behavioral Score" />
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" role="tablist" aria-label="Fraud Analysis Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 bg-gray-50/30">
        <AnimatePresence mode="wait">
          <div key={activeTab} id={`panel-${activeTab}`} role="tabpanel" tabIndex={0} aria-labelledby={`tab-${activeTab}`}>
            {activeTab === 'authenticity' && <AuthenticityPanel data={document_authenticity} />}
            {activeTab === 'behavior' && <BehaviorPanel data={behavioral_analysis} />}
            {activeTab === 'recommendations' && <RecommendationsPanel data={recommendations} overallRisk={overall_risk_assessment} />}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdvancedFraudAnalysis;


