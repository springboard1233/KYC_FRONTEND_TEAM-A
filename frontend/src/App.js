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
// import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* We are not protecting routes yet for speed. You can add <ProtectedRoute> later. */}
          <Route path="/doc-uploader" element={<DocUploader />} />
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      {/* This component enables notifications throughout your app */}
      <ToastContainer theme="dark" position="bottom-right" autoClose={3000} />
    </>
  );
}
export default App;


// // src/App.jsx
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import LoginPage from './pages/Login';
// import SignupPage from './pages/Register';
// import HomePage from './pages/LandingPage';
// import ProtectedRoute from './components/ProtectedRoute';
// import DashboardPage from './pages/DocUploader';
// import './App.css';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/" element={<HomePage />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/signup" element={<SignupPage />} />

//         {/* Protected Route for the main application */}
//         <Route 
//           path="/doc-uploader" 
//           element={
//             // <ProtectedRoute>
//               <DashboardPage />
//             // </ProtectedRoute>
//           } 
//         />
        
//         <Route path="*" element={<Navigate to="/" />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;