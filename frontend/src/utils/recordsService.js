// utils/recordsService.js - COMPLETE VERSION
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000'

const recordsAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

recordsAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Records Request Error:', error)
    return Promise.reject(error)
  }
)

recordsAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Records API Error:', error.response?.status, error.response?.data)
    if (error.response?.status === 401 || error.response?.status === 422) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const recordsService = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await recordsAPI.get('/api/records/stats')
      return response.data.stats || {
        total_records: 0,
        aadhaar_count: 0,
        pan_count: 0,
        verified_count: 0,
        high_risk_count: 0,
        medium_risk_count: 0,
        low_risk_count: 0,
        avg_confidence: 0,
        verification_success_rate: 0,
        fraud_detection_rate: 0,
        avg_fraud_score: 0
      }
    } catch (error) {
      console.error('Get stats error:', error)
      // Return default stats on error to prevent infinite loading
      return {
        total_records: 0,
        aadhaar_count: 0,
        pan_count: 0,
        verified_count: 0,
        high_risk_count: 0,
        medium_risk_count: 0,
        low_risk_count: 0,
        avg_confidence: 0,
        verification_success_rate: 0,
        fraud_detection_rate: 0,
        avg_fraud_score: 0
      }
    }
  },

  // Get user records with pagination and filters
  getRecords: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => value !== '' && value !== null)
        )
      })
      
      const response = await recordsAPI.get(`/api/records?${params}`)
      return {
        records: response.data.records || [],
        pagination: {
          page,
          per_page: limit,
          total_count: response.data.total_count || 0,
          total_pages: response.data.total_pages || 0
        }
      }
    } catch (error) {
      console.error('Get records error:', error)
      throw new Error(error.response?.data?.error || 'Failed to fetch records')
    }
  },

  // Update record status
  updateRecord: async (recordId, newStatus) => {
    try {
      const response = await recordsAPI.put(`/api/records/${recordId}`, {
        status: newStatus
      })
      return response.data
    } catch (error) {
      console.error('Update record error:', error)
      throw new Error(error.response?.data?.error || 'Failed to update record')
    }
  },

  // Delete record
  deleteRecord: async (recordId) => {
    try {
      const response = await recordsAPI.delete(`/api/records/${recordId}`)
      return response.data
    } catch (error) {
      console.error('Delete record error:', error)
      throw new Error(error.response?.data?.error || 'Failed to delete record')
    }
  },

  // Get single record by ID
  getRecordById: async (recordId) => {
    try {
      const response = await recordsAPI.get(`/api/records/${recordId}`)
      return response.data.record
    } catch (error) {
      console.error('Get record by ID error:', error)
      throw new Error(error.response?.data?.error || 'Failed to fetch record')
    }
  },

  // Export records as CSV
  exportRecords: async (filters = {}) => {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => value !== '' && value !== null)
        )
      )
      
      const response = await recordsAPI.get(`/api/records/export/csv?${params}`, {
        responseType: 'blob'
      })
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `kyc_records_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      console.error('Export records error:', error)
      throw new Error(error.response?.data?.error || 'Failed to export records')
    }
  }
}
