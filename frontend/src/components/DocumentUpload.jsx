import React, { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, Camera, Loader } from 'lucide-react'
import { ocrService } from '../utils/ocrService'

const DocumentUpload = ({ onExtractionComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [documentType, setDocumentType] = useState('aadhaar')
  const [autoSave, setAutoSave] = useState(true)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (file) => {
    try {
      ocrService.validateFile(file)
      setSelectedFile(file)
      setError('')
    } catch (err) {
      setError(err.message)
      setSelectedFile(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleExtract = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    setExtracting(true)
    setError('')

    try {
      const result = await ocrService.extractDocument(selectedFile, documentType, autoSave)
      
      if (onExtractionComplete) {
        onExtractionComplete(result)
      }

      // Reset form
      setSelectedFile(null)
      setDocumentType('aadhaar')
      
    } catch (err) {
      setError(err.message)
    } finally {
      setExtracting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Camera className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">Upload Document</h3>
        </div>

        {/* Document Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Document Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="aadhaar"
                checked={documentType === 'aadhaar'}
                onChange={(e) => setDocumentType(e.target.value)}
                className="mr-2"
                disabled={extracting}
              />
              <span>Aadhaar Card</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="pan"
                checked={documentType === 'pan'}
                onChange={(e) => setDocumentType(e.target.value)}
                className="mr-2"
                disabled={extracting}
              />
              <span>PAN Card</span>
            </label>
          </div>
        </div>

        {/* Auto-save Option */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="mr-2"
              disabled={extracting}
            />
            <span className="text-sm font-medium text-gray-700">
              Automatically save extracted data as a record
            </span>
          </label>
        </div>

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : selectedFile
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {selectedFile ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                File Selected
              </p>
              <p className="text-sm text-gray-600 mb-2">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={() => setSelectedFile(null)}
                className="mt-3 text-sm text-red-600 hover:text-red-700"
                disabled={extracting}
              >
                Remove File
              </button>
            </div>
          ) : (
            <div>
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your document here
              </p>
              <p className="text-sm text-gray-600 mb-4">
                or click to browse files
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                disabled={extracting}
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50"
              >
                <FileText className="h-5 w-5 mr-2" />
                Choose File
              </label>
              <p className="text-xs text-gray-500 mt-3">
                Supports PNG, JPG, PDF (max 16MB)
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 animate-slide-up">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Extract Button */}
        <div className="mt-6">
          <button
            onClick={handleExtract}
            disabled={!selectedFile || extracting}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              !selectedFile || extracting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {extracting ? (
              <div className="flex items-center justify-center">
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Processing Document...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Camera className="h-5 w-5 mr-2" />
                Extract Data {autoSave ? '& Save Record' : ''}
              </div>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Tip:</strong> For best results, ensure the document is well-lit, 
            clearly visible, and the text is not blurry. 
            {autoSave && ' The extracted data will be automatically saved to your records.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DocumentUpload
