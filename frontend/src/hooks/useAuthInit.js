import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getCurrentUser } from '../api/user.api.js';
import { login, logout } from '../store/slice/authslice.js';

export const useAuthInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to get current user using the httpOnly cookie
        const user = await getCurrentUser();
        
        if (user) {
          dispatch(login({
            user: user,
            token: null // Token is in httpOnly cookie, not needed in state
          }));
        }
      } catch (error) {
        // If getCurrentUser fails, user is not authenticated
        // This is normal for unauthenticated users
        dispatch(logout());
      }
    };

    initializeAuth();
  }, [dispatch]);
};
