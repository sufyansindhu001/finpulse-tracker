import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CURRENCIES, getCurrencyInfo } from '../data/currencies';
import { convertCurrency, getExchangeRate, DEFAULT_RATES } from '../services/forexService';
import { 
  ArrowLeftRight, 
  Copy, 
  Check, 
  TrendingUp, 
  Globe, 
  Sliders, 
  CheckCircle, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function ForexTerminal({ rates = DEFAULT_RATES, source, lastUpdated, onRefresh }) {
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState('100');
  const [baseCurrency, setBaseCurrency] = useState(() => searchParams.get('from')?.toUpperCase() || 'USD');
  const [targetCurrency, setTargetCurrency] = useState(() => searchParams.get('to')?.toUpperCase() || 'PKR');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const f = searchParams.get('from');
    const t = searchParams.get('to');
    if (f) setBaseCurrency(f.toUpperCase());
    if (t) setTargetCurrency(t.toUpperCase());
  }, [searchParams]);

  const activeRates = useMemo(() => {
    return (rates && Object.keys(rates).length > 0) ? rates : DEFAULT_RATES;
  }, [rates]);

  const numericAmount = parseFloat(amount) || 0;

  // Selected currency objects
  const baseObj = useMemo(() => getCurrencyInfo(baseCurrency), [baseCurrency]);
  const targetObj = useMemo(() => getCurrencyInfo(targetCurrency), [targetCurrency]);

  // Live Calculations
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

  const handleCopy = () => {
    if (convertedValue <= 0) return;
    const text = `${numericAmount} ${baseCurrency} = ${convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${targetCurrency}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dedicated 7 Corridors
  const keyCorridors = [
    { base: 'USD', target: 'PKR', label: 'USD / PKR', name: 'Pakistani Rupee', flag: '🇵🇰' },
    { base: 'EUR', target: 'USD', label: 'EUR / USD', name: 'Euro to Dollar', flag: '🇪🇺' },
    { base: 'GBP', target: 'USD', label: 'GBP / USD', name: 'British Pound', flag: '🇬🇧' },
    { base: 'USD', target: 'JPY', label: 'USD / JPY', name: 'Japanese Yen', flag: '🇯🇵' },
    { base: 'USD', target: 'AED', label: 'USD / AED', name: 'UAE Dirham', flag: '🇦🇪' },
    { base: 'USD', target: 'SAR', label: 'USD / SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
    { base: 'USD', target: 'INR', label: 'USD / INR', name: 'Indian Rupee', flag: '🇮🇳' },
  ];

  return (
    <section id="forex-terminal" className="py-12 border-b border-slate-200/80 dark:border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2.5 border border-blue-500/20 font-mono uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              <span>Interbank Forex Terminal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Dedicated Forex Terminal & Parity Simulator
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Live interbank mid-market exchange rates, bilateral corridor liquidity, and instant parity simulation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-slate-100 dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] px-3 py-1.5 rounded-xl font-semibold flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{source || 'open.er-api.com (Live)'}</span>
            </span>
          </div>
        </div>

        {/* 7 Key Corridors Micro-Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {keyCorridors.map((c) => {
            const rate = getExchangeRate(c.base, c.target, activeRates);
            const isSelected = baseCurrency === c.base && targetCurrency === c.target;

            return (
              <div
                key={c.label}
                onClick={() => {
                  setBaseCurrency(c.base);
                  setTargetCurrency(c.target);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer group shadow-xs ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500 shadow-blue-500/10'
                    : 'bg-white dark:bg-[#0C1017] border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18] hover:bg-slate-50 dark:hover:bg-[#111622]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-lg">{c.flag}</span>
                  <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">{c.label}</span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                  {rate < 0.001 ? rate.toFixed(6) : rate < 1 ? rate.toFixed(4) : rate.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5 font-sans">
                  {c.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Parity Simulator & Currency Converter Terminal */}
        <div className="bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-xs dark:shadow-2xl relative overflow-hidden">
          
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Live Parity Simulator & Currency Calculator
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
              1 {baseCurrency} = {directRate < 0.001 ? directRate.toFixed(6) : directRate.toFixed(4)} {targetCurrency}
            </span>
          </div>

          {/* Recessed Inputs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6 items-center">
            
            {/* Amount Input */}
            <div className="lg:col-span-4 bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-mono">
                Simulation Amount
              </label>
              <div className="relative flex items-center">
                <span className="text-xl font-bold text-slate-400 dark:text-slate-500 mr-2 select-none font-mono">
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

            {/* Base Currency Dropdown */}
            <div className="lg:col-span-3 bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-mono">
                From Currency
              </label>
              <div className="relative">
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="w-full bg-transparent border-0 p-0 pr-6 text-sm sm:text-base font-bold text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-0 cursor-pointer"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-white text-slate-900 dark:bg-[#0C1017] dark:text-white">
                      {c.flag} {c.code} - {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="lg:col-span-2 flex justify-center py-1 lg:py-0">
              <button
                onClick={handleSwap}
                title="Swap Currencies"
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center transition-all shadow-md shadow-blue-600/30 cursor-pointer group"
              >
                <ArrowLeftRight className="w-5 h-5 transition-transform group-hover:rotate-180 duration-300" />
              </button>
            </div>

            {/* Target Currency Dropdown */}
            <div className="lg:col-span-3 bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 font-mono">
                To Currency
              </label>
              <div className="relative">
                <select
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value)}
                  className="w-full bg-transparent border-0 p-0 pr-6 text-sm sm:text-base font-bold text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-0 cursor-pointer"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-white text-slate-900 dark:bg-[#0C1017] dark:text-white">
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

          {/* Quick Presets */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold font-mono mr-1">Presets:</span>
            {[10, 50, 100, 250, 500, 1000, 5000].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className={`text-xs px-3 py-1 rounded-full border font-mono tabular-nums transition-all cursor-pointer ${
                  numericAmount === preset
                    ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs shadow-blue-500/25'
                    : 'bg-slate-100 dark:bg-[#07090E] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                {baseObj.symbol}{preset.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Converted Total Output Banner */}
          <div className="mt-6 p-6 rounded-2xl bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-mono">
                Simulated Output Total ({targetCurrency})
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                  {targetObj.symbol} {convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
                <span className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {targetCurrency}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono tabular-nums">
                {numericAmount.toLocaleString()} {baseCurrency} = {convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {targetCurrency}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 self-start sm:self-center px-4 py-2.5 bg-slate-200/70 hover:bg-slate-200 text-slate-800 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-white rounded-xl text-xs font-semibold border border-slate-300 dark:border-white/[0.08] active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
              <span>{copied ? 'Copied Calculation!' : 'Copy Calculation'}</span>
            </button>
          </div>

          {/* Parity Simulator Matrix Across Key Global Corridors */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                Instant Parity Simulation: {numericAmount.toLocaleString()} {baseCurrency} Across World Corridors
              </h4>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Pure Interbank Baseline
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {['PKR', 'INR', 'AED', 'SAR', 'EUR', 'GBP'].map((code) => {
                const curr = getCurrencyInfo(code);
                const converted = convertCurrency(numericAmount, baseCurrency, code, activeRates);
                const rate = getExchangeRate(baseCurrency, code, activeRates);
                const isCurrent = targetCurrency === code;

                return (
                  <div
                    key={code}
                    onClick={() => setTargetCurrency(code)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-600/15 shadow-xs'
                        : 'bg-slate-50 dark:bg-[#07090E] border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.15] hover:bg-slate-100 dark:hover:bg-[#111622]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">{curr.flag}</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">{code}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate tabular-nums">
                      {curr.symbol} {converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1 truncate tabular-nums">
                      1 {baseCurrency} = {rate < 0.01 ? rate.toFixed(4) : rate.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
