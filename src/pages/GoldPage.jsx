import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Calculator, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw,
  Coins,
  Scale,
  Award,
  ChevronRight,
  Info,
  FileText,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { fetchLiveMetals, calculateGoldLocalMetrics, DEFAULT_METALS } from '../services/metalsService';
import { boundedDecimalInput, calculateGoldEstimate, CALCULATOR_LIMITS } from '../utils/calculatorMath';

export default function GoldPage({ rates = {} }) {
  useSEO({
    title: 'Live Gold & Silver Bullion Rates Terminal | FGC Spot',
    description: 'Real-time spot prices for Gold (XAU) and Silver (XAG) per ounce, gram, and tola in USD and local currencies on FGC Spot.',
    canonical: '/gold'
  });

  const [searchParams] = useSearchParams();
  const usdToPkr = Number.isFinite(rates.PKR) && rates.PKR > 0 ? rates.PKR : null;
  const [selectedUnit, setSelectedUnit] = useState('tola'); // 'tola' | '10g' | 'gram' | 'oz'
  const [calcPurity, setCalcPurity] = useState('24K');
  const [calcWeight, setCalcWeight] = useState('1');
  const [calcUnit, setCalcUnit] = useState('tola');
  const [highlightedPurity, setHighlightedPurity] = useState(null);

  // Live Precious Metals State
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
        console.warn('Gold page metals fetch warning:', err);
      }
    };

    loadMetals();
    const interval = setInterval(loadMetals, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const purity = searchParams.get('purity');
    const unit = searchParams.get('unit');
    if (purity) {
      const pClean = purity.toUpperCase();
      setCalcPurity(pClean);
      setHighlightedPurity(pClean);
    }
    if (unit) {
      setSelectedUnit(unit.toLowerCase());
      setCalcUnit(unit.toLowerCase());
    }
    if (purity || unit) {
      setTimeout(() => {
        const el = document.getElementById(`gold-card-${(purity || '24K').toUpperCase()}`) || document.getElementById('gold-calculator');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      const timer = setTimeout(() => setHighlightedPurity(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Prioritize the same metals service as the global ticker; do not synthesize a quote.
  const goldSpotOzUsd = Number.isFinite(metalsData.gold?.price) && metalsData.gold.price > 0
    ? metalsData.gold.price
    : (Number.isFinite(rates.XAU) && rates.XAU > 0 ? Number((1 / rates.XAU).toFixed(2)) : null);
  const silverSpotOzUsd = Number.isFinite(metalsData.silver?.price) && metalsData.silver.price > 0
    ? metalsData.silver.price
    : (Number.isFinite(rates.XAG) && rates.XAG > 0 ? Number((1 / rates.XAG).toFixed(2)) : null);

  // Base calculations with calibrated Karachi Sarafa Association dynamic formula
  const goldMetrics = useMemo(() => {
    return calculateGoldLocalMetrics(goldSpotOzUsd, usdToPkr, true);
  }, [goldSpotOzUsd, usdToPkr]);

  const goldGram24K_Pkr = goldMetrics.pricePerGram24K;
  const goldTola24K_Pkr = goldMetrics.pricePerTola24K;
  const gold10g24K_Pkr = goldMetrics.pricePer10Gram24K;
  const goldOz24K_Pkr = goldMetrics.pricePerOunceLocal;

  const purities = [
    {
      karat: '24K',
      title: 'Pure Bullion Gold',
      fineness: '99.9% Pure Gold',
      desc: 'Institutional bullion bars, investment coins, and reserve bank standard.',
      factor: 1.0,
      badge: 'Investment Grade',
      accent: '#00E676'
    },
    {
      karat: '22K',
      title: 'Jewelry Standard Gold',
      fineness: '91.6% Pure Gold',
      desc: 'The benchmark standard for South Asian, Pakistani, and Gulf handcrafted jewelry.',
      factor: 22 / 24,
      badge: 'Most Popular',
      accent: '#F59E0B'
    },
    {
      karat: '21K',
      title: 'Middle East Gold',
      fineness: '87.5% Pure Gold',
      desc: 'Widely traded in Saudi Arabia, UAE, and GCC bridal markets.',
      factor: 21 / 24,
      badge: 'GCC Standard',
      accent: '#38BDF8'
    },
    {
      karat: '18K',
      title: 'Modern Fine Gold',
      fineness: '75.0% Pure Gold',
      desc: 'Premium Western and Italian fine jewelry with enhanced alloy durability.',
      factor: 18 / 24,
      badge: 'Italian Standard',
      accent: '#A78BFA'
    }
  ];

  // Helper to get price based on active unit
  const getPriceForPurity = (factor, karat) => {
    if (goldMetrics.pricePerTola24K === null || usdToPkr === null) {
      return { pkr: null, usd: null, label: selectedUnit === 'tola' ? 'Per Tola (11.66g)' : selectedUnit === '10g' ? 'Per 10 Grams' : selectedUnit === 'gram' ? 'Per 1 Gram' : 'Per Troy Oz (31.10g)' };
    }
    switch (selectedUnit) {
      case 'tola':
        if (karat === '24K') {
          return {
            pkr: goldMetrics.pricePerTola24K,
            usd: Math.round(goldMetrics.pricePerTola24K / usdToPkr),
            label: 'Per Tola (11.66g)'
          };
        }
        if (karat === '22K') {
          return {
            pkr: goldMetrics.pricePerTola22K,
            usd: Math.round(goldMetrics.pricePerTola22K / usdToPkr),
            label: 'Per Tola (11.66g)'
          };
        }
        if (karat === '21K') {
          return {
            pkr: goldMetrics.pricePerTola21K,
            usd: Math.round(goldMetrics.pricePerTola21K / usdToPkr),
            label: 'Per Tola (11.66g)'
          };
        }
        if (karat === '18K') {
          return {
            pkr: goldMetrics.pricePerTola18K,
            usd: Math.round(goldMetrics.pricePerTola18K / usdToPkr),
            label: 'Per Tola (11.66g)'
          };
        }
        return {
          pkr: Math.round(goldMetrics.pricePerTola24K * factor),
          usd: Math.round((goldMetrics.pricePerTola24K * factor) / usdToPkr),
          label: 'Per Tola (11.66g)'
        };
      case '10g':
        if (karat === '24K') {
          return {
            pkr: goldMetrics.pricePer10Gram24K,
            usd: Math.round(goldMetrics.pricePer10Gram24K / usdToPkr),
            label: 'Per 10 Grams'
          };
        }
        if (karat === '22K') {
          return {
            pkr: goldMetrics.pricePer10Gram22K,
            usd: Math.round(goldMetrics.pricePer10Gram22K / usdToPkr),
            label: 'Per 10 Grams'
          };
        }
        if (karat === '21K') {
          return {
            pkr: goldMetrics.pricePer10Gram21K,
            usd: Math.round(goldMetrics.pricePer10Gram21K / usdToPkr),
            label: 'Per 10 Grams'
          };
        }
        if (karat === '18K') {
          return {
            pkr: goldMetrics.pricePer10Gram18K,
            usd: Math.round(goldMetrics.pricePer10Gram18K / usdToPkr),
            label: 'Per 10 Grams'
          };
        }
        return {
          pkr: Math.round(goldMetrics.pricePer10Gram24K * factor),
          usd: Math.round((goldMetrics.pricePer10Gram24K * factor) / usdToPkr),
          label: 'Per 10 Grams'
        };
      case 'gram':
        if (karat === '24K') {
          return {
            pkr: goldMetrics.pricePerGram24K,
            usd: (goldMetrics.pricePerGram24K / usdToPkr).toFixed(2),
            label: 'Per 1 Gram'
          };
        }
        if (karat === '22K') {
          return {
            pkr: goldMetrics.pricePerGram22K,
            usd: (goldMetrics.pricePerGram22K / usdToPkr).toFixed(2),
            label: 'Per 1 Gram'
          };
        }
        if (karat === '21K') {
          return {
            pkr: goldMetrics.pricePerGram21K,
            usd: (goldMetrics.pricePerGram21K / usdToPkr).toFixed(2),
            label: 'Per 1 Gram'
          };
        }
        if (karat === '18K') {
          return {
            pkr: goldMetrics.pricePerGram18K,
            usd: (goldMetrics.pricePerGram18K / usdToPkr).toFixed(2),
            label: 'Per 1 Gram'
          };
        }
        return {
          pkr: Math.round(goldMetrics.pricePerGram24K * factor),
          usd: ((goldMetrics.pricePerGram24K * factor) / usdToPkr).toFixed(2),
          label: 'Per 1 Gram'
        };
      case 'oz':
        return {
          pkr: Math.round(goldOz24K_Pkr * factor),
          usd: Math.round(goldSpotOzUsd * factor),
          label: 'Per Troy Oz (31.10g)'
        };
      default:
        return { pkr: 0, usd: 0, label: '' };
    }
  };

  // Compute the quantity from the original ounce quote, rounding only the final value.
  const calculatedTotal = useMemo(() => {
    return calculateGoldEstimate({
      spotUsdPerOunce: goldSpotOzUsd, usdToPkr,
      quantity: calcWeight, unit: calcUnit, purity: calcPurity
    });
  }, [calcPurity, calcWeight, calcUnit, goldSpotOzUsd, usdToPkr]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-white font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/rates" className="hover:text-slate-900 dark:hover:text-white font-medium">Rates</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold">Gold &amp; Precious Metals</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-xs uppercase font-bold tracking-widest text-amber-500 dark:text-amber-400">
              BULLION &amp; COMMODITY DESK
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Indicative Gold &amp; Silver Rates
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B3C2] mt-2 max-w-2xl leading-relaxed">
            Indicative bullion conversions for 24K, 22K, 21K, and 18K gold from available commodity references and USD/PKR currency feeds. These are not official Karachi Sarafa retail price quotations.
          </p>
        </div>

        {/* Spot Summary Pills */}
        <div className="flex flex-wrap gap-3">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0A1726] border border-amber-500/20 text-right shadow-xs">
            <div className="text-[11px] text-amber-500 dark:text-amber-400 uppercase font-bold">Gold Spot (XAU/USD)</div>
            <div className="text-lg font-black text-slate-900 dark:text-white font-tabular">{goldSpotOzUsd !== null ? `$${goldSpotOzUsd.toLocaleString()}` : 'N/A'}</div>
            <div className="text-[10px] text-[#00E676] font-semibold flex items-center justify-end gap-0.5">
              <span>{Number.isFinite(metalsData.gold?.change) ? `${metalsData.gold.change >= 0 ? '+' : ''}${metalsData.gold.change}% 24h` : '24h change N/A'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-right shadow-xs">
            <div className="text-[11px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">Silver Spot (XAG/USD)</div>
            <div className="text-lg font-black text-slate-900 dark:text-white font-tabular">{silverSpotOzUsd !== null ? `$${silverSpotOzUsd.toFixed(2)}` : 'N/A'}</div>
            <div className="text-[10px] text-[#00E676] font-semibold flex items-center justify-end gap-0.5">
              <span>{Number.isFinite(metalsData.silver?.change) ? `${metalsData.silver.change >= 0 ? '+' : ''}${metalsData.silver.change}% 24h` : '24h change N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unit Switch Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white px-2">
          <Scale className="w-4 h-4 text-[#00E676]" />
          <span>Select Benchmark Unit:</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 w-full sm:w-auto">
          {[
            { id: 'tola', label: 'Per Tola' },
            { id: '10g', label: '10 Grams' },
            { id: 'gram', label: '1 Gram' },
            { id: 'oz', label: 'Troy Ounce' }
          ].map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedUnit(u.id)}
              className={`px-2 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center ${
                selectedUnit === u.id
                  ? 'bg-[#00E676] text-[#06111F] shadow-sm'
                  : 'text-slate-600 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Karat Purity Cards Grid */}
      <div id="gold-purity-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {purities.map((item) => {
          const price = getPriceForPurity(item.factor, item.karat);
          const isHighlighted = highlightedPurity === item.karat;
          return (
            <div
              key={item.karat}
              id={`gold-card-${item.karat}`}
              className={`rounded-3xl border p-6 transition-all duration-300 shadow-sm dark:shadow-xl backdrop-blur-xl space-y-5 flex flex-col justify-between group ${
                isHighlighted
                  ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400 shadow-2xl shadow-amber-500/30'
                  : 'bg-white dark:bg-[#0A1726]/80 hover:bg-slate-50 dark:hover:bg-[#0A1726] border-slate-200 dark:border-white/10 hover:border-amber-500/40'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-tabular">{item.karat}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#A8B3C2] border border-slate-200 dark:border-white/10">
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-xs text-amber-500 dark:text-amber-400 font-semibold mt-0.5">
                    {item.fineness}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#A8B3C2] mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Price Container */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-1">
                <div className="text-[11px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">{price.label}</div>
                <div className="text-2xl font-black text-[#00E676] font-tabular">
                  {price.pkr !== null ? `₨ ${price.pkr.toLocaleString()}` : 'N/A — quote unavailable'}
                </div>
                <div className="text-xs text-slate-500 dark:text-[#A8B3C2] font-semibold font-tabular">
                  {price.usd !== null ? `≈ $${price.usd.toLocaleString()} USD` : 'Verified benchmark pending'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Quick Bullion Calculator */}
      <div id="gold-calculator" className="rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Instant Bullion &amp; Jewelry Calculator
            </h2>
            <p className="text-xs text-slate-600 dark:text-[#A8B3C2]">
              Calculate an indicative gold value from verified spot and FX quotes. Dealer charges are not included.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
          
          <div className="min-w-0 lg:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#A8B3C2] mb-1.5">
              Gold Purity (Karat)
            </label>
            <select
              value={calcPurity}
              onChange={(e) => setCalcPurity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-[#00E676]"
            >
              <option value="24K">24K (Pure Bullion 99.9%)</option>
              <option value="22K">22K (Jewelry Standard 91.6%)</option>
              <option value="21K">21K (Middle East 87.5%)</option>
              <option value="18K">18K (Italian Fine 75.0%)</option>
            </select>
          </div>

          <div className="min-w-0 lg:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#A8B3C2] mb-1.5">
              Weight &amp; Measurement Unit
            </label>
            <div className="flex min-w-0 gap-2">
              <input
                type="number"
                min="0"
                max={CALCULATOR_LIMITS.goldQuantity}
                step="any"
                value={calcWeight}
                onChange={(e) => setCalcWeight(boundedDecimalInput(e.target.value, CALCULATOR_LIMITS.goldQuantity))}
                aria-label="Gold weight"
                className="min-w-0 flex-1 px-3 py-3 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-[#00E676]"
              />
              <select
                value={calcUnit}
                onChange={(e) => setCalcUnit(e.target.value)}
                className="w-28 shrink-0 px-3 py-3 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-[#00E676]"
              >
                <option value="tola">Tola</option>
                <option value="gram">Grams</option>
                <option value="10g">10g</option>
                <option value="oz">Troy Oz</option>
              </select>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-[#A8B3C2]">Maximum: {CALCULATOR_LIMITS.goldQuantity.toLocaleString()} units</p>
          </div>

          {/* Result Card */}
          <div className="min-w-0 lg:col-span-4 p-4 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-[#00E676]/30 space-y-2">
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold break-words">
                Total Estimated Value ({calculatedTotal.grams !== null ? calculatedTotal.grams.toLocaleString(undefined, { maximumFractionDigits: 6 }) : 'N/A'}g)
              </div>
              <div className="text-lg xl:text-xl font-black text-[#00E676] tabular-nums leading-tight [overflow-wrap:anywhere]">
                {calculatedTotal.totalPkr !== null ? `₨ ${calculatedTotal.totalPkr.toLocaleString()}` : 'N/A'}
              </div>
            </div>
            <div className="min-w-0 border-t border-slate-200 dark:border-white/10 pt-2">
              <div className="text-[10px] text-slate-500 dark:text-[#A8B3C2]">USD Equiv.</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums [overflow-wrap:anywhere]">
                {calculatedTotal.totalUsd !== null ? `$${calculatedTotal.totalUsd.toLocaleString()}` : 'N/A'}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Comprehensive Bullion Valuation Framework & Calculator Methodology */}
      <section className="rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Section Header */}
        <div className="space-y-2 border-b border-slate-200 dark:border-white/10 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>Calculation Methodology &amp; Data Transparency</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How FGC Spot Calculates Live Gold &amp; Bullion Benchmarks
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            Complete mathematical formulas, data sourcing protocols, update frequencies, and buyer valuation checklists for Pakistani and international precious metals markets.
          </p>
        </div>

        {/* 1. What This Tool Does */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-[#00E676]" />
            <span>1. What This Tool Does</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed">
            The FGC Spot Gold &amp; Bullion Terminal converts available international commodity reference quotes into indicative bullion parity values by weight and purity. These calculated values are not official local wholesale or retail quotes. When a feed is unavailable, the related price is shown as N/A.
          </p>
        </div>

        {/* 2. Mathematical Formulas Used */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#00E676]" />
            <span>2. Mathematical Formulas &amp; Conversion Parity</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-2">
              <span className="text-xs font-bold text-[#00E676] uppercase tracking-wider">24K Pure Bullion Base Formula</span>
              <div className="font-mono text-xs sm:text-sm bg-white dark:bg-[#0D1B2A] p-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200">
                Indicative 24K / Tola = (Reference_USD / 31.1035) &times; USD_PKR &times; 11.664
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Uses a 31.1034768g troy ounce and a 11.664g tola. No unsourced local premium, taxes, or fabrication charges are included.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-2">
              <span className="text-xs font-bold text-[#00E676] uppercase tracking-wider">Karat Purity Derivations</span>
              <div className="space-y-1.5 font-mono text-xs bg-white dark:bg-[#0D1B2A] p-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200">
                <div>&bull; 22K (Jewelry) = 24K Rate &times; (22 / 24) [91.67% fine gold]</div>
                <div>&bull; 21K (Middle East) = 24K Rate &times; (21 / 24) [87.50% fine gold]</div>
                <div>&bull; 18K (Fine Chains) = 24K Rate &times; (18 / 24) [75.00% fine gold]</div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Purity ratios follow statutory international hallmark fineness (916, 875, and 750 parts per thousand).
              </p>
            </div>
          </div>
        </div>

        {/* 3. Verified Data Sources & Update Frequency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00E676]" />
              <span>3. Data Sourcing &amp; Verification</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#00E676] font-bold">&bull;</span>
                <span><strong>International References:</strong> Available observations can come from Yahoo commodity futures, PAXG trading quotes, or currency-metal references. These are not interchangeable with an LBMA fixing or a local jeweller quote.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00E676] font-bold">&bull;</span>
                <span><strong>Currency Translation:</strong> USD/PKR observations are requested from public exchange-rate providers; the display is unavailable if an adequate FX observation is missing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00E676] font-bold">&bull;</span>
                <span><strong>Local Retail Quotes:</strong> No automated verification against APSGJA closing sheets is implemented. Contact a licensed local dealer for a transaction-ready Sarafa quote.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#00E676]" />
              <span>4. Update Frequency &amp; Latency</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#00E676] font-bold">&bull;</span>
                <span><strong>Market References:</strong> Values refresh when the source endpoint is requested; updates and outages depend on the upstream provider.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00E676] font-bold">&bull;</span>
                <span><strong>Domestic Sarafa Rates:</strong> This page does not ingest official association rate sheets. Its PKR amounts are mathematical estimates only.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00E676] font-bold">&bull;</span>
                <span><strong>Client Caching:</strong> Previously received values may be reused briefly (up to one minute) before requesting another observation.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 5. Data Limitations (Spot vs Retail Jewelry) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>5. Data Limitations: Wholesale Spot vs. Retail Jewelry Costs</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed">
            The rates displayed on FGC Spot represent pure, unworked wholesale bullion value. When purchasing wearable jewelry at retail bazaars, total invoice amounts will be higher due to:
          </p>
          <ul className="text-xs text-slate-600 dark:text-[#A8B3C2] space-y-1 pl-4 list-disc">
            <li><strong>Making Charges (Mazdoori / Kaarigari):</strong> Artisan fabrication fees ranging from Rs. 1,200 to Rs. 4,000+ per tola depending on design intricacy.</li>
            <li><strong>Stone Weight Deductions (Katt):</strong> Precious or semi-precious stones, wax, and pearls must be weighed separately and deducted from the gross weight before calculating gold price.</li>
            <li><strong>Retail Taxes:</strong> Applicable provincial sales taxes on services and retail merchant card processing fees.</li>
          </ul>
        </div>

        {/* 6. Practical Calculation Example */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00E676]" />
            <span>6. Practical Buyer's Example: Evaluating a 2.5 Tola 22K Bangle</span>
          </h3>
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed">
            <p>
              Suppose a jeweler quotes Rs. 730,000 for a 22-karat bridal bangle weighing exactly 2.5 tolas (29.16 grams) with Rs. 2,000/tola making charges, when 24K spot is Rs. 284,500/tola:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 font-mono text-xs">
              <li><strong>Find 22K Tola Rate:</strong> Rs. 284,500 &times; (22 / 24) = <strong>Rs. 260,792 per tola</strong>.</li>
              <li><strong>Calculate Net Metal Value:</strong> 2.5 tolas &times; Rs. 260,792 = <strong>Rs. 651,980</strong>.</li>
              <li><strong>Add Fair Making Charges:</strong> 2.5 tolas &times; Rs. 2,000 = <strong>Rs. 5,000</strong>.</li>
              <li><strong>Transparent Target Total:</strong> Rs. 651,980 + Rs. 5,000 = <strong>Rs. 656,980</strong>.</li>
            </ol>
            <p className="text-xs text-emerald-600 dark:text-[#00E676] font-semibold pt-1">
              ✓ Transparent Result: If the shop quoted Rs. 730,000, you are being overcharged by over Rs. 73,000 in hidden retail markup!
            </p>
          </div>
        </div>

        {/* 7. Regulatory & Financial Disclaimers */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-100 dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 text-[11px] leading-relaxed text-slate-500 dark:text-[#A8B3C2] space-y-1.5">
          <p className="font-bold uppercase tracking-wider text-slate-800 dark:text-white">Precious Metals Regulatory Advisory &amp; Risk Disclosure</p>
          <p>
            FGC Spot is a digital financial publishing platform and market data aggregator. We do not sell physical bullion, execute jewelry transactions, or act as licensed gold dealers under the Securities and Exchange Commission of Pakistan (SECP) or State Bank of Pakistan (SBP). All bullion calculators and price feeds are provided strictly for educational and comparative research purposes. Commodity markets carry price volatility risk. Verify hallmarking assay certificates and itemized invoices with licensed bullion merchants prior to executing transactions.
          </p>
        </div>

      </section>

    </div>
  );
}
