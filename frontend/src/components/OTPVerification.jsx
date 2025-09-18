import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Mail, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react'

const OTPVerification = ({ email, name, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const navigate = useNavigate()
  const inputRefs = useRef([])

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const otpValue = otp.join('')
    
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue })
      })

      const data = await response.json()

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        setSuccess('Email verified successfully! Redirecting to dashboard...')
        
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        setError(data.error || 'Invalid OTP. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResending(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('New OTP sent successfully!')
        setTimeLeft(600) // Reset timer
        setOtp(['', '', '', '', '', '']) // Clear current OTP
        inputRefs.current[0]?.focus()
      } else {
        setError(data.error || 'Failed to resend OTP')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-gray-300 text-sm">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-blue-400 font-medium">{email}</p>
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center bg-gray-700/50 rounded-lg px-4 py-2">
              <Mail className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-300">
                Code expires in: <span className="font-bold text-yellow-400">{formatTime(timeLeft)}</span>
              </span>
            </div>
          </div>

          {/* OTP Input */}
          <div className="flex justify-center space-x-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                <p className="text-green-300 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || otp.some(digit => !digit)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg mb-4"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Verify Email'
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResendOTP}
              disabled={resending || timeLeft > 570} // Allow resend after 30 seconds
              className="text-blue-400 hover:text-blue-300 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
              {resending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Resend OTP
                </>
              )}
            </button>
          </div>

          {/* Back Button */}
          <button
            onClick={onBack}
            className="w-full mt-6 flex items-center justify-center text-gray-400 hover:text-gray-300 font-medium text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Signup
          </button>
        </div>
      </div>
    </div>
  )
}

export default OTPVerification
