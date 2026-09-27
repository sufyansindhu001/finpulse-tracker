import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  Globe,
  Calculator
} from 'lucide-react';

export default function WhyFinPulse({ onExploreMarkets, onLaunchConverter }) {
  const pillars = [
    {
      icon: ShieldCheck,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      title: 'Deterministic Parity',
      description: 'Transparent mid-market pricing calculated against live central bank benchmarks.'
    },
    {
      icon: Globe,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      title: 'Emerging Market Depth',
      description: 'Real-time tracking of regional FX corridors including PKR, INR, AED, and SAR.'
    },
    {
      icon: Zap,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      title: 'Low-Latency Ingestion',
      description: 'Direct socket aggregation across top liquidity pools with sub-second delta updates.'
    },
    {
      icon: Calculator,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      title: 'Transparent Calculation',
      description: 'Open financial tooling designed for independent auditors, traders, and businesses.'
    }
  ];

  return (
    <section className="py-16 border-b border-slate-200 dark:border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3 border border-blue-500/20 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Technical Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Institutional Platform Architecture
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 font-medium leading-relaxed">
            Engineered from first principles for computational rigor, transparent pricing, and verifiable cross-market feeds.
          </p>
        </div>

        {/* 4 Technical Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18] rounded-3xl p-6 transition-all duration-200 shadow-xs dark:shadow-xl flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-5 ${pillar.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.04] flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Technical Specification</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing Headline & Action Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-[#0C1017] dark:via-[#0F141F] dark:to-[#07090E] border border-slate-200 dark:border-white/[0.08] p-8 sm:p-14 shadow-xs dark:shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Institutional Precision for Global Markets
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto font-medium leading-relaxed">
              Open financial infrastructure engineered for cross-border traders, corporate treasury analysts, and global researchers.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={onExploreMarkets}
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer group"
              >
                <span>Open Forex Terminal</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onLaunchConverter}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-[#07090E] dark:hover:bg-[#111622] text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white font-semibold text-sm transition-all border border-slate-300 dark:border-white/[0.08] flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
              >
                <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Launch Parity Calculator</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
