import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Loader from './Loader';

// Configuration for file validation
const FILE_CONFIG = {
  'image/jpeg': [],
  'image/png': [],
  'application/pdf': [],
};
const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const DocumentUploader = ({ docName, onFileUpload, isLoading, extractedData, uploadError }) => {
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
    setPreview(URL.createObjectURL(file));
    onFileUpload(file); // Trigger real-time OCR
  }, [onFileUpload, preview]);

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
      <h3>{docName}</h3>
      <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''}` })}>
        <input {...getInputProps()} />
        {preview ? (
          <img src={preview} alt="Document preview" className="preview-img" />
        ) : (
          <p>Drag & drop your file here, or click to select</p>
        )}
      </div>
      
      <div className="status-area">
        {isLoading && <Loader />}
        {validationError && <p className="error-text">{validationError}</p>}
        {uploadError && <p className="error-text">{uploadError}</p>}

        {extractedData && (
          <div className="results-preview">
            <h4>Extracted Data:</h4>
            <ul>
              {Object.entries(extractedData).map(([key, value]) => (
                value && <li key={key}><strong>{key}:</strong> {value}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
export default DocumentUploader;