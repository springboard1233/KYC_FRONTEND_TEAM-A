import React from 'react'
import { CheckCircle, AlertTriangle, FileText, User, Calendar, MapPin, Hash } from 'lucide-react'

const ExtractionResults = ({ result, onSave, onNewExtraction }) => {
  if (!result) return null

  const formatFieldValue = (value) => {
    if (!value || value === 'null' || value === null) {
      return <span className="text-gray-400 italic">Not detected</span>
    }
    return <span className="font-medium">{value}</span>
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100'
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getFieldIcon = (fieldName) => {
    switch (fieldName) {
      case 'name':
        return <User className="h-4 w-4" />
      case 'date_of_birth':
        return <Calendar className="h-4 w-4" />
      case 'address':
        return <MapPin className="h-4 w-4" />
      case 'aadhaar_number':
      case 'pan_number':
        return <Hash className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getFieldLabel = (fieldName) => {
    const labels = {
      name: 'Full Name',
      date_of_birth: 'Date of Birth',
      gender: 'Gender',
      address: 'Address',
      aadhaar_number: 'Aadhaar Number',
      pan_number: 'PAN Number',
      father_name: "Father's Name"
    }
    return labels[fieldName] || fieldName.replace('_', ' ').toUpperCase()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">
              Extraction Complete
            </h3>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(result.confidence_score)}`}>
            {result.confidence_score}% Confidence
          </div>
        </div>

        {/* Document Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Document Type:</span>
              <span className="ml-2 font-medium capitalize">{result.document_type}</span>
            </div>
            <div>
              <span className="text-gray-500">Processed:</span>
              <span className="ml-2 font-medium">
                {new Date(result.processing_timestamp).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500">File:</span>
              <span className="ml-2 font-medium">{result.filename}</span>
            </div>
          </div>
        </div>

        {/* Extracted Fields */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Extracted Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(result.extracted_fields).map(([fieldName, fieldValue]) => {
              if (fieldName === 'document_type') return null
              
              return (
                <div key={fieldName} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="text-gray-500 mr-2">
                      {getFieldIcon(fieldName)}
                    </div>
                    <label className="text-sm font-medium text-gray-700">
                      {getFieldLabel(fieldName)}
                    </label>
                  </div>
                  <div className="text-gray-900">
                    {formatFieldValue(fieldValue)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quality Check */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Quality Assessment</h4>
          
          <div className="space-y-3">
            {result.confidence_score >= 80 && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span>High confidence extraction - Data appears accurate</span>
              </div>
            )}
            
            {result.confidence_score >= 60 && result.confidence_score < 80 && (
              <div className="flex items-center text-yellow-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>Medium confidence - Please verify extracted data</span>
              </div>
            )}
            
            {result.confidence_score < 60 && (
              <div className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>Low confidence - Manual verification recommended</span>
              </div>
            )}
            
            {/* Check for missing fields */}
            {Object.values(result.extracted_fields).some(val => !val || val === 'null') && (
              <div className="flex items-center text-orange-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>Some fields could not be detected - Check document quality</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onSave && onSave(result)}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <CheckCircle className="inline h-5 w-5 mr-2" />
            Save Record
          </button>
          
          <button
            onClick={() => onNewExtraction && onNewExtraction()}
            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            <FileText className="inline h-5 w-5 mr-2" />
            Process Another Document
          </button>
        </div>

        {/* Raw Text (Collapsible) */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            View Raw Extracted Text
          </summary>
          <div className="mt-3 p-4 bg-gray-100 rounded-lg">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
              {result.raw_text}
            </pre>
          </div>
        </details>
      </div>
    </div>
  )
}

export default ExtractionResults
