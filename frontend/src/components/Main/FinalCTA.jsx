import React from 'react';
import { ArrowRight } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="bg-black py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto relative rounded-[40px] md:rounded-[60px] overflow-hidden group">
        
        {/* Background Image with Parallax/Zoom effect on hover */}
        <div className="absolute inset-0 w-full h-full bg-[#111]">
          <img 
            src="/hero-person.png" 
            alt="Start your brand" 
            className="w-full h-full object-cover mix-blend-luminosity opacity-40 transition-transform duration-[2s] group-hover:scale-105"
          />
          {/* Neon Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff4d00]/70 via-transparent to-[#00f0ff]/50 mix-blend-color" />
          {/* Vignette */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center py-32 md:py-48 px-6">
          <h4 className="text-white font-bold text-[18px] md:text-[22px] tracking-wide mb-4 md:mb-6">
            Start Your Brand
          </h4>
          
          <h2 className="text-[56px] md:text-[96px] font-black text-white leading-[1.05] tracking-tighter mb-8 max-w-4xl drop-shadow-2xl">
            Let's Bring Your<br />Brand to Life
          </h2>
          
          <p className="text-white/90 text-[16px] md:text-[20px] font-medium leading-[1.6] max-w-2xl mx-auto mb-12 drop-shadow-md">
            Ready to make something amazing together? Whether you're starting fresh or evolving your brand, I'm here to help.
          </p>
          
          <button className="inline-flex items-center gap-4 bg-white hover:bg-gray-100 text-black font-bold py-3 pl-8 pr-3 rounded-full text-[16px] transition-transform hover:scale-105 shadow-[0_10px_40px_rgba(255,255,255,0.2)] group/btn">
            <span>Get In Touch</span>
            <div className="w-10 h-10 rounded-full bg-[#ff4d00] flex items-center justify-center text-white transition-transform group-hover/btn:-rotate-45">
              <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
