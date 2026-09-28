import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Mail, AlertTriangle, FileText, Globe } from 'lucide-react';
import LegalModal from './LegalModal';

export default function Footer({ onSelectPair }) {
  const navigate = useNavigate();
  const { siteSettings } = useApp();
  const [legalModalTab, setLegalModalTab] = useState(null);

  const popularPairs = [
    { from: 'USD', to: 'PKR', label: 'USD to PKR (Pakistan)' },
    { from: 'EUR', to: 'USD', label: 'EUR to USD (Eurozone)' },
    { from: 'GBP', to: 'USD', label: 'GBP to USD (British Pound)' },
    { from: 'USD', to: 'AED', label: 'USD to AED (UAE Dirham)' },
    { from: 'USD', to: 'SAR', label: 'USD to SAR (Saudi Riyal)' },
    { from: 'USD', to: 'INR', label: 'USD to INR (Indian Rupee)' },
  ];

  const handlePairClick = (e, from, to) => {
    if (onSelectPair) {
      e.preventDefault();
      onSelectPair(from, to);
    } else {
      navigate(`/forex?from=${from}&to=${to}`);
      setTimeout(() => {
        const el = document.getElementById('forex-terminal') || document.getElementById('forex-calculator');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <footer className="w-full max-w-full overflow-hidden bg-slate-100/90 dark:bg-[#07090E] border-t border-slate-200 dark:border-white/[0.08] pt-14 pb-10 mt-20 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-200 dark:border-white/[0.06]">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img 
                src={siteSettings?.logoUrl || '/logo.png'} 
                alt={siteSettings?.websiteName || 'FGC Spot'} 
                className="h-8 w-auto object-contain shrink-0 rounded-lg" 
                width="32"
                height="32"
                loading="lazy"
              />
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {siteSettings?.websiteName || 'FGC Spot'} Media & Data
              </span>
            </Link>

            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-sm font-medium">
              Providing independent real-time foreign currency exchange rates, high-frequency cryptocurrency market data, and institutional macroeconomic analysis for global consumers and cross-border enterprises.
            </p>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" /> 160+ Currencies Live
              </span>
              <span>•</span>
              <span>20+ Top Cryptos</span>
              <span>•</span>
              <span className="text-emerald-500 font-semibold">Real-time WebSocket Feeds</span>
            </div>
          </div>

          {/* Quick Currency Pairs */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Popular Pairs
            </h3>
            <ul className="space-y-1.5 text-xs">
              {popularPairs.map((pair) => (
                <li key={`${pair.from}-${pair.to}`}>
                  <Link 
                    to={`/forex?from=${pair.from}&to=${pair.to}`}
                    onClick={(e) => handlePairClick(e, pair.from, pair.to)}
                    className="hover:text-blue-500 active:text-blue-600 transition-colors cursor-pointer block py-0.5 text-left font-medium"
                  >
                    {pair.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Market Sectors */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Market Sectors
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link 
                  to="/crypto?coin=bitcoin" 
                  className="hover:text-blue-500 cursor-pointer transition-colors block"
                >
                  Bitcoin (BTC) Live Data
                </Link>
              </li>
              <li>
                <Link 
                  to="/crypto?coin=ethereum" 
                  className="hover:text-blue-500 cursor-pointer transition-colors block"
                >
                  Ethereum (ETH) Ecosystem
                </Link>
              </li>
              <li>
                <Link 
                  to="/crypto?coin=solana" 
                  className="hover:text-blue-500 cursor-pointer transition-colors block"
                >
                  Solana (SOL) High-Throughput
                </Link>
              </li>
              <li>
                <Link 
                  to="/forex" 
                  className="hover:text-blue-500 cursor-pointer transition-colors block"
                >
                  Central Bank Forex Feeds
                </Link>
              </li>
              <li>
                <Link 
                  to="/forex" 
                  className="hover:text-blue-500 cursor-pointer transition-colors block"
                >
                  Emerging Market FX Corridors
                </Link>
              </li>
              <li>
                <Link 
                  to="/research" 
                  className="hover:text-blue-500 cursor-pointer transition-colors block"
                >
                  Financial Analysis & Guides
                </Link>
              </li>
              <li>
                <Link 
                  to="/news" 
                  className="hover:text-blue-500 cursor-pointer transition-colors block flex items-center justify-between"
                >
                  <span>Live Financial News Wire</span>
                  <span className="text-xs uppercase bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold">Live</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* AdSense Mandatory Compliance & Trust Standalone URLs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-900 dark:text-white font-semibold text-xs uppercase tracking-wider">
                Trust & Legal
              </h3>
              <button
                onClick={() => setLegalModalTab('privacy')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                title="Quick Legal Summary Modal"
              >
                Quick Modal
              </button>
            </div>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between group">
                <Link
                  to="/about"
                  className="hover:text-blue-500 flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>About Us</span>
                </Link>
                <button
                  onClick={() => setLegalModalTab('about')}
                  className="text-xs opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-500 transition-opacity cursor-pointer font-medium"
                  title="Preview About modal"
                >
                  modal
                </button>
              </li>
              <li className="flex items-center justify-between group">
                <Link
                  to="/contact"
                  className="hover:text-blue-500 flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Us</span>
                </Link>
                <button
                  onClick={() => setLegalModalTab('contact')}
                  className="text-xs opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-500 transition-opacity cursor-pointer font-medium"
                  title="Preview Contact modal"
                >
                  modal
                </button>
              </li>
              <li className="flex items-center justify-between group">
                <Link
                  to="/privacy-policy"
                  className="hover:text-blue-500 flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Privacy Policy & Cookies</span>
                </Link>
                <button
                  onClick={() => setLegalModalTab('privacy')}
                  className="text-xs opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-500 transition-opacity cursor-pointer font-medium"
                  title="Preview Privacy modal"
                >
                  modal
                </button>
              </li>
              <li className="flex items-center justify-between group">
                <Link
                  to="/disclaimer"
                  className="hover:text-amber-500 flex items-center gap-1.5 transition-colors text-amber-600 dark:text-amber-400 font-medium cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Financial Disclaimer</span>
                </Link>
                <button
                  onClick={() => setLegalModalTab('disclaimer')}
                  className="text-xs opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-500 transition-opacity cursor-pointer font-medium"
                  title="Preview Disclaimer modal"
                >
                  modal
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Financial & AdSense Compliance Banner */}
        <div className="py-6 border-b border-slate-200 dark:border-white/[0.06] text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
          <p>
            <strong className="text-slate-800 dark:text-slate-200 font-bold">Financial Disclosure:</strong> Foreign exchange and crypto assets involve market risk. Quoted rates reflect mid-market interbank valuations and are displayed for computational reference.
          </p>
        </div>

        {/* Bottom Bar with Standalone Router Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div>
            © {new Date().getFullYear()} {siteSettings?.websiteName || 'FGC Spot'} Media & Data. All rights reserved. GDPR & Privacy Compliant.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Privacy & Cookies</Link>
            <span>•</span>
            <Link to="/disclaimer" className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Disclaimer</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Advertise & Contact</Link>
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
