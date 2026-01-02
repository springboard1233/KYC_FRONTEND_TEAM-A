import api from "../services/api";

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await api.post("/extract", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data; // { success: true/false, data: {...}, error: "" }
  } catch (err) {
    console.error("Upload failed", err);
    return { success: false, error: err.message };
  }
};
