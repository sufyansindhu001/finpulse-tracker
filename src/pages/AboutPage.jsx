import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Globe, 
  Cpu, 
  ArrowRight, 
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  TrendingUp
} from 'lucide-react';

export default function AboutPage() {
  const { siteSettings } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16 px-4 sm:px-6">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <Link to="/" className="hover:text-[#00E676] transition-colors font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold">About Us</span>
      </nav>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.15)]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#00E676] uppercase tracking-wider">
                Enterprise & Technology
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                About {siteSettings?.websiteName || 'FGC Spot'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#A8B3C2] bg-slate-100 dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 px-3.5 py-1.5 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-ping" />
            <span>High-Frequency Global Terminal</span>
          </div>
        </div>

        {/* Introduction */}
        <div className="text-slate-600 dark:text-[#A8B3C2] text-sm sm:text-base space-y-5 leading-relaxed">
          <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-white">
            {siteSettings?.websiteName || 'FGC Spot'} is a high-speed global financial data platform committed to providing accessible, real-time foreign currency exchange rates, bullion benchmark valuation, and high-frequency cryptocurrency market intelligence.
          </p>

          <p>
            Founded by fintech engineers and quantitative researchers, {siteSettings?.websiteName || 'FGC Spot'} was engineered to eliminate opacity in international exchange calculations and cross-border commerce. Whether you are monitoring major currency corridors (USD/PKR, EUR/PKR, GBP/USD), tracking digital assets (BTC, ETH, SOL), or calculating gold purity benchmarks, our mission is to deliver zero-latency calculation transparency.
          </p>

          {/* Feature Grid */}
          <div className="pt-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Our Data Architecture & Reliability</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 space-y-2 hover:border-[#00E676]/40 transition-all">
                <div className="flex items-center gap-2 text-[#00E676] font-bold text-sm">
                  <Globe className="w-4 h-4" />
                  <span>Central Bank Forex</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-[#A8B3C2] leading-relaxed">
                  Real-time rates ingested from interbank institutional feeds covering 160+ fiat currencies without retail markups.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 space-y-2 hover:border-[#00E676]/40 transition-all">
                <div className="flex items-center gap-2 text-[#00E676] font-bold text-sm">
                  <Cpu className="w-4 h-4" />
                  <span>Multi-Exchange Crypto</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-[#A8B3C2] leading-relaxed">
                  Live order book streaming, 24-hour volume metrics, and capitalization rankings via multi-exchange aggregation.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 space-y-2 hover:border-[#00E676]/40 transition-all">
                <div className="flex items-center gap-2 text-[#00E676] font-bold text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>Bullion Benchmarks</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-[#A8B3C2] leading-relaxed">
                  Live Troy Ounce spot pricing automatically converted to 24K, 22K, 21K, 18K per Tola, 10g, and Gram in local currencies.
                </p>
              </div>
            </div>
          </div>

          {/* Trust & Principles */}
          <div className="pt-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Integrity & Transparency Standards</h2>
            <p>
              {siteSettings?.websiteName || 'FGC Spot'} maintains strict editorial autonomy and data integrity. We do not participate in paid cryptocurrency token endorsements or undisclosed affiliate promotions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {[
                '100% Free Public Access: No mandatory paywalls or account creation required.',
                'Interbank Mid-Market Transparency: Calculating rates without retail bank spreads.',
                'AdSense & Privacy Compliant: Strictly adhering to GDPR, CCPA, and publisher standards.',
                'Sub-Second Ticks: Low latency WebSocket and API feeds.'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/5 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-[#A8B3C2]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-8 p-6 rounded-2xl bg-slate-50 dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Have questions or data inquiries?</h3>
              <p className="text-xs text-slate-500 dark:text-[#A8B3C2] mt-0.5">Our technical desk is available for enterprise partnerships and rate verification.</p>
            </div>
            <Link
              to="/contact"
              className="px-5 py-2.5 bg-[#00E676] hover:bg-[#00FF88] text-slate-950 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,230,118,0.25)] shrink-0 flex items-center gap-1.5"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
