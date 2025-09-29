// CHANGELOG: Fixed a ReferenceError by adding the missing 'memo' import from React.
import React, { useState, useMemo, useCallback, memo } from "react"; // Corrected this line
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from "../utils/auth";
import OTPVerification from "./OTPVerification";
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, UserPlus, Shield, Loader } from "lucide-react";

// --- CUSTOM HOOK FOR SIGNUP LOGIC ---

const useSignup = ({ onSuccess }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [status, setStatus] = useState({ loading: false, error: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: '' });
        try {
            const result = await authService.signup(formData.name, formData.email, formData.password);
            if (result.success) {
                onSuccess(formData.email);
            } else {
                setStatus({ loading: false, error: result.error || "Signup failed." });
            }
        } catch (err) {
            setStatus({ loading: false, error: "An unexpected error occurred." });
        }
    }, [formData, onSuccess]);

    return { ...formData, ...status, handleChange, handleSubmit };
};

// --- REUSABLE SUB-COMPONENTS ---

const PasswordStrengthIndicator = memo(({ password }) => {
    const strength = useMemo(() => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    }, [password]);
    
    const bars = Array.from({ length: 4 }).map((_, index) => {
        const isActive = index < strength;
        const color = strength === 1 ? 'bg-red-500' : strength === 2 ? 'bg-yellow-500' : strength >= 3 ? 'bg-green-500' : 'bg-gray-600';
        return <div key={index} className={`h-1 flex-1 rounded-full ${isActive ? color : 'bg-gray-600'}`} />;
    });

    return <div className="flex gap-2 mt-2">{bars}</div>;
});

// --- MAIN SIGNUP COMPONENT ---

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [flowState, setFlowState] = useState({ step: 'signup', email: '' });

  const { name, email, password, loading, error, handleChange, handleSubmit } = useSignup({
    onSuccess: (submittedEmail) => setFlowState({ step: 'otp', email: submittedEmail }),
  });
  
  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  };
  const otpVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 overflow-hidden relative">
      {/* Animated background matching Login page */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
          <motion.div className="absolute top-[10%] left-[10%] w-72 h-72 bg-blue-600/30 rounded-full filter blur-3xl" animate={{ x: [0, 50, 0], y: [0, -50, 0] }} transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }} />
          <motion.div className="absolute bottom-[10%] right-[10%] w-72 h-72 bg-purple-600/30 rounded-full filter blur-3xl" animate={{ x: [0, -50, 0], y: [0, 50, 0] }} transition={{ duration: 25, repeat: Infinity, repeatType: 'reverse', delay: 5 }} />
      </div>
      
      <div className="w-full max-w-md z-10 bg-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10">
        <AnimatePresence mode="wait">
            {flowState.step === 'signup' ? (
                <motion.div key="signup" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-6">
                            <Shield className="h-10 w-10 text-blue-300 mx-auto mb-3" />
                            <h1 className="text-3xl font-bold text-white">Create an Account</h1>
                            <p className="text-blue-200/80 mt-1">Join the AI-KYC Platform</p>
                        </div>
                        {error && <div className="mb-4 p-3 bg-red-500/20 text-red-300 text-sm rounded-lg flex items-center gap-2"><AlertCircle className="h-5 w-5" />{error}</div>}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-blue-200" htmlFor="name">Full Name</label>
                                <div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input id="name" name="name" type="text" required value={name} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-white/10 border border-gray-500/30 rounded-lg text-white" placeholder="John Doe" /></div>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-blue-200" htmlFor="email">Email Address</label>
                                <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input id="email" name="email" type="email" required value={email} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-white/10 border border-gray-500/30 rounded-lg text-white" placeholder="name@company.com" /></div>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-blue-200" htmlFor="password">Password</label>
                                <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input id="password" name="password" type={showPassword ? "text" : "password"} required value={password} onChange={handleChange} className="w-full pl-11 pr-12 py-3 bg-white/10 border border-gray-500/30 rounded-lg text-white" placeholder="••••••••" /><button type="button" className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-white" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
                                <PasswordStrengthIndicator password={password} />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-50"><div className="flex items-center justify-center gap-2">{loading ? <Loader className="animate-spin h-5 w-5" /> : <><UserPlus className="h-5 w-5" /> Create Account</>}</div></button>
                        </form>
                    </div>
                    <div className="p-6 bg-white/5 border-t border-white/10 text-center text-sm"><p className="text-blue-200">Already have an account? <Link to="/login" className="text-blue-300 hover:underline font-medium">Sign In</Link></p></div>
                </motion.div>
            ) : (
                <motion.div key="otp" variants={otpVariants} initial="hidden" animate="visible" exit="exit">
                    {/* The previously redesigned OTP component fits here perfectly */}
                    <OTPVerification email={flowState.email} onBack={() => setFlowState({ step: 'signup', email: '' })} />
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Signup;
