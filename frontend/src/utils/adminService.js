// FILE: frontend/src/utils/adminService.js
import api from './api';

export const adminService = {
  // Fetch all pending and flagged records for admin review
  getQueue: async () => {
    try {
      const response = await api.get('/admin/queue');
      return response.data.records || [];
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch admin queue');
    }
  },

  // Approve, reject, or flag a record with comments
  // FIX: Added 'admin_comment' to the function to send review notes to the backend.
  updateRecordStatus: async (recordId, action, admin_comment = '') => {
    try {
      const response = await api.post(`/admin/record/${recordId}/decision`, { 
        action,
        admin_comment 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update record status');
    }
  },

  // Get a single record by ID (for admins)
  getRecordById: async (recordId) => {
    try {
      // Note: This endpoint is defined in your admin.py but may need implementation.
      // For now, the main dashboard's record fetching is sufficient.
      const response = await api.get(`/records/${recordId}`);
      return response.data.record;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch record details');
    }
  },

  // Fetch users with pagination and filters
  getUsers: async (page = 1, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '10',
        ...filters,
      });
      const response = await api.get(`/admin/users?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch users');
    }
  },

  // Update a user's role
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update user role');
    }
  },

  // Get audit trail logs
  getAuditTrail: async (page = 1, limit = 15) => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      // Use the correct endpoint registered in Flask: '/api/audit-trail'
      const response = await api.get(`/audit-trail?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch audit trail');
    }
  },

  // Export all records
  exportRecords: async () => {
    try {
      const response = await api.get('/admin/records/export');
      return response.data.records || [];
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to export records');
    }
  }
};