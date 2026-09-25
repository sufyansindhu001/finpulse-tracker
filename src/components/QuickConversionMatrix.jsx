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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Popular Forex Corridors & Matrix</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live calculated exchange rates and benchmark conversion values across major international currency corridors.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 rounded-full self-start sm:self-center flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Interbank Feed</span>
          </span>
        </div>

        {/* Pair Grid - Always displayed with activeRates (never stuck on infinite spinner) */}
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
                className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/90 rounded-xl p-4.5 hover:border-blue-500 dark:hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-800/40 transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-base">
                    <span>{base.flag}</span>
                    <span className="text-slate-400 text-xs">/</span>
                    <span>{target.flag}</span>
                  </div>
                  <div className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {pair.label}
                </div>

                <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
                  {rate < 0.001 
                    ? rate.toFixed(6) 
                    : rate < 1 
                      ? rate.toFixed(4) 
                      : rate.toFixed(2)}
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex justify-between">
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
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">USD Conversion Matrix</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-2.5 px-3">Currency</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate ($1 USD)</th>
                  <th className="py-2.5 px-3 text-right">$50 USD</th>
                  <th className="py-2.5 px-3 text-right">$100 USD</th>
                  <th className="py-2.5 px-3 text-right">$500 USD</th>
                  <th className="py-2.5 px-3 text-right">$1,000 USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-mono tabular-nums">
                {['PKR', 'INR', 'AED', 'SAR', 'EUR', 'GBP', 'CAD', 'JPY'].map((code) => {
                  const curr = getCurrencyInfo(code);
                  const rate = getExchangeRate('USD', code, activeRates);
                  return (
                    <tr key={code} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span>{curr.flag}</span>
                        <span>{curr.name}</span>
                        <span className="text-slate-400 uppercase text-[10px]">({code})</span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                        {rate < 0.001 ? rate.toFixed(6) : rate.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                        {(rate * 50).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                        {(rate * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                        {(rate * 500).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-900 dark:text-white font-bold">
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
