import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Mail, AlertTriangle, FileText, Globe } from 'lucide-react';

export default function Footer({ onSelectPair }) {
  const { siteSettings } = useApp();

  return (
    <footer className="w-full bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 pt-12 pb-8 mt-16 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-200 dark:border-slate-800/80">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              {siteSettings?.logoUrl ? (
                <img 
                  src={siteSettings.logoUrl} 
                  alt={siteSettings.websiteName || 'FinPulse'} 
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700" 
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-400 p-[1px]">
                  <div className="w-full h-full bg-slate-900 rounded-[7px] flex items-center justify-center font-black text-xs text-white uppercase">
                    {siteSettings?.logoText || 'FX'}
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
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> 160+ Currencies Live
              </span>
              <span>•</span>
              <span>20+ Top Cryptos</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">99.98% Feed Uptime</span>
            </div>
          </div>

          {/* Quick Currency Pairs */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-3">
              Popular Pairs
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onSelectPair && onSelectPair('USD', 'PKR')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  USD to PKR (Pakistan)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectPair && onSelectPair('EUR', 'USD')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  EUR to USD (Eurozone)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectPair && onSelectPair('GBP', 'USD')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  GBP to USD (British Pound)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectPair && onSelectPair('USD', 'AED')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  USD to AED (UAE Dirham)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectPair && onSelectPair('USD', 'SAR')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  USD to SAR (Saudi Riyal)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectPair && onSelectPair('USD', 'INR')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  USD to INR (Indian Rupee)
                </button>
              </li>
            </ul>
          </div>

          {/* Market Sectors */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-3">
              Market Sectors
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/crypto" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  Bitcoin (BTC) Live Data
                </Link>
              </li>
              <li>
                <Link to="/crypto" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  Ethereum (ETH) Ecosystem
                </Link>
              </li>
              <li>
                <Link to="/crypto" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  Solana (SOL) High-Throughput
                </Link>
              </li>
              <li>
                <Link to="/matrix" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  Central Bank Forex Feeds
                </Link>
              </li>
              <li>
                <Link to="/matrix" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  Emerging Market FX Corridors
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  Financial Analysis & Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* AdSense Mandatory Compliance & Trust Standalone URLs */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-3">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/about"
                  className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors font-medium"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors font-medium"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Us</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Privacy Policy & Cookies</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/disclaimer"
                  className="hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 transition-colors text-amber-600 dark:text-amber-400 font-medium"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Financial Disclaimer</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Financial & AdSense Compliance Banner */}
        <div className="py-6 border-b border-slate-200 dark:border-slate-800/80 text-[11px] leading-relaxed text-slate-500">
          <p>
            <strong className="text-slate-700 dark:text-slate-300">Financial Disclosure:</strong> Foreign exchange rates and cryptocurrency quotes are supplied for informational purposes only and are not intended for trading purposes or financial advice. {siteSettings?.websiteName || 'FinPulse'} does not verify any data and disclaims any obligation to do so. Market quotes may be delayed.
          </p>
        </div>

        {/* Bottom Bar with Standalone Router Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {siteSettings?.websiteName || 'FinPulse'} Media & Data. All rights reserved. Google AdSense & GDPR Compliant.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-slate-800 dark:hover:text-slate-300">Privacy & Cookies</Link>
            <span>•</span>
            <Link to="/disclaimer" className="hover:text-slate-800 dark:hover:text-slate-300">Disclaimer</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-slate-800 dark:hover:text-slate-300">Advertise & Contact</Link>
          </div>
        </div>


      </div>
    </footer>
  );
}
