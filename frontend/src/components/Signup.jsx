// Enhanced Signup.jsx with Dark Mode Split-Screen UI

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Shield, Loader } from 'lucide-react';
import { authService } from '../utils/auth'; // Assuming authService path

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- Client-side Validation ---
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match. Please re-enter.');
            return;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await authService.signup({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            // On successful signup, navigate to the dashboard
            navigate('/dashboard');
        } catch (err) {
            // Provide more user-friendly error messages
            if (err.message.includes('409') || err.message.toLowerCase().includes('email already exists')) {
                setError('An account with this email already exists. Please login instead.');
            } else if (err.message.includes('network')) {
                setError('Network error. Please check your connection and try again.');
            } else {
                setError('An unexpected error occurred during signup. Please try again later.');
            }
            console.error("Signup error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-900 text-white">
            {/* --- Branding Section (Left Side) --- */}
            <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-gradient-to-br from-blue-700 via-purple-700 to-gray-900 items-center justify-center p-12 relative overflow-hidden">
                <div className="relative z-10 max-w-lg space-y-6">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white p-3 rounded-lg shadow-lg">
                            <Shield className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="text-3xl font-bold text-white tracking-tight">VeriSecure AI</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                        Start Your Secure Onboarding Journey Today
                    </h1>
                    <p className="text-lg text-blue-100 opacity-90">
                        Create an account to access powerful AI verification tools, ensure compliance, and protect against identity fraud.
                    </p>
                    <div className="border-t border-blue-400 border-opacity-30 pt-6 space-y-4 text-blue-100">
                        <div className="flex items-start space-x-3">
                            <CheckIcon />
                            <span>Instant document verification</span>
                        </div>
                        <div className="flex items-start space-x-3">
                            <CheckIcon />
                            <span>Biometric liveness checks</span>
                        </div>
                        <div className="flex items-start space-x-3">
                            <CheckIcon />
                            <span>Secure data vault for compliance</span>
                        </div>
                    </div>
                </div>
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]"></div>
            </div>

            {/* --- Form Section (Right Side) --- */}
            <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 sm:p-12 bg-gray-900 overflow-y-auto">
                <div className="max-w-md w-full space-y-6">
                    {/* Header */}
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Create Your Account</h2>
                        <p className="mt-2 text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200">
                                Sign in here
                            </Link>
                        </p>
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name Input */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <User className="h-5 w-5" />
                                </span>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    placeholder="Enter your full name"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Mail className="h-5 w-5" />
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    placeholder="you@company.com"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Create Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                                Create Password
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Lock className="h-5 w-5" />
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    placeholder="Create a strong password"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Lock className="h-5 w-5" />
                                </span>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    placeholder="Re-enter your password"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-900 border border-red-700 rounded-lg p-3 text-center">
                                <p className="text-red-200 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center items-center py-3 px-4 rounded-lg font-semibold transition-all duration-300 ease-in-out ${
                                    loading 
                                    ? 'bg-gray-600 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader className="animate-spin h-5 w-5 mr-2" />
                                        Creating Account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Custom Check Icon for feature list
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-green-400 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default Signup;