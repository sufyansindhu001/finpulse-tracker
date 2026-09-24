import React from 'react';
import { ExternalLink, Info } from 'lucide-react';

/**
 * AdSense-compliant responsive Ad Banner Slot container
 * Conforms to Google AdSense policies with full light and dark mode styling
 */
export default function AdBanner({ slotType = 'leaderboard', className = '' }) {
  if (slotType === 'header-leaderboard') {
    return (
      <div className={`w-full max-w-5xl mx-auto my-3 px-4 ${className}`}>
        <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center mb-1 font-bold flex items-center justify-center gap-1">
          <span>Advertisement</span>
          <Info className="w-3 h-3 text-slate-400 dark:text-slate-500" />
        </div>
        <div className="w-full min-h-[90px] h-[90px] bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-xl flex items-center justify-between px-4 sm:px-6 relative overflow-hidden backdrop-blur-sm shadow-sm group hover:border-blue-500/50 transition-colors">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
              FX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Zero-Commission Global FX & Crypto Exchange</span>
                <span className="hidden sm:inline-block text-[10px] bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono font-semibold">Sponsored</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Trade over 60+ fiat currencies and 200+ crypto pairs with institutional liquidity.</p>
            </div>
          </div>
          <a
            href="#explore-rates"
            className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <span>Learn More</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <div className="absolute top-1 right-2 text-[9px] text-slate-400 dark:text-slate-600 font-mono">728 × 90 Leaderboard</div>
        </div>
      </div>
    );
  }

  if (slotType === 'sidebar-rectangle') {
    return (
      <div className={`w-full max-w-[300px] mx-auto my-4 ${className}`}>
        <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center mb-1 font-bold flex items-center justify-center gap-1">
          <span>Advertisement</span>
          <Info className="w-3 h-3 text-slate-400 dark:text-slate-500" />
        </div>
        <div className="w-[300px] h-[250px] bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-xl flex flex-col justify-between p-5 relative overflow-hidden backdrop-blur-sm shadow-md group hover:border-emerald-500/50 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold">Verified Partner</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-600 font-mono">300 × 250</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <span className="text-xl font-bold">₿</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 leading-snug mb-1">
              Secure Hardware Vault for Digital Assets
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Air-gapped cold storage. Military-grade secure element for BTC, ETH & SOL.
            </p>
          </div>
          <div>
            <a
              href="#vault"
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg transition-all shadow-sm cursor-pointer"
            >
              <span>Claim 15% Discount</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <p className="text-[9px] text-center text-slate-400 dark:text-slate-500 mt-2">Google AdSense Compliant Slot</p>
          </div>
        </div>
      </div>
    );
  }

  // In-Content Banner (728x90 or responsive native)
  return (
    <div className={`w-full max-w-5xl mx-auto my-8 px-4 ${className}`}>
      <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center mb-1 font-bold flex items-center justify-center gap-1">
        <span>Advertisement</span>
        <Info className="w-3 h-3 text-slate-400 dark:text-slate-500" />
      </div>
      <div className="w-full min-h-[90px] py-4 bg-white dark:bg-gradient-to-r dark:from-slate-900/80 dark:via-slate-800/80 dark:to-slate-900/80 border border-slate-200 dark:border-slate-700/60 rounded-xl flex flex-col sm:flex-row items-center justify-between px-6 gap-3 backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base shrink-0 border border-amber-200 dark:border-amber-500/30">
            ⚡
          </div>
          <div className="text-center sm:text-left">
            <h5 className="text-sm font-bold text-slate-900 dark:text-slate-200">Send Global Remittances with 0% Hidden Bank Markup</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400">Compare real-time bank spreads and transfer to PKR, INR, AED, and EUR instantly.</p>
          </div>
        </div>
        <a
          href="#remit"
          className="text-xs font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/30 border border-amber-300 dark:border-amber-500/40 px-4 py-2 rounded-lg transition-colors shrink-0 cursor-pointer shadow-sm"
        >
          Compare Spreads
        </a>
      </div>
    </div>
  );
}
