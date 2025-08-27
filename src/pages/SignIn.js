import React from "react";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
        <input type="text" placeholder="Username" className="w-full p-2 border mb-3" required />
        <input type="password" placeholder="Password" className="w-full p-2 border mb-3" required />
        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">Sign In</button>
      </form>
    </div>
  );
}
