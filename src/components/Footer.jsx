import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Mail, AlertTriangle, FileText, Globe } from 'lucide-react';
import LegalModal from './LegalModal';

export default function Footer({ onSelectPair }) {
  const { siteSettings } = useApp();
  const [legalModalTab, setLegalModalTab] = useState(null);

  return (
    <footer className="w-full bg-slate-100/90 dark:bg-[#07090E] border-t border-slate-200 dark:border-white/[0.08] pt-14 pb-10 mt-20 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-200 dark:border-white/[0.06]">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              {siteSettings?.logoUrl ? (
                <img 
                  src={siteSettings.logoUrl} 
                  alt={siteSettings.websiteName || 'FinPulse'} 
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-white/10" 
                  width="32"
                  height="32"
                  loading="lazy"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-400 p-[1px]">
                  <div className="w-full h-full bg-slate-900 rounded-[7px] flex items-center justify-center font-black text-xs text-white uppercase">
                    {siteSettings?.logoText || 'FP'}
                  </div>
                </div>
              )}
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {siteSettings?.websiteName || 'FinPulse'} Media & Data
              </span>
            </Link>

            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-sm">
              Providing independent real-time foreign currency exchange rates, high-frequency cryptocurrency market data, and institutional macroeconomic analysis for global consumers and cross-border enterprises.
            </p>
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" /> 160+ Currencies Live
              </span>
              <span>•</span>
              <span>20+ Top Cryptos</span>
              <span>•</span>
              <span className="text-emerald-500 font-semibold">99.98% Feed Uptime</span>
            </div>
          </div>

          {/* Quick Currency Pairs */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-3">
              Popular Pairs
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link 
                  to="/forex?from=USD&to=PKR"
                  className="hover:text-blue-500 cursor-pointer transition-colors block text-left"
                >
                  USD to PKR (Pakistan)
                </Link>
              </li>
              <li>
                <Link 
                  to="/forex?from=EUR&to=USD"
                  className="hover:text-blue-500 cursor-pointer transition-colors block text-left"
                >
                  EUR to USD (Eurozone)
                </Link>
              </li>
              <li>
                <Link 
                  to="/forex?from=GBP&to=USD"
                  className="hover:text-blue-500 cursor-pointer transition-colors block text-left"
                >
                  GBP to USD (British Pound)
                </Link>
              </li>
              <li>
                <Link 
                  to="/forex?from=USD&to=AED"
                  className="hover:text-blue-500 cursor-pointer transition-colors block text-left"
                >
                  USD to AED (UAE Dirham)
                </Link>
              </li>
              <li>
                <Link 
                  to="/forex?from=USD&to=SAR"
                  className="hover:text-blue-500 cursor-pointer transition-colors block text-left"
                >
                  USD to SAR (Saudi Riyal)
                </Link>
              </li>
              <li>
                <Link 
                  to="/forex?from=USD&to=INR"
                  className="hover:text-blue-500 cursor-pointer transition-colors block text-left"
                >
                  USD to INR (Indian Rupee)
                </Link>
              </li>
            </ul>
          </div>

          {/* Market Sectors */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-3">
              Market Sectors
            </h3>
            <ul className="space-y-2 text-xs">
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
            </ul>
          </div>

          {/* AdSense Mandatory Compliance & Trust Standalone URLs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                Trust & Legal
              </h3>
              <button
                onClick={() => setLegalModalTab('privacy')}
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-mono cursor-pointer"
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
                  className="text-[10px] opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-500 transition-opacity cursor-pointer font-mono"
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
                  className="text-[10px] opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-500 transition-opacity cursor-pointer font-mono"
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
                  className="text-[10px] opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-500 transition-opacity cursor-pointer font-mono"
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
                  className="text-[10px] opacity-0 group-hover:opacity-100 text-slate-400 hover:text-amber-500 transition-opacity cursor-pointer font-mono"
                  title="Preview Disclaimer modal"
                >
                  modal
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Financial & AdSense Compliance Banner */}
        <div className="py-6 border-b border-slate-200 dark:border-white/[0.06] text-[11px] leading-relaxed text-slate-500">
          <p>
            <strong className="text-slate-700 dark:text-slate-300">Financial Disclosure:</strong> Foreign exchange rates and cryptocurrency quotes are supplied for informational purposes only and are not intended for trading purposes or financial advice. {siteSettings?.websiteName || 'FinPulse'} does not verify any data and disclaims any obligation to do so. Market quotes may be delayed.
          </p>
        </div>

        {/* Bottom Bar with Standalone Router Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {siteSettings?.websiteName || 'FinPulse'} Media & Data. All rights reserved. GDPR & Privacy Compliant.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer">Privacy & Cookies</Link>
            <span>•</span>
            <Link to="/disclaimer" className="hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer">Disclaimer</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer">Advertise & Contact</Link>
          </div>
        </div>

      </div>

      {/* Quick Legal Compliance Modal Overlay */}
      <LegalModal
        isOpen={!!legalModalTab}
        onClose={() => setLegalModalTab(null)}
        activeTab={legalModalTab || 'privacy'}
        siteName={siteSettings?.websiteName || 'FinPulse'}
      />
    </footer>
  );
}
