import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Upload,
  AlertTriangle,
  FileText,
  BarChart3,
  User,
  Menu,
  X,
  LogOut,
  Home,
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAuthenticated = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // Get role from localStorage

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const commonNavItems = [{ path: "/", label: "Home", icon: Home }];

  const userNavItems = [
    { path: "/upload", label: "KYC Upload", icon: Upload },
    { path: "/my-uploads", label: "My Documents", icon: User },
  ];

  const adminNavItems = [
    { path: "/admin", label: "KYC Requests", icon: User },
    { path: "/fraud-alerts", label: "Fraud Alerts", icon: AlertTriangle },
    { path: "/audit-trail", label: "Audit Trail", icon: FileText },
  ];

  // Select nav items based on role
  const navItems =
    role === "admin"
      ? [...commonNavItems, ...adminNavItems]
      : [...commonNavItems, ...userNavItems];

  // If not authenticated, render nothing
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-2xl border-b border-slate-800/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-10 h-10 bg-gradient-to-r from-yellow-600 to-amber-500 rounded-xl flex items-center justify-center"
              >
                <Shield className="w-6 h-6 text-black" />
              </motion.div>
              <span className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors">
                SecureKYC
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    location.pathname === item.path
                      ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}

              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 ml-4 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-xl text-sm font-medium transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden bg-slate-900/95 backdrop-blur-2xl border-b border-slate-800/50"
          >
            <div className="px-4 py-6 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === item.path
                      ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 mt-4 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-xl text-sm font-medium transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
