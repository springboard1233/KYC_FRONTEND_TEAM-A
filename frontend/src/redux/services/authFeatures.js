import axios from "axios";

// Using the full URL is safer here to avoid conflicts
const USER_API_URL = "http://localhost:5000/api/users";
const ADMIN_API_URL = "http://localhost:5000/api/admins";

// --- User Functions ---
const register = async (userData) => {
  const response = await axios.post(`${USER_API_URL}/register`, userData);
  return response.data;
};

const login = async (userData) => {
  const response = await axios.post(`${USER_API_URL}/login`, userData);
  return response.data;
};


// --- NEW Admin Function ---
const loginAdmin = async (adminData) => {
  // This calls your new Node.js admin endpoint
  const response = await axios.post(`${ADMIN_API_URL}/login`, adminData);
  return response.data;
};


const authService = {
  register,
  login,
  loginAdmin, // <-- ADD THIS LINE to export the function
};

export default authService;