import React, { useState, useEffect } from 'react'
import { Search, Filter, ChevronLeft, ChevronRight, FileText, Calendar, User, Hash, Eye, Trash2, Edit } from 'lucide-react'
import { recordsService } from '../utils/recordsService'

const RecordsList = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    document_type: '',
    status: '',
    min_confidence: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => {
    loadRecords()
  }, [currentPage, filters])

  const loadRecords = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await recordsService.getRecords(currentPage, 10, filters)
      setRecords(response.records)
      setPagination(response.pagination)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleStatusUpdate = async (recordId, newStatus) => {
    try {
      await recordsService.updateRecord(recordId, newStatus)
      loadRecords() // Reload records
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return
    }

    try {
      await recordsService.deleteRecord(recordId)
      loadRecords() // Reload records
    } catch (err) {
      setError(err.message)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading && records.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading records...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type
            </label>
            <select
              value={filters.document_type}
              onChange={(e) => handleFilterChange('document_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="aadhaar">Aadhaar</option>
              <option value="pan">PAN</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="processed">Processed</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Confidence
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.min_confidence}
              onChange={(e) => handleFilterChange('min_confidence', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0-100"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ document_type: '', status: '', min_confidence: '' })
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Document Records ({pagination.total_count || 0})
          </h3>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Records Found</h3>
            <p className="text-gray-600">
              {Object.values(filters).some(f => f) 
                ? 'Try adjusting your filters or upload some documents'
                : 'Upload your first document to see records here'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fields
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Processed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {record.document_type.toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.original_filename}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {record.extracted_fields.name && (
                            <div className="flex items-center mb-1">
                              <User className="h-3 w-3 text-gray-400 mr-1" />
                              {record.extracted_fields.name}
                            </div>
                          )}
                          {(record.extracted_fields.aadhaar_number || record.extracted_fields.pan_number) && (
                            <div className="flex items-center">
                              <Hash className="h-3 w-3 text-gray-400 mr-1" />
                              {record.extracted_fields.aadhaar_number || record.extracted_fields.pan_number}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getConfidenceColor(record.confidence_score)}`}>
                          {record.confidence_score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                          {formatDate(record.processed_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {record.status === 'processed' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(record.id, 'verified')}
                                className="text-green-600 hover:text-green-900"
                                title="Mark as Verified"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(record.id, 'rejected')}
                                className="text-red-600 hover:text-red-900"
                                title="Mark as Rejected"
                              >
                                ✗
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.per_page) + 1} to{' '}
                  {Math.min(pagination.page * pagination.per_page, pagination.total_count)} of{' '}
                  {pagination.total_count} results
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!pagination.has_prev}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <span className="px-3 py-1 text-gray-700">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.total_pages))}
                    disabled={!pagination.has_next}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Record Details</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {/* Record details content */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Document Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Type:</strong> {selectedRecord.document_type.toUpperCase()}</p>
                    <p><strong>Filename:</strong> {selectedRecord.original_filename}</p>
                    <p><strong>Confidence:</strong> {selectedRecord.confidence_score}%</p>
                    <p><strong>Status:</strong> {selectedRecord.status}</p>
                    <p><strong>Processed:</strong> {formatDate(selectedRecord.processed_at)}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Extracted Fields</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {Object.entries(selectedRecord.extracted_fields).map(([key, value]) => (
                      <p key={key}>
                        <strong>{key.replace('_', ' ').toUpperCase()}:</strong> {value || 'Not detected'}
                      </p>
                    ))}
                  </div>
                </div>
                
                <details>
                  <summary className="cursor-pointer font-semibold">Raw Extracted Text</summary>
                  <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                    <pre className="text-xs whitespace-pre-wrap">{selectedRecord.raw_text}</pre>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecordsList
