import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/apiClient"; // Axios instance
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      setUser({ email: "user@example.com" }); // temporary placeholder, replace with backend fetch if needed
    }
  }, [token]);

  async function signup(data) {
    try {
      const response = await apiClient.post("/signup", {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      alert(response.data.message || "Signup successful");
      navigate("/login");
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.message || "Signup failed");
      } else {
        alert("Signup failed. Please try again.");
      }
    }
  }

  async function login(data) {
    try {
      const response = await apiClient.post("/login", {
        username: data.username,
        password: data.password,
      });
      alert(response.data.message || "Login successful");
      const fakeToken = "fake-jwt-token";
      localStorage.setItem("token", fakeToken);
      setToken(fakeToken);
      setUser({ username: data.username });
      navigate("/upload");
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.message || "Login failed");
      } else {
        alert("Login failed. Please try again.");
      }
    }
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
