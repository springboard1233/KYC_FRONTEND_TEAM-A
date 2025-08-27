import React from "react";

export default function AadhaarPreview({ data }) {
  return (
    <div className="border p-4 rounded bg-gray-50 mt-4">
      <h2 className="text-xl font-semibold mb-2">Extracted Data</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
