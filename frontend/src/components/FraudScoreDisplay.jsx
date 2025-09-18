// components/FraudScoreDisplay.jsx
import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, TrendingUp, AlertCircle } from 'lucide-react';

const FraudScoreDisplay = ({ fraudAnalysis }) => {
  if (!fraudAnalysis) return null;

  const { 
    fraud_score, 
    risk_category, 
    risk_color, 
    risk_factors, 
    duplicate_detected, 
    tampering_detected,
    scoring_details 
  } = fraudAnalysis;

  const getRiskIcon = () => {
    switch (risk_category) {
      case 'High':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'Medium':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      default:
        return <CheckCircle className="h-6 w-6 text-green-600" />;
    }
  };

  const getRiskBgColor = () => {
    switch (risk_category) {
      case 'High':
        return 'border-red-200 bg-red-50';
      case 'Medium':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-green-200 bg-green-50';
    }
  };

  const getScoreBarColor = () => {
    switch (risk_category) {
      case 'High':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const getRiskBadgeColor = () => {
    switch (risk_category) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${getRiskBgColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getRiskIcon()}
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Fraud Risk Analysis
            </h3>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBadgeColor()}`}>
                {risk_category} Risk
              </span>
              {duplicate_detected && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Duplicate
                </span>
              )}
              {tampering_detected && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Tampering
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-3xl font-bold ${
            risk_category === 'High' ? 'text-red-600' :
            risk_category === 'Medium' ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {fraud_score || 0}%
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            Risk Score
          </div>
        </div>
      </div>

      {/* Risk Score Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Fraud Risk Level</span>
          <span className={`font-medium ${
            risk_category === 'High' ? 'text-red-600' :
            risk_category === 'Medium' ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {fraud_score || 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${getScoreBarColor()}`}
            style={{ width: `${fraud_score || 0}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0% (Safe)</span>
          <span>100% (High Risk)</span>
        </div>
      </div>

      {/* Risk Factors */}
      {risk_factors && risk_factors.length > 0 && (
        <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
          <h4 className="flex items-center text-sm font-bold text-red-800 mb-2">
            <AlertCircle className="h-4 w-4 mr-2" />
            Risk Factors Detected ({risk_factors.length})
          </h4>
          <ul className="space-y-1">
            {risk_factors.map((factor, index) => (
              <li key={index} className="text-sm text-red-700 flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Scoring Breakdown */}
      {scoring_details && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
          <h5 className="font-bold text-gray-800 mb-3">Scoring Breakdown</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-700">Validation Issues</div>
              <div className="text-lg font-bold text-red-600">
                {scoring_details.validation_penalty || 0}%
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-700">Suspicious Patterns</div>
              <div className="text-lg font-bold text-yellow-600">
                {scoring_details.suspicious_patterns || 0}%
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-700">Data Inconsistencies</div>
              <div className="text-lg font-bold text-orange-600">
                {scoring_details.data_inconsistencies || 0}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Category Description */}
      <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
        <h5 className="font-bold text-gray-800 mb-2">Risk Assessment</h5>
        <p className="text-sm text-gray-600">
          {risk_category === 'High' && 
            "⚠️ High fraud risk detected. This document requires manual review and additional verification before processing."
          }
          {risk_category === 'Medium' && 
            "⚡ Medium fraud risk detected. Some suspicious patterns found. Consider additional verification steps."
          }
          {risk_category === 'Low' && 
            "✅ Low fraud risk. Document appears legitimate with minimal suspicious indicators."
          }
        </p>
      </div>
    </div>
  );
};

export default FraudScoreDisplay;
