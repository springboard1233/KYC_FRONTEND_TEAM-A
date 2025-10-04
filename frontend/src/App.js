import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import LandingPage from './pages/LandingPage';
import DocUploader from './pages/DocUploader';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/doc-uploader" element={<DocUploader />} />
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      
      <ToastContainer theme="dark" position="bottom-right" autoClose={3000} />
    </>
  );
}
export default App;


