import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000'

// Create axios instance with timeout and retry configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 5 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request ID for debugging
    config.metadata = { startTime: new Date() }
    console.log(`API Request [${config.method.toUpperCase()}] ${config.url}`)
    
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime
    console.log(`API Response [${response.status}] ${response.config.url} (${duration}ms)`)
    return response
  },
  (error) => {
    const duration = error.config?.metadata ? new Date() - error.config.metadata.startTime : 0
    console.error(`API Error [${error.response?.status || 'TIMEOUT'}] ${error.config?.url} (${duration}ms):`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    
    // Handle authentication errors without redirect loops
    if (error.response?.status === 401 || error.response?.status === 422) {
      console.log('Authentication failed, clearing tokens')
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      
      // Only redirect if not already on login/signup page
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/signup' && currentPath !== '/') {
        console.log('Redirecting to login due to auth error')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export const authService = {
  signup: async (userData) => {
    try {
      const response = await api.post('/api/signup', userData)
      
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || 'Signup failed'
      throw new Error(message)
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/api/login', credentials)
      
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response.data
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed'
      throw new Error(message)
    }
  },

  logout: async () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/me')
      return response.data.user
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to get user info'
      throw new Error(message)
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token')
  },

  getStoredUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}
