import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { DEFAULT_RATES } from '../services/forexService';
import { calculateGoldLocalMetrics, fetchLiveMetals } from '../services/metalsService';

export default function CryptoTickerBar({ cryptoList = [], rates = DEFAULT_RATES, onSelectCoin }) {
  const navigate = useNavigate();

  const [metalsData, setMetalsData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchLiveMetals().then(res => {
      if (isMounted && res) {
        setMetalsData(res);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const activeRates = (rates && Object.keys(rates).length > 0) ? rates : DEFAULT_RATES;
  const usdToPkr = Number.isFinite(activeRates.PKR) && activeRates.PKR > 0 ? activeRates.PKR : null;
  const eurVal = activeRates.EUR || null;
  const gbpVal = activeRates.GBP || null;
  const aedVal = activeRates.AED || null;
  const sarVal = activeRates.SAR || null;

  const eurToPkr = usdToPkr !== null && eurVal ? usdToPkr / eurVal : null;
  const gbpToPkr = usdToPkr !== null && gbpVal ? usdToPkr / gbpVal : null;
  const aedToPkr = usdToPkr !== null && aedVal ? usdToPkr / aedVal : null;
  const sarToPkr = usdToPkr !== null && sarVal ? usdToPkr / sarVal : null;

  const goldSpotUsd = Number.isFinite(metalsData?.gold?.price) && metalsData.gold.price > 0
    ? metalsData.gold.price
    : (activeRates.XAU > 0 ? Number((1 / activeRates.XAU).toFixed(2)) : null);

  const silverSpotUsd = Number.isFinite(metalsData?.silver?.price) && metalsData.silver.price > 0
    ? metalsData.silver.price
    : (activeRates.XAG > 0 ? Number((1 / activeRates.XAG).toFixed(2)) : null);

  const goldMetrics = calculateGoldLocalMetrics(goldSpotUsd, usdToPkr, true);
  const gold24kTola = goldMetrics?.pricePerTola24K ?? null;
  const gold22kTola = goldMetrics?.pricePerTola22K ?? null;

  const goldChange = typeof metalsData?.gold?.change === 'number' ? metalsData.gold.change : null;
  const silverChange = typeof metalsData?.silver?.change === 'number' ? metalsData.silver.change : null;

  // Curated Multi-Asset Ticker Strip (Gold Bullion, Silver & Forex Interbank)
  const baseMultiAssetItems = [
    {
      id: 'gold-24k-tola',
      type: 'gold',
      symbol: 'GOLD 24K',
      badge: 'Tola',
      basePrice: gold24kTola,
      formatPrice: (p) => `₨${Math.round(p).toLocaleString()}`,
      baseChange: goldChange,
      onClick: () => navigate('/gold')
    },
    {
      id: 'gold-22k-tola',
      type: 'gold',
      symbol: 'GOLD 22K',
      badge: 'Jewelry',
      basePrice: gold22kTola,
      formatPrice: (p) => `₨${Math.round(p).toLocaleString()}`,
      baseChange: goldChange,
      onClick: () => navigate('/gold')
    },
    {
      id: 'gold-spot-oz',
      type: 'gold',
      symbol: 'XAU/USD',
      badge: 'Spot Oz',
      basePrice: goldSpotUsd,
      formatPrice: (p) => `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      baseChange: goldChange,
      onClick: () => navigate('/gold')
    },
    {
      id: 'silver-spot-oz',
      type: 'gold',
      symbol: 'XAG/USD',
      badge: 'Silver Oz',
      basePrice: silverSpotUsd,
      formatPrice: (p) => `$${p.toFixed(2)}`,
      baseChange: silverChange,
      onClick: () => navigate('/gold')
    },
    {
      id: 'fx-usd-pkr',
      type: 'fx',
      symbol: 'USD/PKR',
      badge: 'FX Ref',
      basePrice: usdToPkr,
      formatPrice: (p) => `₨${p.toFixed(2)}`,
      baseChange: null,
      onClick: () => navigate('/rates')
    },
    {
      id: 'fx-eur-pkr',
      type: 'fx',
      symbol: 'EUR/PKR',
      badge: 'Euro',
      basePrice: eurToPkr,
      formatPrice: (p) => `₨${p.toFixed(2)}`,
      baseChange: null,
      onClick: () => navigate('/rates')
    },
    {
      id: 'fx-gbp-pkr',
      type: 'fx',
      symbol: 'GBP/PKR',
      badge: 'Pound',
      basePrice: gbpToPkr,
      formatPrice: (p) => `₨${p.toFixed(2)}`,
      baseChange: null,
      onClick: () => navigate('/rates')
    },
    {
      id: 'fx-aed-pkr',
      type: 'fx',
      symbol: 'AED/PKR',
      badge: 'Dirham',
      basePrice: aedToPkr,
      formatPrice: (p) => `₨${p.toFixed(2)}`,
      baseChange: null,
      onClick: () => navigate('/rates')
    },
    {
      id: 'fx-sar-pkr',
      type: 'fx',
      symbol: 'SAR/PKR',
      badge: 'Riyal',
      basePrice: sarToPkr,
      formatPrice: (p) => `₨${p.toFixed(2)}`,
      baseChange: null,
      onClick: () => navigate('/rates')
    }
  ];

  const hasLiveCoins = Array.isArray(cryptoList) && cryptoList.length > 0;
  const activeCrypto = hasLiveCoins ? cryptoList.slice(0, 8) : [];

  const baseCryptoItems = activeCrypto.map(coin => ({
    id: `crypto-${coin.id}`,
    type: 'crypto',
    symbol: coin.symbol.toUpperCase(),
    badge: 'Crypto',
    basePrice: coin.current_price,
    formatPrice: (p) => `$${p < 1 
      ? p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
      : p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    baseChange: typeof coin.price_change_percentage_24h === 'number' ? coin.price_change_percentage_24h : null,
    image: coin.image,
    onClick: () => onSelectCoin ? onSelectCoin(coin) : navigate('/crypto')
  }));

  const allAvailableItems = [...baseMultiAssetItems, ...baseCryptoItems];

  const renderedItems = allAvailableItems.map(item => {
    const hasChange = typeof item.baseChange === 'number' && !isNaN(item.baseChange);
    const isPositive = hasChange ? item.baseChange >= 0 : null;
    const displayChange = hasChange
      ? `${isPositive ? '+' : ''}${item.baseChange.toFixed(2)}%`
      : 'N/A';

    return {
      ...item,
      displayPrice: Number.isFinite(item.basePrice) ? item.formatPrice(item.basePrice) : 'N/A',
      displayChange,
      isPositive,
      isFlashing: false,
      flashDirection: isPositive ? 'up' : 'down'
    };
  });

  // Duplicate items for continuous seamless marquee looping
  const tickerItems = [...renderedItems, ...renderedItems];

  return (
    <div className="w-full max-w-full bg-slate-100 dark:bg-[#070A12] border-b border-slate-200 dark:border-white/[0.08] text-xs py-1.5 overflow-hidden select-none relative z-30">
      
      {/* Sticky Left Live Feed Pill Badge */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pl-3 pr-6 bg-gradient-to-r from-slate-100 via-slate-100/90 to-transparent dark:from-[#070A12] dark:via-[#070A12]/90 dark:to-transparent pointer-events-auto">
        <button
          onClick={() => navigate('/rates')}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold shadow-xs cursor-pointer transition-all"
          title="Live market feed active — dynamic real-time price stream"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline">LIVE</span>
          <span>FEED</span>
        </button>
      </div>

      {/* Subtle Right Gradient Fade */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-100 to-transparent dark:from-[#070A12] dark:to-transparent pointer-events-none z-10" />

      {/* Animated Marquee Strip */}
      <div className="animate-marquee flex items-center gap-6 whitespace-nowrap">
        {tickerItems.map((item, index) => {
          return (
            <div
              key={`${item.id}-${index}`}
              onClick={item.onClick}
              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full cursor-pointer border transition-all duration-300 ${
                item.isFlashing
                  ? item.flashDirection === 'up'
                    ? 'bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/30'
                    : 'bg-rose-500/15 border-rose-500/40 ring-1 ring-rose-500/30'
                  : 'bg-transparent hover:bg-slate-200/60 dark:hover:bg-white/[0.06] border-transparent hover:border-slate-300 dark:hover:border-white/[0.08]'
              }`}
              title={`View ${item.symbol} live market rates`}
            >
              {item.type === 'gold' && (
                <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-black flex items-center justify-center shrink-0 border border-amber-500/30">
                  AU
                </span>
              )}

              {item.type === 'index' && (
                <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-500 text-[9px] font-black flex items-center justify-center shrink-0 border border-blue-500/30">
                  IX
                </span>
              )}

              {item.type === 'crypto' && item.image && (
                <img 
                  src={item.image} 
                  alt={item.symbol} 
                  className="w-3.5 h-3.5 rounded-full" 
                  width="14" 
                  height="14" 
                  loading="lazy" 
                  decoding="async"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}

              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight text-[11px]">
                  {item.symbol}
                </span>
                <span className="text-[9px] uppercase px-1 py-0.2 rounded font-mono font-bold bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                  {item.badge}
                </span>
              </div>

              {/* Fluctuating Live Numeric Price */}
              <span className={`font-mono font-bold text-[11px] tabular-nums transition-colors duration-200 ${
                item.isFlashing
                  ? item.flashDirection === 'up'
                    ? 'text-emerald-500 dark:text-emerald-400 font-black'
                    : 'text-rose-500 dark:text-rose-400 font-black'
                  : 'text-slate-900 dark:text-white'
              }`}>
                {item.displayPrice}
              </span>

              {/* Dynamic Percentage & Up/Down Indicator */}
              {/* Dynamic Percentage & Up/Down Indicator or N/A */}
              {item.isPositive !== null ? (
                <span
                  className={`inline-flex items-center gap-0.5 text-[10px] font-semibold font-mono tabular-nums px-1.5 py-0.2 rounded-full transition-all duration-200 ${
                    item.isPositive 
                      ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                      : 'text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20'
                  }`}
                >
                  {item.isPositive ? (
                    <TrendingUp className="w-2.5 h-2.5 stroke-[2.5]" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 stroke-[2.5]" />
                  )}
                  {item.displayChange}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 px-1.5 py-0.2">
                  N/A
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
