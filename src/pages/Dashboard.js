import React, { useState } from "react";
import UploadForm from "../components/UploadForm";
import AadhaarPreview from "../components/AadhaarPreview";

export default function Dashboard() {
  const [data, setData] = useState(null);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <UploadForm onExtract={setData} />
      {data && <AadhaarPreview data={data} />}
    </div>
  );
}
