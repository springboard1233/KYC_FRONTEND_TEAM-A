// components/ValidationResults.jsx
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, TrendingUp, Shield } from 'lucide-react';

const ValidationResults = ({ validation, extractionResult }) => {
  if (!validation) return null;

  const { is_valid, validation_score, errors, warnings, status } = validation;

  const getStatusIcon = () => {
    if (is_valid) return <CheckCircle className="h-6 w-6 text-green-600" />;
    return <XCircle className="h-6 w-6 text-red-600" />;
  };

  const getScoreColor = () => {
    if (validation_score >= 80) return 'text-green-600';
    if (validation_score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = () => {
    if (validation_score >= 80) return 'bg-green-500';
    if (validation_score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBorderColor = () => {
    if (is_valid) return 'border-green-200 bg-green-50';
    return 'border-red-200 bg-red-50';
  };

  return (
    <div className={`rounded-xl border-2 p-6 ${getBorderColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Document Validation
            </h3>
            <p className={`text-sm font-medium ${is_valid ? 'text-green-600' : 'text-red-600'}`}>
              Status: {status?.toUpperCase() || 'UNKNOWN'}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-bold ${getScoreColor()}`}>
            {validation_score || 0}%
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            Validation Score
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Validation Progress</span>
          <span className={`font-medium ${getScoreColor()}`}>
            {validation_score || 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getScoreBg()}`}
            style={{ width: `${validation_score || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Errors */}
      {errors && errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="flex items-center text-sm font-bold text-red-800 mb-2">
            <XCircle className="h-4 w-4 mr-2" />
            Validation Errors ({errors.length})
          </h4>
          <ul className="space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700 flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="flex items-center text-sm font-bold text-yellow-800 mb-2">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Warnings ({warnings.length})
          </h4>
          <ul className="space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="text-sm text-yellow-700 flex items-start">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Document Details */}
      {extractionResult && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
          <h5 className="font-bold text-gray-800 mb-2 capitalize">
            {extractionResult.document_type} Document Details
          </h5>
          <div className="text-sm text-gray-600">
            {extractionResult.document_type === 'aadhaar' && extractionResult.extracted_fields?.aadhaar_number && (
              <p><span className="font-medium">Aadhaar Number:</span> {extractionResult.extracted_fields.aadhaar_number}</p>
            )}
            {extractionResult.document_type === 'pan' && extractionResult.extracted_fields?.pan_number && (
              <p><span className="font-medium">PAN Number:</span> {extractionResult.extracted_fields.pan_number}</p>
            )}
            <p><span className="font-medium">Extraction Confidence:</span> {extractionResult.confidence_score}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationResults;
