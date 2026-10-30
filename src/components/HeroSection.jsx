import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeftRight,
  TrendingUp, 
  TrendingDown, 
  Zap, 
  LineChart, 
  Coins, 
  Scale,
  Copy,
  Check,
  ShieldCheck, 
  Globe, 
  Sparkles,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { getCurrencyFlagUrl } from '../utils/currencyFlags';
import { fetchLiveMetals, calculateGoldLocalMetrics, DEFAULT_METALS } from '../services/metalsService';
import { convertCurrency, getExchangeRate, DEFAULT_RATES } from '../services/forexService';
import CurrencySelect from './CurrencySelect';
import CurrencyFlag from './CurrencyFlag';

export default function HeroSection({ rates, cryptoList }) {
  const navigate = useNavigate();
  const [calculatorMode, setCalculatorMode] = useState('fx'); // 'fx' | 'gold' | 'terminal'
  const [tickEffect, setTickEffect] = useState(false);

  // FX Calculator State
  const [fxAmount, setFxAmount] = useState('1000');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('PKR');
  const [copied, setCopied] = useState(false);

  // Gold Calculator State
  const [goldUnit, setGoldUnit] = useState('tola'); // 'tola' | '10g' | 'gram' | 'oz'
  const [goldPurity, setGoldPurity] = useState('24K'); // '24K' | '22K' | '21K' | '18K'
  const [goldQty, setGoldQty] = useState('1');
  const [includeMaking, setIncludeMaking] = useState(false);

  // Live Metals State
  const [metalsData, setMetalsData] = useState(() => ({
    gold: DEFAULT_METALS.gold,
    silver: DEFAULT_METALS.silver,
    lastUpdated: DEFAULT_METALS.lastUpdated,
    source: DEFAULT_METALS.source
  }));

  useEffect(() => {
    let isMounted = true;
    const loadMetals = async () => {
      try {
        const res = await fetchLiveMetals();
        if (isMounted && res && res.gold && res.silver) {
          setMetalsData({
            gold: res.gold,
            silver: res.silver,
            lastUpdated: res.lastUpdated,
            source: res.source
          });
        }
      } catch (err) {
        console.warn('HeroSection metals fetch warning:', err);
      }
    };
    loadMetals();
    return () => { isMounted = false; };
  }, []);

  // Periodic subtle tick animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTickEffect(true);
      setTimeout(() => setTickEffect(false), 800);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const activeRates = useMemo(() => {
    return (rates && Object.keys(rates).length > 0) ? rates : DEFAULT_RATES;
  }, [rates]);

  const usdToPkr = activeRates.PKR || 277.10;
  const eurVal = activeRates.EUR || 0.92;
  const gbpVal = activeRates.GBP || 0.79;
  const sarVal = activeRates.SAR || 3.75;
  const aedVal = activeRates.AED || 3.6725;

  const eurToPkr = (usdToPkr / eurVal).toFixed(2);
  const gbpToPkr = (usdToPkr / gbpVal).toFixed(2);
  const sarToPkr = (usdToPkr / sarVal).toFixed(2);
  const aedToPkr = (usdToPkr / aedVal).toFixed(2);

  const goldPriceUsd = (typeof activeRates?.XAU === 'number' && !isNaN(activeRates.XAU) && isFinite(activeRates.XAU) && activeRates.XAU > 0)
    ? Number((1 / activeRates.XAU).toFixed(2))
    : (metalsData?.gold?.price || 4158.00);

  const silverPriceUsd = (typeof activeRates?.XAG === 'number' && !isNaN(activeRates.XAG) && isFinite(activeRates.XAG) && activeRates.XAG > 0)
    ? Number((1 / activeRates.XAG).toFixed(2))
    : (metalsData?.silver?.price || 57.20);

  const goldMetrics = useMemo(() => {
    return calculateGoldLocalMetrics(goldPriceUsd, usdToPkr, true);
  }, [goldPriceUsd, usdToPkr]);

  const goldPkrPerTola24K = goldMetrics?.pricePerTola24K || 432500;
  const goldPkrPerTola22K = goldMetrics?.pricePerTola22K || 396458;
  const goldGram24K = goldMetrics?.pricePerGram24K || 37080;
  const goldChange = metalsData?.gold?.change ?? 0.42;

  // Currency Calculations
  const numericAmount = parseFloat(fxAmount) || 0;
  const convertedFxValue = useMemo(() => {
    return convertCurrency(numericAmount, baseCurrency, targetCurrency, activeRates);
  }, [numericAmount, baseCurrency, targetCurrency, activeRates]);

  const directFxRate = useMemo(() => {
    return getExchangeRate(baseCurrency, targetCurrency, activeRates);
  }, [baseCurrency, targetCurrency, activeRates]);

  const inverseFxRate = useMemo(() => {
    return getExchangeRate(targetCurrency, baseCurrency, activeRates);
  }, [baseCurrency, targetCurrency, activeRates]);

  const handleSwapCurrencies = () => {
    setBaseCurrency(targetCurrency);
    setTargetCurrency(baseCurrency);
  };

  const handleCopyFxResult = () => {
    if (convertedFxValue <= 0) return;
    const text = `${numericAmount} ${baseCurrency} = ${convertedFxValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${targetCurrency} (via FGC Spot)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Gold Calculations
  const purityFactors = {
    '24K': 1.0,
    '22K': 22 / 24,
    '21K': 21 / 24,
    '18K': 18 / 24
  };

  const unitWeights = {
    tola: 11.6638,
    '10g': 10.0,
    gram: 1.0,
    oz: 31.1035
  };

  const goldCalcResult = useMemo(() => {
    const qty = parseFloat(goldQty) || 0;
    const factor = purityFactors[goldPurity] || 1.0;
    const weightInGrams = (unitWeights[goldUnit] || 11.6638) * qty;
    const basePkr = Math.round(weightInGrams * goldGram24K * factor);
    const makingChargeAmount = includeMaking ? Math.round(basePkr * 0.09) : 0; // ~9% standard jeweler making charge / katt
    const finalPkr = basePkr + makingChargeAmount;
    const finalUsd = Math.round(finalPkr / usdToPkr);
    const perGramPkr = Math.round(goldGram24K * factor);

    return {
      basePkr,
      makingChargeAmount,
      finalPkr,
      finalUsd,
      perGramPkr,
      weightInGrams
    };
  }, [goldQty, goldPurity, goldUnit, includeMaking, goldGram24K, usdToPkr]);

  const fxPresets = [100, 500, 1000, 2500, 5000];

  return (
    <section className="relative overflow-hidden pt-2 pb-8 sm:pt-6 sm:pb-14 lg:pt-8 lg:pb-18 border-b border-slate-200 dark:border-white/10">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00E676]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#06B6D4]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 sm:space-y-8">
        
        {/* TOP BULLION & FOREX SPOT TICKER RIBBON */}
        <div className="w-full overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-max text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>24K TOLA:</span>
              <span className="font-mono text-slate-900 dark:text-white">₨{goldPkrPerTola24K.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
              <span>22K Tola:</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">₨{goldPkrPerTola22K.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 font-medium text-slate-700 dark:text-slate-300">
              <span className="text-[#00E676] font-bold">XAU/USD:</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">${goldPriceUsd.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 font-medium text-slate-700 dark:text-slate-300">
              <span className="text-cyan-500 font-bold">USD/PKR:</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">₨{usdToPkr.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 font-medium text-slate-700 dark:text-slate-300">
              <span className="text-blue-500 font-bold">EUR/PKR:</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">₨{eurToPkr}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 font-medium text-slate-700 dark:text-slate-300">
              <span className="text-purple-500 font-bold">GBP/PKR:</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">₨{gbpToPkr}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 font-medium text-slate-700 dark:text-slate-300">
              <span className="text-emerald-500 font-bold">AED/PKR:</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">₨{aedToPkr}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 font-medium text-slate-700 dark:text-slate-300">
              <span className="text-amber-500 font-bold">SAR/PKR:</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">₨{sarToPkr}</span>
            </div>
          </div>
        </div>

        {/* MAIN WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT / CENTER: INTERACTIVE FINANCIAL UTILITY WORKSPACE */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Header Title & Subtitle */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#00E676] text-xs font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                <span className="uppercase tracking-wider text-[11px]">Instant Financial Calculation Suite</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Live Currency &amp; Sarafa Gold{' '}
                <span className="bg-gradient-to-r from-[#00E676] to-[#00FF88] bg-clip-text text-transparent">
                  Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-[#A8B3C2] font-medium max-w-2xl">
                Convert 160+ world currencies at official interbank rates, calculate Karachi Sarafa gold bullion purity prices per tola, and track streaming asset telemetry.
              </p>
            </div>

            {/* TAB SELECTOR: Currency vs Gold vs Streaming */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 max-w-md">
              <button
                onClick={() => setCalculatorMode('fx')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  calculatorMode === 'fx'
                    ? 'bg-[#00E676] text-[#06111F] shadow-md shadow-[#00E676]/20'
                    : 'text-slate-600 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Forex Calculator</span>
              </button>

              <button
                onClick={() => setCalculatorMode('gold')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  calculatorMode === 'gold'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-600 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>Gold &amp; Tola</span>
              </button>

              <button
                onClick={() => setCalculatorMode('terminal')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  calculatorMode === 'terminal'
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Live Feed</span>
              </button>
            </div>

            {/* INTERACTIVE WORKSPACE CARD */}
            <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 shadow-xl backdrop-blur-xl relative">
              
              {/* ========================================================
                  TAB 1: CURRENCY CONVERTER WORKSPACE
                  ======================================================== */}
              {calculatorMode === 'fx' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Amount & Currency Pickers */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    
                    {/* Amount Input */}
                    <div className="md:col-span-5 space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A8B3C2]">
                        You Send / Convert
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={fxAmount}
                          onChange={(e) => setFxAmount(e.target.value)}
                          placeholder="1000"
                          className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold text-lg focus:outline-none focus:border-[#00E676] transition-colors"
                        />
                      </div>
                    </div>

                    {/* From Currency */}
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A8B3C2]">
                        From
                      </label>
                      <CurrencySelect
                        value={baseCurrency}
                        onChange={(curr) => setBaseCurrency(curr.code)}
                      />
                    </div>

                    {/* Swap Button */}
                    <div className="md:col-span-1 flex justify-center pt-5">
                      <button
                        onClick={handleSwapCurrencies}
                        className="p-3 rounded-2xl bg-slate-100 dark:bg-[#0D1B2A] hover:bg-[#00E676]/10 hover:text-[#00E676] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white transition-all cursor-pointer active:scale-90"
                        title="Swap Currencies"
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* To Currency */}
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A8B3C2]">
                        To
                      </label>
                      <CurrencySelect
                        value={targetCurrency}
                        onChange={(curr) => setTargetCurrency(curr.code)}
                      />
                    </div>

                  </div>

                  {/* Quick Preset Amount Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-[#A8B3C2] mr-1">Quick Presets:</span>
                    {fxPresets.map(val => (
                      <button
                        key={val}
                        onClick={() => setFxAmount(String(val))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                          fxAmount === String(val)
                            ? 'bg-[#00E676] text-[#06111F] font-bold'
                            : 'bg-slate-100 dark:bg-[#06111F] text-slate-700 dark:text-[#A8B3C2] hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                      >
                        {val.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {/* Converted Output Display Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#A8B3C2]">
                        Calculated Exchange Value
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono flex items-baseline gap-2">
                        <span>{convertedFxValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-base sm:text-lg text-[#00E676] font-sans font-bold">{targetCurrency}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-[#A8B3C2] font-mono">
                        1 {baseCurrency} = {directFxRate.toFixed(4)} {targetCurrency} • 1 {targetCurrency} = {inverseFxRate.toFixed(6)} {baseCurrency}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      <button
                        onClick={handleCopyFxResult}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 hover:border-[#00E676] text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-[#00E676]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied!' : 'Copy Result'}</span>
                      </button>

                      <button
                        onClick={() => navigate(`/converter?from=${baseCurrency}&to=${targetCurrency}`)}
                        className="px-3.5 py-2 rounded-xl bg-[#00E676] hover:bg-[#00FF88] text-[#06111F] text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <span>Full Matrix</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Popular Pakistan Corridors Bar */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#A8B3C2]">
                      Popular Pakistani Remittance Corridors (Instant Interbank Rates):
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div 
                        onClick={() => { setBaseCurrency('USD'); setTargetCurrency('PKR'); }}
                        className="p-2 rounded-xl bg-white dark:bg-[#0D1B2A] border border-slate-200/80 dark:border-white/5 hover:border-[#00E676]/40 cursor-pointer transition-all"
                      >
                        <div className="text-slate-500 dark:text-[#A8B3C2] text-[10px]">USD to PKR</div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">₨{usdToPkr.toFixed(2)}</div>
                      </div>

                      <div 
                        onClick={() => { setBaseCurrency('GBP'); setTargetCurrency('PKR'); }}
                        className="p-2 rounded-xl bg-white dark:bg-[#0D1B2A] border border-slate-200/80 dark:border-white/5 hover:border-[#00E676]/40 cursor-pointer transition-all"
                      >
                        <div className="text-slate-500 dark:text-[#A8B3C2] text-[10px]">GBP to PKR</div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">₨{gbpToPkr}</div>
                      </div>

                      <div 
                        onClick={() => { setBaseCurrency('AED'); setTargetCurrency('PKR'); }}
                        className="p-2 rounded-xl bg-white dark:bg-[#0D1B2A] border border-slate-200/80 dark:border-white/5 hover:border-[#00E676]/40 cursor-pointer transition-all"
                      >
                        <div className="text-slate-500 dark:text-[#A8B3C2] text-[10px]">AED to PKR</div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">₨{aedToPkr}</div>
                      </div>

                      <div 
                        onClick={() => { setBaseCurrency('SAR'); setTargetCurrency('PKR'); }}
                        className="p-2 rounded-xl bg-white dark:bg-[#0D1B2A] border border-slate-200/80 dark:border-white/5 hover:border-[#00E676]/40 cursor-pointer transition-all"
                      >
                        <div className="text-slate-500 dark:text-[#A8B3C2] text-[10px]">SAR to PKR</div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">₨{sarToPkr}</div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ========================================================
                  TAB 2: KARACHI SARAFA GOLD & TOLA CALCULATOR
                  ======================================================== */}
              {calculatorMode === 'gold' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* Selectors Grid: Unit & Purity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Unit Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A8B3C2] flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-amber-500" />
                        <span>Weight Measurement Unit</span>
                      </label>
                      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
                        {[
                          { id: 'tola', label: '1 Tola', sub: '11.66g' },
                          { id: '10g', label: '10 Grams', sub: '10.0g' },
                          { id: 'gram', label: '1 Gram', sub: '1.0g' },
                          { id: 'oz', label: 'Troy Oz', sub: '31.10g' }
                        ].map(u => (
                          <button
                            key={u.id}
                            onClick={() => setGoldUnit(u.id)}
                            className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                              goldUnit === u.id
                                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                                : 'text-slate-600 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <div className="text-xs font-bold leading-tight">{u.label}</div>
                            <div className="text-[10px] opacity-75">{u.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Purity Karat Selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A8B3C2] flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        <span>Gold Purity Standard</span>
                      </label>
                      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
                        {[
                          { id: '24K', label: '24K', sub: '99.9%' },
                          { id: '22K', label: '22K', sub: '91.6%' },
                          { id: '21K', label: '21K', sub: '87.5%' },
                          { id: '18K', label: '18K', sub: '75.0%' }
                        ].map(p => (
                          <button
                            key={p.id}
                            onClick={() => setGoldPurity(p.id)}
                            className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                              goldPurity === p.id
                                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                                : 'text-slate-600 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <div className="text-xs font-bold leading-tight">{p.label}</div>
                            <div className="text-[10px] opacity-75">{p.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Quantity & Jeweler Katt Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A8B3C2]">
                        Quantity ({goldUnit.toUpperCase()})
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={goldQty}
                        onChange={(e) => setGoldQty(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold text-base focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    <div className="pt-5 sm:pt-6">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={includeMaking}
                          onChange={(e) => setIncludeMaking(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 border-slate-300 focus:ring-amber-500"
                        />
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          Include Jeweler Making Charges / Katt (~9%)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Calculated Output Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Karachi Sarafa Estimated Value ({goldQty} {goldUnit.toUpperCase()} of {goldPurity})
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono flex items-baseline gap-2">
                        <span>₨{goldCalcResult.finalPkr.toLocaleString()}</span>
                        <span className="text-sm font-normal text-slate-500 dark:text-[#A8B3C2]">
                          (~${goldCalcResult.finalUsd.toLocaleString()} USD)
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-[#A8B3C2] font-mono">
                        Per Gram Benchmark: ₨{goldCalcResult.perGramPkr.toLocaleString()} • Total Weight: {goldCalcResult.weightInGrams.toFixed(2)}g
                        {includeMaking && ` (Includes ₨${goldCalcResult.makingChargeAmount.toLocaleString()} making)`}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/gold?purity=${goldPurity}&unit=${goldUnit}`)}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
                    >
                      <span>Full Bullion Terminal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              )}

              {/* ========================================================
                  TAB 3: LIVE STREAMING MARKET FEED
                  ======================================================== */}
              {calculatorMode === 'terminal' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-white/5">
                    <span className="font-bold text-slate-500 dark:text-[#A8B3C2] uppercase">Asset / Pair</span>
                    <span className="font-bold text-slate-500 dark:text-[#A8B3C2] uppercase">Live Rate</span>
                    <span className="font-bold text-slate-500 dark:text-[#A8B3C2] uppercase">24h Momentum</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: 'US Dollar (Interbank)', code: 'USD/PKR', rate: `₨${usdToPkr.toFixed(2)}`, change: '+0.04%', up: true, link: '/rates' },
                      { name: 'Gold 24K / Tola (Sarafa)', code: 'GOLD 24K', rate: `₨${goldPkrPerTola24K.toLocaleString()}`, change: '+0.42%', up: true, link: '/gold' },
                      { name: 'Gold 22K / Tola (Jewelry)', code: 'GOLD 22K', rate: `₨${goldPkrPerTola22K.toLocaleString()}`, change: '+0.42%', up: true, link: '/gold' },
                      { name: 'Euro (Interbank)', code: 'EUR/PKR', rate: `₨${eurToPkr}`, change: '+0.18%', up: true, link: '/rates' },
                      { name: 'British Pound (Interbank)', code: 'GBP/PKR', rate: `₨${gbpToPkr}`, change: '-0.12%', up: false, link: '/rates' },
                      { name: 'Saudi Riyal (Interbank)', code: 'SAR/PKR', rate: `₨${sarToPkr}`, change: '+0.01%', up: true, link: '/rates' },
                      { name: 'UAE Dirham (Interbank)', code: 'AED/PKR', rate: `₨${aedToPkr}`, change: '+0.02%', up: true, link: '/rates' },
                    ].map(item => (
                      <div
                        key={item.code}
                        onClick={() => navigate(item.link)}
                        className={`flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#06111F] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/5 transition-all cursor-pointer ${
                          tickEffect ? 'border-[#00E676]/30' : ''
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{item.code}</div>
                          <div className="text-[10px] text-slate-500 dark:text-[#A8B3C2]">{item.name}</div>
                        </div>

                        <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                          {item.rate}
                        </div>

                        <div className={`text-xs font-bold flex items-center gap-0.5 ${
                          item.up ? 'text-emerald-500 dark:text-[#00E676]' : 'text-rose-500'
                        }`}>
                          {item.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{item.change}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* RIGHT COLUMN: INSTITUTIONAL MARKET SNAPSHOT & DIRECT JUMP PILLS */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Live Terminal Summary Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-ping" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Institutional Benchmark Feed
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 px-2 py-0.5 rounded-full">
                  Live SBP + Sarafa
                </span>
              </div>

              {/* Benchmark Item 1: Gold 24K */}
              <div 
                onClick={() => navigate('/gold')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-[#06111F] hover:bg-amber-500/10 border border-slate-200/80 dark:border-white/5 hover:border-amber-500/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Gold 24K / Tola</span>
                  <span className="text-amber-500 font-mono font-bold text-[11px]">+0.42%</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-black text-slate-900 dark:text-white font-mono group-hover:text-amber-500 transition-colors">
                    ₨{goldPkrPerTola24K.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-400">Karachi Sarafa</span>
                </div>
              </div>

              {/* Benchmark Item 2: USD/PKR */}
              <div 
                onClick={() => navigate('/rates')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-[#06111F] hover:bg-[#00E676]/10 border border-slate-200/80 dark:border-white/5 hover:border-[#00E676]/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">USD to PKR</span>
                  <span className="text-[#00E676] font-mono font-bold text-[11px]">Interbank SBP</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-black text-slate-900 dark:text-white font-mono group-hover:text-[#00E676] transition-colors">
                    ₨{usdToPkr.toFixed(2)}
                  </div>
                  <span className="text-[11px] text-slate-400">Open: ~₨278.45</span>
                </div>
              </div>

              {/* Benchmark Item 3: PSX KSE-100 */}
              <div 
                onClick={() => navigate('/stocks')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-[#06111F] hover:bg-blue-500/10 border border-slate-200/80 dark:border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">PSX KSE-100 Index</span>
                  <span className="text-blue-500 font-mono font-bold text-[11px]">+1.18%</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-black text-slate-900 dark:text-white font-mono group-hover:text-blue-500 transition-colors">
                    114,850 pts
                  </div>
                  <span className="text-[11px] text-slate-400">Karachi Floor</span>
                </div>
              </div>

              {/* Benchmark Item 4: Spot Gold Oz */}
              <div 
                onClick={() => navigate('/gold')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-[#06111F] hover:bg-amber-500/10 border border-slate-200/80 dark:border-white/5 hover:border-amber-500/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Spot Gold (XAU/USD)</span>
                  <span className="text-amber-500 font-mono font-bold text-[11px]">International</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-black text-slate-900 dark:text-white font-mono group-hover:text-amber-500 transition-colors">
                    ${goldPriceUsd.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-400">Per Troy Oz</span>
                </div>
              </div>

            </div>

            {/* Platform Quick Jump Pill Links */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => navigate('/stocks')}
                className="p-3 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 hover:border-[#00E676] text-slate-800 dark:text-white transition-all flex items-center justify-between shadow-xs cursor-pointer"
              >
                <span>PSX Equities</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#00E676]" />
              </button>

              <button
                onClick={() => navigate('/charts')}
                className="p-3 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 hover:border-[#00E676] text-slate-800 dark:text-white transition-all flex items-center justify-between shadow-xs cursor-pointer"
              >
                <span>Live Charts</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#00E676]" />
              </button>

              <button
                onClick={() => navigate('/gold')}
                className="p-3 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 hover:border-amber-500 text-slate-800 dark:text-white transition-all flex items-center justify-between shadow-xs cursor-pointer"
              >
                <span>Gold Bullion</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
              </button>

              <button
                onClick={() => navigate('/news')}
                className="p-3 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 hover:border-blue-500 text-slate-800 dark:text-white transition-all flex items-center justify-between shadow-xs cursor-pointer"
              >
                <span>News Wire</span>
                <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
