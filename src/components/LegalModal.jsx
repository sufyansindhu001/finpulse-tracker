import React from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Mail, 
  AlertTriangle, 
  ExternalLink,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';

export default function LegalModal({ isOpen, onClose, activeTab = 'privacy', siteName = 'FinPulse' }) {
  const [tab, setTab] = React.useState(activeTab);

  React.useEffect(() => {
    setTab(activeTab);
  }, [activeTab]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#07090E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Institutional Compliance & Trust Center
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {siteName} • GDPR, CCPA & Privacy Compliant
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0C1017] overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setTab('privacy')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              tab === 'privacy' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy & Cookies</span>
          </button>

          <button
            onClick={() => setTab('disclaimer')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              tab === 'disclaimer' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Financial Disclaimer</span>
          </button>

          <button
            onClick={() => setTab('about')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              tab === 'about' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>About Us</span>
          </button>

          <button
            onClick={() => setTab('contact')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              tab === 'contact' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Desk</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed">
          
          {/* TAB 1: PRIVACY POLICY */}
          {tab === 'privacy' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.06]">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Privacy Policy & Cookie Disclosure
                </h4>
                <Link
                  to="/privacy-policy"
                  onClick={onClose}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open Full Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <p>
                At <strong>{siteName}</strong>, accessible via our official web platform, the privacy of our visitors is our highest institutional priority. This document outlines the telemetry collected by {siteName} and how it is protected.
              </p>

              <div className="p-4 rounded-xl bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-white/[0.08] space-y-2">
                <strong className="block text-slate-900 dark:text-white font-bold">
                  Google DoubleClick DART Cookies & Publisher Ad Networks
                </strong>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Google is a third-party vendor on our site. It uses DART cookies to serve advertisements based on users visiting FinPulse and other internet domains. Users may opt out of DART cookies by visiting the Google Ad and Content Network Privacy Policy: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">https://policies.google.com/technologies/ads</a>.
                </p>
              </div>

              <h5 className="font-bold text-slate-900 dark:text-white pt-2">GDPR & CCPA Rights</h5>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You have the full right to data disclosure, data erasure, and non-sale of personal telemetry. FinPulse does not sell, broker, or monetize user browsing identities.
              </p>

              <h5 className="font-bold text-slate-900 dark:text-white pt-2">Local Storage Preferences</h5>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                FinPulse uses client-side localStorage solely to retain selected currency conversion pairs and dark/light display preferences. No biometric or sensitive financial account data is ever stored on our servers.
              </p>
            </div>
          )}

          {/* TAB 2: FINANCIAL DISCLAIMER */}
          {tab === 'disclaimer' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.06]">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Financial & Investment Disclaimer
                </h4>
                <Link
                  to="/disclaimer"
                  onClick={onClose}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open Full Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                <strong>Regulatory Notice:</strong>
                <p>
                  {siteName} is an educational and analytical financial software portal. We are NOT a licensed broker-dealer, registered investment advisor (RIA), or money transfer agent.
                </p>
              </div>

              <h5 className="font-bold text-slate-900 dark:text-white pt-2">Indicative Rates vs Banking Spreads</h5>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                All foreign exchange rates displayed represent mid-market interbank quotes aggregated from international central banks and the Open Exchange Rates API. Actual commercial transactions executed with retail banks or money service businesses incorporate markups, credit card foreign transaction fees, or wire commissions.
              </p>

              <h5 className="font-bold text-slate-900 dark:text-white pt-2">Cryptocurrency Volatility Warning</h5>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Digital assets (including BTC, ETH, and SOL) are subject to high market volatility. Historical data or simulated parity models do not guarantee future performance. Never risk capital you cannot afford to lose.
              </p>
            </div>
          )}

          {/* TAB 3: ABOUT US */}
          {tab === 'about' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.06]">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  About {siteName} Media & Data
                </h4>
                <Link
                  to="/about"
                  onClick={onClose}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open Full Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <p>
                <strong>{siteName}</strong> is an independent fintech publisher engineered to provide ultra-fast, zero-markup foreign exchange calculation tools, cryptocurrency intelligence, and institutional macroeconomic research.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06]">
                  <strong className="text-blue-600 dark:text-blue-400 block mb-1">160+ Fiat Currencies</strong>
                  <span>Streaming mid-market benchmarks updated continuously.</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06]">
                  <strong className="text-emerald-600 dark:text-emerald-400 block mb-1">Defensive Architecture</strong>
                  <span>Null-safe client calculations with resilient offline baselines.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT US */}
          {tab === 'contact' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.06]">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Contact Our Support & Editorial Desk
                </h4>
                <Link
                  to="/contact"
                  onClick={onClose}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open Full Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <p>
                For rate corrections, API integration inquiries, press releases, or Google AdSense partnership requests, reach out directly to our desk:
              </p>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Email Desk:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono">support@finpulse-tracker.com</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Turnaround Time:</span>
                  <span className="text-slate-600 dark:text-slate-400">Within 24 to 48 business hours</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-[#07090E] border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">Press ESC or click outside to dismiss</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-white/[0.08] text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-white/[0.15] font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
