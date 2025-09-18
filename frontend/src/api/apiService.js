import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// This is the interceptor. It runs BEFORE every request is sent.
api.interceptors.request.use(
  (config) => {
    // Get the user object from localStorage
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      const token = user?.token;
      
      // If a token exists, add it to the Authorization header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;