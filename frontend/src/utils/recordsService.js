import api from './api'; // Import the centralized axios instance

export const recordsService = {
  // Submit a record for admin review
  submitForReview: async (recordId) => {
    try {
      const response = await api.post(`/records/${recordId}/submit-review`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit for review');
    }
  },
  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await api.get('/records/stats')
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
  getRecords: async (page = 1, limit = 100, filters = {}) => {
    // Always fetch all records for the user for dashboard and "My Records"
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => value !== '' && value !== null)
        )
      })
      const response = await api.get(`/records?${params}`)
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
      return {
        records: [],
        pagination: {
          page,
          per_page: limit,
          total_count: 0,
          total_pages: 0
        }
      }
    }
  },

  // Delete a record by ID
  deleteRecord: async (recordId) => {
    try {
      await api.delete(`/records/${recordId}`);
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete record');
    }
  },

  // Get a single record by ID
  getRecordById: async (recordId) => {
    try {
      const response = await api.get(`/records/${recordId}`);
      return response.data.record;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch record');
    }
  },

  // Fetch recent fraud/compliance alerts for the user
  getFraudAlerts: async () => {
    try {
      const response = await api.get('/alerts');
      return response.data;
    } catch (error) {
      return { alerts: [] };
    }
  }
};