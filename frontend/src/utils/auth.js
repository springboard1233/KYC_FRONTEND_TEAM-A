
import api from './api';

// Store keys
const TOKEN_KEY = 'kyc_token';
const USER_KEY = 'kyc_user';

// Authentication service
export const authService = {
  // Login function
  async login(email, password) {
    try {
      console.log('Attempting login with:', { email });
      const response = await api.post('/login', { email, password });
      
      if (response.data && response.data.access_token) {
        localStorage.setItem(TOKEN_KEY, response.data.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        
        // Set the Authorization header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        
        console.log('Login successful, token stored');
        return { success: true, user: response.data.user };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed. Please try again.' 
      };
    }
  },

  // Logout function
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Remove Authorization header
    delete api.defaults.headers.common['Authorization'];
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    
    // Set the Authorization header if token exists
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return true;
  },

  // Get stored token
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get stored user
  getStoredUser() {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },
  
  // Refresh user data from server
  async refreshUserData() {
    if (!this.isAuthenticated()) return null;
    
    try {
      const response = await api.get('/me');
      if (response.data) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // If unauthorized, logout
      if (error.response?.status === 401) {
        this.logout();
      }
      return null;
    }
  },

  // Signup function
  async signup(name, email, password) {
    try {
      console.log('Attempting signup with:', { name, email });
      const response = await api.post('/signup', { name, email, password });
      // On successful signup, backend now sends a message and email
      return { success: true, message: response.data.message, email: response.data.email };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Signup failed. Please try again.' 
      };
    }
  },

  // Verify OTP
  async verifyOtp(email, otp) {
    const response = await api.post('/verify-otp', { email, otp });
    if (response.data && response.data.access_token) {
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      return { success: true, user: response.data.user };
    }
    throw new Error(response.data.error || 'OTP verification failed');
  },

  // Resend OTP
  async resendOtp(email) {
    const response = await api.post('/resend-otp', { email });
    if (response.status === 200) {
      return { success: true, message: response.data.message };
    }
    throw new Error(response.data.error || 'Failed to resend OTP');
  }
};