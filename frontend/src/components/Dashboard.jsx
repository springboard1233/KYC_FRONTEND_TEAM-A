import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LogOut, User, Shield, Upload, FileText, Camera, 
  ArrowLeft, CheckCircle, AlertTriangle, BarChart3, 
  Home, Settings, Bell, Menu, X, Clock, Star, Zap, Lock, 
  TrendingUp, Award, ChevronRight, Eye, Download, Users, 
  Target, Globe, Smartphone, Activity, CreditCard, Search, Trash2,
  Plus, Filter, Calendar, Loader, RefreshCw, Save, Database,
  AlertCircle, BookOpen, HardDrive, FileCheck, Cpu, Layers,
  MapPin, Phone, Mail, UserCheck, Hash, Calendar as CalendarIcon
} from 'lucide-react'
import { authService } from '../utils/auth'
import { ocrService } from '../utils/ocrService'

const Dashboard = () => {
  const navigate = useNavigate()
  
  // User & Auth State
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_records: 0,
    aadhaar_count: 0,
    pan_count: 0,
    verified_count: 0,
    avg_confidence: 0
  })
  
  // UI State
  const [currentView, setCurrentView] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [error, setError] = useState('')
  const [records, setRecords] = useState([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [expandedRecord, setExpandedRecord] = useState(null)
  
  // Upload State
  const [selectedFile, setSelectedFile] = useState(null)
  const [documentType, setDocumentType] = useState('aadhaar')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [extractionResult, setExtractionResult] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [saving, setSaving] = useState(false)

  // Prevent infinite loops
  const hasLoadedOnce = useRef(false)
  const loadingRef = useRef(false)

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    if (loadingRef.current || hasLoadedOnce.current) return

    try {
      loadingRef.current = true
      setLoading(true)
      setError('')

      if (!authService.isAuthenticated()) {
        navigate('/login')
        return
      }

      const storedUser = authService.getStoredUser()
      if (storedUser) {
        setUser(storedUser)
      }

      const [currentUser, userStats] = await Promise.all([
        authService.getCurrentUser(),
        getStats()
      ])

      setUser(currentUser)
      setStats(userStats)
      hasLoadedOnce.current = true
      
    } catch (err) {
      console.error('Dashboard loading error:', err)
      setError(err.message)
      
      if (err.message.includes('token') || err.message.includes('auth')) {
        setTimeout(() => navigate('/login'), 2000)
      }
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [navigate])

  // Get user statistics
  const getStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) throw new Error('No access token found')

      const response = await fetch('http://localhost:5000/api/records/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.stats
      }
      throw new Error(`HTTP ${response.status}`)
    } catch (err) {
      console.error('Stats fetch error:', err)
      return {
        total_records: 0,
        aadhaar_count: 0,
        pan_count: 0,
        verified_count: 0,
        avg_confidence: 0
      }
    }
  }, [])

  // Fetch all records for user
  const fetchRecords = useCallback(async () => {
    setLoadingRecords(true)
    try {
      const token = localStorage.getItem('access_token')
      if (!token) throw new Error('No access token found')

      const response = await fetch('http://localhost:5000/api/records', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRecords(data.records || [])
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (err) {
      console.error('Failed to fetch records:', err)
      setRecords([])
    } finally {
      setLoadingRecords(false)
    }
  }, [])

  // Manual save to database
  const saveToDatabase = async () => {
    if (!extractionResult) return

    setSaving(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:5000/api/records/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          extraction_result: extractionResult.extraction_result
        })
      })

      if (response.ok) {
        alert('✅ Record saved to database successfully!')
        
        // Refresh stats and records
        const newStats = await getStats()
        setStats(newStats)
        await fetchRecords()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save record')
      }
    } catch (err) {
      console.error('Save error:', err)
      alert(`❌ Failed to save record: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Delete record function
  const deleteRecord = async (recordId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this record? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      if (!token) throw new Error('No access token found')

      const response = await fetch(`http://localhost:5000/api/records/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Remove from local state
        setRecords(records.filter(record => record.id !== recordId))
        
        // Refresh stats
        const newStats = await getStats()
        setStats(newStats)
        
        alert('✅ Record deleted successfully!')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete record')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert(`❌ Failed to delete record: ${err.message}`)
    }
  }

  // Download JSON file
  const downloadJSON = (data, filename) => {
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Load dashboard on mount
  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  // Load records when switching to records view
  useEffect(() => {
    if (currentView === 'records') {
      fetchRecords()
    }
  }, [currentView, fetchRecords])

  // File upload handlers
  const handleFileSelect = (file) => {
    try {
      ocrService.validateFile(file);
      setSelectedFile(file);
      setUploadError('');
    } catch (err) {
      setUploadError(err.message);
      setSelectedFile(null);
    }
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragActive(false)
  }

  // Enhanced upload handler
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first')
      return
    }

    setUploading(true)
    setUploadError('')

    try {
      console.log('🔍 Starting OCR extraction...')
      const result = await ocrService.extractDocument(selectedFile, documentType, false) // Don't auto-save
      
      console.log('✅ OCR Result:', result)
      
      if (!result.extraction_result && !result.success) {
        throw new Error(result.error || result.details || 'OCR processing failed')
      }

      setExtractionResult(result)
      setCurrentView('results')
      
      // Reset form
      setSelectedFile(null)
      setDocumentType('aadhaar')
      
    } catch (err) {
      console.error('❌ Upload error:', err)
      
      let errorMessage = err.message || 'Unknown error occurred'
      
      if (errorMessage.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (errorMessage.includes('422')) {
        errorMessage = 'Document processing failed. Please ensure the document is clear and readable.'
      } else if (errorMessage.includes('500')) {
        errorMessage = 'Server error. Please try again later.'
      }
      
      setUploadError(`❌ Extraction Failed: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/login')
    }
  }

  const handleBack = () => {
    if (currentView === 'results') {
      setCurrentView('upload')
      setExtractionResult(null)
    } else if (currentView === 'upload') {
      setCurrentView('overview')
    } else {
      navigate(-1)
    }
  }

  // Navigation items with individual colors
  const navigationItems = [
    { id: 'overview', name: 'Dashboard', icon: Home, color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'upload', name: 'Upload', icon: Upload, color: 'bg-green-600 hover:bg-green-700' },
    { id: 'records', name: 'Records', icon: FileText, color: 'bg-purple-600 hover:bg-purple-700' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'bg-orange-600 hover:bg-orange-700' },
  ]

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-300 border-t-blue-600 mx-auto mb-4"></div>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Dashboard</h3>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-4">Connection Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Retry
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Clean Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-white shadow-lg border-r border-gray-200 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-800">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">KYC Portal</h1>
                <p className="text-xs text-gray-300">Admin Dashboard</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded hover:bg-gray-700 text-white"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* User Profile Section */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                currentView === item.id
                  ? `${item.color.split(' ')[0]} text-white`
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {!sidebarCollapsed && item.name}
            </button>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="h-4 w-4 mr-3" />
            {!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {(currentView !== 'overview' || extractionResult) && (
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </button>
              )}
              
              <div>
                <h1 className="text-2xl font-bold text-gray-800 capitalize">{currentView}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {currentView === 'overview' && 'Welcome to your KYC verification dashboard'}
                  {currentView === 'upload' && 'Upload documents for AI-powered data extraction'}
                  {currentView === 'results' && 'Review extracted data and save to database'}
                  {currentView === 'records' && 'Manage your processed document records'}
                  {currentView === 'analytics' && 'View analytics and insights'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {/* Dashboard Overview */}
          {currentView === 'overview' && (
            <div className="space-y-6">
              {/* Hero Section */}
              <div className="bg-blue-600 rounded-lg p-8 text-white">
                <div className="max-w-3xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="h-8 w-8" />
                    <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                      Secure Verification
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-3">AI-Powered KYC Verification System</h2>
                  <p className="text-lg text-blue-100 mb-6">
                    Streamline your KYC process with advanced AI-powered document verification and data extraction.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCurrentView('upload')}
                      className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50"
                    >
                      <Upload className="h-4 w-4 inline mr-2" />
                      Start Verification
                    </button>
                    <button
                      onClick={() => setCurrentView('records')}
                      className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600"
                    >
                      <FileText className="h-4 w-4 inline mr-2" />
                      View Records
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Grid - Removed Success Rate */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Total
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mb-1">{stats.total_records}</p>
                  <p className="text-sm text-gray-600">Documents Processed</p>
                  <div className="mt-3 flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    All time records
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      Verified
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mb-1">{stats.verified_count}</p>
                  <p className="text-sm text-gray-600">Successfully Processed</p>
                  <div className="mt-3 flex items-center text-xs text-green-600">
                    <Award className="h-3 w-3 mr-1" />
                    High accuracy
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Star className="h-6 w-6 text-orange-600" />
                    </div>
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      AI Score
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mb-1">{stats.avg_confidence}%</p>
                  <p className="text-sm text-gray-600">Average Confidence</p>
                  <div className="mt-3 flex items-center text-xs text-orange-600">
                    <Zap className="h-3 w-3 mr-1" />
                    AI powered
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <Globe className="h-8 w-8 text-indigo-600 mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Document Authentication</h3>
                  <p className="text-gray-600">
                    Advanced OCR technology for accurate data extraction from Aadhaar and PAN cards.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <Lock className="h-8 w-8 text-green-600 mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Secure Processing</h3>
                  <p className="text-gray-600">
                    Bank-grade security with encrypted data transmission and secure storage.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <Smartphone className="h-8 w-8 text-purple-600 mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Easy Management</h3>
                  <p className="text-gray-600">
                    Intuitive interface for managing processed documents and extracted data.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Document */}
          {currentView === 'upload' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Upload Document</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Select your document type and upload for AI-powered data extraction
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-8">
                  {/* Document Type Selection */}
                  <div className="mb-8">
                    <label className="block text-lg font-bold text-gray-800 mb-4">
                      Select Document Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                        <input
                          type="radio"
                          value="aadhaar"
                          checked={documentType === 'aadhaar'}
                          onChange={(e) => setDocumentType(e.target.value)}
                          className="sr-only"
                          disabled={uploading}
                        />
                        <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                          documentType === 'aadhaar' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {documentType === 'aadhaar' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">Aadhaar Card</div>
                            <div className="text-sm text-gray-500">Indian identity document</div>
                          </div>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                        <input
                          type="radio"
                          value="pan"
                          checked={documentType === 'pan'}
                          onChange={(e) => setDocumentType(e.target.value)}
                          className="sr-only"
                          disabled={uploading}
                        />
                        <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                          documentType === 'pan' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                        }`}>
                          {documentType === 'pan' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                            <FileText className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">PAN Card</div>
                            <div className="text-sm text-gray-500">Tax identification document</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* File Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-16 text-center transition-all ${
                      dragActive
                        ? 'border-blue-400 bg-blue-50'
                        : selectedFile
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    {selectedFile ? (
                      <div className="space-y-4">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">File Ready</h3>
                          <div className="bg-white rounded-lg p-4 max-w-sm mx-auto border">
                            <p className="font-medium text-gray-800">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-red-600 hover:text-red-700 font-medium"
                          disabled={uploading}
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">Drop your document here</h3>
                          <p className="text-gray-600 mb-4">or click to browse files</p>
                          
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileInput}
                            className="hidden"
                            id="file-upload"
                            disabled={uploading}
                          />
                          <label
                            htmlFor="file-upload"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer font-medium"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Choose File
                          </label>
                        </div>
                        <p className="text-sm text-gray-500">
                          Supports PNG, JPG, JPEG, PDF (max 16MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {uploadError && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-800 mb-1">Upload Error</h4>
                          <p className="text-red-700 text-sm">{uploadError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="mt-6">
                    <button
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      className={`w-full py-4 px-6 rounded-lg font-medium transition-all ${
                        !selectedFile || uploading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {uploading ? (
                        <div className="flex items-center justify-center">
                          <Loader className="animate-spin h-5 w-5 mr-3" />
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Camera className="h-5 w-5 mr-3" />
                          Extract Data
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results View */}
          {currentView === 'results' && extractionResult && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Processing Complete!</h2>
                <p className="text-gray-600">Your document has been successfully processed</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-green-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Zap className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">AI Extraction Results</h3>
                        <p className="text-green-600 text-sm">Document processed successfully</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {extractionResult.extraction_result?.confidence_score || 0}%
                      </div>
                      <div className="text-xs text-gray-500">Confidence</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">Extracted Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(extractionResult.extraction_result?.extracted_fields || {}).map(([key, value]) => {
                        if (key === 'document_type') return null
                        
                        return (
                          <div key={key} className="border border-gray-200 rounded-lg p-4">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                              {key.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-gray-800 font-medium">
                              {value || (
                                <span className="text-gray-400 italic">Not detected</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      onClick={saveToDatabase}
                      disabled={saving}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader className="animate-spin h-4 w-4 inline mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4 inline mr-2" />
                          Save to Database
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setCurrentView('upload')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Plus className="h-4 w-4 inline mr-2" />
                      Process Another
                    </button>
                    
                    <button
                      onClick={() => setCurrentView('records')}
                      className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium"
                    >
                      <FileText className="h-4 w-4 inline mr-2" />
                      View Records
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Records Management with Detailed View */}
          {currentView === 'records' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Records Management</h2>
                  <p className="text-gray-600 mt-1">View and manage extracted document data</p>
                </div>
                
                {records.length > 0 && (
                  <div className="flex space-x-3">
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium">
                      <Filter className="h-4 w-4 inline mr-2" />
                      Filter
                    </button>
                    <button
                      onClick={() => downloadJSON(records, `all-records-${Date.now()}.json`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                    >
                      <Download className="h-4 w-4 inline mr-2" />
                      Export All
                    </button>
                  </div>
                )}
              </div>

              {loadingRecords ? (
                <div className="text-center py-12">
                  <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading records...</p>
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
                  <HardDrive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Records Found</h3>
                  <p className="text-gray-600 mb-6">Upload your first document to get started</p>
                  <button
                    onClick={() => setCurrentView('upload')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    <Upload className="h-4 w-4 inline mr-2" />
                    Upload Document
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {records.map((record) => (
                    <div key={record.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                      {/* Record Header */}
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                              record.document_type === 'aadhaar' ? 'bg-blue-100' : 'bg-purple-100'
                            }`}>
                              <FileCheck className={`h-5 w-5 ${record.document_type === 'aadhaar' ? 'text-blue-600' : 'text-purple-600'}`} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-800 capitalize">
                                {record.document_type} Card
                              </h3>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(record.created_at).toLocaleDateString()}
                                <span className="ml-4 flex items-center">
                                  <Star className="h-4 w-4 mr-1" />
                                  {Math.round(record.confidence_score)}% Confidence
                                </span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                              className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => downloadJSON(record, `record-${record.id}.json`)}
                              className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteRecord(record.id)}
                              className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedRecord === record.id && (
                        <div className="px-6 py-4">
                          <h4 className="text-md font-bold text-gray-800 mb-4">Extracted Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(record.extracted_fields || {}).map(([key, value]) => {
                              if (key === 'document_type') return null
                              
                              // Choose appropriate icon for each field
                              let IconComponent = FileText
                              if (key === 'name') IconComponent = User
                              else if (key === 'aadhaar_number' || key === 'pan_number') IconComponent = Hash
                              else if (key === 'date_of_birth') IconComponent = CalendarIcon
                              else if (key === 'gender') IconComponent = Users
                              else if (key === 'address') IconComponent = MapPin
                              else if (key === 'father_name') IconComponent = User
                              else if (key === 'phone' || key === 'mobile') IconComponent = Phone
                              else if (key === 'email') IconComponent = Mail
                              
                              return (
                                <div key={key} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                  <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-1">
                                      <IconComponent className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                        {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      </div>
                                      <div className="text-sm text-gray-800 font-medium break-words">
                                        {value || (
                                          <span className="text-gray-400 italic">Not available</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          
                          {/* Additional Record Info */}
                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">File Name:</span>
                                <p className="text-gray-800">{record.filename}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Processing Date:</span>
                                <p className="text-gray-800">{new Date(record.created_at).toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Status:</span>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ml-2 ${
                                  record.status === 'processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {record.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics */}
          {currentView === 'analytics' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
                <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600 mb-6">
                  Comprehensive analytics and reporting features coming soon.
                </p>
                <div className="bg-orange-100 text-orange-800 px-6 py-3 rounded-lg font-medium inline-flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Under Development
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
