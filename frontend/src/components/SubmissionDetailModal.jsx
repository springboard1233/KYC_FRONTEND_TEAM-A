import React from 'react';

const SubmissionDetailModal = ({ submission, onClose }) => {
    if (!submission) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl border border-gray-600">
                <h2 className="text-2xl font-bold mb-4">Submission Details</h2>
                {/* Display all the details from the submission object */}
                <p><strong>User:</strong> {submission.userName}</p>
                <p><strong>Status:</strong> {submission.status}</p>
                <p><strong>Fraud Score:</strong> {submission.fraudScore}%</p>
                <h3 className="text-xl mt-4">Risk Reasons:</h3>
                <ul>{submission.riskReasons.map(r => <li key={r}>- {r}</li>)}</ul>
                
                {/* ... Add more details from validationChecks and fraudChecks ... */}

                <button onClick={onClose} className="mt-6 bg-blue-600 px-4 py-2 rounded">Close</button>
            </div>
        </div>
    );
};

export default SubmissionDetailModal;