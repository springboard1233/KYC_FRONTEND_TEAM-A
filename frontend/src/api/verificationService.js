import axios from 'axios';
import { toast } from 'react-toastify';


const PYTHON_API_URL = "http://localhost:5001/api";

const NODE_API_URL = "http://localhost:5000/api";

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

export const submitSubmission = async ({ file, docType, fraudScore, reasons, token }) => {
  const formData = new FormData();
  if (file) formData.append('file', file);
  formData.append('docType', docType);
  formData.append('fraudScore', fraudScore);
  if (Array.isArray(reasons)) {
    reasons.forEach(r => formData.append('reasons', r));
  } else {
    formData.append('reasons', reasons || '');
  }

  const authToken = token || localStorage.getItem('authToken') || localStorage.getItem('token'); // adapt to your storage key

  try {
    const headers = authToken ? { Authorization: `Bearer ${authToken}`, 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'multipart/form-data' };
    const response = await axios.post(`${NODE_API_URL}/submissions`, formData, { headers });
    toast.success("Submission sent to admins!");
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to submit for verification.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

