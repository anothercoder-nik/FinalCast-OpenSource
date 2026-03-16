import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from '@tanstack/react-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { getApiUrl } from '../../utils/config.js';
import { loginUser } from '../../api/user.api.js';
import { login } from '../../store/slice/authslice.js';
import TwoFactorLogin from '../auth/TwoFactorLogin.jsx';
import { GoogleIcon } from '../sign-in-side/components/CustomIcons';

const LoginForm = ({ redirectTo, state }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const email = credentials.email;
    const password = credentials.password;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser(email, password);

      if (res.requires2FA) {
        setShowTwoFactor(true);
        setLoading(false);
        return;
      }

      finishLogin(res);
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMsg(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const finishLogin = (res, redirectOverride) => {
    dispatch(login({ user: res.user, token: res.token }));
    const dest = redirectOverride || redirectTo || '/dashboard';
    navigate({ to: dest });
  };

  const handleGoogleLogin = () => {
    let url = `${getApiUrl()}/api/auth/google`;
    if (redirectTo) url += `?redirect=${encodeURIComponent(redirectTo)}`;
    window.location.href = url;
  };

  if (showTwoFactor) {
    return (
      <section className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]">
        <div className="w-full max-w-md animate-[fade-in-up_0.6s_ease-out_forwards]">
          <TwoFactorLogin 
            email={credentials.email}
            password={credentials.password}
            onSuccess={finishLogin}
            onBack={() => setShowTwoFactor(false)}
            redirectTo={redirectTo}
          />
        </div>
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
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">Welcome Back</h1>
          <p className="text-[#a1a1aa] text-[15px] font-medium">Log in to continue to your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          
          {/* Email Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-[#666] group-focus-within:text-[#ff4d00] transition-colors duration-300" />
            </div>
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-[#141414] hover:bg-[#1a1a1a] border border-white/5 text-white placeholder-[#666] rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#ff4d00]/50 focus:bg-[#1a1a1a] focus:ring-4 focus:ring-[#ff4d00]/10 transition-all duration-300 font-medium text-[15px]"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-[#666] group-focus-within:text-[#ff4d00] transition-colors duration-300" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="w-full bg-[#141414] hover:bg-[#1a1a1a] border border-white/5 text-white placeholder-[#666] rounded-2xl pl-12 pr-12 py-4 focus:outline-none focus:border-[#ff4d00]/50 focus:bg-[#1a1a1a] focus:ring-4 focus:ring-[#ff4d00]/10 transition-all duration-300 font-medium text-[15px]"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-[#666] hover:text-[#ff4d00] transition-colors duration-300"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg text-center animate-pulse">
              {errorMsg}
            </div>
          )}

          {/* Forgot Password */}
          <div className="flex justify-end mt-[-8px]">
            <button type="button" className="text-[#a1a1aa] text-[13px] hover:text-[#ff4d00] transition-colors font-semibold">
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center items-center py-4 px-4 border border-white/5 text-[15px] font-bold rounded-2xl text-white bg-gradient-to-r from-[#ff4d00] to-[#ff7a00] hover:shadow-[0_0_30px_rgba(255,77,0,0.4)] hover:scale-[1.02] active:scale-[0.98] overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? 'Authenticating...' : 'Sign In'}
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

        {/* Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="mt-6 w-full flex justify-center items-center py-4 px-4 border border-white/5 rounded-2xl bg-[#141414] hover:bg-[#1a1a1a] text-white font-semibold transition-all duration-300 group hover:border-white/20 active:scale-[0.98] shadow-sm"
        >
          <div className="bg-white p-1 rounded-full mr-3 group-hover:scale-110 transition-transform duration-300">
             <GoogleIcon />
          </div>
          Google
        </button>

        {/* Toggle to Sign Up */}
        <p className="mt-8 text-center text-[15px] text-[#a1a1aa] font-medium">
          Don't have an account?{' '}
          <button 
            type="button"
            onClick={() => state(false)} 
            className="font-bold text-white hover:text-[#ff4d00] transition-colors ml-1"
          >
            Sign up
          </button>
        </p>

      </div>
    </section>
  );
};

export default LoginForm;