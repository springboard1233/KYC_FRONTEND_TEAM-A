import axios from "axios";

const API_BASE = "http://localhost:5000/api"; // Backend base URL

// Read token from localStorage
const getToken = () => localStorage.getItem("token") || "";

// Create an axios instance with base URL
const axiosInstance = axios.create({
  baseURL: API_BASE,
});

// Add Authorization header automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log("Sending token:", token); // Add this line to debug
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const api = {
  /**
   * Delete a document by ID
   * @param {string} documentId
   */
  deleteDocument: async (documentId) => {
    try {
      const res = await axiosInstance.delete(`/docs/${documentId}`);
      return res.data;
    } catch (error) {
      console.error(
        "Delete document failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Preview document by ID
   * Returns a URL to open the preview
   * @param {string} documentId
   */
  previewDocument: async (documentId) => {
    try {
      // Assuming backend returns a URL to preview
      const res = await axiosInstance.get(`/docs/${documentId}/preview`);
      return res.data.previewUrl; // adjust based on your backend response
    } catch (error) {
      console.error(
        "Preview document failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Download document by ID
   * Triggers download in browser
   * @param {string} documentId
   */
  downloadDocument: async (documentId) => {
    try {
      const res = await axiosInstance.get(`/docs/${documentId}/download`, {
        responseType: "blob",
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      // You can get filename from headers or generate one:
      link.setAttribute("download", `document_${documentId}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(
        "Download document failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  /**
   * Login user
   */
  login: async (email, password, role) => {
    try {
      const res = await axiosInstance.post("/auth/login", {
        email,
        password,
        role, // 🔑 send role to backend
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.userId);
        localStorage.setItem("email", email);
        localStorage.setItem("role", role); // 🔑 store role for later use
      }

      return res.data;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Signup new user
   */
  signup: async (name, email, password, role) => {
    try {
      const res = await axiosInstance.post("/auth/signup", {
        name,
        email,
        password,
        role,
      });

      return res.data;
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Upload document for OCR
   */
  uploadDocument: async (file) => {
    try {
      const token = getToken();
      console.log("Upload token being used:", token); // Add this
      const formData = new FormData();
      formData.append("document", file);

      const res = await axiosInstance.post("/docs/upload-doc", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    } catch (error) {
      console.error(
        "Document upload failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Get previously uploaded user documents
   */
  getUserDocs: async () => {
    try {
      const res = await axiosInstance.get("/docs/get-user-docs");
      return res.data;
    } catch (error) {
      console.error(
        "Fetching user docs failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  submitKYC: async (kycData) => {
    try {
      const res = await axiosInstance.post("/kyc/submit", kycData);
      return res.data;
    } catch (error) {
      console.error(
        "KYC submission failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email) => {
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      return res.data;
    } catch (error) {
      console.error(
        "Forgot password request failed:",
        error.response?.data || error.message
      );
      throw new Error("Failed to send reset email");
    }
  },

  // ---------------- AI Fraud Detection APIs ----------------
  aiVerifyDoc: async (formData) => {
    try {
      const res = await axiosInstance.post(
        "/verification/verify-doc",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data;
    } catch (error) {
      console.error(
        "AI document verification failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Fetch fraud score for a given user
   * @param {string} userId
   */
  getFraudScore: async (userId) => {
    try {
      const res = await axiosInstance.get(`/ai/fraud-score/${userId}`);
      return res.data; // { userId, fraud_score, risk_level }
    } catch (error) {
      console.error(
        "Fetching fraud score failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  getDocumentStatus: async (documentId) => {
    const token = getToken();

    const response = await fetch(`/api/docs/${documentId}/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      `Fetching status for document ID: ${documentId}, response status: ${response.status}`
    );

    // Read the response body as text once
    const text = await response.text();

    if (!response.ok) {
      console.error(`Error fetching document status:`, text);
      throw new Error(
        `Network response was not ok: ${response.status} ${response.statusText}`
      );
    }

    try {
      // Parse JSON from the text
      const data = JSON.parse(text);
      console.log("Document status data:", data);
      return data.status;
    } catch (err) {
      console.error("Failed to parse JSON response:", text);
      throw err;
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const res = await axiosInstance.post(`/auth/reset-password/${token}`, {
        password: newPassword,
      });
      return res.data;
    } catch (error) {
      console.error(
        "Reset password request failed:",
        error.response?.data || error.message
      );
      throw new Error("Failed to reset password");
    }
  },
};
export default api;
