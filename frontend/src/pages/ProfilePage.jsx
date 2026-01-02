import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";
import {
  Shield,
  CheckCircle,
  Sparkles,
  LogOut,
  User,
  Mail,
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
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
            <Shield className="w-10 h-10 text-black" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-yellow-300 bg-clip-text text-transparent mb-2">
            SecureKYC
          </h1>
          <div className="flex items-center justify-center">
            <p className="text-slate-400">Enterprise Identity Verification</p>
            <Sparkles className="w-4 h-4 text-yellow-400 ml-2" />
          </div>
        </motion.div>

        {/* Profile Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative bg-slate-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-800 p-8"
        >
          {/* Glowing border */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-amber-400/10 rounded-3xl blur-xl" />

          <div className="relative z-10 space-y-6">
            <div className="text-white text-center">
              <User className="w-12 h-12 mx-auto mb-2 text-yellow-400" />
              <h2 className="text-2xl font-bold">My Profile</h2>
            </div>

            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center text-slate-300 mb-2">
                <Mail className="w-5 h-5 mr-2 text-yellow-400" />
                <span className="text-sm">Email:</span>
              </div>
              <p className="text-white font-medium ml-7">{email}</p>
            </div>

            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-yellow-600 to-amber-500 text-black hover:from-yellow-500 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/25"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Logout
              <LogOut className="w-5 h-5" />
            </motion.button>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <p className="font-medium mb-1">Your data is protected</p>
                  <p className="text-slate-400">
                    End-to-end encrypted • GDPR compliant • SOC 2 certified
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
