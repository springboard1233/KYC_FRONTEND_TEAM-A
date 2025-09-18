import React, { useState, useRef, useEffect } from 'react';
// Link and useNavigate are removed as they require a Router context which is missing.
import { Eye, EyeOff, Mail, Lock, User, Shield, Loader, ArrowLeft } from 'lucide-react';

// OTPVerification component is now included in the same file
const OTPVerification = ({ email, name, onBack }) => {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef([]);
    // const navigate = useNavigate(); // Removed useNavigate hook

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value) {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async () => {
        const enteredOtp = otp.join("");
        if (enteredOtp.length < 6) {
            setError("Please enter the complete 6-digit OTP.");
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch('http://localhost:5000/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: enteredOtp }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user data, then navigate
                localStorage.setItem('accessToken', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setSuccessMessage('Verification successful! Redirecting...');
                // Replace navigate with window.location.href
                setTimeout(() => window.location.href = '/dashboard', 2000);
            } else {
                throw new Error(data.error || 'OTP verification failed');
            }
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch('http://localhost:5000/api/resend-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage("A new OTP has been sent to your email.");
                setResendCooldown(60); // 60-second cooldown
            } else {
                throw new Error(data.error || 'Failed to resend OTP.');
            }
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm text-white shadow-2xl">
                <button onClick={onBack} className="flex items-center text-sm text-blue-400 hover:text-blue-300 mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Signup
                </button>

                <div className="text-center mb-6">
                    <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold">Email Verification</h2>
                    <p className="text-gray-400 mt-2">
                        Enter the 6-digit code sent to <span className="font-medium text-blue-300">{email}</span>
                    </p>
                </div>

                <div className="flex justify-center space-x-2 mb-6">
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            ref={el => (inputRefs.current[index] = el)}
                            type="text"
                            maxLength="1"
                            value={data}
                            onChange={e => handleChange(e.target, index)}
                            onKeyDown={e => handleKeyDown(e, index)}
                            onFocus={e => e.target.select()}
                            className="w-12 h-14 bg-gray-900/50 border border-gray-600 rounded-lg text-center text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ))}
                </div>

                {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}
                {successMessage && <p className="text-green-400 text-center text-sm mb-4">{successMessage}</p>}

                <button
                    onClick={handleVerify}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg flex items-center justify-center"
                >
                    {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Verify Account'}
                </button>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Didn't receive the code?{' '}
                    <button
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || loading}
                        className="text-blue-400 hover:text-blue-300 font-medium disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const Signup = () => {
  const [step, setStep] = useState('signup'); // 'signup' or 'otp'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw an error with the message from the backend, including the status code.
        throw new Error(`${data.error || 'An unknown error occurred.'} (status: ${response.status})`);
      }

      if (response.ok && data.otp_required) {
        setStep('otp');
      } else {
        setError('Signup successful, but OTP flow was not initiated. Please contact support.');
      }
    } catch (err) {
      const errorMessage = err.message.toLowerCase();
      if (errorMessage.includes('409') || errorMessage.includes('already exists')) {
        setError('An account with this email already exists. Please try logging in instead.');
      } else if (errorMessage.includes('network') || errorMessage.includes('failed to fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        // Clean up the error message for display, removing the status code part
        const displayError = err.message.split('(status:')[0].trim();
        setError(displayError || 'Registration failed. Please try again.');
      }
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <OTPVerification
        email={formData.email}
        name={formData.name}
        onBack={() => setStep('signup')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center max-w-lg">
          <div className="mb-8">
            <Shield className="h-16 w-16 text-blue-200 mb-6" />
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Join the Future of
              <span className="block text-blue-200">Identity Verification</span>
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Create an account to access powerful AI verification tools, ensure compliance, and protect against identity fraud.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-200 rounded-full mr-3"></div>
              <span className="text-blue-100">AI-powered document analysis</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-200 rounded-full mr-3"></div>
              <span className="text-blue-100">Real-time fraud detection</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-200 rounded-full mr-3"></div>
              <span className="text-blue-100">Compliance management tools</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden mb-6">
              <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400">Get started with your KYC verification platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-300 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg flex items-center justify-center"
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
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;