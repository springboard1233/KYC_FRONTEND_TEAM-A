// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import SignupPage from './pages/Register';
import HomePage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DocUploader';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Route for the main application */}
        <Route 
          path="/doc-uploader" 
          element={
            // <ProtectedRoute>
              <DashboardPage />
            // </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;