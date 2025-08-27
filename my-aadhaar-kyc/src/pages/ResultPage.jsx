import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get data from navigation state
  const data = location.state?.data || null;

  // Check if data is empty or missing
  const isEmpty = !data || Object.keys(data).length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
        <p className="text-gray-600 text-lg mb-4">No extracted data found.</p>
        <button
          onClick={() => navigate("/upload")}
          className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Go Back to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow rounded-lg my-12">
      <h1 className="text-3xl font-semibold mb-8 text-center">Extracted Aadhaar Details</h1>
      <div className="space-y-4 text-gray-800">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between border-b py-2">
            <span className="font-medium capitalize">{key.replace(/_/g, " ")}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
      <div className="text-center mt-10">
        <button
          onClick={() => navigate("/upload")}
          className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Upload Another File
        </button>
      </div>
    </div>
  );
}
