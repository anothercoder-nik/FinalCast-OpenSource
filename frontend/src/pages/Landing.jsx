import React, { useEffect } from 'react';
import Hero from '../components/Main/Hero';
import FeaturesSection from '../components/Main/Features';
import RecordUtil from '../components/utils/RecordUtil';
import GoLiveSection from '../components/utils/live';
import PortfolioCarousel from '../components/Main/PortfolioCarousel';
import PricingSection from '../components/Main/PricingSection';
import FAQSection from '../components/Main/FAQSection';
import Footer from '../components/Main/Footer';

const Landing = () => {
  // Enforce pure black background on the body for seamless overscroll
  useEffect(() => {
    document.body.style.backgroundColor = "black";
    return () => { document.body.style.backgroundColor = ""; }
  }, []);

  return (
    <div className="bg-black flex flex-col">

      {/* 1. Hero */}
      <div className="relative z-[80] rounded-b-[32px] md:rounded-b-[48px] overflow-hidden bg-[#111] shadow-[0_15px_40px_rgba(0,0,0,0.4)] border-b border-white/5">
        <Hero />
      </div>

      {/* 2. Features */}
      <div className="relative z-[70] -mt-[40px] md:-mt-[100px] pt-[40px] md:pt-[100px] rounded-b-[32px] md:rounded-b-[48px] overflow-hidden bg-[#0a0a0a] shadow-[0_15px_40px_rgba(0,0,0,0.4)] border-b border-white/5">
        <FeaturesSection />
      </div>

      {/* 3. RecordUtil */}
      <div className="relative z-[60] -mt-[40px] md:-mt-[100px] pt-[40px] md:pt-[100px] rounded-b-[32px] md:rounded-b-[48px] overflow-hidden bg-[#141414] shadow-[0_15px_40px_rgba(0,0,0,0.4)] border-b border-white/5">
        <RecordUtil />
      </div>

      {/* 4. GoLive */}
      <div className="relative z-[50] -mt-[40px] md:-mt-[100px] pt-[40px] md:pt-[100px] rounded-b-[32px] md:rounded-b-[48px] overflow-hidden bg-[#0a0a0a] shadow-[0_15px_40px_rgba(0,0,0,0.4)] border-b border-white/5">
        <GoLiveSection />
      </div>

      {/* 5. Portfolio Carousel */}
      <div className="relative z-[40] -mt-[40px] md:-mt-[100px] pt-[40px] md:pt-[100px] rounded-b-[32px] md:rounded-b-[48px] overflow-hidden bg-[#141414] shadow-[0_15px_40px_rgba(0,0,0,0.4)] border-b border-white/5">
        <PortfolioCarousel />
      </div>

      {/* 6. Pricing */}
      <div className="relative z-[30] -mt-[40px] md:-mt-[100px] pt-[40px] md:pt-[100px] rounded-b-[32px] md:rounded-b-[48px] overflow-hidden bg-[#050505] shadow-[0_15px_40px_rgba(0,0,0,0.4)] border-b border-white/5">
        <PricingSection />
      </div>

      {/* 7. FAQ */}
      <div className="relative z-[20] -mt-[40px] md:-mt-[100px] pt-[40px] md:pt-[100px] rounded-b-[32px] md:rounded-b-[48px] overflow-hidden bg-[#0a0a0a] shadow-[0_15px_40px_rgba(0,0,0,0.4)] border-b border-white/5">
        <FAQSection />
      </div>

      {/* 8. Footer */}
      <div className="relative z-[10] -mt-[40px] md:-mt-[100px] pt-[40px] md:pt-[100px] bg-black">
        <Footer />
      </div>

    </div>
  );
};

export default Landing;
