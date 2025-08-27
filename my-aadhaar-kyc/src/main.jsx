import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Upload from "./pages/Upload";
import ResultPage from "./pages/ResultPage";

import { AuthProvider } from "./hooks/AuthProvider"; // Auth context
import ProtectedRoute from "./components/ProtectedRoute"; // Route guard

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate replace to="/login" />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/upload" element={<Upload />} />
            <Route path="/result" element={<ResultPage />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<p>404: Page Not Found</p>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);