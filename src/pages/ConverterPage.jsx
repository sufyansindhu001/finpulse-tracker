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
import { getCurrencyFlagUrl } from '../utils/currencyFlags';

export default function ConverterPage({ rates = {} }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [amount, setAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState(searchParams.get('from') || 'USD');
  const [toCurrency, setToCurrency] = useState(searchParams.get('to') || 'PKR');
  const [isSwapping, setIsSwapping] = useState(false);

  const currencyCodes = useMemo(() => {
    return Object.keys(rates).filter(c => c !== 'XAU' && c !== 'XAG').sort();
  }, [rates]);

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
            <div className="p-3 rounded-2xl bg-[#06111F] border border-white/10 focus-within:border-[#00E676] transition-colors">
              <div className="flex items-center gap-3">
                <img 
                  src={getCurrencyFlagUrl(fromCurrency)} 
                  alt={fromCurrency} 
                  className="w-7 h-5 rounded object-cover shadow-xs" 
                />
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="bg-transparent text-white font-black text-lg focus:outline-none cursor-pointer"
                >
                  {currencyCodes.map(code => (
                    <option key={code} value={code} className="bg-[#06111F] text-white">
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full mt-2 bg-transparent text-3xl sm:text-4xl font-black text-white font-tabular focus:outline-none"
                placeholder="100"
              />
            </div>
          </div>

          {/* SWAP BUTTON (1 col) */}
          <div className="md:col-span-1 flex justify-center">
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
            <div className="p-3 rounded-2xl bg-[#06111F] border border-white/10">
              <div className="flex items-center gap-3">
                <img 
                  src={getCurrencyFlagUrl(toCurrency)} 
                  alt={toCurrency} 
                  className="w-7 h-5 rounded object-cover shadow-xs" 
                />
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="bg-transparent text-white font-black text-lg focus:outline-none cursor-pointer"
                >
                  {currencyCodes.map(code => (
                    <option key={code} value={code} className="bg-[#06111F] text-white">
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-2 text-3xl sm:text-4xl font-black text-[#00E676] font-tabular truncate">
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
            <div className="text-xs text-[#00E676] font-semibold">
              Inverse: 1 {toCurrency} = {inverseRate.toFixed(6)} {fromCurrency}
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white">
            <ShieldCheck className="w-4 h-4 text-[#00E676]" />
            <span>0.00% Zero-Markup Pricing</span>
          </div>
        </div>

      </div>

      {/* Denominations Multiples Table */}
      <div className="rounded-3xl bg-[#0A1726] border border-white/10 p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-lg font-black text-white">
          Convert {fromCurrency} to {toCurrency} Multiples Table
        </h3>
        <p className="text-xs text-[#A8B3C2]">
          Instant breakdown across common transaction sizes:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {denominations.map((denom) => (
            <div 
              key={denom}
              className="p-3.5 rounded-xl bg-[#06111F] border border-white/10 flex items-center justify-between font-tabular"
            >
              <span className="text-sm font-bold text-white">
                {denom.toLocaleString()} {fromCurrency}
              </span>
              <span className="text-sm font-extrabold text-[#00E676]">
                {(denom * unitRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
