import React, { useEffect } from "react";
import {
  useAnimatedCounter,
  useIntersectionObserver,
} from "../../hooks/use-landing-hooks";

const AnimatedCounter = ({ target, suffix = "", duration = 2000 }) => {
  const [ref, isVisible] = useIntersectionObserver();
  const [count, setIsActive] = useAnimatedCounter(target, duration);

  useEffect(() => {
    if (isVisible) setIsActive(true);
  }, [isVisible, setIsActive]);

  return (
    <span
      ref={ref}
      className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
    >
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const InteractiveStats = () => {
  const stats = [
    { label: "Podcasts Rendered", value: 50, suffix: "+" },
    { label: "Active Users", value: 500, suffix: "+" },
    { label: "Released", value: 12, suffix: "+" },
    { label: "Latency", value: 60, suffix: "ms" },
  ];

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-gray-400 uppercase tracking-wider text-sm">
                {stat.label}
              </div>
            </div>
            
          ))}
        </div>
      </div>
    </section>
  );
};

export default InteractiveStats;
