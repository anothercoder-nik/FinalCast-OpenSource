import React from 'react'

const RecordUtil = () => {
  return (
     <section className="bg-white pt-20 px-4 md:px-8">
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
  <div className="max-w-[100vw] overflow-x-hidden">
    <div className="grid lg:grid-cols-3 items-center gap-10">
      
      {/* Left: Video or Screenshot with no left margin */}
      <div className="lg:col-span-2 relative rounded-xl overflow-hidden shadow-lg ml-0">
        <img
          src="/demo.png" // Replace with your actual image path
          alt="Recording demo"
          className="w-full h-full object-cover rounded-xl"
        />
        <div className="absolute top-4 right-4 bg-red-600 text-white text-sm px-3 py-1 rounded-full shadow-md">
          ● REC
        </div>
      </div>

      {/* Right Panel: Download Options */}
      <div className="space-y-6 px-4 md:px-0">
        {/* Highlight Image */}
        <div className="rounded-xl overflow-hidden shadow-md">
          <img
            src="/demo2.png" // Replace with actual image
            alt="4K recording"
            className="w-full object-cover"
          />
        </div>

        {/* Download Section */}
        <div className="bg-zinc-900 text-white rounded-xl p-6 space-y-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Download separate tracks</h3>

          {[
            { name: "Marsha", img: null, icon: true },
            { name: "Stephen", img: null, icon: true },
            { name: "All Speakers", img: null, icon: true },
          ].map((person, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-zinc-800 px-4 py-3 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {person.icon ? (
                  <div className="w-10 h-10 flex items-center justify-center bg-zinc-700 rounded-full">
                    <span className="text-purple-400 text-xl">👤</span>
                  </div>
                ) : (
                  <img
                    src={person.img}
                    alt={person.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">{person.name}</p>
                  <p className="text-xs text-zinc-400">Ready</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <p>3840 × 2160</p>
                <button className="hover:text-white">⬇️ WAV</button>
                <button className="hover:text-white">⬇️ MP4</button>
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