import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert, LinearProgress, Chip } from '@mui/material';
import { Email, Refresh, CheckCircle, Timer } from '@mui/icons-material';
import { sendRegistrationOTP, verifyRegistrationOTP, resendRegistrationOTP } from '../../api/user.api.js';

const OTPVerification = ({ email, name, onVerified, onBack }) => {
  const [otp, setOtp] = useState('');
  const [otpId, setOtpId] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [status, setStatus] = useState({ loading: false, error: '', success: '', verified: false });

  // Init
  useEffect(() => { sendOTP(); }, []);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const sendOTP = async (isResend = false) => {
    setStatus({ loading: true, error: '', success: '' });
    try {
      const res = isResend
        ? await resendRegistrationOTP(otpId, email, name)
        : await sendRegistrationOTP(email, name);

      setOtpId(res.otpId);
      setTimeLeft(600); // 10m
      setStatus({ loading: false, success: isResend ? 'New code sent' : 'Code sent to email', verified: false });
      if (isResend) setOtp('');
    } catch (e) {
      setStatus({ loading: false, error: e.response?.data?.message || 'Failed to send OTP' });
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return setStatus(s => ({ ...s, error: 'Enter 6-digit code' }));

    setStatus({ loading: true, error: '' });
    try {
      await verifyRegistrationOTP(otpId, otp, email);
      setStatus({ loading: false, verified: true, success: 'Email Verified!' });
      setTimeout(() => onVerified(otpId), 1500);
    } catch (e) {
      setStatus({ loading: false, error: e.response?.data?.message || 'Invalid code' });
    }
  };

  const formatTime = s => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (status.verified) {
    return (
      <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4, textAlign: 'center', p: 3 }}>
        <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" color="success.main" fontWeight="bold">Verified!</Typography>
        <Typography color="text.secondary">Redirecting to setup...</Typography>
        <LinearProgress sx={{ mt: 3 }} />
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <CardContent sx={{ p: 4, textAlign: 'center' }}>
        <Email sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" fontWeight="bold" gutterBottom>Check your Email</Typography>
        <Typography variant="body2" color="text.secondary">Code sent to</Typography>
        <Chip label={email} color="primary" variant="outlined" sx={{ my: 1 }} />

        {status.loading && <LinearProgress sx={{ my: 2 }} />}
        {status.error && <Alert severity="error" sx={{ my: 2 }}>{status.error}</Alert>}
        {status.success && <Alert severity="success" sx={{ my: 2 }}>{status.success}</Alert>}

        <Box sx={{ my: 3 }}>
          <TextField
            fullWidth
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="0 0 0 0 0 0"
            inputProps={{ style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' } }}
            disabled={status.loading}
            autoFocus
            onKeyPress={e => e.key === 'Enter' && otp.length === 6 && handleVerify()}
          />
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleVerify}
          disabled={status.loading || otp.length !== 6}
          sx={{ mb: 2 }}
        >
          Verify Email
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: timeLeft > 0 ? 'primary.main' : 'error.main' }}>
            <Timer sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="body2">{timeLeft > 0 ? formatTime(timeLeft) : 'Expired'}</Typography>
          </Box>

          <Button
            size="small"
            startIcon={<Refresh />}
            onClick={() => sendOTP(true)}
            disabled={status.loading || timeLeft > 540}
            sx={{ textTransform: 'none' }}
          >
            Resend Code
          </Button>
        </Box>

        <Button variant="text" onClick={onBack} disabled={status.loading} sx={{ textTransform: 'none' }}>
          Back to Registration
        </Button>
      </CardContent>
    </Card>
  );
};

export default OTPVerification;
