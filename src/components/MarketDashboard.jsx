import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Sparkles, 
  RefreshCw
} from 'lucide-react';
import { fetchLiveMetals, calculateGoldLocalMetrics, DEFAULT_METALS } from '../services/metalsService';
import CurrencyFlag from './CurrencyFlag';

export default function MarketDashboard({ rates = {}, cryptoList = [], onSelectAsset, onOpenCryptoConverter }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'crypto', 'forex'
  const [metalsData, setMetalsData] = useState(() => ({
    gold: DEFAULT_METALS.gold,
    silver: DEFAULT_METALS.silver,
    lastUpdated: DEFAULT_METALS.lastUpdated,
    source: DEFAULT_METALS.source
  }));
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Precious Metals Auto-Ingestion
  const loadMetals = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetchLiveMetals();
      if (res && res.gold && res.silver) {
        setMetalsData({
          gold: res.gold,
          silver: res.silver,
          lastUpdated: res.lastUpdated,
          source: res.source
        });
      }
    } catch (err) {
      console.warn('Metals ingestion warning:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMetals();
    const interval = setInterval(loadMetals, 45000); // 45s tick refresh
    return () => clearInterval(interval);
  }, []);

  // Extract Live Assets
  const assets = useMemo(() => {
    // 1. Cryptos from live list
    const btc = cryptoList.find(c => c.symbol.toLowerCase() === 'btc') || {
      name: 'Bitcoin', symbol: 'BTC', current_price: 96850, price_change_percentage_24h: 2.14,
      high_24h: 97400, low_24h: 94800, sparkline: [94800, 95200, 95100, 96000, 95800, 96400, 96850]
    };

    const eth = cryptoList.find(c => c.symbol.toLowerCase() === 'eth') || {
      name: 'Ethereum', symbol: 'ETH', current_price: 2780, price_change_percentage_24h: -0.85,
      high_24h: 2840, low_24h: 2750, sparkline: [2820, 2840, 2800, 2790, 2760, 2770, 2780]
    };

    const sol = cryptoList.find(c => c.symbol.toLowerCase() === 'sol') || {
      name: 'Solana', symbol: 'SOL', current_price: 194.20, price_change_percentage_24h: 4.62,
      high_24h: 198.50, low_24h: 184.00, sparkline: [184, 186, 189, 192, 190, 193, 194.2]
    };

    const bnb = cryptoList.find(c => c.symbol.toLowerCase() === 'bnb') || {
      name: 'BNB', symbol: 'BNB', current_price: 645.10, price_change_percentage_24h: 1.15,
      high_24h: 652.00, low_24h: 638.00, sparkline: [638, 641, 640, 644, 642, 646, 645.1]
    };

    // 2. Forex Corridors
    const usdPkrRate = rates.PKR || 278.09;
    const eurUsdRate = rates.EUR ? (1 / rates.EUR) : 1.0845;
    const gbpUsdRate = rates.GBP ? (1 / rates.GBP) : 1.2890;

    // 3. Live Precious Metals
    const goldPriceUsd = (rates.XAU && rates.XAU > 0)
      ? Number((1 / rates.XAU).toFixed(2))
      : (metalsData.gold?.price || 4321.20);

    const silverPriceUsd = (rates.XAG && rates.XAG > 0)
      ? Number((1 / rates.XAG).toFixed(2))
      : (metalsData.silver?.price || 64.80);

    const goldChange = metalsData.gold?.change ?? 0.45;
    const silverChange = metalsData.silver?.change ?? 0.87;

    const goldHigh = metalsData.gold?.high || (goldPriceUsd * 1.008);
    const goldLow = metalsData.gold?.low || (goldPriceUsd * 0.992);

    const silverHigh = metalsData.silver?.high || (silverPriceUsd * 1.012);
    const silverLow = metalsData.silver?.low || (silverPriceUsd * 0.988);

    // Dynamic Local Benchmark (PKR per Tola & Gram)
    const pkrGold = calculateGoldLocalMetrics(goldPriceUsd, usdPkrRate);

    return [
      // Top 4 Cryptocurrencies
      {
        id: 'btc',
        type: 'crypto',
        flagCode: 'BTC',
        name: btc.name || 'Bitcoin',
        symbol: 'BTC',
        category: 'Digital Gold',
        price: btc.current_price,
        formattedPrice: `$${btc.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: btc.price_change_percentage_24h || 2.14,
        high: btc.high_24h || btc.current_price * 1.02,
        low: btc.low_24h || btc.current_price * 0.98,
        sparkline: [40, 48, 45, 62, 58, 70, 78],
        coinObj: btc,
        rangePrefix: '$'
      },
      {
        id: 'eth',
        type: 'crypto',
        flagCode: 'ETH',
        name: eth.name || 'Ethereum',
        symbol: 'ETH',
        category: 'Smart Contracts',
        price: eth.current_price,
        formattedPrice: `$${eth.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: eth.price_change_percentage_24h || -0.85,
        high: eth.high_24h || eth.current_price * 1.02,
        low: eth.low_24h || eth.current_price * 0.98,
        sparkline: [65, 70, 60, 55, 48, 52, 50],
        coinObj: eth,
        rangePrefix: '$'
      },
      {
        id: 'sol',
        type: 'crypto',
        flagCode: 'SOL',
        name: sol.name || 'Solana',
        symbol: 'SOL',
        category: 'High-Throughput L1',
        price: sol.current_price,
        formattedPrice: `$${sol.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: sol.price_change_percentage_24h || 4.62,
        high: sol.high_24h || sol.current_price * 1.03,
        low: sol.low_24h || sol.current_price * 0.96,
        sparkline: [30, 36, 45, 52, 60, 72, 85],
        coinObj: sol,
        rangePrefix: '$'
      },
      {
        id: 'bnb',
        type: 'crypto',
        flagCode: 'BNB',
        name: bnb.name || 'BNB',
        symbol: 'BNB',
        category: 'Exchange Native',
        price: bnb.current_price,
        formattedPrice: `$${bnb.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: bnb.price_change_percentage_24h || 1.15,
        high: bnb.high_24h || bnb.current_price * 1.01,
        low: bnb.low_24h || bnb.current_price * 0.99,
        sparkline: [50, 52, 49, 55, 53, 58, 60],
        coinObj: bnb,
        rangePrefix: '$'
      },

      // Primary FX Corridors
      {
        id: 'usd-pkr',
        type: 'forex',
        flagCode: 'PKR',
        name: 'USD / PKR (Interbank Mid-Market)',
        symbol: 'USD/PKR',
        category: 'Emerging FX',
        price: usdPkrRate,
        formattedPrice: `₨ ${usdPkrRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: 0.12,
        high: usdPkrRate * 1.002,
        low: usdPkrRate * 0.998,
        sparkline: [50, 51, 50, 52, 51, 52, 53],
        base: 'USD',
        target: 'PKR',
        rangePrefix: '₨ '
      },
      {
        id: 'eur-usd',
        type: 'forex',
        flagCode: 'EUR',
        name: 'EUR / USD (Euro Corridor)',
        symbol: 'EUR/USD',
        category: 'Major G10',
        price: eurUsdRate,
        formattedPrice: `$${eurUsdRate.toFixed(4)}`,
        change: -0.28,
        high: eurUsdRate * 1.004,
        low: eurUsdRate * 0.995,
        sparkline: [58, 62, 59, 54, 52, 49, 47],
        base: 'EUR',
        target: 'USD',
        rangePrefix: '$'
      },
      {
        id: 'gbp-usd',
        type: 'forex',
        flagCode: 'GBP',
        name: 'GBP / USD (Sterling Cable)',
        symbol: 'GBP/USD',
        category: 'Major G10',
        price: gbpUsdRate,
        formattedPrice: `$${gbpUsdRate.toFixed(4)}`,
        change: 0.35,
        high: gbpUsdRate * 1.005,
        low: gbpUsdRate * 0.996,
        sparkline: [44, 46, 48, 47, 52, 55, 58],
        base: 'GBP',
        target: 'USD',
        rangePrefix: '$'
      },

      // Precious Metals Benchmarks
      {
        id: 'gold-xau',
        type: 'forex',
        isGold: true,
        flagCode: 'XAU',
        name: 'Gold Spot / Troy Ounce',
        symbol: 'XAU/USD',
        category: 'Spot Bullion',
        price: goldPriceUsd,
        formattedPrice: `$${goldPriceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: goldChange,
        high: goldHigh,
        low: goldLow,
        sparkline: [45, 48, 52, 58, 64, 68, 72],
        base: 'XAU',
        target: 'USD',
        rangePrefix: '$',
        customTag: 'Spot Bullion'
      },
      {
        id: 'silver-xag',
        type: 'forex',
        isSilver: true,
        flagCode: 'XAG',
        name: 'Silver Spot / Troy Ounce',
        symbol: 'XAG/USD',
        category: 'Spot Bullion',
        price: silverPriceUsd,
        formattedPrice: `$${silverPriceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: silverChange,
        high: silverHigh,
        low: silverLow,
        sparkline: [40, 44, 46, 51, 55, 59, 63],
        base: 'XAG',
        target: 'USD',
        rangePrefix: '$',
        customTag: 'Spot Silver'
      },
      {
        id: 'gold-pkr',
        type: 'forex',
        isGold: true,
        isLocalGold: true,
        flagCode: 'XAU',
        name: 'Gold in PKR (24K Tola Benchmark)',
        symbol: 'Gold PKR',
        category: 'Local Bullion',
        price: pkrGold.pricePerTola24K,
        formattedPrice: `₨ ${Math.round(pkrGold.pricePerTola24K).toLocaleString()}`,
        change: goldChange,
        high: pkrGold.pricePerTola24K * 1.008,
        low: pkrGold.pricePerTola24K * 0.992,
        sparkline: [46, 49, 53, 57, 63, 67, 71],
        base: 'XAU',
        target: 'PKR',
        subMetric: `₨ ${Math.round(pkrGold.pricePerGram24K).toLocaleString()}/g · 22K: ₨ ${Math.round(pkrGold.pricePerTola22K).toLocaleString()}`,
        rangePrefix: '₨ ',
        customTag: '24K Benchmark'
      }
    ];
  }, [rates, cryptoList, metalsData]);

  const filteredAssets = useMemo(() => {
    if (activeTab === 'all') return assets;
    return assets.filter(a => a.type === activeTab);
  }, [assets, activeTab]);

  const handleAssetAction = (asset) => {
    if (asset.type === 'crypto' && asset.coinObj) {
      onOpenCryptoConverter(asset.coinObj);
    } else if (asset.base && asset.target) {
      onSelectAsset(asset.base, asset.target);
    }
  };

  return (
    <section id="markets" className="py-12 border-b border-slate-200/80 dark:border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2.5 border border-blue-500/20 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Asset Market Matrix</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Live Market Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl font-medium">
              High-frequency multi-asset terminal monitoring leading cryptocurrencies, global forex corridors, and spot commodities.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] self-start md:self-end">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              All Assets (10)
            </button>
            <button
              onClick={() => setActiveTab('crypto')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'crypto'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Crypto (4)
            </button>
            <button
              onClick={() => setActiveTab('forex')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'forex'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Forex / Gold (6)
            </button>
          </div>
        </div>

        {/* Multi-Asset Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const isPositive = asset.change >= 0;
            const pointsStr = asset.sparkline
              .map((val, idx) => `${(idx / (asset.sparkline.length - 1)) * 90},${45 - (val / 100) * 35}`)
              .join(' ');

            return (
              <div
                key={asset.id}
                onClick={() => handleAssetAction(asset)}
                className={`border rounded-2xl p-4.5 transition-all duration-200 group flex flex-col justify-between shadow-xs dark:shadow-lg cursor-pointer ${
                  asset.isGold
                    ? 'bg-gradient-to-b from-amber-500/[0.04] to-white dark:to-[#0C1017] border-amber-500/30 hover:border-amber-500/60 hover:shadow-amber-500/5'
                    : asset.isSilver
                    ? 'bg-gradient-to-b from-slate-400/[0.04] to-white dark:to-[#0C1017] border-slate-300 dark:border-slate-700 hover:border-slate-400'
                    : 'bg-white dark:bg-[#0C1017] border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18]'
                }`}
              >
                <div>
                  {/* Card Header: Flag/Badge, Symbol, Tag & 24h Change */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CurrencyFlag code={asset.flagCode || asset.base} className="w-5 h-5 shrink-0" />
                      <span className={`font-bold text-sm transition-colors ${
                        asset.isGold 
                          ? 'text-amber-500 dark:text-amber-400 group-hover:text-amber-600' 
                          : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}>
                        {asset.symbol}
                      </span>
                      {asset.isGold ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {asset.customTag || 'Gold'}
                        </span>
                      ) : asset.isSilver ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-400/10 text-slate-500 dark:text-slate-300 border border-slate-400/20">
                          {asset.customTag || 'Silver'}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          {asset.category}
                        </span>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums ${
                        isPositive 
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                          : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      }`}
                    >
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isPositive ? '+' : ''}{asset.change.toFixed(2)}%
                    </span>
                  </div>

                  {/* Asset Full Name */}
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate mb-2">
                    {asset.name}
                  </div>

                  {/* Price & Sparkline Row */}
                  <div className="flex items-baseline justify-between gap-2 mt-1">
                    <div>
                      <div className={`text-2xl font-black tabular-nums tracking-tight ${
                        asset.isGold ? 'text-amber-500 dark:text-amber-400' : 'text-slate-900 dark:text-white'
                      }`}>
                        {asset.formattedPrice}
                      </div>
                      {asset.subMetric && (
                        <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400/90 mt-1 tabular-nums">
                          {asset.subMetric}
                        </div>
                      )}
                    </div>

                    {/* Interactive SVG Sparkline */}
                    <div className="w-24 h-9 shrink-0 self-center">
                      <svg viewBox="0 0 90 45" className="w-full h-full overflow-visible">
                        <polyline
                          fill="none"
                          stroke={isPositive ? '#10B981' : '#F43F5E'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={pointsStr}
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 24h Range Bar & Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-xs font-medium">
                  <div className="text-slate-600 dark:text-slate-400">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">24h: </span>
                    <span className="text-slate-800 dark:text-slate-200 tabular-nums font-semibold">
                      {asset.rangePrefix || '$'}{typeof asset.low === 'number' ? (asset.low < 1 ? asset.low.toFixed(4) : Math.round(asset.low).toLocaleString()) : asset.low}
                    </span>
                    <span className="text-slate-400 dark:text-slate-600 mx-1">-</span>
                    <span className="text-slate-800 dark:text-slate-200 tabular-nums font-semibold">
                      {asset.rangePrefix || '$'}{typeof asset.high === 'number' ? (asset.high < 1 ? asset.high.toFixed(4) : Math.round(asset.high).toLocaleString()) : asset.high}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssetAction(asset);
                    }}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer flex items-center gap-1 active:scale-95 shadow-xs ${
                      asset.isGold
                        ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-950 border-amber-500/25'
                        : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 dark:bg-white/[0.04] dark:hover:bg-blue-600 dark:hover:text-white dark:text-slate-400 border-slate-200 dark:border-white/[0.06]'
                    }`}
                    title={`Calculate ${asset.symbol}`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
