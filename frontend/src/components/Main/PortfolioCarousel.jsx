import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';

const PortfolioCarousel = () => {
  const images = [
    '/demo.png',
    '/office.jpg',
    '/demo2.png',
    '/demo.png',
    '/office.jpg',
    '/demo2.png',
    '/demo.png',
  ];

  const steps = [
    { num: '01', title: 'Strategy & Planning' },
    { num: '02', title: 'Design & Development' },
    { num: '03', title: 'Launch & Growth' },
    { num: '04', title: 'Ongoing Support' },
  ];

  return (
    <section className="w-full py-24 relative overflow-hidden">
      
      {/* ── Top Typography & CTAs ── */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-16 relative z-10">
        <h4 className="text-[#ff4d00] font-bold text-[16px] md:text-[20px] tracking-wide mb-6">
          Behind the Designs
        </h4>
        <h2 className="text-[40px] md:text-[64px] font-black text-white leading-[1.1] tracking-tighter mb-6">
          Curious What Else I've<br />Created?
        </h2>
        <p className="text-gray-400 text-[16px] md:text-[20px] font-medium leading-[1.6] max-w-2xl mx-auto mb-10">
          Explore more brand identities, packaging, and digital design work in my extended portfolio.
        </p>
        
        <button className="inline-flex items-center gap-4 bg-white hover:bg-gray-100 text-black font-bold py-3 pl-8 pr-3 rounded-full text-[16px] transition-transform hover:scale-105 shadow-[0_10px_40px_rgba(255,255,255,0.15)] group">
          <span>See more Projects</span>
          <div className="w-10 h-10 rounded-full bg-[#ff4d00] flex items-center justify-center text-white transition-transform group-hover:rotate-45">
            <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
          </div>
        </button>
      </div>

      {/* ── Smooth 3D Coverflow Carousel ── */}
      <div className="w-full relative mb-24 mt-16 pb-12">
        {/* Soft gradient edge masking */}
        <div className="absolute top-0 bottom-0 left-0 w-16 md:w-48 bg-gradient-to-r from-[#141414] via-[#141414]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-16 md:w-48 bg-gradient-to-l from-[#141414] via-[#141414]/80 to-transparent z-10 pointer-events-none" />

        <style>
          {`
            /* Force the continuous smooth linear sliding motion natively bypassing Swiper's default easing jumps */
            .swiper-wrapper {
              transition-timing-function: linear !important;
            }
          `}
        </style>

        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          loop={true}
          speed={4000} // The duration of a single slide transition
          autoplay={{
            delay: 0, // No delay equals continuous sliding when paired with linear timing
            disableOnInteraction: false,
          }}
          coverflowEffect={{
            rotate: 25,       // Slide tilt angle
            stretch: -40,     // Spacing modifier (negative brings them closer)
            depth: 200,       // Z-depth scale
            modifier: 1.5,    // Effect multiplier
            slideShadows: true, // Auto generated 3D physical shadows inside
          }}
          modules={[EffectCoverflow, Autoplay]}
          className="w-full max-w-[1600px] overflow-visible!"
        >
          {images.map((src, index) => (
            <SwiperSlide key={index} className="w-[300px] h-[400px] md:w-[380px] md:h-[500px] !flex justify-center">
              <div className="w-full h-full rounded-[32px] overflow-hidden shadow-2xl relative border border-white/5 bg-[#141414]">
                {/* Image */}
                <img 
                  src={src} 
                  alt={`Portfolio showcase ${index + 1}`} 
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500" 
                />
                {/* Vignette bottom fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ── Bottom Numbered Steps Grid ── */}
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center group cursor-default">
              <div className="text-[18px] md:text-[22px] font-black text-white mb-3 tracking-tighter transition-colors group-hover:text-[#ff4d00]">
                <span className="text-[#ff4d00]">#</span>{step.num}
              </div>
              <p className="text-gray-300 font-bold text-[14px] md:text-[18px] tracking-tight transition-colors group-hover:text-white">
                {step.title}
              </p>
            </div>
          ))}
        </div>
      </div>
      
    </section>
  );
};

export default PortfolioCarousel;
