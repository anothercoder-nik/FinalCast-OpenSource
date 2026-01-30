import React from 'react';
import { ThemeToggle } from '../components/ui/theme-toggle';
import Hero from '../components/Main/Hero';
import { Link } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import InteractiveStats from '../components/utils/InteractiveStats';
import FeaturesSection from '../components/Main/Features';
import GoLiveSection from '../components/utils/live';
import RecordUtil from '../components/utils/RecordUtil';
import Footer from '../components/Main/Footer';
import Marquee from 'react-fast-marquee';

const Landing = () => {
  return (
    <div>
      <Hero />
      <InteractiveStats />
      <FeaturesSection />
      <RecordUtil />
      <GoLiveSection />

      <section className="relative overflow-hidden bg-black text-white">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row items-center justify-between px-8 md:px-24 py-20 bg-black text-left">
          <div className="max-w-xl z-10">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Take one,<br />for the team.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-6">
              Everything we have to offer, plus seamless collaboration, advanced
              production controls, and all the security standards and support
              your business requires.
            </p>
            <div className="flex items-center space-x-4">
              <button className="bg-lime-400 text-black px-6 py-3 rounded font-semibold">
                Book a demo
              </button>
              <a
                href="#"
                className="text-lime-400 font-semibold hover:underline"
              >
                Explore business options →
              </a>
            </div>
          </div>

          <div className="mt-10 md:mt-0 z-10">
            <img
              src="/office.jpg"
              alt="Hero Person"
              className="w-[500px] md:w-[450px] rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Updated Brand Marquee with react-fast-marquee */}
        <div className="w-full bg-black py-4 border-t border-gray-800">
          <Marquee gradient={false} speed={40} pauseOnHover={true}>
            {[
              "VAYNERMEDIA",
              "Spotify",
              "Microsoft",
              "verizon media",
              "NETFLIX",
              "MARVEL",
              "iHeartMEDIA",
              "The New York Times",
              "BUSINESS INSIDER",
              "TED",
              "The Economist",
              "NPR",
              "VAYNERMEDIA",
            ].map((brand, index) => (
              <span key={index} className="mx-6 text-white text-sm">
                {brand}
              </span>
            ))}
          </Marquee>
        </div>

        {/* Bottom Call to Action */}
        <div className="relative z-10 bg-gradient-to-b from-black to-purple-900 text-center py-20">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-semibold mb-6 text-white">
              Take it from here.
            </h2>
            <p className="text-xl md:text-3xl font-bold text-white mb-8">
              Start creating with FinalCast
            </p>
            <button className="bg-purple-500 hover:bg-purple-600 px-8 py-4 rounded-xl font-semibold text-white">
              Start for Free
            </button>
            <p className="text-sm text-gray-400 mt-2">
              *No credit card needed. <a href="#" className="underline">Free plan</a> available.
            </p>
          </div>

          {/* Curve and shadow */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
            <svg
              className="relative block w-full h-[60px] drop-shadow-2xl"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              viewBox="0 0 1200 120"
            >
              <path
                d="M0,0 C300,100 900,0 1200,100 L1200,120 L0,120 Z"
                fill="white"
              ></path>
            </svg>
          </div>
        </div>

      </section>

      <Footer />
    </div>
  );
};

export default Landing;
