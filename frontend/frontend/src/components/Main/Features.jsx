import { useIntersectionObserver } from "../../hooks/use-landing-hooks";
import { useState } from "react";

// Feature Card Component
const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  const [ref, isVisible] = useIntersectionObserver();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={ref}
      className={`backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-8 transition-all duration-700 cursor-pointer ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${isHovered ? "transform scale-105 rotate-1 shadow-2xl" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
};

// Features Section Component
const FeaturesSection = () => {
  const features = [
  {
    icon: "🎙️",
    title: "Studio-Quality Recordings",
    description:
      "Record audio and video locally in crystal-clear quality, even with poor internet, ensuring professional-grade output every time.",
  },
  {
    icon: "🧑‍🤝‍🧑",
    title: "Multi-Participant Recording",
    description:
      "Seamlessly capture high-resolution streams from multiple participants with individual track isolation for maximum post-production control.",
  },
  {
    icon: "☁️",
    title: "Cloud Backup & Sync",
    description:
      "Auto-upload recordings in real-time to secure cloud storage with resume support, so nothing is ever lost.",
  },
  {
    icon: "✂️",
    title: "Timeline Editor",
    description:
      "Visually edit podcasts or videos with a drag-and-drop interface and smart snapping for precision cuts and layout control.",
  },
  {
    icon: "🌐",
    title: "AI Transcripts & Captions",
    description:
      "Generate accurate multilingual transcripts and captions in seconds using cutting-edge speech-to-text AI.",
  },
  {
    icon: "🔐",
    title: "Zero-Knowledge Encryption",
    description:
      "All recordings are encrypted on-device, ensuring complete privacy with creator-only decryption access.",
  },
];


  return (
    <section className="pt-3 py-20" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
<h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6">
  Powerful Features
</h2>
<p className="text-xl text-gray-300 max-w-3xl mx-auto">
  Everything you need to record, edit, and produce studio-quality podcasts and videos — all backed by cutting-edge AI and cloud technology.
</p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} delay={index * 100} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;