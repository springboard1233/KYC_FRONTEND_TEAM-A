// utils/validationService.js
class ValidationService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
  }

  async validateAadhaar(aadhaarNumber) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${this.baseURL}/validate-aadhaar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ number: aadhaarNumber })
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: data
      };
    } catch (error) {
      console.error('Aadhaar validation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async validatePAN(panNumber) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${this.baseURL}/validate-pan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ number: panNumber })
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: data
      };
    } catch (error) {
      console.error('PAN validation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async validateDocument(documentType, extractedFields) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${this.baseURL}/validate-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          document_type: documentType,
          extracted_fields: extractedFields
        })
      });

      const data = await response.json();
      return {
        success: response.ok,
        data: data
      };
    } catch (error) {
      console.error('Document validation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const validationService = new ValidationService();
