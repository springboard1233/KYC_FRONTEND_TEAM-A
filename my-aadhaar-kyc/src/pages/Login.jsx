import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    console.log("Login data:", data);
    navigate("/upload");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-600 to-indigo-700 px-4">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-md shadow-xl rounded-3xl p-10 border border-gray-200"
      >
        <h1 className="text-4xl font-extrabold text-center mb-8 text-indigo-900 tracking-wide">
          Aadhaar KYC Login
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block mb-2 text-gray-700 font-semibold text-sm">Email</label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-3 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1 ml-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-gray-700 font-semibold text-sm">Password</label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className={`w-full px-4 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-3 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1 ml-1">{errors.password.message}</p>
            )}
          </div>

          {/* Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 font-semibold text-lg"
          >
            Login
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
