import React, { useMemo } from 'react';
import { POPULAR_PAIRS, getCurrencyInfo } from '../data/currencies';
import { getExchangeRate, convertCurrency, DEFAULT_RATES } from '../services/forexService';
import { ArrowUpRight } from 'lucide-react';

export default function QuickConversionMatrix({ rates = DEFAULT_RATES, onSelectPair }) {
  const activeRates = useMemo(() => {
    return (rates && Object.keys(rates).length > 0) ? rates : DEFAULT_RATES;
  }, [rates]);

  return (
    <div className="w-full">
      <div className="bg-white/80 dark:bg-[#0B0F19]/90 border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-9 backdrop-blur-2xl shadow-2xl transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-white/[0.06] gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Popular Forex Corridors & Matrix
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Live calculated exchange rates and benchmark conversion values across major international currency corridors.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full self-start sm:self-center flex items-center gap-2 font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Interbank Feed</span>
          </span>
        </div>

        {/* Pair Grid - Always displayed with activeRates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {POPULAR_PAIRS.map((pair) => {
            const base = getCurrencyInfo(pair.base);
            const target = getCurrencyInfo(pair.target);
            const rate = getExchangeRate(pair.base, pair.target, activeRates);
            const val100 = convertCurrency(100, pair.base, pair.target, activeRates);

            return (
              <div
                key={pair.label}
                onClick={() => onSelectPair && onSelectPair(pair.base, pair.target)}
                className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-4.5 hover:border-blue-500/50 hover:bg-slate-100/60 dark:hover:bg-white/[0.05] transition-all cursor-pointer group shadow-sm hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-base">
                    <span>{base.flag}</span>
                    <span className="text-slate-400 dark:text-slate-600 text-xs">/</span>
                    <span>{target.flag}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-200/60 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                  {pair.label}
                </div>

                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 tabular-nums tracking-tight">
                  {rate < 0.001 
                    ? rate.toFixed(6) 
                    : rate < 1 
                      ? rate.toFixed(4) 
                      : rate.toFixed(2)}
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-3 pt-2.5 border-t border-slate-200/80 dark:border-white/[0.06] flex justify-between tabular-nums">
                  <span>100 {pair.base} =</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">
                    {val100.toLocaleString(undefined, { maximumFractionDigits: 2 })} {pair.target}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Multi-Amount Conversion Reference Table */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.06]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3.5">
            USD Conversion Matrix
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 dark:bg-white/[0.02]">
                <tr className="border-b border-slate-200/80 dark:border-white/[0.06] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">Currency</th>
                  <th className="py-3 px-4 text-right">Unit Rate ($1 USD)</th>
                  <th className="py-3 px-4 text-right">$50 USD</th>
                  <th className="py-3 px-4 text-right">$100 USD</th>
                  <th className="py-3 px-4 text-right">$500 USD</th>
                  <th className="py-3 px-4 text-right">$1,000 USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] font-mono tabular-nums">
                {['PKR', 'INR', 'AED', 'SAR', 'EUR', 'GBP', 'CAD', 'JPY'].map((code) => {
                  const curr = getCurrencyInfo(code);
                  const rate = getExchangeRate('USD', code, activeRates);
                  return (
                    <tr key={code} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span className="text-base">{curr.flag}</span>
                        <span>{curr.name}</span>
                        <span className="text-slate-400 uppercase text-[10px] font-mono">({code})</span>
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                        {rate < 0.001 ? rate.toFixed(6) : rate.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">
                        {(rate * 50).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">
                        {(rate * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">
                        {(rate * 500).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-900 dark:text-white font-bold">
                        {(rate * 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
