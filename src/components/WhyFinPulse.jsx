import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Globe
} from 'lucide-react';

export default function WhyFinPulse({ onExploreMarkets, onLaunchConverter }) {
  const pillars = [
    {
      icon: Zap,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      title: 'Sub-Second API Ingestion',
      description: 'Continuous real-time polling from top international currency banks and CoinGecko liquidity engines, ensuring you always trade on freshly verified quotes.'
    },
    {
      icon: ShieldCheck,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      title: 'Pure Interbank Mid-Market Truth',
      description: 'Zero broker markup, zero hidden spreads, and zero retail slippage. FinPulse calculates raw mid-point foreign exchange values with full decimal precision.'
    },
    {
      icon: Cpu,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      title: 'Resilient Defensive Architecture',
      description: 'Built with rigorous null-safety and offline baseline fallbacks (such as 1 USD = 278.09 PKR) ensuring the terminal never freezes or displays empty screens.'
    },
    {
      icon: Lock,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      title: 'Zero Wall & Privacy First',
      description: 'High-speed client-side calculation with no compulsory signups, no invasive behavioral tracking, and no paywalls. Institutional data accessible to all.'
    }
  ];

  return (
    <section className="py-16 border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-3 border border-blue-500/20 font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Architectural Standards</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Why Professionals Choose FinPulse
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2 font-normal leading-relaxed">
            Engineered from the ground up for speed, analytical rigor, and unwavering reliability across global financial markets.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-[#0C1017] border border-white/[0.08] hover:border-white/[0.18] rounded-3xl p-6 transition-all duration-200 shadow-xl flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-5 ${pillar.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Enterprise Standard</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing Headline & CTA Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0C1017] via-[#0F141F] to-[#07090E] border border-white/[0.08] p-8 sm:p-14 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Your Markets. Your Data. Your Decisions.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-normal leading-relaxed">
              Join over 50,000 analysts, cross-border traders, and enterprises relying on FinPulse for uncompromising global market intelligence.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={onExploreMarkets}
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer group"
              >
                <span>Explore Live Markets</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onLaunchConverter}
                className="px-6 py-3.5 rounded-xl bg-[#07090E] hover:bg-[#111622] text-slate-200 hover:text-white font-semibold text-sm transition-all border border-white/[0.08] flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Globe className="w-4 h-4 text-slate-400" />
                <span>Launch Parity Calculator</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
