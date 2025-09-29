// FILE: frontend/src/utils/complianceService.js
const API_BASE_URL = '/api-compliance'; // Use a relative path for the new proxy rule

const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('kyc_token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Compliance service error hitting ${endpoint}:`, error);
    throw error;
  }
};

export const complianceService = {
  getStats: () => {
    return apiRequest('/compliance-stats');
  },
  getAlerts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/alerts?${query}`);
  },
  resolveAlert: (alertId, resolution_notes) => {
    return apiRequest(`/alerts/${alertId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution_notes }),
    });
  },
  getAuditTrail: (page = 1, limit = 10) => {
    // Fetch paginated audit trail data from the dedicated endpoint
    return apiRequest(`/audit-trail?page=${page}&limit=${limit}`);
  }
};