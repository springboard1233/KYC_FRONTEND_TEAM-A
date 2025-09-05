import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000'

const ocrAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

ocrAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

ocrAPI.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const ocrService = {
  extractDocument: async (file, documentType, autoSave = true) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('doctype', documentType)
      formData.append('save_record', autoSave.toString())

      const response = await ocrAPI.post('/api/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error) {
      const message = error.response?.data?.error || 'Document extraction failed'
      throw new Error(message)
    }
  },

  validateFile: (file) => {
    const maxSize = 16 * 1024 * 1024 // 16MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']

    if (!file) {
      throw new Error('No file selected')
    }

    if (file.size > maxSize) {
      throw new Error('File size must be less than 16MB')
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PNG, JPG, JPEG, and PDF files are allowed')
    }

    return true
  }
}
