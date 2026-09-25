import React from 'react';
import { 
  Activity, 
  BarChart3, 
  Gauge, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Compass
} from 'lucide-react';

export default function MarketIntelligence() {
  return (
    <section id="intelligence" className="py-12 border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2.5 border border-emerald-500/20 font-mono uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Quantitative Market Overview</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Market Intelligence & Analytics
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Real-time volatility indexes, sentiment gauges, aggregate cross-market turnover, and institutional commentary.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Analytics Engine Active</span>
          </div>
        </div>

        {/* 3 Analytics Gauges / Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Volatility Index */}
          <div className="bg-[#0C1017] border border-white/[0.08] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Market Volatility Index
                </span>
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <Activity className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-white font-mono tabular-nums">
                  18.42
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Low / Stable
                </span>
              </div>

              {/* Visual meter bar */}
              <div className="mt-4">
                <div className="w-full bg-[#07090E] h-2 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full w-[25%]" title="Low" />
                  <div className="bg-blue-500 h-full w-[35%]" title="Moderate" />
                  <div className="bg-amber-500 h-full w-[25%]" title="Elevated" />
                  <div className="bg-rose-500 h-full w-[15%]" title="High" />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5">
                  <span>0 (Complacent)</span>
                  <span className="text-blue-400 font-bold">18.4 Current</span>
                  <span>100 (Extreme)</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-white/[0.04] leading-relaxed">
              Currency cross-rate implied volatility remains anchored; foreign exchange corridor spreads are tight.
            </p>
          </div>

          {/* Card 2: 24h Global Aggregate Turnover */}
          <div className="bg-[#0C1017] border border-white/[0.08] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  24h Aggregate Volume
                </span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-white font-mono tabular-nums">
                  $186.4B
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +6.8%
                </span>
              </div>

              {/* Volume Distribution */}
              <div className="mt-4 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Forex Spot Volume:</span>
                  <span className="text-slate-200 font-bold tabular-nums">$118.2B (63%)</span>
                </div>
                <div className="w-full bg-[#07090E] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '63%' }} />
                </div>

                <div className="flex justify-between text-slate-400 text-[11px] pt-1">
                  <span>Crypto Turnover:</span>
                  <span className="text-slate-200 font-bold tabular-nums">$68.2B (37%)</span>
                </div>
                <div className="w-full bg-[#07090E] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '37%' }} />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-white/[0.04] leading-relaxed">
              Turnover spiked across USD, AED, SAR, and PKR remittance channels during early Asian & London trading hours.
            </p>
          </div>

          {/* Card 3: Sentiment Gauge */}
          <div className="bg-[#0C1017] border border-white/[0.08] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Market Sentiment Gauge
                </span>
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Gauge className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-white font-mono tabular-nums">
                  68 / 100
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Greed / Bullish
                </span>
              </div>

              {/* Gauge breakdown */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-xl bg-[#07090E] border border-white/[0.04]">
                  <div className="text-slate-500">Forex Liquidity</div>
                  <div className="text-emerald-400 font-bold">Deep (98.4%)</div>
                </div>
                <div className="p-2 rounded-xl bg-[#07090E] border border-white/[0.04]">
                  <div className="text-slate-500">Retail Sentiment</div>
                  <div className="text-blue-400 font-bold">Accumulation</div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-white/[0.04] leading-relaxed">
              Institutional investors demonstrate sustained risk appetite with capital rotating toward emerging market currencies.
            </p>
          </div>

        </div>

        {/* Analytical Editorial Commentary Box */}
        <div className="bg-[#0C1017] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-mono font-bold uppercase">
                  Institutional Desk Memo
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" /> Updated 15 mins ago
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Macroeconomic Outlook: Dollar Index (DXY) Consolidates Around 104.2 While Asian FX Stabilizes
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Interbank rates for the Pakistani Rupee (USD/PKR 278.09 baseline) remain stable following foreign reserve inflows and compliant bilateral remittance flows. Meanwhile, Bitcoin (BTC) and Solana (SOL) continue consolidating above critical moving averages as global institutional liquidity expands.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <div className="px-4 py-2.5 rounded-xl bg-[#07090E] border border-white/[0.06] text-xs font-mono">
                <div className="text-slate-500">Central Bank Benchmark</div>
                <div className="text-slate-200 font-bold tabular-nums">Fed Funds: 5.25% - 5.50%</div>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-[#07090E] border border-white/[0.06] text-xs font-mono">
                <div className="text-slate-500">Interbank Spread Standard</div>
                <div className="text-emerald-400 font-bold tabular-nums">&lt; 0.05% Target</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
