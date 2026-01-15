import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from '@tanstack/react-router';
import { Box, Button, Card as MuiCard, Checkbox, Divider, FormLabel, FormControl, FormControlLabel, Link, TextField, Typography, styled } from '@mui/material';
import { getApiUrl } from '../../../utils/config.js';
import ForgotPassword from './ForgotPassword';
import { GoogleIcon, SitemarkIcon } from './CustomIcons';
import { loginUser } from '../../../api/user.api.js';
import { login } from '../../../store/slice/authslice.js';
import TwoFactorLogin from '../../auth/TwoFactorLogin.jsx';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: { width: '450px' },
  ...theme.applyStyles('dark', {
    boxShadow: 'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export default function SignInCard({ redirectTo }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [emailError, setEmailError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [showTwoFactor, setShowTwoFactor] = React.useState(false);
  const [credentials, setCredentials] = React.useState({ email: '', password: '' });

  const validate = (email, password) => {
    let valid = true;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else setEmailError('');

    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      valid = false;
    } else setPasswordError('');

    return valid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');

    if (!validate(email, password)) return;

    setLoading(true);
    try {
      const res = await loginUser(email, password);
      
      if (res.requires2FA) {
        setCredentials({ email, password });
        setShowTwoFactor(true);
        setLoading(false);
        return;
      }

      finishLogin(res);
    } catch (error) {
      console.error('Login failed:', error);
      setEmailError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const finishLogin = (res, redirectOverride) => {
    dispatch(login({ user: res.user, token: res.token }));
    const dest = redirectOverride || redirectTo || '/dashboard';
    console.log('🎯 Redirecting:', dest);
    navigate({ to: dest });
  };

  const handleGoogleLogin = () => {
    let url = `${getApiUrl()}/api/auth/google`;
    if (redirectTo) url += `?redirect=${encodeURIComponent(redirectTo)}`;
    window.location.href = url;
  };

  if (showTwoFactor) {
    return (
      <TwoFactorLogin 
        email={credentials.email}
        password={credentials.password}
        onSuccess={finishLogin}
        onBack={() => setShowTwoFactor(false)}
        redirectTo={redirectTo}
      />
    );
  }

  return (
    <Card variant="outlined">
      <Box sx={{ display: { xs: 'flex', md: 'none' } }}><SitemarkIcon /></Box>
      <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
        Sign in
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <TextField
            error={!!emailError}
            helperText={emailError}
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
            autoFocus
            required
            fullWidth
            variant="outlined"
          />
        </FormControl>
        
        <FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Link component="button" type="button" onClick={() => setOpen(true)} variant="body2" sx={{ alignSelf: 'baseline' }}>
              Forgot your password?
            </Link>
          </Box>
          <TextField
            error={!!passwordError}
            helperText={passwordError}
            name="password"
            placeholder="••••••"
            type="password"
            id="password"
            autoComplete="current-password"
            required
            fullWidth
            variant="outlined"
          />
        </FormControl>
        
        <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />
        <ForgotPassword open={open} handleClose={() => setOpen(false)} />
        
        <Button type="submit" fullWidth variant="contained" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
        
        <Typography sx={{ textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <Link
            component="button"
            type="button"
            onClick={() => navigate({ to: '/auth', search: { mode: 'signup', redirect: redirectTo } })}
            variant="body2"
            sx={{ alignSelf: 'center' }}
          >
            Sign up
          </Link>
        </Typography>
      </Box>
      
      <Divider>or</Divider>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button fullWidth variant="outlined" onClick={handleGoogleLogin} startIcon={<GoogleIcon />}>
          Sign in with Google
        </Button>
      </Box>
    </Card>
  );
}
