import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import api from "../services/api";
import {
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.resetPassword(token, password);
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      <AnimatedBackground />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-600 to-amber-500 rounded-3xl mb-6 shadow-2xl shadow-yellow-500/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Lock className="w-10 h-10 text-black" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-yellow-300 bg-clip-text text-transparent mb-2">
            Reset Password
          </h1>
          <p className="text-slate-400">
            Set a new secure password for your account
          </p>
        </motion.div>

        {/* Reset Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative bg-slate-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800 p-8"
        >
          {/* Glowing border */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-amber-400/10 rounded-3xl blur-xl" />

          <div className="relative z-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 outline-none transition-all duration-300 text-white placeholder-slate-400 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-500 hover:text-yellow-400 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-500 hover:text-yellow-400 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Confirm New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 outline-none transition-all duration-300 text-white placeholder-slate-400 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-500 hover:text-yellow-400 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-500 hover:text-yellow-400 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center p-3 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </motion.div>
              )}

              {/* Success Message */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center p-3 bg-green-500/10 border border-green-500/30 rounded-xl backdrop-blur-sm"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                  <p className="text-sm text-green-300">{message}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className={`relative w-full py-3 px-4 rounded-xl font-semibold text-lg shadow-2xl transition-all duration-300 overflow-hidden group ${
                  loading
                    ? "bg-slate-700 cursor-not-allowed text-slate-400"
                    : "bg-gradient-to-r from-yellow-600 to-amber-500 text-black hover:from-yellow-500 hover:to-amber-400 shadow-yellow-500/25"
                }`}
                whileHover={loading ? {} : { scale: 1.02, y: -2 }}
                whileTap={loading ? {} : { scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                {!loading && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-600 opacity-0 group-hover:opacity-100 rounded-xl"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-8 text-sm text-slate-500"
        >
          <p>
            Remembered your password?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
            >
              Sign In
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
