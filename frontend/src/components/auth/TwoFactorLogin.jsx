import React, { useState, useRef } from 'react';
import { Shield, Key, ArrowLeft, Loader2 } from 'lucide-react';
import { loginUser } from '../../api/user.api.js';

const TwoFactorLogin = ({ email, password, onSuccess, onBack, redirectTo }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [backupCode, setBackupCode] = useState('');
  const [isBackup, setIsBackup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  const handleVerify = async (codeOverride) => {
    const code = isBackup
      ? backupCode
      : (codeOverride || otp.join(''));

    if (isBackup && !code) { setError('Enter backup code'); return; }
    if (!isBackup && code.length !== 6) { setError('Enter valid 6-digit code'); return; }

    setLoading(true);
    setError('');
    try {
      const response = await loginUser(
        email,
        password,
        !isBackup ? code : undefined,
        isBackup ? code : undefined
      );
      onSuccess(response, redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
      if (!isBackup) {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== '' && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.join('').length === 6) handleVerify(newOtp.join(''));
  };

  const handleOtpKeyDown = (index, e) => {
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

  const handleBackupInput = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-F0-9]/g, '').slice(0, 8);
    setBackupCode(val);
  };

  return (
    <div className="w-full max-w-[440px] mx-auto bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/[0.08] rounded-[32px] p-8 md:p-12 shadow-[0_0_80px_-20px_rgba(255,77,0,0.2)] relative overflow-hidden animate-[fade-in-up_0.5s_ease-out_forwards]">

      {/* Decorative glow */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#ff4d00]/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>

      <div className="relative z-10 flex flex-col items-center text-center">

        <div className="w-16 h-16 bg-[#1a1a1a] rounded-full border border-white/5 flex items-center justify-center mb-6">
          <Shield className="w-7 h-7 text-[#ff4d00]" />
        </div>

        <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">Two-Factor Auth</h2>
        <p className="text-[#888] text-sm mb-2">
          {isBackup
            ? 'Enter one of your backup codes'
            : 'Enter the 6-digit code from your authenticator app'}
        </p>
        {redirectTo && (
          <p className="text-[#ff4d00] text-xs mb-4">🎥 Redirecting to studio after verification</p>
        )}

        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5 animate-pulse">
            {error}
          </div>
        )}

        {/* Code Input */}
        {isBackup ? (
          <input
            type="text"
            value={backupCode}
            onChange={handleBackupInput}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            placeholder="BACKUP CODE"
            maxLength={8}
            autoFocus
            className="w-full bg-[#141414] hover:bg-[#1a1a1a] border border-white/5 rounded-2xl text-center text-xl font-mono text-white py-4 px-4 mb-6 focus:outline-none focus:border-[#ff4d00]/50 focus:bg-[#1a1a1a] focus:ring-4 focus:ring-[#ff4d00]/10 tracking-[0.3em] placeholder-[#444] transition-all duration-300"
          />
        ) : (
          <div className="flex gap-2 sm:gap-3 justify-center mb-6 relative">
            {loading && (
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
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                disabled={loading}
                autoFocus={index === 0}
                className="w-10 h-12 sm:w-12 sm:h-14 bg-[#141414] hover:bg-[#1a1a1a] border border-white/5 rounded-2xl text-center text-xl font-bold text-white focus:outline-none focus:border-[#ff4d00]/50 focus:bg-[#1a1a1a] focus:ring-4 focus:ring-[#ff4d00]/10 transition-all duration-300"
              />
            ))}
          </div>
        )}

        {/* Switch mode */}
        <button
          type="button"
          onClick={() => { setIsBackup(!isBackup); setError(''); setBackupCode(''); setOtp(['','','','','','']); }}
          className="flex items-center gap-2 text-[#888] hover:text-white text-sm transition-colors mb-6 group"
        >
          {isBackup ? <Shield className="w-4 h-4" /> : <Key className="w-4 h-4" />}
          {isBackup ? 'Use authenticator app instead' : 'Use backup code instead'}
        </button>

        {/* Action Buttons */}
        <div className="w-full flex gap-3 mt-2">
          <button
            onClick={onBack}
            className="flex-1 py-4 bg-[#141414] border border-white/5 text-white rounded-2xl font-semibold hover:bg-[#1a1a1a] hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={() => handleVerify()}
            disabled={loading || (isBackup ? !backupCode : otp.join('').length !== 6)}
            className="group relative flex-[1.5] flex justify-center items-center py-4 px-4 border border-white/5 text-[15px] font-bold rounded-2xl text-white bg-gradient-to-r from-[#ff4d00] to-[#ff7a00] hover:shadow-[0_0_30px_rgba(255,77,0,0.4)] hover:scale-[1.02] active:scale-[0.98] overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? 'Verifying...' : 'Verify Code'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
          </button>
        </div>

        <p className="text-[#555] text-xs mt-6">Lost access? Contact support.</p>
      </div>
    </div>
  );
};

export default TwoFactorLogin;
