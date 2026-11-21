import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { 
  ArrowLeft, 
  TrendingUp, 
  Coins, 
  DollarSign, 
  Building2, 
  Calculator, 
  BookOpen, 
  ShieldAlert 
} from 'lucide-react';

export default function NotFoundPage() {
  useSEO({
    title: '404 — Page Not Found | FGC Spot Financial Terminal',
    description: 'The requested financial terminal endpoint or research guide could not be located. Explore live exchange rates, gold bullion fixings, and PSX equities on FGC Spot.',
    canonical: '/404',
    robots: 'noindex, follow'
  });

  const QUICK_LINKS = [
    { title: 'Live Forex Rates', desc: 'Interbank benchmarks & open market cash quotes', path: '/rates', icon: DollarSign, color: 'text-emerald-500' },
    { title: 'Gold Bullion Rates', desc: 'Sarafa bazaar 24K/22K tola & gram calculator', path: '/gold', icon: Coins, color: 'text-amber-500' },
    { title: 'PSX Equity Terminal', desc: 'KSE-100 stock screener & dividend yields', path: '/stocks', icon: Building2, color: 'text-blue-500' },
    { title: 'Crypto Terminal', desc: 'Real-time cryptocurrency tracking & PKR counter-values', path: '/crypto', icon: TrendingUp, color: 'text-purple-500' },
    { title: 'Currency Converter', desc: 'Official cross-rate calculation engine with zero markups', path: '/converter', icon: Calculator, color: 'text-teal-500' },
    { title: 'Research & Guides', desc: 'Authoritative Pakistani macroeconomic research guides', path: '/blog', icon: BookOpen, color: 'text-emerald-400' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center space-y-10">
      
      {/* 404 Hero Badge & Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
          <ShieldAlert className="w-4 h-4" />
          <span>HTTP 404 — Terminal Resource Not Found</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
          Page Not Located
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-[#A8B3C2] max-w-xl mx-auto leading-relaxed">
          The requested URL does not match an active financial terminal module or published research guide. Please verify the URL or select a primary terminal below.
        </p>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00E676] text-slate-950 font-bold hover:bg-[#00c865] transition-all shadow-md hover:shadow-lg text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Terminal Home</span>
          </Link>
        </div>
      </div>

      {/* Recommended Financial Terminals Matrix */}
      <div className="pt-6 space-y-4 text-left">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A8B3C2] text-center">
          Available Financial Modules &amp; Calculators
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_LINKS.map(item => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group p-5 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 dark:hover:border-[#00E676]/40 transition-all shadow-xs hover:shadow-md space-y-2"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-slate-100 dark:bg-white/5 ${item.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#00E676] transition-colors">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                  {item.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
