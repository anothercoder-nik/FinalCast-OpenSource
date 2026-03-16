import { useIntersectionObserver } from "../../hooks/use-landing-hooks";
import { useState } from "react";
import { Mic, Users, Cloud, Scissors, Captions, ShieldCheck } from "lucide-react";

const FeatureCard = ({ id, icon: Icon, title, description, delay = 0, isOrange }) => {
  const [ref, isVisible] = useIntersectionObserver();

  // Dynamic styling based on the alternating orange/dark requirement
  const bgClass = isOrange 
    ? "bg-gradient-to-br from-[#ff5500] to-[#dd4400] border-[#ff7733]/50" 
    : "bg-gradient-to-br from-[#181818] to-[#111111] border-white/5";
    
  const hoverClass = isOrange 
    ? "shadow-[0_40px_80px_rgba(255,85,0,0.5)] border-white/30" 
    : "shadow-[0_40px_80px_rgba(255,77,0,0.15)] border-[#ff4d00]/30";
  
  const iconContainer = isOrange
    ? "bg-white/15 border-white/30 text-white group-hover:bg-white group-hover:text-[#ff4d00] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.8)]"
    : "bg-[#ff4d00]/10 border-[#ff4d00]/20 text-[#ff4d00] group-hover:bg-[#ff4d00] group-hover:text-white group-hover:shadow-[0_0_40px_rgba(255,77,0,0.6)]";
    
  const numberClass = isOrange
    ? "text-black/10 group-hover:text-white/60 group-hover:scale-110 group-hover:-translate-y-2"
    : "text-[#222] group-hover:text-[#ff4d00]/40 group-hover:scale-110 group-hover:-translate-y-2";
    
  const descClass = isOrange ? "text-white/90" : "text-gray-400";
  const cornerGlow = isOrange ? "bg-white/30" : "bg-[#ff4d00]/40";

  return (
    <div
      ref={ref}
      className={`relative ${bgClass} rounded-[32px] p-8 md:p-12 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer overflow-hidden group flex flex-col h-full transform-gpu ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
      } hover:-translate-y-4 ${hoverClass}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* ── Aesthetic Corner Outer Glow ── */}
      <div 
        className={`absolute top-0 right-0 w-[300px] h-[300px] ${cornerGlow} blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 transition-opacity duration-[800ms] opacity-0 group-hover:opacity-100 pointer-events-none`} 
      />
      
      {/* ── Glass Shimmer Sweep ── */}
      <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] group-hover:animate-[shimmer_1.5s_cubic-bezier(0.4,0,0.2,1)] pointer-events-none" />
      
      {/* ── Top Header ── */}
      <div className="flex justify-between items-start mb-12 relative z-10">
        <div className={`relative w-16 h-16 border rounded-2xl flex items-center justify-center shadow-inner transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.15] group-hover:-rotate-3 ${iconContainer}`}>
          <Icon className="w-8 h-8 stroke-[2px] transition-transform duration-500 group-hover:scale-110" />
        </div>
        <span className={`font-black text-[40px] tracking-tighter transition-all duration-[600ms] ease-out select-none ${numberClass}`}>
          {id}
        </span>
      </div>

      {/* ── Content ── */}
      <div className="flex-grow flex flex-col justify-end relative z-10">
        <h3 className="text-[24px] font-bold text-white mb-4 tracking-tight leading-snug transition-transform duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-2">
          {title}
        </h3>
        <p className={`leading-[1.7] text-[16px] font-medium transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-2 delay-75 ${descClass}`}>
          {description}
        </p>
      </div>
    </div>
  );
};

// Features Section Component
const FeaturesSection = () => {
  const features = [
    {
      id: "01",
      icon: Mic,
      title: "Studio-Quality Recordings",
      description: "Record audio and video locally in crystal-clear quality, even with poor internet, ensuring professional-grade output every time.",
    },
    {
      id: "02",
      icon: Users,
      title: "Multi-Participant Recording",
      description: "Seamlessly capture high-resolution streams from multiple participants with individual track isolation for maximum post-production control.",
    },
    {
      id: "03",
      icon: Cloud,
      title: "Cloud Backup & Sync",
      description: "Auto-upload recordings in real-time to secure cloud storage with resume support, so nothing is ever lost.",
    },
    {
      id: "04",
      icon: Scissors,
      title: "Timeline Editor",
      description: "Visually edit podcasts or videos with a drag-and-drop interface and smart snapping for precision cuts and layout control.",
    },
    {
      id: "05",
      icon: Captions,
      title: "AI Transcripts & Captions",
      description: "Generate accurate multilingual transcripts and captions in seconds using cutting-edge speech-to-text AI.",
    },
    {
      id: "06",
      icon: ShieldCheck,
      title: "Zero-Knowledge Encryption",
      description: "All recordings are encrypted on-device, ensuring complete privacy with creator-only decryption access.",
    },
  ];

  return (
    <section className="w-full py-24 md:py-32" id="features">
      <div className="w-full px-8 md:px-14">
        <div className="flex flex-col md:flex-row gap-12 justify-between items-end mb-24">
          <div className="max-w-2xl">
            <h3 className="text-[#ff4d00] font-bold text-[18px] md:text-[22px] tracking-wide mb-6">
              Powerful Features
            </h3>
            <h2 className="text-5xl md:text-[64px] font-black text-white tracking-tight leading-[1.05]">
              Everything you need<br />to produce at scale.
            </h2>
          </div>
          <p className="text-xl text-gray-400 max-w-md pb-2 font-medium">
            Record, edit, and produce studio-quality podcasts and videos — all backed by cutting-edge AI and cloud technology.
          </p>
        </div>

        {/* 3 columns on large screens => Top row: Orange, Dark, Orange / Bottom row: Dark, Orange, Dark */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              {...feature} 
              delay={index * 100} 
              isOrange={index % 2 === 0} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;