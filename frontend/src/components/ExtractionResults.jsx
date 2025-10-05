// FILE: frontend/src/components/ExtractionResults.jsx
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, ArrowLeft, Upload } from 'lucide-react';
import AINameMatchingDisplay from './AINameMatchingDisplay';
import FraudScoreDisplay from './FraudScoreDisplay';
import DocumentManipulationDisplay from './DocumentManipulationDisplay';

const ExtractionResults = ({ extractionResult, setCurrentView }) => {
  if (!extractionResult) {
    return (
      <div className="text-center p-8 text-gray-400">
        <p>No extraction results available. Please upload a document first.</p>
        <button
          onClick={() => setCurrentView('upload')}
          className="mt-4 flex items-center justify-center mx-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          <Upload className="h-5 w-5 mr-2" /> Upload Document
        </button>
      </div>
    );
  }

  const {
    extracted_fields = {},
    fraud_analysis = {},
    manipulation_result = {},
    user_entered_name,
    status,
    confidence_score,
    risk_category,
    fraud_score,
    analysis_details = {},
  } = extractionResult;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.header variants={itemVariants} className="text-center">
        <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
        <h1 className="text-3xl font-bold text-white mt-4">Verification Processed</h1>
        <div className="flex flex-wrap justify-center gap-6 mt-4">
          <div className="bg-gray-900/60 rounded-lg px-6 py-3 text-left shadow border border-gray-700">
            <span className="text-gray-400">Status:</span> <span className="text-white font-bold ml-2">{status || 'N/A'}</span>
          </div>
          <div className="bg-gray-900/60 rounded-lg px-6 py-3 text-left shadow border border-gray-700">
            <span className="text-gray-400">Confidence:</span> <span className="text-white font-bold ml-2">{confidence_score ?? fraud_analysis.ai_confidence ?? 'N/A'}%</span>
          </div>
          <div className="bg-gray-900/60 rounded-lg px-6 py-3 text-left shadow border border-gray-700">
            <span className="text-gray-400">Risk Category:</span> <span className="text-white font-bold ml-2">{risk_category ?? fraud_analysis.risk_category ?? 'N/A'}</span>
          </div>
          <div className="bg-gray-900/60 rounded-lg px-6 py-3 text-left shadow border border-gray-700">
            <span className="text-gray-400">Fraud Score:</span> <span className="text-white font-bold ml-2">{fraud_score ?? fraud_analysis.fraud_score ?? 'N/A'}%</span>
          </div>
        </div>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">The document has been analyzed by our AI pipeline. The results are summarized below and have been submitted for final review.</p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="bg-gray-800/50 backdrop-blur-xl rounded-xl shadow-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-3 text-blue-400" />
            Key Extracted Details
          </h3>
          <div className="space-y-3">
            {Object.keys(extracted_fields).length > 0 ? Object.entries(extracted_fields).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="text-white font-medium text-right">{value || 'N/A'}</span>
              </div>
            )) : <p className="text-gray-500 text-sm">No fields could be extracted. Please try a clearer document.</p>}
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <FraudScoreDisplay analysis={fraud_analysis} />
        </motion.div>
      </div>

      {/* AI Name Matching Display */}
      <motion.div variants={itemVariants}>
        <AINameMatchingDisplay 
          nameMatchingResult={fraud_analysis.analysis_details?.name_matching_result}
          userEnteredName={user_entered_name}
          extractedFields={extracted_fields}
        />
      </motion.div>
      
      {/* Document Manipulation Display */}
      <motion.div variants={itemVariants}>
        <DocumentManipulationDisplay manipulationResult={manipulation_result} />
      </motion.div>

      {/* Analysis Checklist Display */}
      <motion.div variants={itemVariants} className="bg-gray-800/50 rounded-xl shadow-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 mr-3 text-green-400" />
          Analysis Checklist
        </h3>
        <div className="space-y-2">
          {fraud_analysis.analysis_details?.manipulation_result?.detected_issues?.length > 0 ? (
            fraud_analysis.analysis_details.manipulation_result.detected_issues.map((issue, idx) => (
              <div key={idx} className="flex items-center text-sm text-red-400">
                <CheckCircle className="h-4 w-4 mr-2 text-yellow-400" />
                {issue}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No issues detected.</div>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="text-center space-y-4 pt-4">
        <h3 className="text-lg font-semibold text-white">What's next?</h3>
        <div className="flex justify-center flex-wrap gap-4">
          <button onClick={() => setCurrentView('records')} className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            View All My Records
          </button>
          <button onClick={() => setCurrentView('upload')} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            <Upload className="h-5 w-5 mr-2" />
            Upload Another
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default memo(ExtractionResults);