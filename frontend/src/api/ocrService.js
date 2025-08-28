import axios from 'axios';

const API_URL = "http://localhost:5001/api/extract";

export const extractTextFromImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Server error occurred.');
    } else if (error.request) {
      throw new Error('Backend server not responding. Please ensure it is running.');
    } else {
      throw new Error('An error occurred while sending the request.');
    }
  }
};