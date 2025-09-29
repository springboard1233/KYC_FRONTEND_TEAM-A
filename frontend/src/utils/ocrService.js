// FILE: frontend/src/utils/ocrService.js
import api from './api';

export const ocrService = {
  async extractDocument({ file, documentType, userEnteredName }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doctype', documentType);
    formData.append('user_entered_name', userEnteredName);

    try {
      const response = await api.post('/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Document extraction failed');
    }
  },
};