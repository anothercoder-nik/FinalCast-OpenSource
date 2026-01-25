import React from 'react'

const RecordUtil = () => {
  return (
     <section className="bg-white pt-20 pb-20 px-4 md:px-8">
  {/* Top Record It Block */}
  <div className="text-center mb-20">
    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">Record it.</h2>
    <p className="text-gray-600 max-w-2xl mx-auto">
      Studio-quality, separate audio and video tracks for each participant, thanks to our local recording technology.
    </p>
    <div className="mt-6">
      <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md">
        Start for Free
      </button>
    </div>
    <div className="mt-3">
      <a href="#" className="text-purple-500 text-sm font-medium hover:underline">
        Learn more →
      </a>
    </div>
  </div>

  {/* Main Recording Feature Section */}
  <div className="max-w-7xl mx-auto">
    <div className="grid lg:grid-cols-3 items-start gap-6">
      
      {/* Left: Video or Screenshot */}
      <div className="lg:col-span-2 relative rounded-2xl overflow-hidden shadow-2xl">
        <img
          src="/demo.png"
          alt="Recording demo"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-6 right-6 bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg flex items-center gap-1.5">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          REC
        </div>
      </div>

      {/* Right Panel: Download Options */}
      <div className="space-y-6">
        {/* Highlight Image */}
        <div className="rounded-2xl overflow-hidden shadow-xl relative">
          <img
            src="/demo2.png"
            alt="4K recording"
            className="w-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-lg">
            <span className="font-bold">4K</span> high-quality recording
          </div>
        </div>

        {/* Download Section */}
        <div className="bg-black text-white rounded-2xl p-6 shadow-2xl">
          <h3 className="text-base font-bold mb-5">Download separate tracks</h3>

          {[
            { name: "Marsha", initial: "M", color: "bg-purple-600" },
            { name: "Stephen", initial: "S", color: "bg-purple-600" },
            { name: "All Speakers", initial: "A", color: "bg-purple-600" },
          ].map((person, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-4 border-b border-zinc-800 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 flex items-center justify-center ${person.color} rounded-full text-white font-bold text-sm`}>
                  {person.initial}
                </div>
                <div>
                  <p className="font-semibold text-sm">{person.name}</p>
                  <p className="text-xs text-gray-400">Ready</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="text-gray-400 hidden sm:inline">3840 × 2160</span>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded font-medium">WAV</span>
                  <span className="bg-blue-500 text-white px-2 py-1 rounded font-medium">MP4</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>
  )
}

export default RecordUtil