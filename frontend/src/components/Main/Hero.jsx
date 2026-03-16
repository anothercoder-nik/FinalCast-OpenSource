import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";

const AnimatedImageGrid = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // only animate once per page load
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const images = [
    { src: '/office.jpg', alt: 'FinalCast Office Collaboration' },
    { src: '/demo.png', alt: 'FinalCast Interface Preview 1' },
    { src: '/demo2.png', alt: 'FinalCast Interface Preview 2' },
  ];

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-16 md:mt-24">
      {images.map((img, i) => (
        <div 
          key={i} 
          className={`relative w-full aspect-[4/5] md:aspect-[3/4] rounded-[24px] md:rounded-[32px] overflow-hidden bg-zinc-900 transition-all duration-[1200ms] ease-out will-change-[opacity,transform] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-32'
          }`}
          style={{ transitionDelay: `${i * 150}ms` }}
        >
          <img 
            src={img.src} 
            alt={img.alt} 
            className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105 cursor-pointer" 
          />
        </div>
      ))}
    </div>
  );
};

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Podcast-relevant brand icons
  const podcastBrands = [
    {
      name: "PulseCast",
      icon: (
        <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12h4l3-9 5 18 3-9h5" />
        </svg>
      )
    },
    {
      name: "EchoWave",
      icon: (
        <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10v4M8 6v12M12 2v20M16 6v12M20 10v4" />
        </svg>
      )
    },
    {
      name: "StreamLab",
      icon: (
        <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M10 8l6 4-6 4V8z" />
        </svg>
      )
    },
    {
      name: "VocalPro",
      icon: (
        <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
        </svg>
      )
    },
    {
      name: "AudioFlow",
      icon: (
        <svg className="w-6 h-6 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15V6M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 12H3M16 6H3M12 18H3" />
        </svg>
      )
    }
  ];

  // Calculate dynamic styles based on scroll position
  const scale = 1 + scrollY * 0.0005;
  const opacity = Math.max(1 - scrollY * 0.0015, 0); // Fade out slightly on deep scroll

  return (
    <section className="bg-[#111111] flex flex-col pb-0">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes infiniteScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hero-marquee-track {
          display: flex;
          width: max-content;
          animation: infiniteScroll 30s linear infinite;
        }
        .hero-marquee-track:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* ═══════════ HERO FULL WIDTH ═══════════ */}
      <div
        className="relative z-20 w-full min-h-[85vh] md:min-h-[820px] rounded-b-[80px] md:rounded-b-[120px] overflow-hidden flex flex-col justify-between bg-[#ff4d00]"
        style={{
          backgroundImage: `radial-gradient(circle at 45% 45%, #ff5e00 0%, #aa0000 50%, #220000 100%)`,
        }}
      >
        {/* Animated Background Image Layer */}
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none transform-gpu origin-center will-change-transform"
          style={{
            backgroundImage: `url('/hero.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center", // Perfectly match the attached image
            transform: `scale(${scale})`,
            opacity: opacity,
            transition: "transform 0.1s ease-out, opacity 0.1s ease-out",
          }}
        />

        {/* Subtle overall overlay + black shade from bottom */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111]/90 via-[#111]/10 to-transparent pointer-events-none" />

        {/* ── 1. Navbar (Inside Card) ── */}
        <nav className="relative z-10 flex items-center justify-between px-8 md:px-14 pt-8 pb-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-white text-[22px] font-bold tracking-tight">FinalCast</span>
            <span className="text-white text-[10px] font-bold leading-none ml-[2px] mb-3">®</span>
          </Link>

          {/* Nav Links & CTA */}
          <div className="hidden md:flex items-center gap-14">
            <div className="flex items-center gap-6">
              <a href="#" className="text-white text-[15px] font-bold hover:opacity-80 transition-opacity">Home</a>
              <a href="#features" className="text-white text-[15px] font-bold hover:opacity-80 transition-opacity">Features</a>
              <a href="#pricing" className="text-white text-[15px] font-bold hover:opacity-80 transition-opacity">Pricing</a>
            </div>

            <Link href="/auth?mode=signup">
              <button className="relative flex items-center overflow-hidden bg-white rounded-full h-[46px] w-[184px] group shadow-[0_4px_14px_0_rgba(0,0,0,0.2)]">
                {/* Expanding Orange Pill */}
                <div className="absolute right-1 top-1 bottom-1 w-[38px] bg-[#ff4d00] rounded-full transition-all duration-500 ease-out group-hover:w-[calc(100%-8px)]" />
                
                <div className="relative z-10 flex items-center w-full h-full pointer-events-none">
                  {/* Sliding Text */}
                  <span className="absolute left-[24px] text-[#111] font-bold text-[14px] transition-all duration-500 ease-out group-hover:text-white group-hover:left-[48px]">
                    Start Recording
                  </span>
                  
                  {/* Sliding Arrow */}
                  <div className="absolute right-[12px] transition-all duration-500 ease-out group-hover:right-[146px]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            </Link>
          </div>
        </nav>

        {/* ── 2. Main Content ── */}
        <div className="relative z-10 flex-grow flex flex-col md:flex-row items-center justify-between px-8 md:px-14 py-4 md:py-8">
          {/* Left Column Text */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h3 className="text-white text-[15px] md:text-[18px] font-bold tracking-wide mb-2 opacity-95">
              Podcasting Made Simple
            </h3>
            <h1 className="text-[72px] md:text-[88px] lg:text-[100px] font-black leading-[0.95] text-white tracking-tighter shadow-sm">
              Record<br />
              Render<br />
              Release
            </h1>
          </div>

          {/* Right Column Text */}
          <div className="w-full md:w-1/2 flex justify-end md:pr-4 mt-12 md:mt-24">
            <div className="max-w-[420px]">
              <h2 className="text-white text-[32px] md:text-[40px] font-bold leading-[1.15] mb-6 tracking-tight drop-shadow-sm">
                Create podcasts and<br />
                video conversations<br />
                effortlessly.
              </h2>
              <p className="text-[#e0e0e0] text-[16px] md:text-[18px] leading-relaxed font-medium drop-shadow-sm">
                FinalCast records your session and<br />
                automatically renders a ready-to-share<br />
                video.
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Bottom Features Row ── */}
        <div className="relative z-10 px-8 md:px-14 pb-12 pt-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-[95%]">
            {[
              { id: "01", title: "Real-time Recording" },
              { id: "02", title: "WebRTC Video Sessions" },
              { id: "03", title: "Automatic Rendering" },
              { id: "04", title: "Instant Publishing" },
            ].map((item, index) => (
              <div key={index} className="flex flex-col gap-2">
                <span className="text-[#f95503] font-bold text-[18px]">
                  #{item.id}
                </span>
                <span className="text-white font-bold text-[16px] md:text-[17px] tracking-tight whitespace-nowrap">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ MIDDLE LAYER: BRAND SLIDER ═══════════ */}
      <div className="relative z-10 w-full px-8 md:px-14 pt-[130px] md:pt-[240px] pb-16 md:pb-24 bg-[#141414] rounded-b-[80px] md:rounded-b-[120px] overflow-hidden -mt-[60px] md:-mt-[120px]">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-[80px] w-full">
          {/* Static Heading */}
          <p className="text-white text-[14px] md:text-[16px] font-bold leading-tight min-w-[200px] shrink-0">
            Trusted by Brands I've<br />Helped Shape
          </p>

          {/* Marquee Container with Fade Edges */}
          <div 
            className="relative flex-grow w-full overflow-hidden"
            style={{ 
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', 
              maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' 
            }}
          >
            <div className="hero-marquee-track">
              {/* Group 1 */}
              <div className="flex items-center gap-16 md:gap-[90px] pr-16 md:pr-[90px] w-max shrink-0">
                {podcastBrands.map((brand, index) => (
                  <div key={`brand-1-${index}`} className="flex items-center gap-3 text-white/90 font-bold text-[18px] md:text-[22px] tracking-tight whitespace-nowrap">
                    {brand.icon}
                    {brand.name}
                  </div>
                ))}
              </div>
              {/* Group 2 (Duplicate for infinite seamless loop) */}
              <div className="flex items-center gap-16 md:gap-[90px] pr-16 md:pr-[90px] w-max shrink-0" aria-hidden="true">
                {podcastBrands.map((brand, index) => (
                  <div key={`brand-2-${index}`} className="flex items-center gap-3 text-white/90 font-bold text-[18px] md:text-[22px] tracking-tight whitespace-nowrap">
                    {brand.icon}
                    {brand.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ BOTTOM LAYER: BEHIND FINALCAST ═══════════ */}
      <div className="relative z-0 w-full px-8 md:px-14 pt-[120px] md:pt-[200px] py-16 md:py-24 bg-black overflow-hidden -mt-[60px] md:-mt-[120px]">
        <div className="flex flex-col md:flex-row gap-12 md:gap-[100px] lg:gap-[150px] items-start w-full">
            {/* Left Side */}
            <div className="flex-1">
              <h3 className="text-[#ff4d00] font-bold text-[18px] md:text-[22px] tracking-wide mb-6">
                Behind FinalCast
              </h3>
              <h2 className="text-white text-[48px] md:text-[64px] font-black leading-[1.05] tracking-tight">
                Record<br />
                Conversations<br />
                Render Videos<br />
                Publish Instantly
              </h2>
            </div>

            {/* Right Side */}
            <div className="flex-1 flex flex-col pt-2 md:pt-[40px] gap-10 md:gap-16">
              <p className="text-white font-bold text-[24px] md:text-[32px] leading-tight tracking-tight max-w-[540px]">
                FinalCast helps creators record conversations and automatically transform them into shareable videos.
              </p>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-[540px]">
                <p className="text-gray-400 font-semibold text-[14px] leading-snug">
                  Record Once Publish<br />Everywhere
                </p>
                <Link href="/auth?mode=signup" className="shrink-0">
                  <button className="relative flex items-center overflow-hidden bg-white rounded-full h-[56px] w-[214px] group shadow-[0_4px_14px_0_rgba(0,0,0,0.2)]">
                    {/* Expanding Orange Pill */}
                    <div className="absolute right-1.5 top-1.5 bottom-1.5 w-[44px] bg-[#ff4d00] rounded-full transition-all duration-500 ease-out group-hover:w-[calc(100%-12px)]" />
                    
                    <div className="relative z-10 flex items-center w-full h-full pointer-events-none">
                      {/* Sliding Text */}
                      <span className="absolute left-[28px] text-[#111] font-black tracking-tight text-[16px] transition-all duration-500 ease-out group-hover:text-white group-hover:left-[56px]">
                        Start Recording
                      </span>
                      
                      {/* Sliding Arrow */}
                      <div className="absolute right-[14px] transition-all duration-500 ease-out group-hover:right-[172px]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-[20px] h-[20px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <AnimatedImageGrid />
      </div>

    </section>
  );
};

export default Hero;