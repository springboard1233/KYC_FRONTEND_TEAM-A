import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();

  // On mount, optionally verify token / fetch user info
  useEffect(() => {
    if (token) {
      // Mock: set user info if token exists, replace with API call as needed
      setUser({ email: "user@example.com" });
    }
  }, [token]);

  async function signup(data) {
    console.log("Signup called with", data);
    // TODO: Replace with real signup API call

    // After successful signup, navigate to login page
    navigate("/login");
  }

  async function login(data) {
    console.log("Login called with", data);
    // TODO: Replace with real login API call and token retrieval

    // Mock login success
    const fakeToken = "fake-jwt-token";
    localStorage.setItem("token", fakeToken);
    setToken(fakeToken);
    setUser({ email: data.email });

    navigate("/upload");
  }

  function logout() {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, token, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
