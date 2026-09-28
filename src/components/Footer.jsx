import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Mail, AlertTriangle, FileText, Globe, Zap, ArrowUpRight, BookOpen } from 'lucide-react';
import LegalModal from './LegalModal';

export default function Footer({ onSelectPair }) {
  const navigate = useNavigate();
  const { siteSettings } = useApp();
  const [legalModalTab, setLegalModalTab] = useState(null);

  const popularPairs = [
    { from: 'USD', to: 'PKR', label: 'USD to PKR (Pakistan)' },
    { from: 'EUR', to: 'PKR', label: 'EUR to PKR (Euro)' },
    { from: 'GBP', to: 'PKR', label: 'GBP to PKR (Pound)' },
    { from: 'AED', to: 'PKR', label: 'AED to PKR (Dirham)' },
    { from: 'SAR', to: 'PKR', label: 'SAR to PKR (Riyal)' },
    { from: 'CAD', to: 'PKR', label: 'CAD to PKR (Canada)' },
  ];

  return (
    <footer className="w-full max-w-full overflow-hidden bg-slate-100 dark:bg-[#0A1726] border-t border-slate-200 dark:border-white/10 pt-16 pb-12 mt-20 text-slate-600 dark:text-[#A8B3C2] text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200 dark:border-white/10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={siteSettings?.logoUrl || '/logo.png'} 
                alt={siteSettings?.websiteName || 'FGC Spot'} 
                className="h-8 sm:h-9 w-auto object-contain shrink-0" 
                width="36"
                height="36"
                loading="lazy"
              />
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-[#00E676] transition-colors">
                {siteSettings?.websiteName || 'FGC Spot'}
              </span>
            </Link>

            <p className="text-slate-600 dark:text-[#A8B3C2] text-xs leading-relaxed max-w-sm font-medium">
              Real-time foreign exchange calculation matrix, institutional cryptocurrency market metrics, and physical gold bullion benchmark rates.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-[#A8B3C2] pt-1">
              <span className="flex items-center gap-1.5 bg-white dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-full text-slate-800 dark:text-white shadow-xs">
                <Globe className="w-3.5 h-3.5 text-[#00E676]" /> 160+ Global Currencies
              </span>
              <span className="flex items-center gap-1.5 bg-white dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-full text-slate-800 dark:text-white shadow-xs">
                <Zap className="w-3.5 h-3.5 text-[#00E676]" /> Sub-Second Live Feeds
              </span>
            </div>
          </div>

          {/* Quick Currency Pairs */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span>Popular FX Pairs</span>
            </h3>
            <ul className="space-y-2 text-xs">
              {popularPairs.map((pair) => (
                <li key={`${pair.from}-${pair.to}`}>
                  <Link 
                    to={`/converter?from=${pair.from}&to=${pair.to}`}
                    className="hover:text-[#00E676] transition-colors cursor-pointer block py-0.5 text-left font-medium text-slate-600 dark:text-[#A8B3C2]"
                  >
                    {pair.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Navigation */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-4">
              Markets & Tools
            </h3>
            <ul className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-[#A8B3C2]">
              <li>
                <Link to="/rates" className="hover:text-[#00E676] cursor-pointer transition-colors block">
                  Live Exchange Rates
                </Link>
              </li>
              <li>
                <Link to="/crypto" className="hover:text-[#00E676] cursor-pointer transition-colors block">
                  Crypto Terminal & Heatmap
                </Link>
              </li>
              <li>
                <Link to="/gold" className="hover:text-[#00E676] cursor-pointer transition-colors block">
                  Gold & Silver Bullion
                </Link>
              </li>
              <li>
                <Link to="/charts" className="hover:text-[#00E676] cursor-pointer transition-colors block">
                  Interactive Financial Charts
                </Link>
              </li>
              <li>
                <Link to="/converter" className="hover:text-[#00E676] cursor-pointer transition-colors block">
                  Currency Converter Matrix
                </Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-[#00E676] cursor-pointer transition-colors flex items-center justify-between">
                  <span>Market News Wire</span>
                  <span className="text-[10px] uppercase bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 px-1.5 py-0.5 rounded font-bold">Live</span>
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-[#00E676] cursor-pointer transition-colors flex items-center justify-between">
                  <span>Guides & Analysis</span>
                  <span className="text-[10px] uppercase bg-slate-200/60 dark:bg-white/5 text-slate-600 dark:text-[#A8B3C2] border border-slate-300/80 dark:border-white/10 px-1.5 py-0.5 rounded font-bold">Blog</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust Standalone URLs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                Trust & Support
              </h3>
              <button
                onClick={() => setLegalModalTab('privacy')}
                className="text-[11px] text-[#00E676] hover:underline font-semibold cursor-pointer"
                title="Quick Legal Summary Modal"
              >
                Quick View
              </button>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-[#A8B3C2]">
              <li>
                <Link
                  to="/about"
                  className="hover:text-[#00E676] flex items-center gap-2 transition-colors font-medium cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-[#00E676] flex items-center gap-2 transition-colors font-medium cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact & Support</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-[#00E676] flex items-center gap-2 transition-colors font-medium cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-[#00E676] flex items-center gap-2 transition-colors font-medium cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Privacy Policy & Cookies</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/disclaimer"
                  className="hover:text-amber-500 dark:hover:text-amber-400 flex items-center gap-2 transition-colors text-amber-600 dark:text-amber-400/90 font-medium cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Financial Disclaimer</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Financial & AdSense Compliance Banner */}
        <div className="py-6 border-b border-slate-200 dark:border-white/10 text-xs leading-relaxed text-slate-600 dark:text-[#A8B3C2] font-medium">
          <p>
            <strong className="text-slate-900 dark:text-white font-bold">Financial Disclosure:</strong> Foreign exchange rates and cryptocurrency market values fluctuate constantly. All figures displayed on {siteSettings?.websiteName || 'FGC Spot'} are based on interbank institutional benchmarks and are intended for computational and informational reference.
          </p>
        </div>

        {/* Bottom Bar with Standalone Router Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-[#A8B3C2] font-medium">
          <div>
            © {new Date().getFullYear()} {siteSettings?.websiteName || 'FGC Spot'} Media & Data. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Terms of Service</Link>
            <span>•</span>
            <Link to="/disclaimer" className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Disclaimer</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Contact Desk</Link>
          </div>
        </div>

      </div>

      {/* Quick Legal Compliance Modal Overlay */}
      <LegalModal
        isOpen={!!legalModalTab}
        onClose={() => setLegalModalTab(null)}
        activeTab={legalModalTab || 'privacy'}
        siteName={siteSettings?.websiteName || 'FGC Spot'}
      />
    </footer>
  );
}
