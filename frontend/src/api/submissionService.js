import axios from "axios";

export const submitSubmission = async ({ userId, userName, docType, fraudScore, reasons }) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(
    "http://localhost:5000/api/submissions",
    {
      userId,
      userName,
      docType,
      fraudScore,
      reasons,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
};




