// components/AdvancedFraudAnalysis.jsx
import React, { useState } from 'react';
import { 
  Shield, AlertTriangle, Eye, Brain, Zap, Clock, 
  CheckCircle, XCircle, AlertCircle, Camera, Cpu,
  Target, Activity, FileSearch, Lock
} from 'lucide-react';

const AdvancedFraudAnalysis = ({ advancedAnalysis }) => {
  const [activeTab, setActiveTab] = useState('authenticity');

  if (!advancedAnalysis) return null;

  const { 
    document_authenticity, 
    behavioral_analysis, 
    overall_risk_assessment,
    recommendations 
  } = advancedAnalysis;

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical':
        return 'text-red-800 bg-red-100 border-red-200';
      case 'high':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-700 bg-green-50 border-green-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-6 w-6 text-white mr-3" />
            <div>
              <h3 className="text-lg font-bold text-white">AI-Powered Fraud Analysis</h3>
              <p className="text-purple-100 text-sm">Advanced document authenticity & behavioral analysis</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-bold ${getRiskColor(overall_risk_assessment?.risk_level)}`}>
            {overall_risk_assessment?.risk_level?.toUpperCase()} RISK
          </div>
        </div>
      </div>

      {/* Overall Risk Score */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(overall_risk_assessment?.overall_risk_score || 0)}`}>
              {overall_risk_assessment?.overall_risk_score || 0}%
            </div>
            <div className="text-sm text-gray-600">Overall Risk Score</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(document_authenticity?.authenticity_score || 0)}`}>
              {document_authenticity?.authenticity_score || 0}%
            </div>
            <div className="text-sm text-gray-600">Document Authenticity</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(100 - (behavioral_analysis?.risk_score || 0))}`}>
              {100 - (behavioral_analysis?.risk_score || 0)}%
            </div>
            <div className="text-sm text-gray-600">Behavioral Score</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          {[
            { id: 'authenticity', name: 'Document Authenticity', icon: FileSearch },
            { id: 'behavior', name: 'Behavioral Analysis', icon: Activity },
            { id: 'recommendations', name: 'Recommendations', icon: Target }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Document Authenticity Tab */}
        {activeTab === 'authenticity' && (
          <div className="space-y-6">
            {/* Authenticity Score */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-800 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Document Authenticity Analysis
                </h4>
                <span className={`text-2xl font-bold ${getScoreColor(document_authenticity?.authenticity_score || 0)}`}>
                  {document_authenticity?.authenticity_score || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    (document_authenticity?.authenticity_score || 0) >= 80 ? 'bg-green-500' :
                    (document_authenticity?.authenticity_score || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${document_authenticity?.authenticity_score || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Security Features */}
            {document_authenticity?.security_features_detected && document_authenticity.security_features_detected.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Security Features Detected
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {document_authenticity.security_features_detected.map((feature, index) => (
                    <div key={index} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-800">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fraud Indicators */}
            {document_authenticity?.fraud_indicators && document_authenticity.fraud_indicators.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Fraud Indicators
                </h4>
                <div className="space-y-2">
                  {document_authenticity.fraud_indicators.map((indicator, index) => (
                    <div key={index} className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
                      <XCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                      <span className="text-sm text-red-800">{indicator}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata Anomalies */}
            {document_authenticity?.metadata_anomalies && document_authenticity.metadata_anomalies.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Metadata Anomalies
                </h4>
                <div className="space-y-2">
                  {document_authenticity.metadata_anomalies.map((anomaly, index) => (
                    <div key={index} className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                      <span className="text-sm text-yellow-800">{anomaly}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Manipulation Detection */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">Digital Manipulation Detection</span>
                {document_authenticity?.image_manipulation_detected ? (
                  <div className="flex items-center text-red-600">
                    <XCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Detected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Clean</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Behavioral Analysis Tab */}
        {activeTab === 'behavior' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-800 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  User Behavior Analysis
                </h4>
                <span className={`text-2xl font-bold ${getScoreColor(100 - (behavioral_analysis?.risk_score || 0))}`}>
                  {behavioral_analysis?.risk_score || 0}% Risk
                </span>
              </div>
            </div>

            {/* Session Analysis */}
            {behavioral_analysis?.session_analysis && (
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Session Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(behavioral_analysis.session_analysis).map(([key, value]) => (
                    <div key={key} className="p-3 border border-gray-200 rounded-lg">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        {key.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-gray-800">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Behavior Flags */}
            {behavioral_analysis?.behavior_flags && behavioral_analysis.behavior_flags.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Behavioral Red Flags</h4>
                <div className="space-y-2">
                  {behavioral_analysis.behavior_flags.map((flag, index) => (
                    <div key={index} className="flex items-start p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mr-2 mt-0.5" />
                      <span className="text-sm text-orange-800">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-800 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                AI-Generated Recommendations
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Based on comprehensive fraud analysis and risk assessment
              </p>
            </div>

            {recommendations && recommendations.length > 0 && (
              <div className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm text-blue-800 font-medium">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Risk Level Summary */}
            <div className="p-4 border rounded-lg">
              <h5 className="font-bold text-gray-800 mb-2">Risk Assessment Summary</h5>
              <div className={`p-3 rounded-lg ${getRiskColor(overall_risk_assessment?.risk_level)}`}>
                <div className="font-medium">
                  Overall Risk: {overall_risk_assessment?.risk_level?.toUpperCase()}
                </div>
                <div className="text-sm mt-1">
                  Confidence: {((overall_risk_assessment?.confidence || 0) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFraudAnalysis;
