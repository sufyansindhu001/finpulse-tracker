import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { SCREENER_FAQS } from '../data/stocksData';

export default function ScreenerFaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (idx) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <section className="w-full bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8">
      
      {/* Centered Heading */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge Base</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#A8B3C2] leading-relaxed">
          Comprehensive guidance on screening strategies, fundamental ratio definitions, data update frequency, and custom institutional workflows.
        </p>
      </div>

      {/* 18 Expandable Accordions */}
      <div className="divide-y divide-slate-200 dark:divide-white/10 border-y border-slate-200 dark:border-white/10">
        {SCREENER_FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-4">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-[#00E676] transition-colors cursor-pointer group"
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400 group-hover:text-blue-500">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <span>{faq.q}</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-blue-600 dark:text-[#00E676]' : ''}`} />
              </button>

              {isOpen && (
                <div className="pt-3 pb-1 pl-8 text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] leading-relaxed text-justify animate-in fade-in duration-200 font-sans">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Section Footer */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          Need additional quantitative screening assistance? Reach out to our analytical research team at <a href="mailto:fgcspot4@gmail.com" className="text-blue-600 dark:text-[#00E676] font-semibold hover:underline">fgcspot4@gmail.com</a>.
        </p>
      </div>

    </section>
  );
}
