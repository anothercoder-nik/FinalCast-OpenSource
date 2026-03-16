import React, { useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How long does a brand identity project take?",
      answer: "A standard brand identity project typically takes 4-6 weeks from initial discovery to final delivery, depending on the scope and revision cycles."
    },
    {
      question: "Do you offer payment plans?",
      answer: "Yes, standard projects are usually split into 50% upfront and 50% upon completion. For larger engagements, we can arrange custom milestone-based schedules."
    },
    {
      question: "Can you also design my website?",
      answer: "Absolutely. I specialize in full-stack digital product design, meaning we can bridge the gap from your new brand identity directly into a high-performance website."
    },
    {
      question: "Do you work with international clients?",
      answer: "Yes! The majority of my clients are international. We handle everything efficiently via async communication and targeted video sessions."
    },
    {
      question: "What do I need to get started?",
      answer: "Just a clear vision of your business goals. When you reach out, I'll send you a short discovery questionnaire to help us align before our kickoff call."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full">
      {/* 
        This wrapper creates the seamless rounded bottom overlapping the footer.
        The background is #111 (slightly lighter than pure black footer).
      */}
      <div className="pt-12 md:pt-24 pb-24 md:pb-40 px-6 md:px-16 relative z-10 w-full overflow-hidden">
        
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left Side: Typography */}
          <div className="lg:w-1/3 flex flex-col items-start">
            <h4 className="text-[#ff4d00] font-bold text-[18px] md:text-[22px] tracking-wide mb-6 md:mb-8">
              Frequently Asked Questions
            </h4>
            
            <h2 className="text-[56px] md:text-[80px] font-black text-white leading-[1.05] tracking-tighter mb-8">
              Answers to<br />Common<br />Questions
            </h2>
            
            <p className="text-gray-400 text-[16px] md:text-[18px] font-medium leading-[1.6] mb-12">
              From timelines to process details, here are quick answers to the most frequent questions I get.
            </p>
            
            <button className="inline-flex items-center gap-4 bg-white hover:bg-gray-100 text-black font-bold py-3 pl-8 pr-3 rounded-full text-[16px] transition-transform hover:scale-105 group">
              <span>Contact me</span>
              <div className="w-10 h-10 rounded-full bg-[#ff4d00] flex items-center justify-center text-white transition-transform group-hover:rotate-45">
                <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
              </div>
            </button>
          </div>

          {/* Right Side: Accordion Grid */}
          <div className="lg:w-2/3 flex flex-col gap-4 max-w-[800px] w-full ml-auto">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={index} 
                  className="bg-[#0a0a0a] rounded-[24px] overflow-hidden transition-all duration-500 cursor-pointer"
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex items-center gap-6 p-6 md:p-8">
                    <div className="text-gray-500 transition-transform duration-500">
                      <Plus className={`w-6 h-6 transition-transform duration-500 ${isOpen ? 'rotate-45 text-[#ff4d00]' : ''}`} />
                    </div>
                    <h3 className={`font-bold text-[18px] md:text-[20px] tracking-tight transition-colors duration-300 ${isOpen ? 'text-[#ff4d00]' : 'text-white'}`}>
                      {faq.question}
                    </h3>
                  </div>
                  
                  {/* Expandable Answer */}
                  <div 
                    className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] pb-8 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-gray-400 font-medium text-[16px] leading-relaxed pl-[88px] pr-8">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
