import React from 'react';

const GoLiveSection = () => {
  return (
    <section className="bg-[#f8f7ff] py-20 px-4 text-center relative overflow-hidden">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          Go <span className="text-indigo-600">live.</span>
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Stream your events and webinars in full HD from your fully
          branded studio. Simulcasting, omnichat, and lots more included.
        </p>
        <button className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition">
          Start for Free
        </button>
        <div>
          <a
            href="#"
            className="block text-indigo-500 hover:underline text-sm mt-2"
          >
            Learn more →
          </a>
        </div>
      </div>

      {/* Video Section */}
      <div className="mt-16 flex justify-center">
        <video
          src="/livestream_desktop.mp4" // Update this path to your actual video location
          autoPlay
          loop
          muted
          playsInline
          className="max-w-4xl w-full rounded-xl shadow-lg"
        />
      </div>
    </section>
  );
};

export default GoLiveSection;
