// CHANGELOG: Refactored with a 'useLogin' hook for cleaner logic and enhanced UI with dynamic background and refined animations.
import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../utils/auth';
import { Shield, Mail, Lock, AlertCircle, LogIn, Loader } from 'lucide-react';

// --- CUSTOM HOOK FOR LOGIN LOGIC ---

const useLogin = ({ onSuccess }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.login(credentials.email, credentials.password);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [credentials, onSuccess]);

  return { ...credentials, error, loading, handleChange, handleSubmit };
};

// --- ANIMATION VARIANTS ---

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5, 
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1 
    } 
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

// --- MAIN LOGIN COMPONENT ---

const Login = () => {
  const navigate = useNavigate();
  const { email, password, error, loading, handleChange, handleSubmit } = useLogin({
    onSuccess: () => navigate('/dashboard'),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 overflow-hidden relative">
      {/* Animated background shapes */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
          <motion.div 
            className="absolute top-[10%] left-[10%] w-72 h-72 bg-blue-600/30 rounded-full filter blur-3xl"
            animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          />
          <motion.div 
            className="absolute bottom-[10%] right-[10%] w-72 h-72 bg-purple-600/30 rounded-full filter blur-3xl"
            animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
            transition={{ duration: 25, repeat: Infinity, repeatType: 'reverse', delay: 5 }}
          />
      </div>

      <motion.div 
        className="w-full max-w-md z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="p-8">
            <motion.div variants={itemVariants} className="text-center mb-6">
              <div className="inline-block p-4 bg-blue-600/20 rounded-full mb-3">
                <Shield className="w-8 h-8 text-blue-300"/>
              </div>
              <h1 className="text-3xl font-bold text-white">AI-KYC System Login</h1>
              <p className="text-blue-200/80 mt-1">Welcome back, please sign in.</p>
            </motion.div>

            {error && (
              <motion.div 
                className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center text-red-200"
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <motion.div variants={itemVariants}>
                <label className="block mb-2 text-sm font-medium text-blue-200" htmlFor="email">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input id="email" name="email" type="email" required value={email} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-gray-500/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400 transition"
                    placeholder="name@company.com" />
                </div>
              </motion.div>
              <motion.div variants={itemVariants}>
                <label className="block mb-2 text-sm font-medium text-blue-200" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input id="password" name="password" type="password" required value={password} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-gray-500/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400 transition"
                    placeholder="••••••••" />
                </div>
              </motion.div>
              <motion.button type="submit" disabled={loading} variants={itemVariants}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                whileHover={{ scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="h-5 w-5" /> Sign In
                  </div>
                )}
              </motion.button>
            </form>
          </div>
          <motion.div variants={itemVariants} className="p-6 bg-white/5 border-t border-white/10 text-center">
            <p className="text-blue-200 text-sm">
              Don't have an account yet?{" "}
              <Link to="/signup" className="text-blue-300 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

