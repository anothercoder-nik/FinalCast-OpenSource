import React from 'react';
import { ArrowRight, Video, Mic, Download } from 'lucide-react';

const RecordUtil = () => {
  return (
    <section className="w-full py-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-14">
        
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          
          {/* ── Left Typography Pane ── */}
          <div className="w-full lg:w-5/12 flex flex-col items-start relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4d00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff4d00]"></span>
              </span>
              <span className="text-[#ff4d00] font-bold text-[14px] uppercase tracking-[0.2em]">Local Engine</span>
            </div>
            
            <h2 className="text-[48px] md:text-[64px] font-black text-white leading-[1.05] tracking-tight mb-8">
              Capture every<br />detail, natively.
            </h2>
            
            <p className="text-gray-400 text-[18px] leading-[1.7] mb-10 max-w-[90%] font-medium">
              Studio-quality, separate audio and video tracks for each participant. Our proprietary local recording technology ensures you never lose resolution to bad internet.
            </p>
            
            <button className="group flex items-center gap-4 text-white font-bold text-[16px] transition-colors hover:text-[#ff4d00]">
              Explore recording engine
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center transition-all group-hover:bg-[#ff4d00] group-hover:border-[#ff4d00] group-hover:shadow-[0_0_20px_rgba(255,77,0,0.5)]">
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </div>

          {/* ── Right Bento Grid Pane ── */}
          <div className="w-full lg:w-7/12 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#ff4d00]/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Bento Box 1: Main Video (Spans full width of the right column) */}
            <div className="md:col-span-2 relative bg-[#141414] border border-white/5 rounded-[32px] p-4 shadow-2xl transition-transform duration-700 hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)] border-[#ff4d00]/[0.02] hover:border-[#ff4d00]/20">
              <div className="relative rounded-[24px] overflow-hidden aspect-[16/9] bg-black">
                <img src="/demo.png" alt="Recording interface" className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" />
                
                {/* Live REC Indicator */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 flex items-center gap-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-white text-[12px] font-bold tracking-widest uppercase">REC 00:14:23</span>
                </div>
              </div>
            </div>

            {/* Bento Box 2: 4K Feature mini-card */}
            <div className="relative bg-[#141414] border border-white/5 rounded-[32px] overflow-hidden group shadow-2xl transition-transform duration-700 hover:-translate-y-2">
              <img src="/demo2.png" alt="4K resolution" className="w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-80 mix-blend-luminosity" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <Video className="w-6 h-6 text-[#ff4d00] mb-4" />
                <h4 className="text-white font-bold text-[20px] mb-2">4K Resolution</h4>
                <p className="text-gray-400 text-[14px] leading-relaxed">Pristine isolated video tracks captured directly from the camera source.</p>
              </div>
            </div>

            {/* Bento Box 3: Multitrack Download List */}
            <div className="relative bg-[#141414] border border-white/5 rounded-[32px] p-8 flex flex-col shadow-2xl transition-transform duration-700 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-white font-bold text-[18px]">Track Status</h4>
                <Download className="w-5 h-5 text-gray-500" />
              </div>

              <div className="space-y-4 flex-grow flex flex-col justify-center">
                {[
                  { name: "Host Output", type: "WAV", color: "bg-[#ff4d00]/20 text-[#ff4d00]" },
                  { name: "Guest 1", type: "MP4", color: "bg-white/10 text-white" },
                  { name: "Guest 2", type: "MP4", color: "bg-white/10 text-white" },
                ].map((track, idx) => (
                  <div key={idx} className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[14px] ${track.color}`}>
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-white text-[14px] font-bold">{track.name}</p>
                        <p className="text-[#333] text-[12px] font-semibold tracking-wider uppercase group-hover:text-[#ff4d00] transition-colors">100% Synced</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
                      {track.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default RecordUtil;