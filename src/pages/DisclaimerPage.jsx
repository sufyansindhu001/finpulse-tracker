import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AlertTriangle, ChevronRight } from 'lucide-react';

export default function DisclaimerPage() {
  const { siteSettings } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16 px-4 sm:px-6">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <Link to="/" className="hover:text-[#00E676] transition-colors font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold">Financial Disclaimer</span>
      </nav>

      {/* Main Content Container */}
      <div className="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Legal Disclosure
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Financial & Investment Disclaimer
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#A8B3C2] mt-1 font-medium">
              Please read this disclaimer carefully before using {siteSettings?.websiteName || 'FGC Spot'} data tools and calculators.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="text-slate-600 dark:text-[#A8B3C2] text-sm sm:text-base space-y-6 leading-relaxed">
          
          {/* Prominent Warning Callout */}
          <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-[#0D1B2A] border-l-4 border-amber-500 border-t border-r border-b border-amber-200 dark:border-white/10 text-slate-700 dark:text-[#A8B3C2] text-xs sm:text-sm font-medium space-y-2">
            <strong className="block font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Important Regulatory Notice:
            </strong>
            <p>
              {siteSettings?.websiteName || 'FGC Spot'} is an educational and analytical financial software portal. {siteSettings?.websiteName || 'FGC Spot'} is NOT a broker-dealer, registered investment advisor (RIA), money services business (MSB), financial institution, or custodian under applicable international financial regulations.
            </p>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-2 border-b border-slate-200 dark:border-white/10 pb-2">
            1. No Investment, Legal, or Financial Advice
          </h2>
          <p>
            The content, calculation tools, exchange rates, and cryptocurrency metrics provided across this application do not constitute investment advice, financial advice, trading advice, or any other sort of professional recommendation. You should not treat any content on the site as such. We strongly advise conducting independent due diligence and consulting licensed financial advisors before executing financial transactions.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-2 border-b border-slate-200 dark:border-white/10 pb-2">
            2. Real-Time Rates & Data Latency
          </h2>
          <p>
            Foreign exchange rates and digital currency valuations are derived from public interbank indices, decentralized liquidity protocols, and third-party feed aggregators. While we employ rigorous caching algorithms and low-latency pipelines, market data may be delayed, incomplete, or subject to transmission discrepancies. {siteSettings?.websiteName || 'FGC Spot'} makes no express or implied warranty regarding the computational accuracy of quotes.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-2 border-b border-slate-200 dark:border-white/10 pb-2">
            3. Limitation of Liability
          </h2>
          <p>
            Under no circumstances shall {siteSettings?.websiteName || 'FGC Spot'}, its developers, officers, or partners be liable for any direct, indirect, incidental, or consequential losses, damages, or claims arising from the use of, or inability to use, our exchange rate tools, conversion calculators, or market indicators.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-2 border-b border-slate-200 dark:border-white/10 pb-2">
            4. Reporting Inaccuracies &amp; Inquiries
          </h2>
          <p>
            If you notice any computational discrepancies, delayed feeds, or have questions regarding our exchange rate methodology, please alert our technical support desk at <a href="mailto:fgcspot4@gmail.com" className="text-[#00E676] hover:text-[#00FF88] font-bold font-mono underline underline-offset-4 decoration-[#00E676]/40">fgcspot4@gmail.com</a>.
          </p>

        </div>

      </div>

    </div>
  );
}
