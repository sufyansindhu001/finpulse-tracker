import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useSEO } from '../hooks/useSEO';
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

  useSEO({
    title: 'About Us — Institutional Market Analytics | FGC Spot',
    description: 'Learn about FGC Spot, our mission to deliver real-time financial transparency, interbank currency rates, and market intelligence.',
    canonical: '/about'
  });

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

          {/* Editorial Leadership & E-E-A-T Framework */}
          <div className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00E676]">
                Editorial Desk &amp; Authorship
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Analytical Leadership &amp; Financial Governance
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed mt-1">
                Every research article, conversion guide, and market calculation on FGC Spot is produced under strict editorial oversight and published by our verified analytical team.
              </p>
            </div>

            {/* Author Spotlight Card */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4">
                <img
                  src="/sufyan-author.jpg"
                  alt="Sufyan Saleem — Lead Financial Analyst"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#00E676]/40 shadow-sm shrink-0"
                  width="64"
                  height="64"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo.png';
                  }}
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Sufyan Saleem
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full border border-[#00E676]/20">
                      Lead Financial Analyst
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed max-w-xl">
                    Lead macro strategist and columnist at FGC Spot. Author of comprehensive empirical research guides covering Pakistan interbank forex, Karachi Sarafa gold benchmarks, PSX equity valuation, and remittance tax structures.
                  </p>
                </div>
              </div>

              <Link
                to="/author/sufyan-saleem"
                className="px-4 py-2 bg-[#00E676] hover:bg-[#00FF88] text-[#06111F] text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Full Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Editorial Policies & Data Transparency Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <Link
                to="/editorial-policy"
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 transition-colors group space-y-1"
              >
                <div className="flex items-center justify-between text-[#00E676] font-bold text-xs uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Editorial Policy
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-500 dark:text-[#A8B3C2] leading-relaxed">
                  Fact-checking standards, primary sources, correction policy, and commercial independence.
                </p>
              </Link>

              <Link
                to="/data-sources"
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 transition-colors group space-y-1"
              >
                <div className="flex items-center justify-between text-[#00E676] font-bold text-xs uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" />
                    Data Sources
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-500 dark:text-[#A8B3C2] leading-relaxed">
                  Transparent disclosure of APIs, polling cadences, calculation formulas, and market limitations.
                </p>
              </Link>

              <Link
                to="/disclaimer"
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 hover:border-amber-500/40 transition-colors group space-y-1"
              >
                <div className="flex items-center justify-between text-amber-500 font-bold text-xs uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Risk Disclaimer
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-slate-500 dark:text-[#A8B3C2] leading-relaxed">
                  Statutory non-advisory notices, volatility warnings, and indicative rate boundaries.
                </p>
              </Link>
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
