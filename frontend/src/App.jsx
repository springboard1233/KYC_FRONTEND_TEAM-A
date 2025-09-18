import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'  // ← Remove BrowserRouter import
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import { authService } from './utils/auth'
import './styles/dashboard.css'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated()
  return isAuthenticated ? children : <Navigate to="/login" />
}

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated()
  return isAuthenticated ? <Navigate to="/dashboard" /> : children
}

function App() {
  return (
    // ← Remove <Router> wrapper since it's already in main.jsx
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-4">Page not found</p>
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="btn-primary"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App
