import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

// Note: Loader is no longer needed here as the parent component handles loading states.

const FILE_CONFIG = {
  'image/jpeg': [],
  'image/png': [],
  'application/pdf': [],
};
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const DocumentUploader = ({ docName, onFileUpload }) => {
  const [preview, setPreview] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Clean up preview URL to avoid memory leaks
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const onDrop = useCallback(acceptedFiles => {
    setValidationError('');
    if (preview) URL.revokeObjectURL(preview);

    const file = acceptedFiles[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileUpload(file); // Immediately pass the file up to the parent component
    }
  }, [preview, onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: FILE_CONFIG,
    maxSize: MAX_SIZE_BYTES,
    multiple: false,
    onDropRejected: (rejectedFiles) => {
      setValidationError(rejectedFiles[0].errors[0].message);
    }
  });


  return (
    <div className="uploader-card">
      <h3 className="text-xl font-semibold mb-4 text-center">{docName}</h3>
      
      <div 
        {...getRootProps({ 
          className: `dropzone border-2 border-dashed rounded-lg p-6 cursor-pointer text-center transition 
          ${isDragActive ? 'border-blue-400 bg-white/20' : 'border-gray-500 bg-transparent'}`
        })}
      >
        <input {...getInputProps()} />
        {preview ? (
          <img src={preview} alt="Document preview" className="preview-img mx-auto max-h-40 rounded-md" />
        ) : (
          <p className="text-gray-400">Drag & drop your file here, or click to select</p>
        )}
      </div>
      
      {/* --- This area is now cleaner, as results are shown in the parent --- */}
      <div className="status-area mt-4">
        {validationError && <p className="text-red-400 text-center">{validationError}</p>}
      </div>
    </div>
  );
};

export default DocumentUploader;