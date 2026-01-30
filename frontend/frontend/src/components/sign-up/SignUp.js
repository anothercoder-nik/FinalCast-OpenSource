import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from '@tanstack/react-router';
import { Box, Button, Checkbox, CssBaseline, Divider, FormControl, FormControlLabel, FormLabel, Link, TextField, Typography, Stack, Card as MuiCard, styled } from '@mui/material';
import AppTheme from '../shared-theme/AppTheme.js';
import ColorModeSelect from '../shared-theme/ColorModeSelect.js';
import { GoogleIcon, SitemarkIcon } from './components/CustomIcons.js';
import { getApiUrl } from '../../utils/config.js';
import RegistrationOTPVerification from '../auth/RegistrationOTPVerification.jsx';
import { registerUser } from '../../api/user.api.js';
import { login } from '../../store/slice/authslice.js';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex', flexDirection: 'column', alignSelf: 'center', width: '100%', padding: theme.spacing(4), gap: theme.spacing(2), margin: 'auto',
  boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: { width: '450px' },
  ...theme.applyStyles('dark', { boxShadow: 'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px' }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  minHeight: '100vh', padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: { padding: theme.spacing(4) },
  '&::before': {
    content: '""', display: 'block', position: 'absolute', zIndex: -1, inset: 0,
    backgroundImage: 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', { backgroundImage: 'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))' }),
  },
}));

export default function SignUp(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const redirectTo = props.redirectTo !== 'null' && props.redirectTo !== 'undefined' ? props.redirectTo : null;

  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [showOTP, setShowOTP] = React.useState(false);
  const [regData, setRegData] = React.useState(null);

  const validate = (name, email, password) => {
    const newErrors = {};
    if (!name || name.length < 1) newErrors.name = 'Name is required.';
    if (!email || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Valid email required.';
    if (!password || password.length < 6) newErrors.password = 'Min 6 chars required.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get('name');
    const email = data.get('email');
    const password = data.get('password');

    if (!validate(name, email, password)) return;

    setRegData({ name, email, password });
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

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
      <SignUpContainer direction="column" justifyContent="space-between">
        {showOTP ? (
          <RegistrationOTPVerification
            email={regData?.email}
            name={regData?.name}
            onVerified={handleOTPVerified}
            onBack={() => setShowOTP(false)}
            redirectTo={redirectTo}
          />
        ) : (
          <Card variant="outlined">
            <SitemarkIcon />
            <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
              {redirectTo ? 'Join Studio Session' : 'Sign up'}
            </Typography>
            {redirectTo && (
              <Typography variant="body2" color="primary" sx={{ mb: 2, textAlign: 'center' }}>
                🎥 You've been invited to join a studio session. Create account to continue.
              </Typography>
            )}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl>
                <FormLabel htmlFor="name">Full name</FormLabel>
                <TextField autoComplete="name" name="name" required fullWidth id="name" placeholder="Jon Snow" error={!!errors.name} helperText={errors.name} />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="email">Email</FormLabel>
                <TextField required fullWidth id="email" placeholder="your@email.com" name="email" autoComplete="email" error={!!errors.email} helperText={errors.email} />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="password">Password</FormLabel>
                <TextField required fullWidth name="password" placeholder="••••••" type="password" id="password" autoComplete="new-password" error={!!errors.password} helperText={errors.password} />
              </FormControl>
              <FormControlLabel control={<Checkbox value="allowExtraEmails" color="primary" />} label="Receive updates via email." />
              
              <Button type="submit" fullWidth variant="contained" disabled={loading}>
                {loading ? 'Processing...' : 'Continue'}
              </Button>
            </Box>
            
            <Divider><Typography sx={{ color: 'text.secondary' }}>or</Typography></Divider>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button fullWidth variant="outlined" onClick={handleGoogleSignup} startIcon={<GoogleIcon />}>
                Sign up with Google
              </Button>
            
              <Typography sx={{ textAlign: 'center' }}>
                Already have an account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate({ to: '/auth', search: { mode: 'signin', redirect: redirectTo } })}
                  sx={{ alignSelf: 'center' }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Card>
        )}
      </SignUpContainer>
    </AppTheme>
  );
}
