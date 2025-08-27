import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";

export default function ProtectedRoute() {
  const { user, token } = useAuth();

  if (!user || !token) {
    // Redirect unauthenticated users to login
    return <Navigate to="/login" replace />;
  }

  // Render nested routes if authenticated
  return <Outlet />;
}
