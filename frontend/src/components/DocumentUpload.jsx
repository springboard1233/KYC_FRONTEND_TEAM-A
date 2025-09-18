import React, { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, Camera, Loader, User } from 'lucide-react'


import { ocrService } from '../utils/ocrService'

const DocumentUpload = ({ onExtractionComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [documentType, setDocumentType] = useState('aadhaar')
  const [userEnteredName, setUserEnteredName] = useState('')
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

    if (!userEnteredName.trim()) {
      setError('Please enter your name for AI verification')
      return
    }

    setExtracting(true)
    setError('')

    try {
      const result = await ocrService.extractDocument(
        selectedFile, 
        documentType, 
        userEnteredName.trim(),
        autoSave
      )

      if (onExtractionComplete) {
        onExtractionComplete(result)
      }

      // Reset form
      setSelectedFile(null)
      setUserEnteredName('')
      setDocumentType('aadhaar')
    } catch (err) {
      setError(err.message)
    } finally {
      setExtracting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Upload</h3>
            
            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
              <input
                type="file"
                onChange={handleFileInput}
                accept=".png,.jpg,.jpeg,.pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={extracting}
              />

              {selectedFile ? (
                <div className="space-y-3">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <div>
                    <p className="font-medium text-gray-900">File Selected</p>
                    <p className="text-sm text-gray-600">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {ocrService.formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Drop your document here
                    </p>
                    <p className="text-sm text-gray-600">or click to browse files</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Supports PNG, JPG, PDF (max 16MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Configuration Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Configuration</h3>
            
            <div className="space-y-4">
              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={extracting}
                >
                  {ocrService.getSupportedTypes().map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Your Name (for AI Verification)
                </label>
                <input
                  type="text"
                  value={userEnteredName}
                  onChange={(e) => setUserEnteredName(e.target.value)}
                  placeholder="Enter your full name as it appears on the document"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={extracting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  🤖 AI will compare this with extracted document name for verification
                </p>
              </div>

              {/* Auto Save Option */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={extracting}
                  />
                  <span className="text-sm text-gray-700">Auto-save results</span>
                </label>
              </div>

              {/* Extract Button */}
              <button
                onClick={handleExtract}
                disabled={!selectedFile || !userEnteredName.trim() || extracting}
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-colors ${
                  selectedFile && userEnteredName.trim() && !extracting
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {extracting ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Processing with AI...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5" />
                    <span>Extract with AI Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* AI Features Info */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">🤖 AI-Powered Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Advanced Name Matching</p>
                <p className="text-gray-600">Advanced fuzzy matching algorithm compares your entered name with extracted document name using multiple similarity metrics.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Document Authenticity</p>
                <p className="text-gray-600">Detects tampering, manipulation, and authenticity issues using advanced image processing and AI techniques.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Fraud Detection</p>
                <p className="text-gray-600">Comprehensive risk scoring based on pattern analysis, duplicate detection, and ML-powered fraud indicators.</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Smart Validation</p>
                <p className="text-gray-600">Automated validation with confidence scoring and intelligent decision recommendations.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
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
