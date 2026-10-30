import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { DEFAULT_CRYPTO_BENCHMARKS } from '../services/cryptoService';
import { DEFAULT_RATES } from '../services/forexService';
import { DEFAULT_METALS, calculateGoldLocalMetrics } from '../services/metalsService';

export default function CryptoTickerBar({ cryptoList = [], rates = DEFAULT_RATES, onSelectCoin }) {
  const navigate = useNavigate();

  const activeRates = (rates && Object.keys(rates).length > 0) ? rates : DEFAULT_RATES;
  const usdToPkr = activeRates.PKR || 277.10;
  const eurVal = activeRates.EUR || 0.92;
  const gbpVal = activeRates.GBP || 0.79;
  const aedVal = activeRates.AED || 3.6725;
  const sarVal = activeRates.SAR || 3.75;

  const eurToPkr = (usdToPkr / eurVal).toFixed(2);
  const gbpToPkr = (usdToPkr / gbpVal).toFixed(2);
  const aedToPkr = (usdToPkr / aedVal).toFixed(2);
  const sarToPkr = (usdToPkr / sarVal).toFixed(2);

  const goldSpotUsd = (activeRates.XAU && activeRates.XAU > 0)
    ? Number((1 / activeRates.XAU).toFixed(2))
    : DEFAULT_METALS.gold.price;

  const goldMetrics = calculateGoldLocalMetrics(goldSpotUsd, usdToPkr, true);
  const gold24kTola = goldMetrics?.pricePerTola24K || 432500;
  const gold22kTola = goldMetrics?.pricePerTola22K || 396458;

  // Curated Multi-Asset Ticker Strip (Gold Bullion, Forex Interbank & Top Crypto)
  const multiAssetItems = [
    {
      id: 'gold-24k-tola',
      type: 'gold',
      symbol: 'GOLD 24K',
      badge: 'Tola',
      price: `₨${gold24kTola.toLocaleString()}`,
      change: '+0.42%',
      isPositive: true,
      onClick: () => navigate('/gold')
    },
    {
      id: 'gold-22k-tola',
      type: 'gold',
      symbol: 'GOLD 22K',
      badge: 'Jewelry',
      price: `₨${gold22kTola.toLocaleString()}`,
      change: '+0.42%',
      isPositive: true,
      onClick: () => navigate('/gold')
    },
    {
      id: 'gold-spot-oz',
      type: 'gold',
      symbol: 'XAU/USD',
      badge: 'Spot Oz',
      price: `$${goldSpotUsd.toLocaleString()}`,
      change: '+0.38%',
      isPositive: true,
      onClick: () => navigate('/gold')
    },
    {
      id: 'fx-usd-pkr',
      type: 'fx',
      symbol: 'USD/PKR',
      badge: 'Interbank',
      price: `₨${usdToPkr.toFixed(2)}`,
      change: '+0.04%',
      isPositive: true,
      onClick: () => navigate('/rates')
    },
    {
      id: 'fx-eur-pkr',
      type: 'fx',
      symbol: 'EUR/PKR',
      badge: 'Euro',
      price: `₨${eurToPkr}`,
      change: '+0.18%',
      isPositive: true,
      onClick: () => navigate('/rates')
    },
    {
      id: 'fx-gbp-pkr',
      type: 'fx',
      symbol: 'GBP/PKR',
      badge: 'Pound',
      price: `₨${gbpToPkr}`,
      change: '-0.12%',
      isPositive: false,
      onClick: () => navigate('/rates')
    },
    {
      id: 'fx-aed-pkr',
      type: 'fx',
      symbol: 'AED/PKR',
      badge: 'Dirham',
      price: `₨${aedToPkr}`,
      change: '+0.02%',
      isPositive: true,
      onClick: () => navigate('/rates')
    },
    {
      id: 'fx-sar-pkr',
      type: 'fx',
      symbol: 'SAR/PKR',
      badge: 'Riyal',
      price: `₨${sarToPkr}`,
      change: '+0.01%',
      isPositive: true,
      onClick: () => navigate('/rates')
    }
  ];

  const hasLiveCoins = Array.isArray(cryptoList) && cryptoList.length > 0;
  const activeCrypto = hasLiveCoins ? cryptoList.slice(0, 8) : DEFAULT_CRYPTO_BENCHMARKS.slice(0, 8);

  const cryptoItems = activeCrypto.map(coin => ({
    id: `crypto-${coin.id}`,
    type: 'crypto',
    symbol: coin.symbol.toUpperCase(),
    badge: 'Crypto',
    price: `$${coin.current_price < 1 
      ? coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
      : coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    change: `${(coin.price_change_percentage_24h || 0) >= 0 ? '+' : ''}${(coin.price_change_percentage_24h || 0).toFixed(2)}%`,
    isPositive: (coin.price_change_percentage_24h || 0) >= 0,
    image: coin.image,
    onClick: () => onSelectCoin ? onSelectCoin(coin) : navigate('/crypto')
  }));

  // Interleave and duplicate to achieve continuous marquee loop
  const combinedList = [...multiAssetItems, ...cryptoItems];
  const tickerItems = [...combinedList, ...combinedList];

  return (
    <div className="w-full max-w-full bg-slate-100/95 dark:bg-[#070A12]/95 border-b border-slate-200 dark:border-white/[0.06] text-xs py-1.5 overflow-hidden select-none backdrop-blur-xl sticky top-0 z-40">
      <div className="animate-marquee flex items-center gap-6 whitespace-nowrap">
        {tickerItems.map((item, index) => {
          return (
            <div
              key={`${item.id}-${index}`}
              onClick={item.onClick}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full cursor-pointer hover:bg-slate-200/60 dark:hover:bg-white/[0.06] border border-transparent hover:border-slate-300 dark:hover:border-white/[0.08] transition-all"
              title={`View ${item.symbol} live market rates`}
            >
              {item.type === 'gold' && (
                <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-black flex items-center justify-center shrink-0 border border-amber-500/30">
                  AU
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

              <span className="text-slate-900 dark:text-white font-mono font-bold text-[11px] tabular-nums">
                {item.price}
              </span>

              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-semibold font-mono tabular-nums px-1.5 py-0.2 rounded-full ${
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
                {item.change}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
