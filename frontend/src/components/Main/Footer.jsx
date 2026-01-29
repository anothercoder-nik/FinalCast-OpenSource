import React from "react";
import { FaFacebookF, FaYoutube, FaInstagram, FaLinkedinIn } from "react-icons/fa";


const Footer = () => {
  return (
    <footer className="bg-[#f9f9f9] text-[#333] text-sm pt-16 pb-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
        {/* Company */}
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2">
            <li><a href="#">About Us</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Partners</a></li>
          </ul>
        </div>

        {/* Product */}
        <div>
          <h4 className="font-semibold mb-4">Product</h4>
          <ul className="space-y-2">
            <li><a href="#">FinalCast</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Mobile Apps</a></li>
          </ul>
        </div>

        {/* Features */}
        <div>
          <h4 className="font-semibold mb-4">Features</h4>
          <ul className="space-y-2">
            <li><a href="#">Recording</a></li>
            <li><a href="#">Livestream</a></li>
            <li><a href="#">Editor</a></li>
          </ul>
        </div>

        {/* Tools */}
        <div>
          <h4 className="font-semibold mb-4">Tools</h4>
          <ul className="space-y-2">
            <li><a href="#">Podcast Maker</a></li>
            <li><a href="#">Screen Recorder</a></li>
            <li><a href="#">Mic Test</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="font-semibold mb-4">Resources</h4>
          <ul className="space-y-2">
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Community Hub</a></li>
          </ul>
        </div>

        {/* Legal Pages */}
        <div>
          <h4 className="font-semibold mb-4">Legal Pages</h4>
          <ul className="space-y-2">
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-12 border-t border-gray-300 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
        <p>&copy; 2025 RiversideFM, Inc.</p>
      <div className="flex gap-4 mt-4 md:mt-0 text-lg">
  <a href="#"><FaFacebookF /></a>
  <a href="#"><FaYoutube /></a>
  <a href="#"><FaInstagram /></a>
  <a href="#"><FaLinkedinIn /></a>
</div>

      </div>
    </footer>
  );
};

export default Footer;