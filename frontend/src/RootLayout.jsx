import { Outlet, useRouterState } from '@tanstack/react-router';
import Navbar from '../src/components/utils/Navbar.jsx';
import { FloatingShapes } from './components/utils/floating-shapers.jsx';
import { useAuthInit } from './hooks/useAuthInit.js';

function RootLayout() {
  // Initialize authentication on app start
  useAuthInit();

  const router = useRouterState();
  const currentPath = router.location.pathname;

  // Hide Navbar/Shapes on Studio Room, Editor, Landing, and Auth pages
  const isStudioOrEditor = currentPath.includes('/studio/') || currentPath.includes('/editor/');
  const isLanding = currentPath === '/';
  const isAuth = currentPath.startsWith('/auth');
  const hideGlobalNav = isStudioOrEditor || isLanding || isAuth;

  return (
    <div className={`min-h-screen bg-stone-950 text-white overflow-x-hidden relative ${hideGlobalNav ? '' : 'pt-20'}`}>
      {!hideGlobalNav && (
        <>
          <FloatingShapes />
          <Navbar />
        </>
      )}
      <div className={isStudioOrEditor ? 'h-screen' : 'flex-grow'}>
        <Outlet />
      </div>
    </div>
  );
}

export default RootLayout