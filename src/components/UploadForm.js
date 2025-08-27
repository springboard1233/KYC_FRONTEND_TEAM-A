import React, { useState } from "react";
import axios from "axios";

export default function UploadForm({ onExtract }) {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("http://127.0.0.1:5000/api/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onExtract(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mb-2" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Upload & Extract</button>
    </form>
  );
}
