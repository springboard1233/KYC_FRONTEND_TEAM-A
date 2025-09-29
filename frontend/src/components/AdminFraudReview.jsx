// CHANGELOG: Enhanced accessibility with focus trapping and ARIA attributes, and improved UX with a responsive two-column layout.
import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import { FileText, User, Database, Brain, ShieldCheck, CheckCircle, XCircle, Flag, X, Loader } from 'lucide-react';
import AINameMatchingDisplay from './AINameMatchingDisplay';
import DocumentManipulationDisplay from './DocumentManipulationDisplay';
import FraudScoreProgressBar from './FraudScoreProgressBar';

// --- ACCESSIBILITY HOOK ---

const useFocusTrap = (ref, active) => {
  useEffect(() => {
    if (!active || !ref.current) return;

    const focusableElements = ref.current.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    firstElement?.focus();
    ref.current.addEventListener('keydown', handleKeyDown);

    return () => ref.current?.removeEventListener('keydown', handleKeyDown);
  }, [ref, active]);
};

// --- SUB-COMPONENTS ---

const ModalHeader = memo(({ recordId, onClose }) => (
  <header className="bg-gray-900/70 py-4 px-6 flex items-center justify-between border-b border-gray-700/50 sticky top-0 z-10">
    <div>
      <h3 id="review-modal-title" className="text-xl font-semibold text-white">Review Document</h3>
      <p className="text-sm text-gray-400 mt-1">Record ID: {recordId}</p>
    </div>
    <button
      onClick={onClose}
      aria-label="Close modal"
      className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700/50 transition-colors"
    >
      <X className="h-6 w-6" />
    </button>
  </header>
));

const InfoBlock = memo(({ icon: Icon, title, data }) => (
  <div className="bg-gray-900/50 rounded-lg p-4 ring-1 ring-gray-700/50">
    <h4 className="font-semibold text-gray-100 mb-3 flex items-center">
      <Icon className="h-5 w-5 mr-2 text-blue-400" />
      {title}
    </h4>
    <div className="space-y-2 text-sm">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex justify-between items-center">
          <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
          <span className="text-gray-200 text-right font-medium">{value || 'N/A'}</span>
        </div>
      ))}
    </div>
  </div>
));

const ExtractedFields = memo(({ fields }) => (
  <div className="bg-gray-900/50 rounded-lg p-4 ring-1 ring-gray-700/50">
    <h4 className="font-semibold text-gray-100 mb-3 flex items-center">
      <Database className="h-5 w-5 mr-2 text-purple-400" />
      Extracted Information
    </h4>
    {!fields || Object.keys(fields).length === 0 ? (
        <p className="text-gray-400 text-sm">No fields were extracted.</p>
    ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(fields).map(([key, value]) => (
            <div key={key} className="bg-gray-800/60 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                {key.replace(/_/g, ' ')}
            </div>
            <div className="text-sm text-gray-100 font-medium truncate" title={value}>
                {value || <span className="text-gray-500 italic">Not available</span>}
            </div>
            </div>
        ))}
        </div>
    )}
  </div>
));

const DecisionButton = memo(({ onClick, isProcessing, color, icon: Icon, title, subtitle }) => (
  <button
    onClick={onClick}
    disabled={isProcessing}
    className={`bg-${color}-600 hover:bg-${color}-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-3 w-full group`}
  >
    <div className="transition-transform group-hover:scale-110">
      {isProcessing ? <Loader className="animate-spin h-5 w-5" /> : <Icon className="h-5 w-5" />}
    </div>
    <div className="text-left">
      <div className="font-bold">{title}</div>
      <div className="text-xs opacity-80">{subtitle}</div>
    </div>
  </button>
));

// --- MAIN COMPONENT ---

const AdminFraudReview = ({ selectedRecord, onClose, onReviewDecision }) => {
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const modalRef = useRef(null);

  useFocusTrap(modalRef, !!selectedRecord);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  useEffect(() => {
    // Reset state when a new record is selected
    if (selectedRecord) {
        setReviewNotes('');
        setIsProcessing(false);
    }
  }, [selectedRecord]);


  const handleDecision = useCallback(async (decision) => {
    setIsProcessing(true);
    try {
      await onReviewDecision(selectedRecord._id, decision, reviewNotes);
    } catch (error) {
      console.error("Failed to process decision:", error);
    } finally {
      setIsProcessing(false);
      // Do not close on decision, parent component should handle this
    }
  }, [onReviewDecision, selectedRecord, reviewNotes]);

  if (!selectedRecord) {
    return null;
  }
  
  const documentInfo = {
    file_name: selectedRecord.filename,
    document_type: selectedRecord.document_type,
    submitted: new Date(selectedRecord.created_at).toLocaleString(),
    confidence: `${selectedRecord.confidence_score?.toFixed(1) ?? 'N/A'}%`,
  };

  const submitterInfo = {
    name: selectedRecord.submitter?.name,
    email: selectedRecord.submitter?.email,
    user_id: selectedRecord.user_id,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800/80 backdrop-blur-xl ring-1 ring-gray-700 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col animate-scale-in"
      >
        <ModalHeader recordId={selectedRecord._id} onClose={onClose} />

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              <InfoBlock icon={FileText} title="Document Details" data={documentInfo} />
              <InfoBlock icon={User} title="Submitter Details" data={submitterInfo} />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              <ExtractedFields fields={selectedRecord.extracted_fields} />
              {selectedRecord.fraud_analysis && (
                <div className="bg-gray-900/50 rounded-lg p-4 ring-1 ring-gray-700/50 space-y-4">
                    <h4 className="font-semibold text-gray-100 flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-pink-400" />
                      AI Fraud Analysis
                    </h4>
                    {selectedRecord.fraud_analysis.analysis_details?.name_matching_result && (
                      <AINameMatchingDisplay
                        nameMatchingResult={selectedRecord.fraud_analysis.analysis_details.name_matching_result}
                        extractedFields={selectedRecord.extracted_fields}
                        userEnteredName={selectedRecord.user_entered_name}
                      />
                    )}
                    {selectedRecord.manipulation_result && (
                      <DocumentManipulationDisplay manipulationResult={selectedRecord.manipulation_result} />
                    )}
                    <FraudScoreProgressBar
                      fraudScore={selectedRecord.fraud_score}
                      riskCategory={selectedRecord.risk_category}
                      riskFactors={selectedRecord.risk_factors}
                      animated={true}
                    />
                </div>
              )}
            </div>
          </div>
          
          {/* Admin Review Section (Full Width) */}
          <div className="bg-gray-900/50 rounded-lg p-4 ring-1 ring-gray-700/50">
            <h4 className="font-semibold text-gray-100 mb-3 flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2 text-green-400" />
              Admin Review & Decision
            </h4>
            <div className="space-y-4">
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full p-3 bg-gray-700/80 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                rows={4}
                placeholder="Enter review notes, reasoning for the decision, or any additional comments..."
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <DecisionButton onClick={() => handleDecision('approve')} isProcessing={isProcessing} color="green" icon={CheckCircle} title="Approve" subtitle="Mark as valid & safe" />
                <DecisionButton onClick={() => handleDecision('reject')} isProcessing={isProcessing} color="red" icon={XCircle} title="Reject" subtitle="Mark as fraudulent" />
                <DecisionButton onClick={() => handleDecision('flag')} isProcessing={isProcessing} color="yellow" icon={Flag} title="Flag for Review" subtitle="Needs investigation" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFraudReview;

