// CHANGELOG: Redesigned with a dark theme, an interactive drag-and-drop file zone, and an animated multi-step progress display.
import React, { useEffect } from 'react';
import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, X, Brain, Shield, UserCheck, Send, Loader, CheckCircle } from 'lucide-react';
import { ocrService } from '../utils/ocrService';

// --- REUSABLE SUB-COMPONENTS ---

const FileDropzone = memo(({ selectedFile, onFileChange, onFileRemove, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange({ target: { files: e.dataTransfer.files } });
      e.dataTransfer.clearData();
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative p-6 border-2 border-dashed rounded-xl transition-colors duration-300
        ${error ? 'border-red-500/50' : 'border-gray-600/80'}
        ${isDragging ? 'bg-blue-500/20 border-blue-400' : 'bg-gray-900/40'}`
      }
    >
      <input
        type="file"
        id="file-upload"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={onFileChange}
        className="absolute w-0 h-0 opacity-0"
      />
      {selectedFile ? (
        <div className="text-center">
            <FileText className="h-12 w-12 text-blue-400 mx-auto mb-2" />
            <p className="font-semibold text-white truncate">{selectedFile.name}</p>
            <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            <button
                onClick={onFileRemove}
                className="mt-4 text-sm text-red-400 hover:text-red-300 font-semibold flex items-center justify-center gap-1 mx-auto"
            >
                <X className="h-4 w-4" /> Remove File
            </button>
        </div>
      ) : (
        <label htmlFor="file-upload" className="text-center cursor-pointer flex flex-col items-center">
          <UploadCloud className={`h-12 w-12 mb-2 transition-transform duration-300 ${isDragging ? 'scale-110 text-blue-300' : 'text-gray-500'}`} />
          <p className="font-semibold text-white">Click to browse or drag & drop</p>
          <p className="text-sm text-gray-400">PDF, PNG, JPG (max 5MB)</p>
        </label>
      )}
    </div>
  );
});

const FeatureListItem = memo(({ icon: Icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="p-2 bg-gray-700/50 rounded-lg mt-1"><Icon className="h-5 w-5 text-purple-300" /></div>
        <div>
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
    </div>
));

// --- MAIN COMPONENT ---

const DocumentUpload = ({ onUploadSuccess, addNotification }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('aadhaar');
  const [userEnteredName, setUserEnteredName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size cannot exceed 5MB.');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!selectedFile) { setError('Please select a file to upload.'); return; }
    if (!userEnteredName.trim()) { setError('Please enter your full name for verification.'); return; }

    setUploading(true);
    setError('');

    try {
      setUploadStep(1); // Uploading
      // Simulate progress for better UX
      setTimeout(() => setUploadStep(2), 700); // AI Processing
      setTimeout(() => setUploadStep(3), 1500); // Finalizing

      const result = await ocrService.extractDocument({
        file: selectedFile,
        documentType,
        userEnteredName: userEnteredName.trim(),
      });
      
      setUploadStep(4); // Done
      if (result.success && result.extraction_result) {
        onUploadSuccess(result.extraction_result);
      } else {
        throw new Error(result.error || 'Document processing failed.');
      }
    } catch (err) {
      setError(err.message);
      addNotification(`Upload failed: ${err.message}`, 'error');
      setUploading(false);
      setUploadStep(0);
    }
  }, [selectedFile, documentType, userEnteredName, onUploadSuccess, addNotification]);

  const uploadSteps = ["", "Uploading...", "AI Processing...", "Finalizing...", "Done!"];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-4">
            <h2 className="text-2xl font-bold text-white">Upload Your Document</h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Document Type</label>
                <select value={documentType} onChange={e => setDocumentType(e.target.value)} className="w-full bg-gray-700/80 border border-gray-600 rounded-lg px-3 py-2 text-white">
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="pan">PAN Card</option>
                </select>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Your Full Name</label>
                <input type="text" value={userEnteredName} onChange={e => setUserEnteredName(e.target.value)} placeholder="Enter name as it appears on the document" className="w-full bg-gray-700/80 border border-gray-600 rounded-lg px-3 py-2 text-white"/>
            </div>

            <FileDropzone selectedFile={selectedFile} onFileChange={handleFileChange} onFileRemove={() => setSelectedFile(null)} error={!!error} />

            <AnimatePresence>
                {error && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-red-400 text-sm">{error}</motion.p>}
            </AnimatePresence>
            
            <button onClick={handleSubmit} disabled={uploading} className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {uploading ? <Loader className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
                {uploading ? uploadSteps[uploadStep] : 'Submit for Verification'}
            </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-800/20 p-6 rounded-xl border border-dashed border-gray-700/50 space-y-4">
            <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-purple-300" />
                <h3 className="text-xl font-bold text-white">Powered by AI</h3>
            </div>
            <FeatureListItem icon={UserCheck} title="Name Verification" description="AI cross-references the name you provide with the name extracted from the document." />
            <FeatureListItem icon={Shield} title="Fraud Detection" description="Advanced algorithms scan for signs of digital tampering, forgery, and inconsistencies."/>
            <FeatureListItem icon={CheckCircle} title="Data Extraction" description="Key information like ID numbers and dates are automatically extracted and validated." />
        </motion.div>
    </div>
  );
};

export default DocumentUpload;

