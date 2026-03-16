import React from "react";
import { ArrowRight } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-28 pb-0 px-6 md:px-24 relative overflow-hidden flex justify-center">

      {/* Main Grid */}
      <div className="max-w-[1400px] w-full grid grid-cols-1 md:grid-cols-[1.6fr_0.6fr_0.6fr] gap-28 relative z-10 pb-48">

        {/* Left */}
        <div className="flex flex-col items-start">

          <h2 className="text-[18px] font-semibold mb-5 tracking-tight">
            FinalCast
          </h2>

          <h3 className="text-[22px] md:text-[24px] font-bold leading-snug mb-5">
            Great design should feel invisible.
          </h3>

          <p className="text-[#7a7a7a] text-[14px] leading-relaxed mb-8 max-w-[360px]">
            I'm a product designer focused on building clean, intuitive
            interfaces that solve real-world problems.
          </p>

          {/* CTA */}
          <button className="flex items-center gap-4 bg-[#151515] hover:bg-[#1d1d1d] text-white font-semibold py-2 pl-6 pr-2 rounded-full text-[14px] transition group mb-10">

            <span>Get in touch</span>

            <div className="w-8 h-8 rounded-full bg-[#ff4d00] flex items-center justify-center transition-transform group-hover:rotate-45">
              <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform" />
            </div>

          </button>

          <p className="text-[#5a5a5a] text-[12px] font-medium">
            © 2025 Copyright
          </p>

        </div>

        {/* Menu */}
        <div>
          <h4 className="text-[#ff4d00] font-semibold text-[14px] mb-6">
            Menu
          </h4>

          <ul className="space-y-4 text-[14px] font-medium text-white">
            <li><a className="hover:text-[#ff4d00] transition">Home</a></li>
            <li><a className="hover:text-[#ff4d00] transition">Services</a></li>
            <li><a className="hover:text-[#ff4d00] transition">About</a></li>
            <li><a className="hover:text-[#ff4d00] transition">Projects</a></li>
            <li><a className="hover:text-[#ff4d00] transition">Pricing</a></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-[#ff4d00] font-semibold text-[14px] mb-6">
            Social
          </h4>

          <ul className="space-y-4 text-[14px] text-[#8a8a8a]">
            <li className="flex items-center gap-3 hover:text-white transition">
              <FaFacebookF className="w-4 h-4" /> Facebook
            </li>
            <li className="flex items-center gap-3 hover:text-white transition">
              <FaInstagram className="w-4 h-4" /> Instagram
            </li>
            <li className="flex items-center gap-3 hover:text-white transition">
              <FaTiktok className="w-4 h-4" /> TikTok
            </li>
            <li className="flex items-center gap-3 hover:text-white transition">
              <FaYoutube className="w-4 h-4" /> YouTube
            </li>
          </ul>
        </div>

      </div>

      {/* Watermark */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none select-none z-0 overflow-hidden">

        <h1 className="text-[18vw] font-black tracking-[-0.04em] text-[#111111] leading-[0.8] whitespace-nowrap translate-y-[15%]">
          FinalCast®
        </h1>

      </div>

    </footer>
  );
};

export default Footer;