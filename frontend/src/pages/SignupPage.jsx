import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import api from "../services/api";
import {
  Eye,
  EyeOff,
  Shield,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle,
  Check,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user", // default role
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();

  // Password strength validation
  const passwordRequirements = [
    { test: (pwd) => pwd.length >= 8, text: "At least 8 characters" },
    { test: (pwd) => /[A-Z]/.test(pwd), text: "One uppercase letter" },
    { test: (pwd) => /[a-z]/.test(pwd), text: "One lowercase letter" },
    { test: (pwd) => /\d/.test(pwd), text: "One number" },
    {
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      text: "One special character",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.signup(form.name, form.email, form.password, form.role);
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <AnimatedBackground />

      <div className="w-full max-w-4xl relative z-10">
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
            <Shield className="w-10 h-10 text-black" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-yellow-300 bg-clip-text text-transparent mb-2">
            SecureKYC
          </h1>
          <div className="flex items-center justify-center">
            <p className="text-slate-400">Create Your Secure Account</p>
            <Sparkles className="w-4 h-4 text-yellow-400 ml-2" />
          </div>
        </motion.div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative bg-slate-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800 p-8 "
        >
          {/* Glowing border */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-amber-400/10 rounded-3xl blur-xl" />

          <div className="relative z-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Get Started
              </h2>
              <p className="text-slate-400">
                Join thousands of secure users worldwide
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First row: Full Name and Email */}
              <div className="flex space-x-4">
                {/* Full Name Field */}
                <div className="flex-1">
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-slate-300 mb-2"
                  >
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 outline-none transition-all duration-300 text-white placeholder-slate-400 backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="flex-1">
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
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 outline-none transition-all duration-300 text-white placeholder-slate-400 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Second row: Password and Confirm Password */}
              <div className="flex space-x-4">
                {/* Password Field */}
                <div className="flex-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-300 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required
                      className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 outline-none transition-all duration-300 text-white placeholder-slate-400 backdrop-blur-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-500 hover:text-yellow-400 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-500 hover:text-yellow-400 transition-colors" />
                      )}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  {form.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 p-4 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30"
                    >
                      <p className="text-sm font-medium text-slate-300 mb-3">
                        Password Requirements:
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {passwordRequirements.map((req, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center text-xs"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            {req.test(form.password) ? (
                              <Check className="w-3 h-3 text-amber-400 mr-2 flex-shrink-0" />
                            ) : (
                              <X className="w-3 h-3 text-red-400 mr-2 flex-shrink-0" />
                            )}
                            <span
                              className={
                                req.test(form.password)
                                  ? "text-amber-300"
                                  : "text-slate-400"
                              }
                            >
                              {req.text}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="flex-1">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-slate-300 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                      }
                      required
                      className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 outline-none transition-all duration-300 text-white placeholder-slate-400 backdrop-blur-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-500 hover:text-yellow-400 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-500 hover:text-yellow-400 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="mb-4">
                  <label
                    htmlFor="role"
                    className="block text-sm font-semibold text-slate-300 mb-2"
                  >
                    Select Role
                  </label>
                  <select
                    id="role"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full py-3 px-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 outline-none transition-all"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Terms Acceptance */}
              <div className="flex items-start space-x-3">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 text-yellow-400 border-slate-600 rounded focus:ring-yellow-400/50 bg-slate-800 mt-1"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-slate-400 leading-relaxed"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                  >
                    Privacy Policy
                  </a>
                </label>
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

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading || !acceptTerms}
                className={`relative w-full py-3 px-4 rounded-xl font-semibold text-lg shadow-2xl transition-all duration-300 overflow-hidden group ${
                  loading || !acceptTerms
                    ? "bg-slate-700 cursor-not-allowed text-slate-400"
                    : "bg-gradient-to-r from-yellow-600 to-amber-500 text-black hover:from-yellow-500 hover:to-amber-400 shadow-yellow-500/25"
                }`}
                whileHover={
                  loading || !acceptTerms ? {} : { scale: 1.02, y: -2 }
                }
                whileTap={loading || !acceptTerms ? {} : { scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Secure Account
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                {!loading && !!acceptTerms && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-600 opacity-0 group-hover:opacity-100 rounded-xl"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <p className="font-medium mb-1">Enterprise-grade security</p>
                  <p className="text-slate-400">
                    Your data is encrypted and protected with military-grade
                    security protocols
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-8 text-sm text-slate-500"
        >
          <p>© 2024 SecureKYC. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
}
