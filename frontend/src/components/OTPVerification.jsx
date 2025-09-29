// CHANGELOG: Modernized with a single-field OTP input, a visual countdown timer, and a celebratory success animation.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Clock, RefreshCw, ArrowLeft, CheckCircle, Loader } from 'lucide-react';
import { authService } from '../utils/auth';

// --- CUSTOM HOOK FOR OTP LOGIC ---

const useOtpVerification = ({ email, onSuccess }) => {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  const [status, setStatus] = useState({ loading: false, resending: false, error: '', success: '' });
  
  useEffect(() => {
    if (timeLeft > 0 && !status.success) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, status.success]);

  const handleVerify = useCallback(async () => {
    if (otp.length !== 6) {
      setStatus(s => ({ ...s, error: 'Please enter the complete 6-digit OTP.' }));
      return;
    }
    setStatus({ loading: true, resending: false, error: '', success: '' });
    try {
      await authService.verifyOtp(email, otp);
      setStatus({ loading: false, resending: false, error: '', success: 'Email verified successfully!' });
      setTimeout(onSuccess, 2000);
    } catch (err) {
      setStatus({ loading: false, resending: false, error: err.message || 'Invalid OTP.', success: '' });
    }
  }, [otp, email, onSuccess]);

  const handleResend = useCallback(async () => {
    setStatus({ loading: false, resending: true, error: '', success: '' });
    try {
      await authService.resendOtp(email);
      setOtp('');
      setTimeLeft(600);
      setStatus(s => ({ ...s, resending: false, success: 'A new OTP has been sent.' }));
    } catch (err) {
      setStatus(s => ({ ...s, resending: false, error: err.message || 'Failed to resend OTP.' }));
    }
  }, [email]);

  return { otp, setOtp, timeLeft, status, handleVerify, handleResend };
};

// --- REUSABLE SUB-COMPONENTS ---

const CountdownCircle = ({ timeLeft }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const progress = (timeLeft / 600) * circumference;
    const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

    return (
        <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="absolute w-full h-full" viewBox="0 0 52 52">
                <circle className="text-gray-700" stroke="currentColor" strokeWidth="3" fill="transparent" r={radius} cx="26" cy="26" />
                <motion.circle
                    className="text-yellow-400" stroke="currentColor" strokeWidth="3" fill="transparent" r={radius} cx="26" cy="26"
                    strokeDasharray={circumference} initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: circumference - progress }}
                    transition={{ duration: 1, ease: 'linear' }} transform="rotate(-90 26 26)"
                />
            </svg>
            <span className="font-mono font-bold text-yellow-400">{formatTime(timeLeft)}</span>
        </div>
    );
};

const OtpInput = ({ value, onChange }) => {
    const inputRef = useRef(null);
    return (
        <div className="relative flex justify-center items-center" onClick={() => inputRef.current?.focus()}>
            <input
                ref={inputRef}
                type="tel"
                maxLength="6"
                value={value}
                onChange={(e) => /^\d*$/.test(e.target.value) && onChange(e.target.value)}
                className="absolute w-full h-full opacity-0"
                aria-label="One Time Password"
            />
            <div className="flex space-x-2">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className={`w-12 h-14 flex items-center justify-center text-2xl font-bold bg-gray-700/50 border-2 rounded-lg text-white transition-colors
                        ${value.length === index && 'border-blue-500'}
                        ${value.length > index ? 'border-gray-500' : 'border-gray-600'}
                    `}>
                        {value[index] || (value.length === index ? <motion.div className="w-0.5 h-6 bg-blue-500" animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.2 }} /> : null)}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN OTP COMPONENT ---

const OTPVerification = ({ email, onBack }) => {
  const navigate = useNavigate();
  const { otp, setOtp, timeLeft, status, handleVerify, handleResend } = useOtpVerification({
    email,
    onSuccess: () => navigate('/dashboard'),
  });

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <AnimatePresence>
        {status.success ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <CheckCircle className="h-24 w-24 text-green-400 mx-auto" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mt-4">{status.success}</h2>
            <p className="text-gray-400">Redirecting to your dashboard...</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 p-8">
            <div className="text-center mb-6">
              <Shield className="h-10 w-10 text-blue-300 mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-white">Enter Verification Code</h1>
              <p className="text-gray-300 text-sm mt-1">A 6-digit code was sent to <span className="font-medium text-blue-400">{email}</span></p>
            </div>
            
            <div className="flex justify-center mb-6"><CountdownCircle timeLeft={timeLeft} /></div>
            
            <OtpInput value={otp} onChange={setOtp} />

            {status.error && <p className="text-red-400 text-sm text-center mt-4">{status.error}</p>}
            
            <button onClick={handleVerify} disabled={status.loading || otp.length !== 6}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium disabled:opacity-50 transition">
              {status.loading ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Verify'}
            </button>
            
            <div className="flex justify-between items-center mt-6 text-sm">
              <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Back</button>
              <button onClick={handleResend} disabled={status.resending || timeLeft > 540} className="text-blue-400 hover:text-white disabled:opacity-50 flex items-center gap-1">
                {status.resending ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Resend Code
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OTPVerification;

