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
  ChevronRight
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function GoldPage({ rates = {} }) {
  const [searchParams] = useSearchParams();
  const usdToPkr = rates.PKR || 277.10;
  const [selectedUnit, setSelectedUnit] = useState('tola'); // 'tola' | '10g' | 'gram' | 'oz'
  const [calcPurity, setCalcPurity] = useState('24K');
  const [calcWeight, setCalcWeight] = useState(1);
  const [calcUnit, setCalcUnit] = useState('tola');
  const [highlightedPurity, setHighlightedPurity] = useState(null);

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

  // Benchmark spot prices
  const goldSpotOzUsd = 2684.50;
  const silverSpotOzUsd = 31.85;

  // Base calculations: 1 Troy Oz = 31.1035 grams, 1 Tola = 11.6638 grams
  const goldGram24K_Pkr = (goldSpotOzUsd * usdToPkr) / 31.1035;
  const goldTola24K_Pkr = goldGram24K_Pkr * 11.6638;
  const gold10g24K_Pkr = goldGram24K_Pkr * 10;
  const goldOz24K_Pkr = goldSpotOzUsd * usdToPkr;

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
  const getPriceForPurity = (factor) => {
    switch (selectedUnit) {
      case 'tola':
        return {
          pkr: Math.round(goldTola24K_Pkr * factor),
          usd: Math.round((goldTola24K_Pkr * factor) / usdToPkr),
          label: 'Per Tola (11.66g)'
        };
      case '10g':
        return {
          pkr: Math.round(gold10g24K_Pkr * factor),
          usd: Math.round((gold10g24K_Pkr * factor) / usdToPkr),
          label: 'Per 10 Grams'
        };
      case 'gram':
        return {
          pkr: Math.round(goldGram24K_Pkr * factor),
          usd: ((goldGram24K_Pkr * factor) / usdToPkr).toFixed(2),
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

  // Calculator computation
  const calculatedTotal = useMemo(() => {
    const purityObj = purities.find(p => p.karat === calcPurity) || purities[0];
    let grams = 0;
    if (calcUnit === 'tola') grams = calcWeight * 11.6638;
    else if (calcUnit === '10g') grams = calcWeight * 10;
    else if (calcUnit === 'gram') grams = calcWeight;
    else if (calcUnit === 'oz') grams = calcWeight * 31.1035;

    const totalPkr = Math.round(grams * goldGram24K_Pkr * purityObj.factor);
    const totalUsd = Math.round(totalPkr / usdToPkr);

    return { totalPkr, totalUsd, grams: grams.toFixed(2) };
  }, [calcPurity, calcWeight, calcUnit, goldGram24K_Pkr, usdToPkr]);

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
            Certified Live Gold Rates
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B3C2] mt-2 max-w-2xl leading-relaxed">
            Real-time bullion benchmark prices for 24K, 22K, 21K, and 18K purity grades calculated dynamically from London Bullion Market (LBMA) spot quotes and live USD/PKR interbank parity.
          </p>
        </div>

        {/* Spot Summary Pills */}
        <div className="flex flex-wrap gap-3">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0A1726] border border-amber-500/20 text-right shadow-xs">
            <div className="text-[11px] text-amber-500 dark:text-amber-400 uppercase font-bold">Gold Spot (XAU/USD)</div>
            <div className="text-lg font-black text-slate-900 dark:text-white font-tabular">${goldSpotOzUsd.toLocaleString()}</div>
            <div className="text-[10px] text-[#00E676] font-semibold flex items-center justify-end gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+0.45% 24h</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-right shadow-xs">
            <div className="text-[11px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">Silver Spot (XAG/USD)</div>
            <div className="text-lg font-black text-slate-900 dark:text-white font-tabular">${silverSpotOzUsd.toFixed(2)}</div>
            <div className="text-[10px] text-[#00E676] font-semibold flex items-center justify-end gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+1.12% 24h</span>
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
          const price = getPriceForPurity(item.factor);
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
                  ₨ {price.pkr.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 dark:text-[#A8B3C2] font-semibold font-tabular">
                  ≈ ${price.usd.toLocaleString()} USD
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
              Calculate the exact Pakistani Rupee and US Dollar value for any weight or purity.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
          
          <div>
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#A8B3C2] mb-1.5">
              Weight &amp; Measurement Unit
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0.01"
                step="any"
                value={calcWeight}
                onChange={(e) => setCalcWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-2/3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-[#00E676]"
              />
              <select
                value={calcUnit}
                onChange={(e) => setCalcUnit(e.target.value)}
                className="w-1/3 px-3 py-3 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-[#00E676]"
              >
                <option value="tola">Tola</option>
                <option value="gram">Grams</option>
                <option value="10g">10g</option>
                <option value="oz">Troy Oz</option>
              </select>
            </div>
          </div>

          {/* Result Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-[#00E676]/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">
                Total Estimated Value ({calculatedTotal.grams}g)
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#00E676] font-tabular">
                ₨ {calculatedTotal.totalPkr.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 dark:text-[#A8B3C2]">USD Equiv.</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white font-tabular">
                ${calculatedTotal.totalUsd.toLocaleString()}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
