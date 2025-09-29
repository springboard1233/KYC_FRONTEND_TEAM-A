// FILE: frontend/src/utils/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '/api',  // Use a relative path for the Vite proxy
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('kyc_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // If unauthorized or not found on /me, clear token and redirect to login
        if (
            error.response &&
            (error.response.status === 401 || error.response.status === 404) &&
            error.config &&
            error.config.url &&
            error.config.url.includes('/me')
        ) {
            localStorage.removeItem('kyc_token');
            if (localStorage.getItem('user')) {
                localStorage.removeItem('user');
            }
            window.location.href = '/login';
            return; // Prevent further error handling
        }
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;