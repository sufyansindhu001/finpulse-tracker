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
      {/* Main Converter Card */}
      <div className="bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-xl relative overflow-hidden transition-colors duration-200">
        
        {/* Decorative background glow (dark mode) */}
        <div className="hidden dark:block absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="hidden dark:block absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800/80 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2 border border-blue-200 dark:border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time International Forex Feed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Live Currency Calculator
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Dynamic real-time conversions for USD, EUR, GBP, AED, SAR, PKR, INR and 160+ world currencies via Open Exchange Rates API.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-slate-950/80 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-slate-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{source || 'open.er-api.com (Live)'}</span>
            </span>
          </div>
        </div>

        {/* Info or error indicator if sync is pending or failed */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Live feed sync notice: Using reliable benchmark rates while reconnecting.</span>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-2.5 py-1 bg-amber-200 dark:bg-amber-600/40 hover:bg-amber-300 dark:hover:bg-amber-600/60 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {/* Converter Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6 items-center">
          
          {/* Amount Input */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-2">
              Amount to Convert
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400 font-bold">
                {baseObj.symbol || '$'}
              </div>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white font-mono tabular-nums text-lg font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Base Currency Dropdown */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-2">
              From Currency
            </label>
            <div className="relative">
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="w-full pl-3 pr-8 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white font-semibold text-sm appearance-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all shadow-sm"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {c.flag} {c.code} - {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500 dark:text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center pt-2 md:pt-6">
            <button
              onClick={handleSwap}
              title="Swap From and To Currencies"
              className="w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center transition-all shadow-md shadow-blue-600/30 cursor-pointer group"
              aria-label="Swap Currencies"
            >
              <ArrowLeftRight className="w-5 h-5 transition-transform group-hover:rotate-180 duration-300" />
            </button>
          </div>

          {/* Target Currency Dropdown */}
          <div className="md:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-2">
              To Currency
            </label>
            <div className="relative">
              <select
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
                className="w-full pl-3 pr-8 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white font-semibold text-sm appearance-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer transition-all shadow-sm"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {c.flag} {c.code} - {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500 dark:text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

        </div>

        {/* Quick Amount Preset Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mr-1">Quick Select:</span>
          {amountPresets.map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(preset.toString())}
              className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all cursor-pointer ${
                numericAmount === preset
                  ? 'bg-blue-50 dark:bg-blue-600/30 border-blue-500 text-blue-600 dark:text-blue-300 font-bold'
                  : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {baseObj.symbol}{preset.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Conversion Result Hero Panel */}
        <div className="mt-8 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-7 relative shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Converted Total ({targetCurrency})
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                  {targetObj.symbol} {convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
                <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {targetCurrency}
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-mono tabular-nums">
                {numericAmount.toLocaleString()} {baseCurrency} = {convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {targetCurrency}
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 self-start sm:self-center px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Calculation!' : 'Copy Calculation'}</span>
            </button>
          </div>

          {/* Exchange Rate Metrics Footer with full precision */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">Exchange Rate:</span>
              <span className="text-slate-900 dark:text-white font-mono font-bold">
                1 {baseCurrency} = {directRate < 0.001 ? directRate.toFixed(6) : directRate.toFixed(4)} {targetCurrency}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              <span className="text-slate-500 dark:text-slate-400">Inverse Rate:</span>
              <span className="text-slate-900 dark:text-white font-mono font-bold">
                1 {targetCurrency} = {inverseRate < 0.001 ? inverseRate.toFixed(6) : inverseRate.toFixed(4)} {baseCurrency}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Currency Quick Target Matrix */}
        {topDestinations.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300">
                Key Corridors for {numericAmount.toLocaleString()} {baseCurrency}
              </h3>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live Interbank Feed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {topDestinations.map((dest) => (
                <div
                  key={dest.code}
                  onClick={() => setTargetCurrency(dest.code)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                    targetCurrency === dest.code
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10'
                      : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base">{dest.flag}</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{dest.code}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate">
                    {dest.symbol} {dest.converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
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
