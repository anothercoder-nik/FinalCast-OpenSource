import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { getCurrentUser } from '../api/user.api.js';
import { login } from '../store/slice/authslice.js';

export default function AuthCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const search = useSearch();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const user = await getCurrentUser();
        // Token is now handled via httpOnly cookies automatically
        
        dispatch(login({
          user: user,
          token: null // No need to pass token as it's in httpOnly cookie
        }));
        
        // Check for redirect parameter in URL search params
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect') || search?.redirect;
        
        if (redirectTo) {
          console.log('🎯 Auth callback redirecting to:', redirectTo);
          navigate({ to: redirectTo });
        } else {
          navigate({ to: '/dashboard' });
        }
      } catch (error) {
        console.error('Auth callback failed:', error);
        navigate({ to: '/auth' });
      }
    };

    handleCallback();
  }, [dispatch, navigate, search]);

  return <div>Completing sign in...</div>;
}
