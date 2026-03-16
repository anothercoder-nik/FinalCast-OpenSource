import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: 'Starter',
      price: '₹1490',
      period: '/month',
      desc: 'Perfect for early-stage podcasters and solo creators.',
      features: [
        'Local 1080p recording',
        'Basic cloud backup (10GB)',
        'Standard transcripts',
      ],
      isPopular: false,
    },
    {
      name: 'Pro plan',
      price: '₹2990',
      period: '/month',
      desc: 'Ideal for businesses & creators ready to scale.',
      features: [
        'Local 4K video recording',
        'Unlimited cloud storage',
        'Advanced AI editing suite',
      ],
      isPopular: true,
    },
    {
      name: 'Pay-per-use',
      price: '₹299',
      period: '/hour',
      desc: 'Flexible production on demand without commitment.',
      features: [
        'All Pro features included',
        'Billed strictly by rendered hour',
        'Priority rendering queue',
      ],
      isPopular: false,
    },
  ];

  return (
    <section className="w-full py-24 md:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* ── Top Typography ── */}
        <div className="text-center mb-16">
          <h4 className="text-[#ff4d00] font-bold text-[16px] md:text-[20px] tracking-wide mb-6">
            Pricing
          </h4>
          <h2 className="text-[40px] md:text-[56px] font-black text-white leading-[1.1] tracking-tighter mb-4">
            Simple Packages for Every<br />Stage
          </h2>
          <p className="text-gray-400 text-[16px] md:text-[18px] font-medium leading-[1.6]">
            Clear, flexible packages built to fit your production needs.
          </p>
        </div>

        {/* ── Pricing Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-[1100px] mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-[32px] p-8 md:p-10 flex flex-col transition-transform duration-500 hover:-translate-y-2 ${plan.isPopular
                  ? 'bg-[#ff4d00] shadow-[0_20px_60px_rgba(255,77,0,0.3)]'
                  : 'bg-[#141414] border border-white/5 shadow-2xl hover:border-white/10'
                }`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className={`font-bold text-[20px] md:text-[22px] tracking-tight ${plan.isPopular ? 'text-white' : 'text-white'}`}>
                  {plan.name}
                </h3>
                {plan.isPopular && (
                  <span className="bg-white/20 text-white text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/30 backdrop-blur-sm">
                    Popular
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-end gap-2 mb-4">
                <span className={`font-black text-[48px] md:text-[56px] leading-none tracking-tighter ${plan.isPopular ? 'text-white' : 'text-white'}`}>
                  {plan.price}
                </span>
                <span className={`font-medium text-[14px] mb-2 ${plan.isPopular ? 'text-white/80' : 'text-gray-400'}`}>
                  {plan.period}
                </span>
              </div>

              {/* Description */}
              <p className={`text-[15px] font-medium leading-relaxed mb-10 min-h-[48px] ${plan.isPopular ? 'text-white/90' : 'text-gray-400'}`}>
                {plan.desc}
              </p>

              {/* Features List */}
              <ul className="mb-12 space-y-5 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex gap-4 items-start">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.isPopular ? 'text-white' : 'text-[#ff4d00]'}`} />
                    <span className={`font-semibold text-[15px] leading-snug ${plan.isPopular ? 'text-white' : 'text-gray-300'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <button
                className={`w-full py-4 px-6 rounded-full font-bold text-[16px] flex items-center justify-between group transition-all duration-300 ${plan.isPopular
                    ? 'bg-white text-black hover:bg-gray-100 hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]'
                    : 'bg-[#1a1a1a] text-white hover:bg-[#222] border border-white/5 hover:border-white/10'
                  }`}
              >
                <span className="ml-2">Get started</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${plan.isPopular ? 'bg-[#ff4d00]' : 'bg-[#ff4d00]'
                  }`}>
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
