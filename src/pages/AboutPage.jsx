import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Globe, 
  Cpu, 
  ArrowRight, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

export default function AboutPage() {
  const { siteSettings } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 dark:text-slate-200 font-semibold">About Us</span>
      </nav>

      {/* Main Content Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Company & Technology
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              About {siteSettings?.websiteName || 'FinPulse'} Media & Data
            </h1>
          </div>
        </div>

        {/* Introduction */}
        <div className="text-slate-700 dark:text-slate-300 text-sm sm:text-base space-y-5 leading-relaxed">
          <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-white">
            {siteSettings?.websiteName || 'FinPulse'} is an independent, global financial data publishing platform committed to providing accessible, real-time foreign currency exchange tools, cryptocurrency market intelligence, and institutional macroeconomic analysis.
          </p>

          <p>
            Founded by veteran fintech software engineers and economic researchers, {siteSettings?.websiteName || 'FinPulse'} was created to eliminate opacity in global money transfers and decentralized asset valuation. Whether you are an expatriate sending remittances to family across USD/PKR, EUR/INR, or AED/SAR, or a digital asset trader monitoring Bitcoin liquidity, our mission is to deliver zero-latency calculation transparency.
          </p>

          {/* Feature Grid */}
          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4">Our Data Architecture & Reliability</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                <Globe className="w-4 h-4" />
                <span>Central Bank Forex Feeds</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We ingest real-time currency exchange rates directly from <code className="text-blue-600 dark:text-blue-400 font-mono">open.er-api.com</code> and the European Central Bank repository, covering 160+ world fiat currencies without artificial markups.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <Cpu className="w-4 h-4" />
                <span>CoinGecko Public API</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Cryptocurrency order books, 24-hour volume metrics, and capitalization rankings are streamed live via CoinGecko, ensuring verifiable on-chain parity.
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4">Editorial & Independence Standards</h2>
          <p>
            FinPulse maintains strict editorial autonomy. We do not participate in paid cryptocurrency token endorsements, sponsored coin shilling, or undisclosed affiliate promotions. All articles published under our 'Market Updates', 'Forex News', and 'Crypto Guides' categories undergo rigorous fact-checking and peer review before publication.
          </p>

          <div className="space-y-2 pt-2">
            {[
              '100% Free Public Access: No mandatory paywalls or account creation required.',
              'AdSense & Consumer Privacy Compliant: Strictly adhering to Google Publisher Policies, GDPR, and CCPA standards.',
              'Interbank Mid-Market Transparency: Calculating rates without retail bank spreads.'
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-8 p-6 rounded-2xl bg-blue-50 dark:bg-slate-950 border border-blue-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Have questions or press inquiries?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Our technical and research desk is available for partnerships and data verification.</p>
            </div>
            <Link
              to="/contact"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5"
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
