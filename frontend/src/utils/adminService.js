// FILE: frontend/src/utils/adminService.js
import api from './api';

export const adminService = {
  // Fetch all pending records for admin review
  getQueue: async () => {
    try {
      const response = await api.get('/admin/queue');
      return response.data.records || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch admin queue');
    }
  },

  // Approve or reject a record
  updateRecordStatus: async (recordId, action) => {
    try {
      const response = await api.post(`/admin/record/${recordId}/decision`, { action });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update record status');
    }
  },

  // Get a single record by ID (for admins)
  getRecordById: async (recordId) => {
    try {
      const response = await api.get(`/admin/record/${recordId}`);
      return response.data.record;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch record details');
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
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  // Update a user's role
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user role');
    }
  },

  // Get audit trail logs
  getAuditTrail: async (page = 1, limit = 15) => {
    try {
      const params = new URLSearchParams({ page, limit });
      const response = await api.get(`/audit-trail?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch audit trail');
    }
  },

  // Export all records
  exportRecords: async () => {
    try {
      const response = await api.get('/admin/records/export');
      return response.data.records || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export records');
    }
  }
};