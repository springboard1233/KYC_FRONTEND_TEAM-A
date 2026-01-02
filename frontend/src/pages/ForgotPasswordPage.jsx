import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import api from "../services/api";
import { Mail, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); // success message
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Call your API to request password reset email
      await api.forgotPassword(email);
      setMessage(
        "If an account with that email exists, you will receive a password reset email shortly."
      );
    } catch (err) {
      setError(
        "There was an issue sending the reset email. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <AnimatedBackground />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-yellow-300 bg-clip-text text-transparent mb-2">
            Forgot Password
          </h1>
          <p className="text-slate-400">
            Enter your email address to reset your password.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative bg-slate-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 outline-none transition-all duration-300 text-white placeholder-slate-400 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Show error */}
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

            {/* Show success message */}
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
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Email
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

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
            >
              Back to Login
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
