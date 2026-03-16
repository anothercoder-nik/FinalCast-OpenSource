import React, { useState, useEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import LoginForm from '../components/Forms/LoginForm.jsx';
import RegisterForm from '../components/Forms/RegisterForm.jsx';
import Footer from '../components/Main/Footer.jsx';

const AuthPage = () => {
  const search = useSearch({ from: '/auth' });
  const [isLogin, setIsLogin] = useState(search?.mode !== 'signup');

  useEffect(() => {
    setIsLogin(search?.mode !== 'signup');
  }, [search]);

  // Pass down redirectTo via router state or search query
  const redirectTo = search?.redirect && search.redirect !== 'null' ? search.redirect : null;

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans selection:bg-[#ff4d00] selection:text-white">
      
      {/* ═══ TOP HERO BANNER / BACKGROUND ═══ */}
      <div 
        className="relative w-full min-h-[90vh] md:min-h-[820px] bg-[#ff4d00] overflow-hidden rounded-b-[40px] md:rounded-b-[120px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 border-b border-white/5 flex flex-col"
        style={{
          backgroundImage: `radial-gradient(circle at 45% 45%, #ff5e00 0%, #aa0000 50%, #220000 100%)`,
        }}
      >
        
        {/* Animated Background Image Layer */}
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            backgroundImage: `url('/hero.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        {/* Dark Sub-Overlays */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80"></div>
        <div className="absolute inset-0 mix-blend-overlay opacity-20 bg-[url('/noise.webp')]"></div>

        {/* ── Home Page Navbar ── */}
        <nav className="relative z-50 flex items-center justify-between px-8 md:px-14 pt-8 pb-4">
          <Link to="/" className="flex items-center">
            <span className="text-white text-[22px] font-bold tracking-tight">FinalCast</span>
            <span className="text-white text-[10px] font-bold leading-none ml-[2px] mb-3">®</span>
          </Link>

          <div className="hidden md:flex items-center gap-14">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-white text-[15px] font-bold hover:opacity-80 transition-opacity">Home</Link>
              <a href="/#features" className="text-white text-[15px] font-bold hover:opacity-80 transition-opacity">Features</a>
              <a href="/#pricing" className="text-white text-[15px] font-bold hover:opacity-80 transition-opacity">Pricing</a>
            </div>

            <Link to="/auth?mode=signup">
              <button className="bg-white hover:bg-gray-100 flex items-center gap-4 pl-6 pr-2 py-2 rounded-full transition-transform hover:scale-105 shadow-[0_4px_14px_0_rgba(0,0,0,0.2)]">
                <span className="text-[#111] font-bold text-[14px]">Start Recording</span>
                <div className="w-8 h-8 rounded-full bg-[#f95503] flex items-center justify-center -mr-[2px]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </Link>
          </div>
        </nav>

        {/* ── Page Content (Text + Cards) ── */}
        <div className="relative z-20 flex-grow max-w-[1400px] w-full mx-auto px-6 md:px-12 lg:px-24 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Left Side: Marketing Text */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center animate-[fade-in-up_0.8s_ease-out_forwards]">
            <h3 className="text-[#ff4d00] text-[15px] md:text-[17px] font-bold mb-4 tracking-[0.2em] uppercase opacity-90">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h3>
            <h1 className="text-white text-5xl md:text-[64px] lg:text-[80px] font-black leading-[1] tracking-tighter mb-8 drop-shadow-sm">
              {isLogin ? "Let's build\nsomething\ngreat." : "Let's create\nsomething\nmeaningful."}
            </h1>
            <p className="text-[#a1a1aa] text-lg md:text-[20px] font-medium max-w-[400px] leading-[1.6]">
              {isLogin 
                ? "Resume your session seamlessly and dive right back into your active projects."
                : "Join the top community of creators rendering studio-quality audio instantly."}
            </p>
          </div>

          {/* Right Side: Reusable Auth Forms */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end animate-[fade-in-up_1s_ease-out_forwards]">
            {isLogin ? (
              <LoginForm redirectTo={redirectTo} state={setIsLogin} />
            ) : (
              <RegisterForm redirectTo={redirectTo} state={setIsLogin} />
            )}
          </div>

        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <Footer />
    </div>
  );
};

export default AuthPage;
