// CHANGELOG: Abstracted API call to service layer, fixed bugs, and redesigned layout into a dynamic, multi-column dashboard grid.
import React, { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Send, Loader, FileText, ShieldAlert } from 'lucide-react';
import AINameMatchingDisplay from './AINameMatchingDisplay';
import DocumentManipulationDisplay from './DocumentManipulationDisplay';
import FraudScoreProgressBar from './FraudScoreProgressBar'; // Corrected import path
import { recordsService } from '../utils/recordsService'; // Assume service is updated with submitForReview

const AnalysisCard = memo(({ title, icon: Icon, children, className = '' }) => (
    <motion.div 
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        className={`bg-gray-800/50 rounded-xl shadow-lg p-6 border border-gray-700 h-full ${className}`}
    >
        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center">
            <Icon className="h-5 w-5 mr-3 text-blue-400" />
            {title}
        </h3>
        {children}
    </motion.div>
));
const ResultsView = ({ extractionResult, getStatusBadge: StatusBadge, setCurrentView, addNotification, fetchDashboardData }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleSubmitForReview = useCallback(async (recordId) => {
        if (!recordId) return;
        setIsSubmitting(true);
        try {
            // Abstracted API call to a dedicated service
            await recordsService.submitForReview(recordId);
            addNotification('Document submitted for admin review!', 'info');
            await fetchDashboardData();
            setCurrentView('records');
        } catch (err) {
            addNotification(err.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    }, [addNotification, fetchDashboardData, setCurrentView]);

    if (!extractionResult) {
        return <div className="text-center p-8 text-gray-400">No result to display.</div>;
    }

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1 }}
            className="space-y-6"
        >
            <motion.div variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}>
                <RecordHeader 
                    record={extractionResult}
                    isSubmitting={isSubmitting}
                    onSubmit={() => handleSubmitForReview(extractionResult._id)}
                    onProcessAnother={() => setCurrentView('upload')}
                    StatusBadge={StatusBadge}
                />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-6">
                    {extractionResult.fraud_analysis?.analysis_details?.manipulation_result && (
                        <DocumentManipulationDisplay
                            manipulationResult={extractionResult.fraud_analysis.analysis_details.manipulation_result}
                        />
                    )}
                    <AnalysisCard title="Extracted Details" icon={FileText}>
                        <div className="space-y-3">
                            {Object.keys(extractionResult.extracted_fields).length > 0 ? Object.entries(extractionResult.extracted_fields).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm border-b border-gray-700/50 pb-2 last:border-b-0">
                                    <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                                    <span className="text-white font-medium text-right">{value || 'N/A'}</span>
                                </div>
                            )) : <p className="text-gray-500 text-sm">No fields could be extracted.</p>}
                        </div>
                    </AnalysisCard>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-1 space-y-6">
                    {extractionResult.fraud_analysis?.analysis_details?.name_matching_result && (
                        <AINameMatchingDisplay
                            nameMatchingResult={extractionResult.fraud_analysis.analysis_details.name_matching_result}
                            extractedFields={extractionResult.extracted_fields}
                            userEnteredName={extractionResult.user_entered_name}
                        />
                    )}
                    <FraudScoreProgressBar
                        fraudScore={extractionResult.fraud_score}
                        riskCategory={extractionResult.risk_category}
                        riskFactors={extractionResult.risk_factors}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default ResultsView;
