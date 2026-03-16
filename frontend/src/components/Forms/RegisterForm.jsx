import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from '@tanstack/react-router';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { getApiUrl } from '../../utils/config.js';
import { registerUser } from '../../api/user.api.js';
import { login } from '../../store/slice/authslice.js';
import RegistrationOTPVerification from '../auth/RegistrationOTPVerification.jsx';
import { GoogleIcon } from '../sign-in-side/components/CustomIcons';

const RegisterForm = ({ redirectTo, state }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [regData, setRegData] = useState({ name: '', email: '', password: '' });

  const validate = () => {
    const newErrors = {};
    if (!regData.name || regData.name.length < 1) newErrors.name = 'Name is required.';
    if (!regData.email || !/\S+@\S+\.\S+/.test(regData.email)) newErrors.email = 'Valid email required.';
    if (!regData.password || regData.password.length < 6) newErrors.password = 'Min 6 chars required.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setShowOTP(true);
  };

  const handleOTPVerified = async (otpId) => {
    setLoading(true);
    try {
      const res = await registerUser(regData.name, regData.password, regData.email, otpId);
      dispatch(login({ user: res.user, token: res.token }));
      navigate({ to: redirectTo || '/dashboard' });
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ email: error?.message || 'Registration failed' });
      setShowOTP(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    let url = `${getApiUrl()}/api/auth/google`;
    if (redirectTo) url += `?redirect=${encodeURIComponent(redirectTo)}`;
    window.location.href = url;
  };

  if (showOTP) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center p-4">
        <RegistrationOTPVerification
          email={regData.email}
          name={regData.name}
          onVerified={handleOTPVerified}
          onBack={() => setShowOTP(false)}
          redirectTo={redirectTo}
        />
      </section>
    );
  }

  return (
    <section className="flex items-center justify-center relative z-10 w-full h-full">
      
      {/* Premium Auth Card */}
      <div className="w-full max-w-[440px] bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/[0.08] rounded-[32px] p-8 md:p-12 shadow-[0_0_80px_-20px_rgba(255,77,0,0.2)] relative overflow-hidden animate-[fade-in-up_0.6s_ease-out_forwards]">
        
        {/* Decorative corner glow */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#ff4d00]/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>

        <div className="mb-10 text-center relative z-10">
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">Create Account</h1>
          <p className="text-[#a1a1aa] text-[15px] font-medium">
            {redirectTo && <span className="text-[#ff4d00] font-medium mb-1 block">🎥 Studio Invitation Pending</span>}
            Join FinalCast to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                  {/* Name Field */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-[#666] group-focus-within:text-[#ff4d00] transition-colors duration-300" />
            </div>
            <input
              type="text"
              placeholder="Full Name"
              className={`w-full bg-[#141414] hover:bg-[#1a1a1a] border ${errors.name ? 'border-red-500/50' : 'border-white/5'} text-white placeholder-[#666] rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#ff4d00]/50 focus:bg-[#1a1a1a] focus:ring-4 focus:ring-[#ff4d00]/10 transition-all duration-300 font-medium text-[15px]`}
              value={regData.name}
              onChange={(e) => setRegData({ ...regData, name: e.target.value })}
            />
          </div>
          {errors.name && <p className="text-red-400 text-xs px-2 -mt-3 relative z-10">{errors.name}</p>}

          {/* Email Field */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-[#666] group-focus-within:text-[#ff4d00] transition-colors duration-300" />
            </div>
            <input
              type="email"
              placeholder="Email address"
              className={`w-full bg-[#141414] hover:bg-[#1a1a1a] border ${errors.email ? 'border-red-500/50' : 'border-white/5'} text-white placeholder-[#666] rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#ff4d00]/50 focus:bg-[#1a1a1a] focus:ring-4 focus:ring-[#ff4d00]/10 transition-all duration-300 font-medium text-[15px]`}
              value={regData.email}
              onChange={(e) => setRegData({ ...regData, email: e.target.value })}
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs px-2 -mt-3 relative z-10">{errors.email}</p>}

          {/* Password Field */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-[#666] group-focus-within:text-[#ff4d00] transition-colors duration-300" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min 6 chars)"
              className={`w-full bg-[#141414] hover:bg-[#1a1a1a] border ${errors.password ? 'border-red-500/50' : 'border-white/5'} text-white placeholder-[#666] rounded-2xl pl-12 pr-12 py-4 focus:outline-none focus:border-[#ff4d00]/50 focus:bg-[#1a1a1a] focus:ring-4 focus:ring-[#ff4d00]/10 transition-all duration-300 font-medium text-[15px]`}
              value={regData.password}
              onChange={(e) => setRegData({ ...regData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-[#666] hover:text-[#ff4d00] transition-colors duration-300"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs px-2 -mt-3 relative z-10">{errors.password}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center items-center py-4 px-4 border border-white/5 text-[15px] font-bold rounded-2xl text-white bg-gradient-to-r from-[#ff4d00] to-[#ff7a00] hover:shadow-[0_0_30px_rgba(255,77,0,0.4)] hover:scale-[1.02] active:scale-[0.98] overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? 'Sending OTP...' : 'Continue'}
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
          </button>
        </form>

        {/* Divider */}
        <div className="mt-8 flex items-center">
          <div className="flex-grow border-t border-white/[0.06]"></div>
          <span className="flex-shrink-0 px-4 text-[#666] text-[13px] font-semibold tracking-wide uppercase">or continue with</span>
          <div className="flex-grow border-t border-white/[0.06]"></div>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignup}
          type="button"
          className="mt-6 w-full flex justify-center items-center py-4 px-4 border border-white/5 rounded-2xl bg-[#141414] hover:bg-[#1a1a1a] text-white font-semibold transition-all duration-300 group hover:border-white/20 active:scale-[0.98] shadow-sm"
        >
          <div className="bg-white p-1 rounded-full mr-3 group-hover:scale-110 transition-transform duration-300">
             <GoogleIcon />
          </div>
          Google
        </button>

        {/* Toggle to Sign In */}
        <p className="mt-8 text-center text-[15px] text-[#a1a1aa] font-medium">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={() => state(true)} 
            className="font-bold text-white hover:text-[#ff4d00] transition-colors ml-1"
          >
            Sign in
          </button>
        </p>

      </div>
    </section>
  );
};

export default RegisterForm;