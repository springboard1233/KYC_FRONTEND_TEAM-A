import React, { useState, useEffect, useCallback } from 'react'
import { 
  Upload, FileText, BarChart3, Users, TrendingUp, AlertTriangle, 
  CheckCircle, XCircle, Eye, Home, Shield, Activity, User, 
  Loader, Plus, Download, Search, Filter, Calendar, Flag,
  AlertCircle, Cpu, CreditCard, RefreshCw, Settings, LogOut,
  Bell, Menu, X, ChevronDown, ArrowUp, ArrowDown, Info,
  Lock, Unlock, Database, Zap, Target, Award, Globe,
  PieChart, LineChart, TrendingDown, Brain, Scan, Microscope,
  UserCheck, FileCheck, ShieldCheck, Layers, GitBranch,
  BarChart, Monitor, Server, Clock, CheckSquare, XSquare, Save, Trash2,
  Send // New icon for submit
} from 'lucide-react'

// --- Import modular chart components ---
import DocumentStatusChart from '../Charts/DocumentStatusChart'
import DocumentTypesChart from '../Charts/DocumentTypesChart'
import FraudTrendsChart from '../Charts/FraudTrendsChart'
import RiskCategoriesChart from '../Charts/RiskCategoriesChart'

// ================================
// 🤖 AI NAME MATCHING DISPLAY COMPONENT
// ================================
const AINameMatchingDisplay = ({ nameMatchingResult, extractedFields, userEnteredName }) => {
  if (!nameMatchingResult || !nameMatchingResult.similarity_score) return null;

  const getMatchIcon = () => {
    switch (nameMatchingResult.match_type) {
      case 'exact_match':
      case 'high_similarity':
        return <CheckCircle className="h-6 w-6 text-green-400" />;
      case 'acceptable_match':
        return <AlertTriangle className="h-6 w-6 text-yellow-400" />;
      default:
        return <XCircle className="h-6 w-6 text-red-400" />;
    }
  };

  const getMatchColor = () => {
    switch (nameMatchingResult.match_type) {
      case 'exact_match':
      case 'high_similarity':
        return 'border-green-500/30 bg-green-500/5';
      case 'acceptable_match':
        return 'border-yellow-500/30 bg-yellow-500/5';
      default:
        return 'border-red-500/30 bg-red-500/5';
    }
  };

  const getConfidenceColor = () => {
    const confidence = nameMatchingResult.confidence_level;
    switch (confidence) {
      case 'very_high': return 'text-green-400';
      case 'high': return 'text-green-300';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-orange-400';
      default: return 'text-red-400';
    }
  };

  return (
    <div className={`rounded-2xl shadow-2xl border p-6 backdrop-blur-xl ${getMatchColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-100 flex items-center">
          <Brain className="h-6 w-6 mr-2 text-blue-400" />
          🤖 AI Name Verification
        </h3>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            {getMatchIcon()}
            <span className="text-2xl font-bold text-gray-100">
              {nameMatchingResult.similarity_score}%
            </span>
          </div>
          <p className="text-sm text-gray-400">Match Score</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Name Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-600 rounded-lg p-4 hover:bg-gray-700/30 transition-all">
            <div className="flex items-center mb-2">
              <FileText className="h-4 w-4 mr-2 text-blue-400" />
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Document Name (Extracted)
              </div>
            </div>
            <div className="text-lg text-gray-200 font-medium">
              {extractedFields?.name || 'Not extracted'}
            </div>
          </div>
          <div className="border border-gray-600 rounded-lg p-4 hover:bg-gray-700/30 transition-all">
            <div className="flex items-center mb-2">
              <UserCheck className="h-4 w-4 mr-2 text-green-400" />
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                User Entered Name
              </div>
            </div>
            <div className="text-lg text-gray-200 font-medium">
              {userEnteredName || 'Not provided'}
            </div>
          </div>
        </div>

        {/* AI Analysis Details */}
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="font-medium text-gray-200 mb-3 flex items-center">
            <Activity className="h-4 w-4 mr-2 text-blue-400" />
            AI Match Analysis
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Confidence Level:</span>
              <span className={`text-sm font-bold ${getConfidenceColor()}`}>
                {nameMatchingResult.confidence_level?.toUpperCase()}
              </span>
            </div>
            
            <div className="text-sm text-gray-400">
              <strong>AI Reasoning:</strong> {nameMatchingResult.reason}
            </div>

            <div className="text-sm text-gray-400">
              <strong>Recommendation:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                nameMatchingResult.recommendation === 'auto_approve' ? 'bg-green-500/20 text-green-300' :
                nameMatchingResult.recommendation === 'approve' ? 'bg-green-500/10 text-green-400' :
                nameMatchingResult.recommendation === 'conditional_approve' ? 'bg-yellow-500/20 text-yellow-300' :
                nameMatchingResult.recommendation === 'manual_review' ? 'bg-orange-500/20 text-orange-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {nameMatchingResult.recommendation?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
          
          {/* AI Insights */}
          {nameMatchingResult.ai_insights && nameMatchingResult.ai_insights.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-300 mb-2">🧠 AI Insights:</h5>
              <div className="space-y-1">
                {nameMatchingResult.ai_insights.map((insight, idx) => (
                  <div key={idx} className="text-xs text-gray-400 flex items-start">
                    <div className="w-1 h-1 rounded-full bg-blue-400 mt-2 mr-2 flex-shrink-0"></div>
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Detailed Scores */}
          {nameMatchingResult.detailed_analysis && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-300 mb-3">Detailed Analysis Scores:</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(nameMatchingResult.detailed_analysis).map(([key, value]) => (
                  <div key={key} className="text-center p-2 bg-gray-700/50 rounded hover:bg-gray-700/70 transition-all">
                    <div className="text-xs font-medium text-gray-300 capitalize">
                      {key.replace('_', ' ')}
                    </div>
                    <div className="text-blue-400 font-bold text-sm">
                      {typeof value === 'boolean' ? (value ? '✓' : '✗') : `${value}${typeof value === 'number' ? '%' : ''}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Final Result */}
        <div className={`p-4 rounded-lg border ${
          nameMatchingResult.is_match 
            ? 'bg-green-900/30 border-green-500/30' 
            : 'bg-red-900/30 border-red-500/30'
        }`}>
          <div className="flex items-center">
            {nameMatchingResult.is_match ? (
              <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400 mr-3" />
            )}
            <div>
              <div className={`font-medium ${
                nameMatchingResult.is_match ? 'text-green-300' : 'text-red-300'
              }`}>
                {nameMatchingResult.is_match 
                  ? '✅ AI Name Verification: MATCH CONFIRMED' 
                  : '❌ AI Name Verification: NO MATCH'
                }
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Match Type: {nameMatchingResult.match_type?.replace('_', ' ')} • 
                Confidence: {nameMatchingResult.confidence_level}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================================
// 🔍 DOCUMENT MANIPULATION DETECTION DISPLAY
// ================================
const DocumentManipulationDisplay = ({ manipulationResult }) => {
  if (!manipulationResult) return null;

  const getRiskColor = () => {
    switch (manipulationResult.risk_level) {
      case 'high': return 'border-red-500/30 bg-red-500/5';
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'low': return 'border-green-500/30 bg-green-500/5';
      default: return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  const getRiskIcon = () => {
    switch (manipulationResult.risk_level) {
      case 'high': return <AlertTriangle className="h-6 w-6 text-red-400" />;
      case 'medium': return <AlertCircle className="h-6 w-6 text-yellow-400" />;
      case 'low': return <CheckCircle className="h-6 w-6 text-green-400" />;
      default: return <Info className="h-6 w-6 text-gray-400" />;
    }
  };

  return (
    <div className={`rounded-2xl shadow-2xl border p-6 backdrop-blur-xl ${getRiskColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-100 flex items-center">
          <Microscope className="h-6 w-6 mr-2 text-purple-400" />
          🔍 Document Authenticity Analysis
        </h3>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            {getRiskIcon()}
            <span className="text-2xl font-bold text-gray-100">
              {manipulationResult.manipulation_score}%
            </span>
          </div>
          <p className="text-sm text-gray-400">Risk Score</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Risk Level Indicator */}
        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-400" />
            <span className="text-gray-300">Document Integrity:</span>
          </div>
          <div className="flex items-center">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              manipulationResult.risk_level === 'low' ? 'bg-green-500/20 text-green-300' :
              manipulationResult.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-red-500/20 text-red-300'
            }`}>
              {manipulationResult.risk_level?.toUpperCase()} RISK
            </span>
            <span className="ml-2 text-sm text-gray-400">
              ({manipulationResult.confidence}% confidence)
            </span>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300 flex items-center">
              <Scan className="h-4 w-4 mr-2 text-green-400" />
              Manipulation Detection
            </h4>
            <div className={`p-3 rounded border ${
              manipulationResult.manipulation_detected 
                ? 'border-red-500/30 bg-red-500/10' 
                : 'border-green-500/30 bg-green-500/10'
            }`}>
              <div className="flex items-center">
                {manipulationResult.manipulation_detected ? (
                  <XCircle className="h-4 w-4 text-red-400 mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                )}
                <span className={`font-medium ${
                  manipulationResult.manipulation_detected ? 'text-red-300' : 'text-green-300'
                }`}>
                  {manipulationResult.manipulation_detected 
                    ? 'Potential Manipulation Detected' 
                    : 'No Manipulation Detected'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300 flex items-center">
              <BarChart className="h-4 w-4 mr-2 text-blue-400" />
              Risk Assessment
            </h4>
            <div className="p-3 rounded border border-gray-600 bg-gray-700/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Risk Level:</span>
                <span className="text-sm font-bold text-gray-200">
                  {manipulationResult.risk_level?.toUpperCase()}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    manipulationResult.risk_level === 'low' ? 'bg-green-400' :
                    manipulationResult.risk_level === 'medium' ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`}
                  style={{ width: `${manipulationResult.manipulation_score}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Detected Issues */}
        {manipulationResult.detected_issues && manipulationResult.detected_issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-orange-400" />
              Analysis Findings ({manipulationResult.detected_issues.length})
            </h4>
            <div className="space-y-1">
              {manipulationResult.detected_issues.map((issue, idx) => (
                <div key={idx} className="flex items-start p-2 bg-gray-800/50 rounded text-sm">
                  <div className="w-1 h-1 rounded-full bg-orange-400 mt-2 mr-2 flex-shrink-0"></div>
                  <span className="text-gray-300">{issue}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Details */}
        {manipulationResult.technical_details && (
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Monitor className="h-4 w-4 mr-2 text-gray-400" />
              Technical Analysis Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
              {manipulationResult.technical_details.image_dimensions && (
                <div>
                  <span className="font-medium">Image Size:</span> {manipulationResult.technical_details.image_dimensions}
                </div>
              )}
              {manipulationResult.technical_details.analysis_methods && (
                <div className="md:col-span-2">
                  <span className="font-medium">Analysis Methods:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {manipulationResult.technical_details.analysis_methods.map((method, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-700/50 rounded text-xs">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ================================
// 📊 ENHANCED PROGRESS BARS COMPONENT
// ================================
const EnhancedProgressBar = ({ label, value, maxValue = 100, color = 'blue', showPercentage = true, animated = true, size = 'medium', showLabel = true }) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  const getColorClasses = () => {
    switch (color) {
      case 'green': return 'from-green-500 to-green-600';
      case 'yellow': return 'from-yellow-500 to-yellow-600';
      case 'red': return 'from-red-500 to-red-600';
      case 'purple': return 'from-purple-500 to-purple-600';
      case 'orange': return 'from-orange-500 to-orange-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'h-2';
      case 'large': return 'h-6';
      default: return 'h-4';
    }
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">{label}</span>
          {showPercentage && (
            <span className="text-sm font-bold text-gray-100">
              {typeof value === 'number' ? `${Math.round(percentage)}%` : value}
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-700 rounded-full ${getSizeClasses()} overflow-hidden shadow-inner relative`}>
        <div 
          className={`${getSizeClasses()} bg-gradient-to-r ${getColorClasses()} rounded-full transition-all duration-1000 ease-out ${
            animated ? 'animate-pulse' : ''
          } shadow-lg relative`}
          style={{ width: `${percentage}%` }}
        >
          {size === 'large' && (
            <div className="h-full flex items-center justify-center text-xs font-bold text-white">
              {Math.round(percentage)}%
            </div>
          )}
          
          {/* Shimmer effect for animation */}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          )}
        </div>
      </div>
      
      {size !== 'small' && showLabel && (
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      )}
    </div>
  );
};

// Fraud Score Progress Bar with Enhanced Risk Categories
const FraudScoreProgressBar = ({ fraudScore, riskCategory, riskFactors, animated = true }) => {
  const getProgressColor = () => {
    if (fraudScore >= 70) return 'red';
    if (fraudScore >= 40) return 'orange';
    if (fraudScore >= 20) return 'yellow';
    return 'green';
  };

  const getRiskIcon = () => {
    if (fraudScore >= 70) return <AlertTriangle className="h-6 w-6 text-red-400" />;
    if (fraudScore >= 40) return <AlertCircle className="h-6 w-6 text-orange-400" />;
    if (fraudScore >= 20) return <Info className="h-6 w-6 text-yellow-400" />;
    return <CheckCircle className="h-6 w-6 text-green-400" />;
  };

  const getRiskBadgeColor = () => {
    switch (riskCategory) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-gray-600 bg-gray-800/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getRiskIcon()}
          <div>
            <h3 className="text-xl font-bold text-gray-100">Fraud Risk Analysis</h3>
            <p className="text-sm text-gray-400">AI-powered risk assessment</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-100">{fraudScore?.toFixed(1) || 0}%</div>
          <div className={`text-sm px-2 py-1 rounded border font-medium ${getRiskBadgeColor()}`}>
            {riskCategory?.toUpperCase() || 'UNKNOWN'} RISK
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <EnhancedProgressBar
          label="Overall Fraud Risk Score"
          value={fraudScore || 0}
          color={getProgressColor()}
          animated={animated}
          size="large"
        />
        
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className={`text-center p-3 rounded transition-all ${fraudScore < 20 ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700/70'}`}>
            <div className="font-bold text-lg">0-19%</div>
            <div className="mt-1">Very Low</div>
          </div>
          <div className={`text-center p-3 rounded transition-all ${fraudScore >= 20 && fraudScore < 40 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700/70'}`}>
            <div className="font-bold text-lg">20-39%</div>
            <div className="mt-1">Low Risk</div>
          </div>
          <div className={`text-center p-3 rounded transition-all ${fraudScore >= 40 && fraudScore < 70 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700/70'}`}>
            <div className="font-bold text-lg">40-69%</div>
            <div className="mt-1">Medium Risk</div>
          </div>
          <div className={`text-center p-3 rounded transition-all ${fraudScore >= 70 ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700/70'}`}>
            <div className="font-bold text-lg">70-100%</div>
            <div className="mt-1">High Risk</div>
          </div>
        </div>

        {/* Risk Factors Display */}
        {riskFactors && riskFactors.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Flag className="h-4 w-4 mr-2 text-orange-400" />
              Identified Risk Factors ({riskFactors.length})
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {riskFactors.slice(0, 5).map((factor, idx) => (
                <div key={idx} className="flex items-start p-2 bg-gray-800/30 rounded text-sm">
                  <div className="w-1 h-1 rounded-full bg-orange-400 mt-2 mr-2 flex-shrink-0"></div>
                  <span className="text-gray-300">{factor}</span>
                </div>
              ))}
              {riskFactors.length > 5 && (
                <div className="text-xs text-gray-400 text-center py-1">
                  +{riskFactors.length - 5} more factors
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ================================
// 🏛️ COMPLETE ADMIN PANEL INTERFACE
// ================================
const AdminPanel = ({ adminQueue, adminStats, onReviewDecision, loading, onRefreshQueue }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('fraud_score');

  const handleReviewDecision = async (decision) => {
    if (!selectedRecord) return;
    
    setProcessing(true);
    try {
      await onReviewDecision(selectedRecord.id, decision, reviewNotes);
      setSelectedRecord(null);
      setReviewNotes('');
      if (onRefreshQueue) onRefreshQueue();
    } catch (error) {
      console.error('Review decision error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  // Filter and sort queue
  const filteredQueue = adminQueue?.filter(record => {
    if (filterPriority === 'all') return true;
    return record.priority === filterPriority;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'fraud_score': return (b.fraud_score || 0) - (a.fraud_score || 0);
      case 'created_at': return new Date(b.created_at) - new Date(a.created_at);
      case 'priority': return (b.priority_score || 0) - (a.priority_score || 0);
      default: return 0;
    }
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-400 mx-auto mb-4" />
          <span className="text-gray-400 text-lg">Loading admin queue...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-6 border border-blue-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-100 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-blue-400" />
              Admin Review Panel
            </h2>
            <p className="text-blue-200 mt-1">High-risk document review and fraud analysis</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefreshQueue}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Statistics */}
      {adminStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <Clock className="h-8 w-8 text-orange-400" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-100">{adminStats.total_pending || 0}</div>
                <div className="text-sm text-gray-300 font-medium">Pending Reviews</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="bg-red-500/20 p-3 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-100">{adminStats.critical_pending || 0}</div>
                <div className="text-sm text-gray-300 font-medium">Critical Priority</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-100">{adminStats.approved_count || 0}</div>
                <div className="text-sm text-gray-300 font-medium">Approved</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-400" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-100">{adminStats.approval_rate || 0}%</div>
                <div className="text-sm text-gray-300 font-medium">Approval Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Filters and Controls */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">Filter Priority:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded px-3 py-1"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option> 
                <option value="medium">Medium</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <BarChart className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded px-3 py-1"
              >
                <option value="fraud_score">Fraud Score</option>
                <option value="created_at">Date Submitted</option>
                <option value="priority">Priority Level</option>
              </select>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            {filteredQueue.length} of {adminQueue?.length || 0} documents
          </div>
        </div>
      </div>

      {/* Queue Display */}
      {!filteredQueue || filteredQueue.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700">
          <ShieldCheck className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-100 mb-2">
            {filterPriority === 'all' ? 'No Documents Pending Review' : `No ${filterPriority} priority documents`}
          </h3>
          <p className="text-gray-400">
            {filterPriority === 'all' ? 
              'The review queue is clear!' : 
              'Try adjusting your filters to see more results'
            }
          </p>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-100 flex items-center">
              <AlertTriangle className="h-6 w-6 text-orange-400 mr-3" />
              Review Queue ({filteredQueue.length})
            </h3>
            <div className="text-sm text-gray-400">
              Sorted by {sortBy.replace('_', ' ')}
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredQueue.map((record) => (
              <div 
                key={record.id} 
                className="bg-gray-900/50 rounded-xl p-6 border border-gray-600 hover:border-gray-500 transition-all shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-400" />
                        <h4 className="text-lg font-semibold text-gray-100 capitalize">
                          {record.document_type} Document
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-1 ${getPriorityColor(record.priority)}`}>
                          {getPriorityIcon(record.priority)}
                          <span>{record.priority?.toUpperCase()} PRIORITY</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Submission Details:</p>
                        <p className="text-sm text-gray-300">File: {record.filename}</p>
                        <p className="text-sm text-gray-300">
                          Submitted: {new Date(record.created_at).toLocaleString()}
                        </p>
                        {record.time_pending && (
                          <p className="text-sm text-gray-300">Pending: {record.time_pending}</p>
                        )}
                      </div>
                      
                      {record.submitter && (
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Submitted by:</p>
                          <p className="text-sm text-gray-300">{record.submitter.name}</p>
                          <p className="text-sm text-gray-300">{record.submitter.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-6">
                    <div className="text-3xl font-bold text-red-400 mb-1">
                      {record.fraud_score?.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-gray-400">Fraud Risk</div>
                    <div className={`mt-2 px-2 py-1 rounded text-xs font-bold ${
                      record.risk_category === 'high' ? 'bg-red-500/20 text-red-300' :
                      record.risk_category === 'medium' ? 'bg-orange-500/20 text-orange-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {record.risk_category?.toUpperCase()} RISK
                    </div>
                  </div>
                </div>

                {/* Enhanced Fraud Score Progress */}
                <div className="mb-4">
                  <EnhancedProgressBar 
                    label="Fraud Risk Assessment"
                    value={record.fraud_score || 0}
                    color={record.fraud_score >= 85 ? 'red' : record.fraud_score >= 70 ? 'orange' : 'yellow'}
                    animated={true}
                    size="medium"
                  />
                </div>

                {/* Risk Factors */}
                {record.risk_factors && record.risk_factors.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <Flag className="h-4 w-4 mr-2 text-orange-400" />
                      Risk Factors ({record.risk_factors.length}):
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {record.risk_factors.slice(0, 6).map((factor, idx) => (
                        <div 
                          key={idx} 
                          className="px-3 py-2 bg-red-500/10 text-red-300 text-sm rounded-lg border border-red-500/20 flex items-start"
                        >
                          <div className="w-1 h-1 rounded-full bg-red-400 mt-2 mr-2 flex-shrink-0"></div>
                          {factor}
                        </div>
                      ))}
                      {record.risk_factors.length > 6 && (
                        <div className="text-sm text-gray-400 flex items-center">
                          <Plus className="h-4 w-4 mr-1" />
                          {record.risk_factors.length - 6} more factors
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 min-w-[140px]"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Review Details</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRecord(record);
                      setTimeout(() => handleReviewDecision('approve'), 100);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-medium transition-all flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Quick Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRecord(record);
                      setTimeout(() => handleReviewDecision('reject'), 100);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-medium transition-all flex items-center space-x-2"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Quick Reject</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRecord(record);
                      setTimeout(() => handleReviewDecision('flag'), 100);
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-xl font-medium transition-all flex items-center space-x-2"
                  >
                    <Flag className="h-4 w-4" />
                    <span>Flag</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Review Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-600">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-100 flex items-center">
                    <FileCheck className="h-7 w-7 mr-3 text-blue-400" />
                    Document Review - ID #{selectedRecord.id}
                  </h3>
                  <p className="text-blue-200 mt-1">
                    {selectedRecord.document_type?.toUpperCase()} Document • 
                    Fraud Score: {selectedRecord.fraud_score?.toFixed(1)}% • 
                    {selectedRecord.priority?.toUpperCase()} Priority
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-200 p-2 rounded-lg hover:bg-gray-700/50"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Document Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-100 mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-400" />
                    Document Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">File Name:</span>
                      <span className="text-gray-200">{selectedRecord.filename}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Document Type:</span>
                      <span className="text-gray-200 capitalize">{selectedRecord.document_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Submitted:</span>
                      <span className="text-gray-200">{new Date(selectedRecord.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confidence:</span>
                      <span className="text-gray-200">{selectedRecord.confidence_score?.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-100 mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-green-400" />
                    Submitter Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    {selectedRecord.submitter ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Name:</span>
                          <span className="text-gray-200">{selectedRecord.submitter.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Email:</span>
                          <span className="text-gray-200">{selectedRecord.submitter.email}</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-400">User information not available</span>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">User ID:</span>
                      <span className="text-gray-200">{selectedRecord.user_id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extracted Fields */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-100 mb-3 flex items-center">
                  <Database className="h-5 w-5 mr-2 text-purple-400" />
                  Extracted Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(selectedRecord.extracted_fields || {}).map(([key, value]) => (
                    <div key={key} className="border border-gray-600 rounded-lg p-3 hover:bg-gray-700/30 transition-all">
                      <div className="text-xs font-medium text-gray-400 uppercase mb-1">
                        {key.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-gray-200 font-medium">
                        {value || 'Not available'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analysis Results */}
              {selectedRecord.fraud_analysis && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-100 mb-3 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-blue-400" />
                    AI Analysis Results
                  </h4>
                  
                  {/* Name Matching */}
                  {selectedRecord.fraud_analysis.analysis_details?.name_matching_result && (
                    <AINameMatchingDisplay
                      nameMatchingResult={selectedRecord.fraud_analysis.analysis_details.name_matching_result}
                      extractedFields={selectedRecord.extracted_fields}
                      userEnteredName={selectedRecord.user_entered_name}
                    />
                  )}

                  {/* Document Manipulation */}
                  {selectedRecord.manipulation_result && (
                    <DocumentManipulationDisplay
                      manipulationResult={selectedRecord.manipulation_result}
                    />
                  )}

                  {/* Fraud Score */}
                  <FraudScoreProgressBar
                    fraudScore={selectedRecord.fraud_score}
                    riskCategory={selectedRecord.risk_category}
                    riskFactors={selectedRecord.risk_factors}
                    animated={true}
                  />
                </div>
              )}

              {/* Admin Review Section */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-100 mb-3 flex items-center">
                  <ShieldCheck className="h-5 w-5 mr-2 text-green-400" />
                  Admin Review & Decision
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Review Notes & Comments
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      rows={4}
                      placeholder="Enter your review notes, reasoning for the decision, or any additional comments..."
                    />
                  </div>

                  {/* Decision Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleReviewDecision('approve')}
                      disabled={processing}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                    >
                      {processing ? <Loader className="animate-spin h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                      <div className="text-left">
                        <div className="font-bold">Approve Document</div>
                        <div className="text-xs opacity-75">Mark as valid & safe</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleReviewDecision('reject')}
                      disabled={processing}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                    >
                      {processing ? <Loader className="animate-spin h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      <div className="text-left">
                        <div className="font-bold">Reject Document</div>
                        <div className="text-xs opacity-75">Mark as invalid/fraudulent</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleReviewDecision('flag')}
                      disabled={processing}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                    >
                      {processing ? <Loader className="animate-spin h-5 w-5" /> : <Flag className="h-5 w-5" />}
                      <div className="text-left">
                        <div className="font-bold">Flag for Review</div>
                        <div className="text-xs opacity-75">Requires further investigation</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ================================
// 🎯 FRAUD PATTERNS VISUALIZATION
// ================================
const FraudPatternsVisualization = ({ patterns }) => {
  if (!patterns || !patterns.common_risk_factors) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
          <Brain className="h-5 w-5 mr-2 text-purple-400" />
          Fraud Patterns Analysis
        </h3>
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400">No pattern data available</p>
        </div>
      </div>
    );
  }

  const riskFactors = Object.entries(patterns.common_risk_factors || {}).slice(0, 8);
  const maxCount = Math.max(...Object.values(patterns.common_risk_factors || {}));

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
        <Brain className="h-5 w-5 mr-2 text-purple-400" />
        AI Fraud Patterns Analysis
      </h3>
      
      <div className="space-y-4">
        {/* Common Risk Factors */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Most Common Risk Factors</h4>
          <div className="space-y-2">
            {riskFactors.map(([factor, count]) => (
              <div key={factor} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                <span className="text-gray-300 text-sm">{factor}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manipulation Patterns */}
        {patterns.manipulation_patterns && Object.keys(patterns.manipulation_patterns).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Document Manipulation Patterns</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(patterns.manipulation_patterns).slice(0, 4).map(([pattern, count]) => (
                <div key={pattern} className="bg-gray-900/50 rounded p-2 text-center">
                  <div className="text-orange-400 font-bold">{count}</div>
                  <div className="text-xs text-gray-400">{pattern}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pattern Summary */}
        <div className="pt-4 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-400">Total Patterns</div>
              <div className="text-purple-400 font-bold">{patterns.total_patterns || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Risk Indicators</div>
              <div className="text-orange-400 font-bold">{riskFactors.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================================
// 🏠 MAIN ENHANCED DASHBOARD COMPONENT
// ================================
const Dashboard = () => {
  // ================================
  // STATE MANAGEMENT
  // ================================
  const [currentView, setCurrentView] = useState('overview')
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({})
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Upload states
  const [selectedFile, setSelectedFile] = useState(null)
  const [documentType, setDocumentType] = useState('aadhaar')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [extractionResult, setExtractionResult] = useState(null)
  
  // Enhanced AI features states
  const [userEnteredName, setUserEnteredName] = useState('')
  const [adminQueue, setAdminQueue] = useState([])
  const [adminStats, setAdminStats] = useState({})
  const [fraudPatterns, setFraudPatterns] = useState({})
  const [loadingAdmin, setLoadingAdmin] = useState(false)
  const [fraudTrends, setFraudTrends] = useState({})

  // Authentication states
  const [showLogin, setShowLogin] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  
  // UI states
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  const navigationItems = [
    { id: 'overview', name: 'Dashboard', icon: Home, description: 'Main dashboard overview' },
    { id: 'upload', name: 'AI Upload', icon: Upload, description: 'Upload documents for AI processing' },
    { id: 'records', name: 'Records', icon: FileText, description: 'View all processed documents' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'Fraud trends and analytics' },
    { id: 'admin', name: 'Admin Panel', icon: Shield, description: 'Review high-risk documents', adminOnly: true }
  ]

  // ================================
  // API HELPER FUNCTIONS
  // ================================
  const apiRequest = async (url, options = {}) => {
    try {
      const token = localStorage.getItem('access_token')
      
      if (!token && !url.includes('/signup') && !url.includes('/login') && !url.includes('/health')) {
        console.log('❌ No authentication token found');
        setError('Please login to access dashboard features');
        setShowLogin(true);
        return null;
      }

      const response = await fetch(`http://localhost:5000${url}`, {
        ...options,
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': options.headers?.['Content-Type'] || 'application/json',
          ...options.headers
        }
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ Authentication failed - clearing token');
          localStorage.removeItem('access_token');
          setError('Authentication failed. Please login again.');
          setShowLogin(true);
          return null;
        }
        
        if (response.status === 422) {
          console.log('❌ Request validation failed:', data);
          throw new Error(data.error || 'Request validation failed - please check your authentication');
        }
        
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API Error [${url}]:`, error)
      throw error
    }
  }

  // ================================
  // DATA FETCHING FUNCTIONS
  // ================================
  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('🔒 Please login to access dashboard');
      setLoading(false);
      setShowLogin(true);
      return;
    }

    setLoading(true)
    setError('')
    
    try {
      console.log('🔄 Fetching enhanced dashboard data...');
      
      const [userResponse, statsResponse, recordsResponse] = await Promise.all([
        apiRequest('/api/me'),
        apiRequest('/api/records/stats'),
        apiRequest('/api/records?per_page=10')
      ]);

      if (userResponse) setUser(userResponse.user || userResponse)
      if (statsResponse) setStats(statsResponse.stats || {})
      if (recordsResponse) setRecords(recordsResponse.records || [])
      
      console.log('✅ Enhanced dashboard data loaded successfully');
    } catch (err) {
      console.error('❌ Dashboard loading error:', err)
      setError(`Failed to load dashboard: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAdminData = useCallback(async () => {
    if (!user || user.role !== 'admin') return
    
    setLoadingAdmin(true)
    try {
      const [queueResponse, statsResponse, patternsResponse] = await Promise.all([
        apiRequest('/api/admin/queue'),
        apiRequest('/api/admin/stats'),
        apiRequest('/api/admin/fraud-patterns')
      ])

      setAdminQueue(queueResponse?.queue || [])
      setAdminStats(statsResponse?.stats || {})
      setFraudPatterns(patternsResponse?.patterns || {})
    } catch (err) {
      console.error('Failed to fetch admin data:', err)
    } finally {
      setLoadingAdmin(false)
    }
  }, [user])

  const fetchFraudTrends = useCallback(async () => {
    try {
      const response = await apiRequest('/api/analytics/fraud-trends?days=30')
      setFraudTrends(response?.trends || {})
    } catch (err) {
      console.error('Failed to fetch fraud trends:', err)
    }
  }, [])

  // ================================
  // AUTHENTICATION FUNCTIONS
  // ================================
  const handleLogin = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })
      
      const data = await response.json()
      
      if (response.ok && data.access_token) {
        localStorage.setItem('access_token', data.access_token)
        setShowLogin(false)
        setError('')
        await fetchDashboardData()
        addNotification('Login successful!', 'success')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError(`Login error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
    setShowLogin(true)
    addNotification('Logged out successfully', 'info')
  }

  // ================================
  // UPLOAD & RECORD MANAGEMENT FUNCTIONS
  // ================================

  // ========== 🟢 START: MODIFIED CODE 🟢 ==========
  const handleProcess = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }
    if (!userEnteredName.trim()) {
      setUploadError('Please enter your full name for AI verification');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('doctype', documentType);
      formData.append('user_entered_name', userEnteredName.trim());
      // The 'save_record' flag is no longer sent; the backend handles saving automatically.

      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5000/api/extract', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      if (result.success && result.extraction_result) {
        setExtractionResult(result.extraction_result);
        setCurrentView('results');
        setSelectedFile(null);
        setUserEnteredName('');
        
        // Refresh dashboard data as the new record is now in the pending queue
        fetchDashboardData(); 
        addNotification('Document submitted for review!', 'success');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(`❌ Processing Failed: ${err.message}`);
      addNotification('Document processing failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to permanently delete this record?')) {
      return;
    }

    try {
      await apiRequest(`/api/records/${recordId}`, { method: 'DELETE' });
      setRecords(prev => prev.filter(r => r.id !== recordId));
      fetchDashboardData(); // Refresh stats
      addNotification('Record deleted successfully', 'success');
    } catch (err) {
      addNotification(`Failed to delete record: ${err.message}`, 'error');
    }
  };

  // The handleSaveRecord function is no longer needed as users cannot manually save.
  // ========== 🟢 END: MODIFIED CODE 🟢 ==========

  // ================================
  // ADMIN FUNCTIONS
  // ================================
  const handleAdminReviewDecision = async (recordId, decision, notes) => {
    try {
      await apiRequest(`/api/admin/review/${recordId}`, {
        method: 'POST',
        body: JSON.stringify({
          decision: decision,
          notes: notes
        })
      })

      // Remove reviewed item from local queue state for instant UI update
      setAdminQueue(prev => prev.filter(item => item.id !== recordId))
      
      // Refresh admin stats and user records
      fetchAdminData()
      fetchDashboardData();
      
      addNotification(`Document ${decision}ed successfully`, 'success')
      console.log(`Document ${decision}ed successfully`)
    } catch (err) {
      console.error('Admin review error:', err)
      addNotification('Review decision failed', 'error')
      throw err
    }
  }

  // ================================
  // UTILITY FUNCTIONS
  // ================================
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    }
    setNotifications(prev => [notification, ...prev.slice(0, 4)])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCSV = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:5000/api/records/export/csv', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `kyc-records-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
        addNotification('CSV export successful!', 'success')
      }
    } catch (err) {
      console.error('Export error:', err)
      addNotification('Export failed', 'error')
    }
  }

  // ========== 🟢 START: MODIFIED CODE 🟢 ==========
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approve':
        return (
          <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-medium flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" /> Approved
          </span>
        );
      case 'reject':
        return (
          <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs font-medium flex items-center">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs font-medium flex items-center">
            <Clock className="h-3 w-3 mr-1" /> Pending Review
          </span>
        );
    }
  };
  // ========== 🟢 END: MODIFIED CODE 🟢 ==========


  // ================================
  // EFFECTS
  // ================================
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('❌ No token found, user needs to authenticate');
      setError('🔐 Authentication Required: Please login to access the dashboard');
      setLoading(false);
      setShowLogin(true);
      return;
    }
    
    console.log('✅ Token found, fetching data...');
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (currentView === 'admin' && user?.role === 'admin') {
      fetchAdminData()
    }
  }, [currentView, fetchAdminData, user])

  useEffect(() => {
    if (currentView === 'analytics') {
      fetchFraudTrends()
    }
  }, [currentView, fetchFraudTrends])

  // ================================
  // LOGIN SCREEN RENDER
  // ================================
  if (!localStorage.getItem('access_token') || showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-100 mb-2">🤖 AI-KYC System</h2>
            <p className="text-gray-400">Advanced AI-powered document verification</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader className="animate-spin h-5 w-5" />
              ) : (
                <>
                  <LogOut className="h-5 w-5" />
                  <span>Login to Dashboard</span>
                </>
              )}
            </button>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="text-center space-y-2">
              <div className="text-gray-400 text-sm">Demo Credentials:</div>
              <div className="text-blue-300 text-sm font-mono">
                Admin: admin@kyc.com / admin123
              </div>
              <div className="text-green-300 text-sm font-mono">
                User: test@kyc.com / test123
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================================
  // MAIN DASHBOARD RENDER
  // ================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Enhanced Navigation Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI-KYC System</h1>
                <p className="text-xs text-gray-400">Enhanced Fraud Detection</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              if (item.adminOnly && user?.role !== 'admin') return null;
              
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center space-x-3 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600/50 to-purple-600/50 text-white border border-blue-500/30' 
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'}`} />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.description}</div>
                  </div>
                  {item.id === 'admin' && adminQueue?.length > 0 && (
                    <div className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {adminQueue.length}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gray-700 rounded-full p-2">
                <User className="h-5 w-5 text-gray-300" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{user?.name}</div>
                <div className="text-xs text-gray-400">{user?.role?.toUpperCase()}</div>
              </div>
            </div>
            {/* ========== 🟢 START: MODIFIED CODE 🟢 ========== */}
            <button
              onClick={handleLogout}
              className="w-full bg-red-800 hover:bg-red-700 text-red-100 px-4 py-2 rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
            {/* ========== 🟢 END: MODIFIED CODE 🟢 ========== */}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:ml-64">
        {/* Top Navigation Bar */}
        <div className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-white capitalize">
                  {currentView === 'overview' ? 'Dashboard Overview' : currentView}
                </h2>
                <p className="text-sm text-gray-400">
                  {currentView === 'overview' && 'AI-powered document verification dashboard'}
                  {currentView === 'upload' && 'Upload documents for AI analysis'}
                  {currentView === 'records' && 'View all processed documents'}
                  {currentView === 'analytics' && 'Fraud trends and analytics'}
                  {currentView === 'admin' && 'High-risk document review panel'}
                  {currentView === 'results' && 'AI processing results'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              {notifications.length > 0 && (
                <div className="relative">
                  <Bell className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer" />
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </div>
                </div>
              )}
              
              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportCSV}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => fetchDashboardData()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Display */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-40 space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border animate-slide-in ${
                  notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-300' :
                  notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
                  'bg-blue-500/20 border-blue-500/30 text-blue-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {notification.type === 'success' && <CheckCircle className="h-4 w-4" />}
                  {notification.type === 'error' && <XCircle className="h-4 w-4" />}
                  {notification.type === 'info' && <Info className="h-4 w-4" />}
                  <span className="text-sm">{notification.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="animate-spin h-12 w-12 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-400">Loading dashboard data...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Dashboard Overview */}
          {!loading && currentView === 'overview' && (
            <div className="space-y-6">
              {/* Enhanced Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Total Documents</p>
                      <p className="text-3xl font-bold text-gray-100">{stats.total_records || 0}</p>
                      <p className="text-green-400 text-sm">
                        <TrendingUp className="h-4 w-4 inline mr-1" />
                        +{stats.recent_submissions || 0} this week
                      </p>
                    </div>
                    <div className="bg-blue-500/20 p-3 rounded-lg">
                      <FileText className="h-8 w-8 text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Approved Documents</p>
                      <p className="text-3xl font-bold text-gray-100">{stats.verified_count || 0}</p>
                      <p className="text-green-400 text-sm">
                        {stats.verification_success_rate || 0}% success rate
                      </p>
                    </div>
                    <div className="bg-green-500/20 p-3 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">High Risk Detected</p>
                      <p className="text-3xl font-bold text-gray-100">{stats.high_risk_count || 0}</p>
                      <p className="text-red-400 text-sm">
                        {stats.fraud_detection_rate || 0}% detection rate
                      </p>
                    </div>
                    <div className="bg-red-500/20 p-3 rounded-lg">
                      <AlertTriangle className="h-8 w-8 text-red-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">AI Confidence</p>
                      <p className="text-3xl font-bold text-gray-100">{stats.avg_confidence || 0}%</p>
                      <p className="text-blue-400 text-sm">
                        <Activity className="h-4 w-4 inline mr-1" />
                        AI Analysis
                      </p>
                    </div>
                    <div className="bg-purple-500/20 p-3 rounded-lg">
                      <Brain className="h-8 w-8 text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-blue-400" />
                    Document Types
                  </h3>
                  <DocumentTypesChart data={{
                    aadhaar_count: stats.aadhaar_count || 0,
                    pan_count: stats.pan_count || 0
                  }} />
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-red-400" />
                    Fraud & Confidence Trends
                  </h3>
                  <FraudTrendsChart data={{
                    avg_fraud_score: stats.avg_fraud_score || 0,
                    fraud_detection_rate: stats.fraud_detection_rate || 0,
                    avg_confidence: stats.avg_confidence || 0,
                    total_records: stats.total_records || 0,
                  }} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-orange-400" />
                    Risk Categories
                  </h3>
                  <RiskCategoriesChart data={{
                    high_risk_count: stats.high_risk_count || 0,
                    medium_risk_count: stats.medium_risk_count || 0,
                    low_risk_count: stats.low_risk_count || 0
                  }} />
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
                   <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                    <CheckSquare className="h-5 w-5 mr-2 text-green-400" />
                    Document Status
                  </h3>
                  <DocumentStatusChart data={{
                    verified_count: stats.verified_count || 0,
                    high_risk_count: stats.high_risk_count || 0,
                    medium_risk_count: stats.medium_risk_count || 0,
                    low_risk_count: (stats.total_records || 0) - (stats.verified_count || 0) - (stats.high_risk_count || 0) - (stats.medium_risk_count || 0)
                  }} />
                </div>
              </div>

              {/* AI Features Status */}
              <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                  <Brain className="h-6 w-6 mr-3 text-purple-400" />
                  🤖 AI-Powered Features Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-800/30 rounded-lg p-4 flex items-center space-x-3">
                    <div className="bg-green-500/20 p-2 rounded-lg">
                      <UserCheck className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-green-400 font-bold">AI Name Matching</div>
                      <div className="text-xs text-gray-400">Active & Running</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-4 flex items-center space-x-3">
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                      <Microscope className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-blue-400 font-bold">Manipulation Detection</div>
                      <div className="text-xs text-gray-400">Advanced Analysis</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-4 flex items-center space-x-3">
                    <div className="bg-orange-500/20 p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <div className="text-orange-400 font-bold">Fraud Analysis</div>
                      <div className="text-xs text-gray-400">Pattern Recognition</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-4 flex items-center space-x-3">
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                      <GitBranch className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-purple-400 font-bold">Admin Review</div>
                      <div className="text-xs text-gray-400">Human Oversight</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Records */}
              {records && records.length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-100 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-400" />
                      Recent Processing Activity
                    </h3>
                    <button
                      onClick={() => setCurrentView('records')}
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                    >
                      <span>View All</span>
                      <ArrowUp className="h-4 w-4 transform rotate-45" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {records.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-all">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            record.risk_category === 'high' ? 'bg-red-500/20' :
                            record.risk_category === 'medium' ? 'bg-yellow-500/20' :
                            'bg-green-500/20'
                          }`}>
                            <FileText className={`h-4 w-4 ${
                              record.risk_category === 'high' ? 'text-red-400' :
                              record.risk_category === 'medium' ? 'text-yellow-400' :
                              'text-green-400'
                            }`} />
                          </div>
                          <div>
                            <div className="text-gray-200 font-medium capitalize">{record.document_type}</div>
                            <div className="text-xs text-gray-400">{record.filename}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-200 font-bold">{record.fraud_score?.toFixed(1) || 0}%</div>
                          <div className="text-xs text-gray-400">{record.risk_category} risk</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Upload Section */}
          {!loading && currentView === 'upload' && (
            <div className="space-y-6">
              {/* Enhanced Upload Header */}
              <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-100 flex items-center">
                      <Upload className="h-8 w-8 mr-3 text-green-400" />
                      🤖 AI-Powered Document Upload
                    </h2>
                    <p className="text-green-200 mt-1">
                      Documents will be automatically submitted for admin review after processing.
                    </p>
                  </div>
                  <div className="bg-green-500/20 p-3 rounded-lg">
                    <Cpu className="h-8 w-8 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Form */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                    <FileText className="h-6 w-6 mr-2 text-blue-400" />
                    Document Upload
                  </h3>
                  
                  <div className="space-y-4">
                    {/* User Name Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <UserCheck className="h-4 w-4 inline mr-2 text-green-400" />
                        Your Full Name (Required for AI Verification) *
                      </label>
                      <input
                        type="text"
                        value={userEnteredName}
                        onChange={(e) => setUserEnteredName(e.target.value)}
                        placeholder="Enter your full name as it appears on the document"
                        className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        🤖 AI will compare this with extracted document name for verification.
                      </p>
                    </div>

                    {/* Document Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Document Type
                      </label>
                      <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="aadhaar">📱 Aadhaar Card</option>
                        <option value="pan">💳 PAN Card</option>
                      </select>
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Upload Document
                      </label>
                      <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                        selectedFile 
                          ? 'border-green-500/50 bg-green-500/10' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          {selectedFile ? (
                            <div>
                              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                              <p className="text-green-300 font-medium">{selectedFile.name}</p>
                              <p className="text-gray-400 text-sm">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          ) : (
                            <div>
                              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-300 mb-2">Drop your document here or click to browse</p>
                              <p className="text-gray-400 text-sm">
                                Supports: JPG, PNG, PDF (Max 16MB)
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Upload Error */}
                    {uploadError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-5 w-5" />
                          <span>{uploadError}</span>
                        </div>
                      </div>
                    )}

                    {/* ========== 🟢 START: MODIFIED CODE 🟢 ========== */}
                    {/* Single "Submit for Review" button */}
                    <div className="pt-2">
                      <button
                        onClick={handleProcess}
                        disabled={!selectedFile || !userEnteredName.trim() || uploading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {uploading ? (
                          <>
                            <Loader className="animate-spin h-5 w-5" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5" />
                            <span>Submit for Review</span>
                          </>
                        )}
                      </button>
                    </div>
                    {/* ========== 🟢 END: MODIFIED CODE 🟢 ========== */}

                    {/* Processing Info */}
                    {uploading && (
                      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 p-4 rounded-xl">
                        <div className="text-sm">
                          <div className="flex items-center mb-2">
                            <Brain className="h-4 w-4 mr-2" />
                            <span className="font-medium">AI Processing Pipeline:</span>
                          </div>
                          <ul className="text-xs space-y-1 ml-6">
                            <li>• Enhanced OCR text extraction</li>
                            <li>• AI-powered name matching analysis</li>
                            <li>• Document manipulation detection</li>
                            <li>• Comprehensive fraud risk assessment</li>
                            <li>• Submitting for admin review</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Features Info */}
                <div className="space-y-6">
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                      <Brain className="h-6 w-6 mr-2 text-purple-400" />
                      🤖 AI Features
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="border border-gray-600 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <UserCheck className="h-5 w-5 mr-2 text-green-400" />
                          <span className="font-medium text-gray-200">AI Name Matching</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                          Advanced fuzzy matching algorithm compares your entered name with extracted document name using multiple similarity metrics.
                        </p>
                      </div>

                      <div className="border border-gray-600 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Microscope className="h-5 w-5 mr-2 text-blue-400" />
                          <span className="font-medium text-gray-200">Document Analysis</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                          Detects tampering, manipulation, and authenticity issues using advanced image processing and AI techniques.
                        </p>
                      </div>

                      <div className="border border-gray-600 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Shield className="h-5 w-5 mr-2 text-orange-400" />
                          <span className="font-medium text-gray-200">Fraud Detection</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                          Comprehensive risk scoring based on pattern analysis, duplicate detection, and ML-powered fraud indicators.
                        </p>
                      </div>

                      <div className="border border-gray-600 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Target className="h-5 w-5 mr-2 text-purple-400" />
                          <span className="font-medium text-gray-200">Smart Validation</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                          Automated validation with confidence scoring and intelligent decision recommendations.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Upload Tips */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <h4 className="font-medium text-blue-300 mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      📋 Upload Tips for Best Results
                    </h4>
                    <ul className="text-blue-200 text-sm space-y-1">
                      <li>• Ensure document is clear and well-lit</li>
                      <li>• Avoid shadows, glare, or reflections</li>
                      <li>• Use high resolution (recommended: 300+ DPI)</li>
                      <li>• Enter your name exactly as shown on document</li>
                      <li>• Supported formats: JPG, PNG, PDF</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Records Section */}
          {!loading && currentView === 'records' && (
            <div className="space-y-6">
              {/* Records Header */}
              <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-100 flex items-center">
                      <Database className="h-8 w-8 mr-3 text-blue-400" />
                      Document Records
                    </h2>
                    <p className="text-blue-200 mt-1">All processed documents with AI analysis results</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={exportCSV}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Records Display */}
              {records && records.length > 0 ? (
                <div className="space-y-4">
                  {records.map((record) => (
                    <div key={record.id} className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
                                <FileText className="h-5 w-5 text-blue-400" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-100 capitalize">
                                  {record.document_type} Document
                                </h3>
                                <p className="text-sm text-gray-400">{record.filename}</p>
                              </div>
                            </div>
                            {/* ========== 🟢 START: MODIFIED CODE 🟢 ========== */}
                            <div className="ml-4 flex-shrink-0">
                                {getStatusBadge(record.status)}
                            </div>
                            {/* ========== 🟢 END: MODIFIED CODE 🟢 ========== */}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <span className="text-gray-400">Processed: </span>
                              <span className="text-gray-200">
                                {new Date(record.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Confidence: </span>
                              <span className="text-gray-200">
                                {record.confidence_score?.toFixed(1) || 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className={`text-3xl font-bold mb-1 ${
                            record.fraud_score >= 70 ? 'text-red-400' :
                            record.fraud_score >= 40 ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {record.fraud_score?.toFixed(1) || 0}%
                          </div>
                          <div className="text-sm text-gray-400">Fraud Risk</div>
                          <div className={`mt-1 px-2 py-1 rounded text-xs font-bold ${
                            record.risk_category === 'high' ? 'bg-red-500/20 text-red-300' :
                            record.risk_category === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {record.risk_category?.toUpperCase()} RISK
                          </div>
                        </div>
                      </div>

                      {/* Extracted Information */}
                      {record.extracted_fields && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Extracted Information:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(record.extracted_fields).map(([key, value]) => (
                              <div key={key} className="bg-gray-900/50 rounded-lg p-3">
                                <div className="text-xs text-gray-400 uppercase mb-1">
                                  {key.replace('_', ' ')}
                                </div>
                                <div className="text-sm text-gray-200 font-medium">
                                  {value || 'Not available'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Analysis Results Button */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center">
                            <Brain className="h-4 w-4 mr-1 text-purple-400" />
                            <span>AI Processed</span>
                          </div>
                          {record.fraud_analysis?.analysis_details?.name_matching_result && (
                            <div className="flex items-center">
                              <UserCheck className="h-4 w-4 mr-1 text-green-400" />
                              <span>Name Matched ({record.fraud_analysis.analysis_details.name_matching_result.similarity_score}%)</span>
                            </div>
                          )}
                          {record.manipulation_result?.manipulation_detected && (
                            <div className="flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-1 text-red-400" />
                              <span>Manipulation Detected</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                           <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                            <button
                              onClick={() => {
                                setExtractionResult(record);
                                setCurrentView('results');
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-all"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View Analysis</span>
                            </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700">
                  <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-100 mb-2">No Documents Processed</h3>
                  <p className="text-gray-400 mb-4">Upload your first document to get started with AI analysis</p>
                  <button
                    onClick={() => setCurrentView('upload')}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                  >
                    Upload Document
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Analytics Section */}
          {!loading && currentView === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Header */}
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-100 flex items-center">
                      <BarChart3 className="h-8 w-8 mr-3 text-purple-400" />
                      📊 Fraud Analytics & Trends
                    </h2>
                    <p className="text-purple-200 mt-1">Advanced analytics and fraud pattern insights</p>
                  </div>
                  <div className="bg-purple-500/20 p-3 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Enhanced Analytics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-red-400" />
                    Fraud & Confidence Trends
                  </h3>
                  <FraudTrendsChart data={fraudTrends} />
                </div>
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-400" />
                    Fraud Patterns
                  </h3>
                  <FraudPatternsVisualization patterns={fraudPatterns} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-blue-400" />
                    Document Types
                  </h3>
                  <DocumentTypesChart data={{
                    aadhaar_count: stats.aadhaar_count || 0,
                    pan_count: stats.pan_count || 0
                  }} />
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-orange-400" />
                    Risk Categories
                  </h3>
                  <RiskCategoriesChart data={{
                    high_risk_count: stats.high_risk_count || 0,
                    medium_risk_count: stats.medium_risk_count || 0,
                    low_risk_count: stats.low_risk_count || 0
                  }} />
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                    <CheckSquare className="h-5 w-5 mr-2 text-green-400" />
                    Document Status
                  </h3>
                  <DocumentStatusChart data={{
                    verified_count: stats.verified_count || 0,
                    high_risk_count: stats.high_risk_count || 0,
                    medium_risk_count: stats.medium_risk_count || 0,
                    low_risk_count: (stats.total_records || 0) - (stats.verified_count || 0) - (stats.high_risk_count || 0) - (stats.medium_risk_count || 0)
                  }} />
                </div>
              </div>

              {/* Detailed Analytics */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-400" />
                  Performance Metrics
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {stats.verification_success_rate || 0}%
                    </div>
                    <div className="text-gray-300 text-sm">Success Rate</div>
                    <EnhancedProgressBar
                      label=""
                      value={stats.verification_success_rate || 0}
                      color="blue"
                      showLabel={false}
                      size="small"
                    />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-400 mb-2">
                      {stats.fraud_detection_rate || 0}%
                    </div>
                    <div className="text-gray-300 text-sm">Fraud Detection</div>
                    <EnhancedProgressBar
                      label=""
                      value={stats.fraud_detection_rate || 0}
                      color="red"
                      showLabel={false}
                      size="small"
                    />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {stats.avg_confidence || 0}%
                    </div>
                    <div className="text-gray-300 text-sm">AI Confidence</div>
                    <EnhancedProgressBar
                      label=""
                      value={stats.avg_confidence || 0}
                      color="green"
                      showLabel={false}
                      size="small"
                    />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {stats.manipulation_detected_count || 0}
                    </div>
                    <div className="text-gray-300 text-sm">Manipulations Found</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Out of {stats.total_records || 0} docs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Panel Section */}
          {!loading && currentView === 'admin' && user?.role === 'admin' && (
            <AdminPanel
              adminQueue={adminQueue}
              adminStats={adminStats}
              onReviewDecision={handleAdminReviewDecision}
              loading={loadingAdmin}
              onRefreshQueue={fetchAdminData}
            />
          )}

          {/* Results Section */}
          {!loading && currentView === 'results' && extractionResult && (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-100 flex items-center">
                      <CheckCircle className="h-8 w-8 mr-3 text-green-400" />
                      🤖 AI Analysis Results
                    </h2>
                    <p className="text-green-200 mt-1">
                      Comprehensive AI analysis for {extractionResult.document_type?.toUpperCase()} document
                    </p>
                  </div>
                  <div className="text-right">
                    {/* ========== 🟢 START: MODIFIED CODE 🟢 ========== */}
                    <div className="mb-2">{getStatusBadge(extractionResult.status)}</div>
                    {/* ========== 🟢 END: MODIFIED CODE 🟢 ========== */}
                    <div className="text-sm text-gray-400">Processing ID</div>
                    <div className="text-lg font-bold text-gray-200">#{extractionResult.id}</div>
                  </div>
                </div>
              </div>

              {/* Overall Analysis Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700 text-center">
                  <div className={`text-4xl font-bold mb-2 ${
                    extractionResult.status === 'approve' ? 'text-green-400' : 
                    extractionResult.status === 'reject' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {extractionResult.status === 'approve' ? '✅' : extractionResult.status === 'reject' ? '❌' : '🕒'}
                  </div>
                  <div className="text-lg font-semibold text-gray-100 uppercase">
                    {extractionResult.status === 'approve' ? 'Approved' : extractionResult.status}
                  </div>
                  <div className="text-sm text-gray-400">Document Status</div>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700 text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    {extractionResult.confidence_score?.toFixed(1) || 0}%
                  </div>
                  <div className="text-lg font-semibold text-gray-100">CONFIDENCE</div>
                  <div className="text-sm text-gray-400">AI Analysis</div>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700 text-center">
                  <div className={`text-4xl font-bold mb-2 ${
                    extractionResult.fraud_score >= 70 ? 'text-red-400' :
                    extractionResult.fraud_score >= 40 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {extractionResult.fraud_score?.toFixed(1) || 0}%
                  </div>
                  <div className="text-lg font-semibold text-gray-100">FRAUD RISK</div>
                  <div className="text-sm text-gray-400 capitalize">
                    {extractionResult.risk_category || 'Unknown'} Risk Level
                  </div>
                </div>
              </div>

              {/* AI Name Matching Results */}
              {extractionResult.fraud_analysis?.analysis_details?.name_matching_result && (
                <AINameMatchingDisplay
                  nameMatchingResult={extractionResult.fraud_analysis.analysis_details.name_matching_result}
                  extractedFields={extractionResult.extracted_fields}
                  userEnteredName={extractionResult.user_entered_name}
                />
              )}

              {/* Document Manipulation Analysis */}
              {extractionResult.manipulation_result && (
                <DocumentManipulationDisplay
                  manipulationResult={extractionResult.manipulation_result}
                />
              )}

              {/* Fraud Risk Analysis */}
              <FraudScoreProgressBar
                fraudScore={extractionResult.fraud_score}
                riskCategory={extractionResult.risk_category}
                riskFactors={extractionResult.risk_factors}
                animated={true}
              />

              {/* Extracted Document Information */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                  <Database className="h-6 w-6 mr-2 text-green-400" />
                  📄 Extracted Document Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(extractionResult.extracted_fields || {}).map(([key, value]) => (
                    <div key={key} className="border border-gray-600 rounded-lg p-4 hover:bg-gray-700/30 transition-all">
                      <div className="text-xs font-medium text-gray-400 uppercase mb-2">
                        {key.replace('_', ' ')}
                      </div>
                      <div className="text-lg text-gray-200 font-medium">
                        {value || 'Not extracted'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Processing Details */}
              {extractionResult.processing_details && (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                    <Cpu className="h-6 w-6 mr-2 text-purple-400" />
                    🔧 Processing Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Processing Method:</h4>
                      <div className="bg-gray-700/50 rounded-lg p-3 text-sm text-gray-200">
                        {extractionResult.processing_details.extraction_method || 'Standard OCR'}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">AI Features Used:</h4>
                      <div className="flex flex-wrap gap-2">
                        {(extractionResult.processing_details.ai_features_used || []).map((feature, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30">
                            {feature.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="text-xs text-gray-400">
                      Processed on: {new Date(extractionResult.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* ========== 🟢 START: MODIFIED CODE 🟢 ========== */}
              {/* Action Buttons - "Save" button removed */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setCurrentView('upload')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Process Another</span>
                </button>
                <button
                  onClick={() => downloadJSON(extractionResult, `analysis-${extractionResult.id}.json`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Analysis</span>
                </button>
              </div>
              {/* ========== 🟢 END: MODIFIED CODE 🟢 ========== */}
            </div>
          )}

          {/* Admin Access Restriction */}
          {!loading && currentView === 'admin' && user?.role !== 'admin' && (
            <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700">
              <Shield className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-100 mb-2">Admin Access Required</h3>
              <p className="text-gray-400 mb-4">You need administrator privileges to access this panel</p>
              <button
                onClick={() => setCurrentView('overview')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Add custom CSS for animations
const styles = `
  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }

  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default Dashboard;