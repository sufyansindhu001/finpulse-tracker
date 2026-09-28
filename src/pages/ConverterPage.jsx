import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  ArrowLeftRight, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  ChevronRight,
  TrendingUp,
  Percent,
  Zap
} from 'lucide-react';
import CurrencySelect from '../components/CurrencySelect';
import { getCurrencyFlagUrl } from '../utils/currencyFlags';

export default function ConverterPage({ rates = {} }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [amount, setAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState(searchParams.get('from') || 'USD');
  const [toCurrency, setToCurrency] = useState(searchParams.get('to') || 'PKR');
  const [isSwapping, setIsSwapping] = useState(false);

  // Conversion math
  const { fromRate, toRate, convertedAmount, unitRate, inverseRate } = useMemo(() => {
    const fromR = rates[fromCurrency] || (fromCurrency === 'USD' ? 1.0 : 1.0);
    const toR = rates[toCurrency] || (toCurrency === 'PKR' ? 278.09 : 1.0);

    // Amount in USD = amount / fromR
    const inUsd = amount / fromR;
    const finalAmount = inUsd * toR;

    const unit = toR / fromR;
    const inverse = fromR / toR;

    return {
      fromRate: fromR,
      toRate: toR,
      convertedAmount: finalAmount,
      unitRate: unit,
      inverseRate: inverse
    };
  }, [amount, fromCurrency, toCurrency, rates]);

  // Swap currencies
  const handleSwap = () => {
    setIsSwapping(true);
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setSearchParams({ from: toCurrency, to: fromCurrency });
    setTimeout(() => setIsSwapping(false), 300);
  };

  // Shortcut chips
  const quickCorridors = [
    { from: 'USD', to: 'PKR', label: 'USD → PKR' },
    { from: 'EUR', to: 'PKR', label: 'EUR → PKR' },
    { from: 'GBP', to: 'PKR', label: 'GBP → PKR' },
    { from: 'SAR', to: 'PKR', label: 'SAR → PKR' },
    { from: 'AED', to: 'PKR', label: 'AED → PKR' },
    { from: 'CAD', to: 'PKR', label: 'CAD → PKR' },
    { from: 'EUR', to: 'USD', label: 'EUR → USD' },
    { from: 'GBP', to: 'USD', label: 'GBP → USD' },
  ];

  const handleSelectCorridor = (from, to) => {
    setFromCurrency(from);
    setToCurrency(to);
    setSearchParams({ from, to });
  };

  // Denomination table multiples
  const denominations = [1, 5, 10, 25, 50, 100, 500, 1000, 5000];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#A8B3C2]">
        <Link to="/" className="hover:text-white font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/rates" className="hover:text-white font-medium">Rates</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white font-semibold">Smart Converter</span>
      </nav>

      {/* Header Banner */}
      <div className="text-left space-y-2 pb-6 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
          <span className="text-xs uppercase font-bold tracking-widest text-[#00E676]">
            ZERO-MARKUP CALCULATION ENGINE
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Real-Time Currency Converter
        </h1>
        <p className="text-sm text-[#A8B3C2] max-w-2xl">
          Instantly calculate cross-currency conversions using authentic institutional mid-market rates without hidden bank markups.
        </p>
      </div>

      {/* Quick Corridor Shortcut Chips */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#A8B3C2] uppercase tracking-wider block">
          Quick Currency Corridors:
        </span>
        <div className="flex flex-wrap gap-2">
          {quickCorridors.map((c) => {
            const isMatch = fromCurrency === c.from && toCurrency === c.to;
            return (
              <button
                key={c.label}
                onClick={() => handleSelectCorridor(c.from, c.to)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isMatch
                    ? 'bg-[#00E676] text-[#06111F] shadow-sm'
                    : 'bg-[#0A1726] hover:bg-[#0D1B2A] text-white border border-white/10 hover:border-[#00E676]/30'
                }`}
              >
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Glassmorphic Converter Card */}
      <div className="rounded-3xl bg-[#0A1726] border border-white/10 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          
          {/* FROM COLUMN (5 cols) */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A8B3C2]">
              You Convert
            </label>
            <div className="p-4 rounded-2xl bg-[#06111F] border border-white/10 focus-within:border-[#00E676] transition-colors">
              <CurrencySelect
                value={fromCurrency}
                onChange={(code) => {
                  setFromCurrency(code);
                  setSearchParams({ from: code, to: toCurrency });
                }}
                align="left"
              />

              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full mt-3 bg-transparent text-3xl sm:text-4xl font-black text-white font-tabular focus:outline-none"
                placeholder="100"
              />
            </div>
          </div>

          {/* SWAP BUTTON (1 col) */}
          <div className="md:col-span-1 flex justify-center py-2 md:py-0">
            <button
              onClick={handleSwap}
              className={`p-3.5 rounded-2xl bg-[#0D1B2A] hover:bg-[#00E676] text-white hover:text-[#06111F] border border-white/10 hover:border-[#00E676] transition-all cursor-pointer shadow-lg active:scale-90 ${
                isSwapping ? 'rotate-180 duration-300' : ''
              }`}
              title="Swap Currencies"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* TO COLUMN (5 cols) */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A8B3C2]">
              You Receive (Estimated)
            </label>
            <div className="p-4 rounded-2xl bg-[#06111F] border border-white/10">
              <CurrencySelect
                value={toCurrency}
                onChange={(code) => {
                  setToCurrency(code);
                  setSearchParams({ from: fromCurrency, to: code });
                }}
                align="left"
              />

              <div className="mt-3 text-3xl sm:text-4xl font-black text-[#00E676] font-tabular truncate">
                {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

        </div>

        {/* Live Exchange Rate Math Banner */}
        <div className="p-5 rounded-2xl bg-[#06111F] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs text-[#A8B3C2] font-medium">Interbank Mid-Market Exchange Rate</div>
            <div className="text-base sm:text-lg font-black text-white font-tabular">
              1 {fromCurrency} = {unitRate.toLocaleString(undefined, { maximumFractionDigits: 4 })} {toCurrency}
            </div>
          </div>
          <div className="text-xs text-[#A8B3C2] text-center sm:text-right font-medium">
            Inverse: 1 {toCurrency} = {inverseRate.toLocaleString(undefined, { maximumFractionDigits: 4 })} {fromCurrency}
          </div>
        </div>

      </div>

      {/* Multiples & Conversion Matrix Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Table 1: Base to Target Multiples */}
        <div className="rounded-3xl bg-[#0A1726] border border-white/10 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-extrabold text-white text-base">
              Convert {fromCurrency} to {toCurrency}
            </h3>
            <span className="text-xs text-[#00E676] font-bold">Standard Multiples</span>
          </div>

          <div className="divide-y divide-white/5">
            {denominations.map((d) => (
              <div key={d} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-white font-tabular">
                  {d.toLocaleString()} {fromCurrency}
                </span>
                <span className="font-bold text-[#00E676] font-tabular">
                  {(d * unitRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Table 2: Target to Base Multiples (Reverse) */}
        <div className="rounded-3xl bg-[#0A1726] border border-white/10 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-extrabold text-white text-base">
              Convert {toCurrency} to {fromCurrency}
            </h3>
            <span className="text-xs text-[#A8B3C2] font-bold">Reverse Multiples</span>
          </div>

          <div className="divide-y divide-white/5">
            {denominations.map((d) => (
              <div key={d} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-white font-tabular">
                  {d.toLocaleString()} {toCurrency}
                </span>
                <span className="font-bold text-white font-tabular">
                  {(d * inverseRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {fromCurrency}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
