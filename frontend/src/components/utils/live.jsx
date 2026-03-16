import React from 'react';
import { Radio, ArrowRight, Play, Globe } from 'lucide-react';

const GoLiveSection = () => {
  return (
    <section className="w-full py-24 md:py-32 relative overflow-hidden flex flex-col items-center">
      
      {/* ── Background Ambient Glow ── */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#ff4d00]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        
        {/* Eyebrow Label */}
        <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4d00] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff4d00]"></span>
          </span>
          <span className="text-[#ff4d00] font-bold text-[12px] uppercase tracking-widest">Streaming Engine</span>
        </div>

        {/* Headline */}
        <h2 className="text-[56px] md:text-[80px] font-black text-white leading-[1.05] tracking-tighter mb-8">
          Go <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d00] to-[#ff8c42]">live.</span><br />
          Everywhere.
        </h2>

        {/* Description */}
        <p className="text-[18px] md:text-[22px] text-gray-400 max-w-2xl mx-auto font-medium leading-[1.6] mb-12">
          Stream your events and webinars in pristine 4K from your fully branded studio. True simulcasting, active omnichat, and zero latency.
        </p>

        {/* CTA Stack */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
          <button className="bg-[#ff4d00] hover:bg-[#e64600] text-white font-bold py-4 px-10 rounded-full flex items-center gap-3 transition-all hover:scale-105 shadow-[0_10px_30px_rgba(255,77,0,0.3)]">
            <span className="text-[16px]">Start your broadcast</span>
            <Radio className="w-5 h-5" />
          </button>
          <button className="group text-white font-bold py-4 px-8 rounded-full flex items-center gap-3 transition-colors hover:bg-white/5">
            <span className="text-[16px]">Explore features</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* ── Cinematic Video Container ── */}
      <div className="w-full max-w-[1200px] px-6 relative z-10 group">
        
        {/* Decorative Floating Badges */}
        <div className="absolute -top-6 -left-4 md:-left-12 bg-[#141414] border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 z-20 animate-bounce transition-transform duration-1000 group-hover:-translate-y-4" style={{ animationDuration: '4s' }}>
          <div className="w-10 h-10 rounded-full bg-[#ff4d00]/20 flex items-center justify-center text-[#ff4d00]">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-white font-bold text-[14px]">Multi-Platform</p>
            <p className="text-gray-400 text-[12px]">YouTube, Twitch, X</p>
          </div>
        </div>

        <div className="absolute -bottom-8 -right-4 md:-right-8 bg-[#141414] border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 z-20 animate-bounce transition-transform duration-1000 group-hover:translate-y-4" style={{ animationDuration: '5s', animationDelay: '1s' }}>
          <div className="w-10 h-10 rounded-full bg-[#ff4d00] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,77,0,0.5)]">
            <Play className="w-5 h-5 fill-white" />
          </div>
          <div>
            <p className="text-white font-bold text-[14px] leading-tight">Zero Latency</p>
            <p className="text-[#ff4d00] font-bold text-[12px] uppercase tracking-wider">Active</p>
          </div>
        </div>

        {/* The Player */}
        <div className="relative rounded-[32px] overflow-hidden bg-[#111] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] ring-1 ring-[#ff4d00]/10 transition-all duration-700 group-hover:ring-[#ff4d00]/30 group-hover:shadow-[0_40px_120px_rgba(255,77,0,0.15)] aspect-[16/9]">
          
          {/* Faux Browser Header */}
          <div className="w-full h-12 bg-[#1a1a1a] border-b border-white/5 flex items-center px-6 gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-black/50 rounded-full w-1/3 h-6 border border-white/5"></div>
            </div>
          </div>

          <video
            src="/livestream_desktop.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-[calc(100%-3rem)] object-cover opacity-90 transition-opacity duration-1000 group-hover:opacity-100 mix-blend-screen"
          />
        </div>

      </div>
    </section>
  );
};

export default GoLiveSection;
