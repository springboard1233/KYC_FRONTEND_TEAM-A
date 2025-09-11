// import axios from 'axios';
// import { toast } from 'react-toastify';

// // The URL for your Python verification server
// const VERIFY_API_URL = "http://localhost:5001/api/verify-document";

// export const verifyDocument = async (file, userName) => {
//   const formData = new FormData();
//   formData.append('file', file);
//   formData.append('userEnteredName', userName);

//   try {
//     const response = await axios.post(VERIFY_API_URL, formData);
//     toast.success("Verification complete!");
//     return response.data;
//   } catch (error) {
//     const errorMessage = error.response?.data?.error || "An error occurred during verification.";
//     toast.error(errorMessage);
//     throw new Error(errorMessage);
//   }
// };


import axios from 'axios';
import { toast } from 'react-toastify';

// Python server running on port 5001
const PYTHON_API_URL = "http://localhost:5001/api";

// API 1: For simple text extraction
export const extractText = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await axios.post(`${PYTHON_API_URL}/extract`, formData);
    toast.success("Text extracted successfully!");
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || "OCR Extraction failed.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// API 2: For full fraud verification
export const verifyDocument = async (file, userName) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userEnteredName', userName);
  try {
    const response = await axios.post(`${PYTHON_API_URL}/verify-document`, formData);
    toast.success("Verification complete!");
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || "Verification failed.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};