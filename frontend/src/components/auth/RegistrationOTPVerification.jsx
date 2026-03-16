import React, { useState, useEffect, useRef } from 'react';
import { Mail, RefreshCw, CheckCircle, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { sendRegistrationOTP, verifyRegistrationOTP, resendRegistrationOTP } from '../../api/user.api.js';

const OTPVerification = ({ email, name, onVerified, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpId, setOtpId] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [status, setStatus] = useState({ loading: false, error: '', success: '', verified: false });
  const inputRefs = useRef([]);

  // Init
  useEffect(() => { sendOTP(); }, []);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const sendOTP = async (isResend = false) => {
    setStatus({ loading: true, error: '', success: '', verified: false });
    try {
      const res = isResend
        ? await resendRegistrationOTP(otpId, email, name)
        : await sendRegistrationOTP(email, name);

      setOtpId(res.otpId);
      setTimeLeft(600); // 10m
      setStatus({ loading: false, success: isResend ? 'New code sent' : '', verified: false });
      if (isResend) {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (e) {
      setStatus({ loading: false, error: e.response?.data?.message || 'Failed to send OTP' });
    }
  };

  const handleVerify = async (currentOtpString) => {
    const code = currentOtpString || otp.join('');
    if (code.length !== 6) {
      setStatus(s => ({ ...s, error: 'Enter 6-digit code' }));
      return;
    }

    setStatus({ loading: true, error: '', success: '' });
    try {
      await verifyRegistrationOTP(otpId, code, email);
      setStatus({ loading: false, verified: true, success: 'Email Verified!' });
      setTimeout(() => onVerified(otpId), 1500);
    } catch (e) {
      setStatus({ loading: false, error: e.response?.data?.message || 'Invalid code', success: '' });
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify if complete
    if (newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (status.verified) {
    return (
      <div className="w-full max-w-[440px] bg-[#0a0a0a]/90 backdrop-blur-3xl border border-green-500/[0.15] rounded-[32px] p-8 md:p-12 shadow-[0_0_80px_-20px_rgba(34,197,94,0.2)] flex flex-col items-center justify-center text-center animate-[fade-in-up_0.5s_ease-out_forwards] relative overflow-hidden">
        
        {/* Decorative corner glow */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-green-500/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>

        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 relative z-10">
          <CheckCircle className="w-10 h-10 text-green-500 animate-[bounce_1s_ease-in-out]" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight mb-2 relative z-10">Verified!</h2>
        <p className="text-[#888] text-sm">Redirecting to setup...</p>
        <div className="w-full h-1 bg-white/10 rounded-full mt-8 overflow-hidden">
          <div className="h-full bg-green-500 rounded-full animate-[progress_1.5s_ease-in-out_forwards]" style={{ width: '100%' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[440px] bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/[0.08] rounded-[32px] p-8 md:p-12 shadow-[0_0_80px_-20px_rgba(255,77,0,0.2)] relative overflow-hidden animate-[fade-in-up_0.5s_ease-out_forwards]">
      
      {/* Decorative center glow */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#ff4d00]/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-[#1a1a1a] rounded-full border border-white/5 flex items-center justify-center mb-6 shadow-inner">
          <Mail className="w-7 h-7 text-[#ff4d00]" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Check your Email</h2>
        <p className="text-[#888] text-sm mb-6 max-w-[260px]">
          We sent a 6-digit code to <br/>
          <span className="text-white font-medium inline-block mt-1 py-1 px-3 bg-[#1a1a1a] rounded-lg border border-white/5">
            {email}
          </span>
        </p>

        {/* Status Messages */}
        {status.error && (
          <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6 animate-pulse">
            {status.error}
          </div>
        )}
        {status.success && (
          <div className="w-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-xl mb-6">
            {status.success}
          </div>
        )}

        {/* 6-Box OTP Inputs */}
        <div className="flex gap-2 sm:gap-3 justify-center mb-8 relative">
          {status.loading && (
            <div className="absolute inset-0 bg-[#111]/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl">
              <Loader2 className="w-6 h-6 text-[#ff4d00] animate-spin" />
            </div>
          )}
          
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={status.loading}
              className="w-10 h-12 sm:w-12 sm:h-14 bg-[#141414] hover:bg-[#1a1a1a] border border-white/5 rounded-2xl text-center text-xl font-bold text-white focus:outline-none focus:border-[#ff4d00]/50 focus:bg-[#1a1a1a] focus:ring-4 focus:ring-[#ff4d00]/10 transition-all duration-300"
            />
          ))}
        </div>

        {/* Verify Button (Manual Fallback) */}
        <button
          onClick={() => handleVerify()}
          disabled={status.loading || otp.join('').length !== 6}
          className="group relative w-full flex justify-center items-center py-4 px-4 border border-white/5 text-[15px] font-bold rounded-2xl text-white bg-gradient-to-r from-[#ff4d00] to-[#ff7a00] hover:shadow-[0_0_30px_rgba(255,77,0,0.4)] hover:scale-[1.02] active:scale-[0.98] overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-6 mt-2"
        >
          <span className="relative z-10 flex items-center gap-2">
            Verify Email
            {!status.loading && otp.join('').length === 6 && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
        </button>

        {/* Resend & Timer Footer */}
        <div className="w-full flex items-center justify-between text-sm border-t border-white/5 pt-6 mt-2">
          
          <div className={`flex items-center gap-1.5 font-medium ${timeLeft > 0 ? 'text-[#ff4d00]' : 'text-red-400'}`}>
            <Clock className="w-4 h-4" />
            <span>{timeLeft > 0 ? formatTime(timeLeft) : 'Expired'}</span>
          </div>

          <button
            onClick={() => sendOTP(true)}
            disabled={status.loading || timeLeft > 540} // Disabled for first 60s
            className="flex items-center gap-1.5 text-[#888] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed group font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${status.loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Resend Code
          </button>

        </div>

        {/* Back Button */}
        <button 
          onClick={onBack}
          disabled={status.loading}
          className="mt-6 flex items-center gap-2 text-[#555] hover:text-white text-sm transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Registration
        </button>

      </div>
    </div>
  );
};

export default OTPVerification;
