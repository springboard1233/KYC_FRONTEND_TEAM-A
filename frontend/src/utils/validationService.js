// frontend/src/utils/validationService.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Aadhaar: 12 digits, not all same digit, not in blacklist
export function validateAadhaarFormat(aadhaar) {
  const aadhaarStr = String(aadhaar).replace(/\s+/g, "");
  if (!/^\d{12}$/.test(aadhaarStr)) {
    return { valid: false, error: "Aadhaar must be 12 digits." };
  }
  if (/^(\d)\1{11}$/.test(aadhaarStr)) {
    return { valid: false, error: "Aadhaar cannot have all digits the same." };
  }
  // Add more blacklist checks as needed
  return { valid: true };
}

// PAN: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
export function validatePANFormat(pan) {
  const panStr = String(pan).toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panStr)) {
    return { valid: false, error: "PAN must be in format: ABCDE1234F." };
  }
  return { valid: true };
}

// Mock API: Aadhaar verification (simulate UIDAI sandbox)
export async function verifyAadhaarAPI(aadhaar) {
  try {
    const res = await fetch(`${API_BASE_URL}/mock/verify-aadhaar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aadhaar }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Aadhaar verification failed");
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Mock API: PAN verification
export async function verifyPANAPI(pan) {
  try {
    const res = await fetch(`${API_BASE_URL}/mock/verify-pan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pan }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "PAN verification failed");
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}