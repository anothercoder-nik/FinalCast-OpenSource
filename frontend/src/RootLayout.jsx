import { Outlet, useRouterState } from '@tanstack/react-router';
import Navbar from '../src/components/utils/Navbar.jsx';
import { FloatingShapes } from './components/utils/floating-shapers.jsx';
import { useAuthInit } from './hooks/useAuthInit.js';

function RootLayout() {
  // Initialize authentication on app start
  useAuthInit();

  const router = useRouterState();
  const currentPath = router.location.pathname;

  // Hide Navbar/Shapes on Studio Room and Editor pages
  const isStudioOrEditor = currentPath.includes('/studio/') || currentPath.includes('/editor/');

  return (
    <div className={`min-h-screen bg-stone-950 text-white overflow-x-hidden relative ${isStudioOrEditor ? '' : 'pt-20'}`}>
      {!isStudioOrEditor && (
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