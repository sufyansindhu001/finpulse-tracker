import React, { useState, useMemo } from 'react';
import { CURRENCIES, getCurrencyInfo } from '../data/currencies';
import { convertCurrency, getExchangeRate, DEFAULT_RATES } from '../services/forexService';
import { 
  ArrowLeftRight, 
  Copy, 
  Check, 
  TrendingUp, 
  Sparkles,
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function CurrencyConverter({ rates = DEFAULT_RATES, lastUpdated, source, isLoading, error, onRetry }) {
  const [amount, setAmount] = useState('100');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('PKR');
  const [copied, setCopied] = useState(false);

  // Quick amount buttons
  const amountPresets = [10, 50, 100, 250, 500, 1000, 5000];

  // Guaranteed rates object with 1 USD = 278.09 PKR fallback baseline
  const activeRates = useMemo(() => {
    return (rates && Object.keys(rates).length > 0) ? rates : DEFAULT_RATES;
  }, [rates]);

  // Selected currency metadata
  const baseObj = useMemo(() => getCurrencyInfo(baseCurrency), [baseCurrency]);
  const targetObj = useMemo(() => getCurrencyInfo(targetCurrency), [targetCurrency]);

  // Calculations strictly from rates
  const numericAmount = parseFloat(amount) || 0;
  
  const convertedValue = useMemo(() => {
    return convertCurrency(numericAmount, baseCurrency, targetCurrency, activeRates);
  }, [numericAmount, baseCurrency, targetCurrency, activeRates]);

  const directRate = useMemo(() => {
    return getExchangeRate(baseCurrency, targetCurrency, activeRates);
  }, [baseCurrency, targetCurrency, activeRates]);

  const inverseRate = useMemo(() => {
    return getExchangeRate(targetCurrency, baseCurrency, activeRates);
  }, [baseCurrency, targetCurrency, activeRates]);

  // Swap currencies
  const handleSwap = () => {
    setBaseCurrency(targetCurrency);
    setTargetCurrency(baseCurrency);
  };

  // Copy result
  const handleCopy = () => {
    if (convertedValue <= 0) return;
    const text = `${numericAmount} ${baseCurrency} = ${convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${targetCurrency}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Multi-currency preview list: live conversion of the entered amount into top destinations
  const topDestinations = useMemo(() => {
    const defaultCodes = ['EUR', 'GBP', 'AED', 'SAR', 'INR', 'PKR', 'CAD', 'JPY'];
    return defaultCodes
      .filter(code => code !== baseCurrency)
      .slice(0, 6)
      .map(code => {
        const curr = getCurrencyInfo(code);
        const converted = convertCurrency(numericAmount, baseCurrency, code, activeRates);
        const rate = getExchangeRate(baseCurrency, code, activeRates);
        return { ...curr, converted, rate };
      });
  }, [numericAmount, baseCurrency, activeRates]);

  return (
    <div className="w-full">
      {/* Main Converter Card - Executive Exchange Terminal */}
      <div className="bg-white/80 dark:bg-[#0B0F19]/90 border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-2xl relative overflow-hidden transition-colors duration-200">
        
        {/* Subtle radial ambient glows */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-white/[0.06] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2.5 border border-blue-500/20 tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time International Forex Feed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Live Currency Calculator
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              Institutional-grade real-time conversions for USD, EUR, GBP, AED, SAR, PKR, INR and 160+ world currencies via Open Exchange Rates API.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2 bg-slate-100 dark:bg-white/[0.03] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/[0.08] font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{source || 'open.er-api.com (Live)'}</span>
            </span>
          </div>
        </div>

        {/* Info or error indicator if sync is pending or failed */}
        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Live feed sync notice: Using reliable benchmark rates while reconnecting.</span>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {/* Converter Inputs Grid - Recessed Terminal Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-7 items-center">
          
          {/* Amount Input Recessed Box */}
          <div className="lg:col-span-4 bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-4 transition-all focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Amount to Convert
            </label>
            <div className="relative flex items-center">
              <span className="text-xl font-bold text-slate-400 dark:text-slate-500 mr-2 select-none">
                {baseObj.symbol || '$'}
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent border-0 p-0 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums tracking-tight focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Base Currency Dropdown Box */}
          <div className="lg:col-span-3 bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-4 transition-all focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              From Currency
            </label>
            <div className="relative">
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="w-full bg-transparent border-0 p-0 pr-6 text-sm sm:text-base font-bold text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-0 cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white">
                    {c.flag} {c.code} - {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Floating Swap Button */}
          <div className="lg:col-span-2 flex justify-center py-1 lg:py-0">
            <button
              onClick={handleSwap}
              title="Swap From and To Currencies"
              className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center transition-all shadow-lg shadow-blue-600/30 cursor-pointer group"
              aria-label="Swap Currencies"
            >
              <ArrowLeftRight className="w-5 h-5 transition-transform group-hover:rotate-180 duration-300" />
            </button>
          </div>

          {/* Target Currency Dropdown Box */}
          <div className="lg:col-span-3 bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] rounded-2xl p-4 transition-all focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              To Currency
            </label>
            <div className="relative">
              <select
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
                className="w-full bg-transparent border-0 p-0 pr-6 text-sm sm:text-base font-bold text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-0 cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-white dark:bg-[#0B0F19] text-slate-900 dark:text-white">
                    {c.flag} {c.code} - {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

        </div>

        {/* Quick Amount Preset Chips */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mr-1">Quick Select:</span>
          {amountPresets.map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(preset.toString())}
              className={`text-xs px-3 py-1 rounded-full border font-mono tabular-nums transition-all cursor-pointer ${
                numericAmount === preset
                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm shadow-blue-500/25'
                  : 'bg-slate-100/90 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              {baseObj.symbol}{preset.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Conversion Result Hero Panel - Executive Display Terminal */}
        <div className="mt-8 bg-gradient-to-br from-slate-900 via-[#0B0F19] to-[#070A12] text-white border border-slate-800 dark:border-white/[0.08] rounded-2xl p-6 sm:p-8 relative shadow-2xl overflow-hidden">
          <div className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl"></div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-5 relative z-10">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <span>Converted Output Total</span>
                <span className="text-emerald-400 font-mono">({targetCurrency})</span>
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-mono tabular-nums tracking-tight">
                  {targetObj.symbol} {convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
                <span className="text-lg sm:text-2xl font-bold text-emerald-400 font-mono tracking-wide">
                  {targetCurrency}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-2.5 font-mono tabular-nums">
                {numericAmount.toLocaleString()} {baseCurrency} = {convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {targetCurrency}
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 self-start sm:self-center px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold border border-white/10 active:scale-95 transition-all cursor-pointer shadow-sm backdrop-blur-md"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
              <span>{copied ? 'Copied Calculation!' : 'Copy Calculation'}</span>
            </button>
          </div>

          {/* Exchange Rate Metrics Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-7 pt-5 border-t border-white/[0.08] text-xs relative z-10">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-slate-400">Direct Rate:</span>
              <span className="text-white font-mono font-bold tabular-nums">
                1 {baseCurrency} = {directRate < 0.001 ? directRate.toFixed(6) : directRate.toFixed(4)} {targetCurrency}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              <span className="text-slate-400">Inverse Rate:</span>
              <span className="text-white font-mono font-bold tabular-nums">
                1 {targetCurrency} = {inverseRate < 0.001 ? inverseRate.toFixed(6) : inverseRate.toFixed(4)} {baseCurrency}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Currency Quick Target Matrix */}
        {topDestinations.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Key Global Corridors for {numericAmount.toLocaleString()} {baseCurrency}
              </h3>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live Interbank Feed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {topDestinations.map((dest) => (
                <div
                  key={dest.code}
                  onClick={() => setTargetCurrency(dest.code)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all hover:shadow-lg ${
                    targetCurrency === dest.code
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-500/10 shadow-sm shadow-blue-500/10'
                      : 'bg-slate-50/80 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/60 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{dest.flag}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{dest.code}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate tabular-nums">
                    {dest.symbol} {dest.converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1 truncate tabular-nums">
                    1 {baseCurrency} = {dest.rate < 0.01 ? dest.rate.toFixed(4) : dest.rate.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
