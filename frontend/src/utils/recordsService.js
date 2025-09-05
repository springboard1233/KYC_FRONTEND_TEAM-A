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
    console.log('Records API Request:', config.method, config.url)
    return config
  },
  (error) => {
    console.error('Records Request Error:', error)
    return Promise.reject(error)
  }
)

recordsAPI.interceptors.response.use(
  (response) => {
    console.log('Records API Response:', response.status, response.data)
    return response
  },
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
  getStats: async () => {
    try {
      const response = await recordsAPI.get('/api/records/stats')
      return response.data.stats
    } catch (error) {
      console.error('Get stats error:', error)
      // Return default stats on error to prevent infinite loading
      return {
        total_records: 0,
        aadhaar_count: 0,
        pan_count: 0,
        verified_count: 0,
        avg_confidence: 0
      }
    }
  }
}
