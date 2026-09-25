import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Sparkles, 
  Layers, 
  RefreshCw,
  Coins
} from 'lucide-react';

export default function MarketDashboard({ rates = {}, cryptoList = [], onSelectAsset, onOpenCryptoConverter }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'crypto', 'forex'

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

    // 2. Forex & Commodities
    const usdPkrRate = rates.PKR || 278.09;
    const eurUsdRate = rates.EUR ? (1 / rates.EUR) : 1.0845;
    const gbpUsdRate = rates.GBP ? (1 / rates.GBP) : 1.2890;
    const goldRate = 2914.80; // Spot Gold USD/oz

    return [
      {
        id: 'btc',
        type: 'crypto',
        name: btc.name || 'Bitcoin',
        symbol: 'BTC',
        category: 'Digital Gold',
        price: btc.current_price,
        formattedPrice: `$${btc.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: btc.price_change_percentage_24h || 2.14,
        high: btc.high_24h || btc.current_price * 1.02,
        low: btc.low_24h || btc.current_price * 0.98,
        sparkline: [40, 48, 45, 62, 58, 70, 78],
        coinObj: btc
      },
      {
        id: 'eth',
        type: 'crypto',
        name: eth.name || 'Ethereum',
        symbol: 'ETH',
        category: 'Smart Contracts',
        price: eth.current_price,
        formattedPrice: `$${eth.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: eth.price_change_percentage_24h || -0.85,
        high: eth.high_24h || eth.current_price * 1.02,
        low: eth.low_24h || eth.current_price * 0.98,
        sparkline: [65, 70, 60, 55, 48, 52, 50],
        coinObj: eth
      },
      {
        id: 'sol',
        type: 'crypto',
        name: sol.name || 'Solana',
        symbol: 'SOL',
        category: 'High-Throughput L1',
        price: sol.current_price,
        formattedPrice: `$${sol.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: sol.price_change_percentage_24h || 4.62,
        high: sol.high_24h || sol.current_price * 1.03,
        low: sol.low_24h || sol.current_price * 0.96,
        sparkline: [30, 36, 45, 52, 60, 72, 85],
        coinObj: sol
      },
      {
        id: 'bnb',
        type: 'crypto',
        name: bnb.name || 'BNB',
        symbol: 'BNB',
        category: 'Exchange Native',
        price: bnb.current_price,
        formattedPrice: `$${bnb.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: bnb.price_change_percentage_24h || 1.15,
        high: bnb.high_24h || bnb.current_price * 1.01,
        low: bnb.low_24h || bnb.current_price * 0.99,
        sparkline: [50, 52, 49, 55, 53, 58, 60],
        coinObj: bnb
      },
      {
        id: 'usd-pkr',
        type: 'forex',
        name: 'USD / PKR',
        symbol: 'USD/PKR',
        category: 'Emerging Market FX',
        price: usdPkrRate,
        formattedPrice: `₨ ${usdPkrRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: 0.12,
        high: usdPkrRate * 1.002,
        low: usdPkrRate * 0.998,
        sparkline: [50, 51, 50, 52, 51, 52, 53],
        base: 'USD',
        target: 'PKR'
      },
      {
        id: 'eur-usd',
        type: 'forex',
        name: 'EUR / USD',
        symbol: 'EUR/USD',
        category: 'Major G10 Corridor',
        price: eurUsdRate,
        formattedPrice: `$${eurUsdRate.toFixed(4)}`,
        change: -0.28,
        high: eurUsdRate * 1.004,
        low: eurUsdRate * 0.995,
        sparkline: [58, 62, 59, 54, 52, 49, 47],
        base: 'EUR',
        target: 'USD'
      },
      {
        id: 'gbp-usd',
        type: 'forex',
        name: 'GBP / USD',
        symbol: 'GBP/USD',
        category: 'Sterling Cable',
        price: gbpUsdRate,
        formattedPrice: `$${gbpUsdRate.toFixed(4)}`,
        change: 0.35,
        high: gbpUsdRate * 1.005,
        low: gbpUsdRate * 0.996,
        sparkline: [44, 46, 48, 47, 52, 55, 58],
        base: 'GBP',
        target: 'USD'
      },
      {
        id: 'gold-xau',
        type: 'forex',
        name: 'Gold (XAU / USD)',
        symbol: 'XAU/USD',
        category: 'Precious Metals',
        price: goldRate,
        formattedPrice: `$${goldRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: 0.85,
        high: 2928.00,
        low: 2895.00,
        sparkline: [45, 48, 52, 58, 64, 68, 72],
        base: 'USD',
        target: 'USD'
      }
    ];
  }, [rates, cryptoList]);

  const filteredAssets = useMemo(() => {
    if (activeTab === 'all') return assets;
    return assets.filter(a => a.type === activeTab);
  }, [assets, activeTab]);

  return (
    <section id="markets" className="py-12 border-b border-slate-200/80 dark:border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2.5 border border-blue-500/20 font-mono uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Asset Market Matrix</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Live Market Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
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
              All Assets (8)
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
              Forex & Gold (4)
            </button>
          </div>
        </div>

        {/* Multi-Asset 8-Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const isPositive = asset.change >= 0;
            const pointsStr = asset.sparkline
              .map((val, idx) => `${(idx / (asset.sparkline.length - 1)) * 90},${45 - (val / 100) * 35}`)
              .join(' ');

            return (
              <div
                key={asset.id}
                className="bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18] rounded-2xl p-4.5 transition-all duration-200 group flex flex-col justify-between shadow-xs dark:shadow-lg"
              >
                <div>
                  {/* Card Header: Symbol & 24h Change */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {asset.symbol}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {asset.category}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full tabular-nums ${
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
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate mb-3">
                    {asset.name}
                  </div>

                  {/* Price & Sparkline Row */}
                  <div className="flex items-baseline justify-between gap-2 mt-1">
                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                      {asset.formattedPrice}
                    </div>

                    {/* Interactive SVG Sparkline */}
                    <div className="w-24 h-9 shrink-0">
                      <svg viewBox="0 0 90 45" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id={`grad-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity="0.4" />
                            <stop offset="100%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
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
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-[11px] font-mono">
                  <div className="text-slate-500 dark:text-slate-400">
                    <span className="text-slate-400 dark:text-slate-500">24h: </span>
                    <span className="text-slate-700 dark:text-slate-300 tabular-nums">
                      ${typeof asset.low === 'number' ? (asset.low < 1 ? asset.low.toFixed(4) : Math.round(asset.low).toLocaleString()) : asset.low}
                    </span>
                    <span className="text-slate-400 dark:text-slate-600 mx-1">-</span>
                    <span className="text-slate-700 dark:text-slate-300 tabular-nums">
                      ${typeof asset.high === 'number' ? (asset.high < 1 ? asset.high.toFixed(4) : Math.round(asset.high).toLocaleString()) : asset.high}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (asset.type === 'crypto' && asset.coinObj) {
                        onOpenCryptoConverter(asset.coinObj);
                      } else if (asset.base && asset.target) {
                        onSelectAsset(asset.base, asset.target);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 dark:bg-white/[0.04] dark:hover:bg-blue-600 dark:hover:text-white dark:text-slate-400 text-xs font-semibold transition-all border border-slate-200 dark:border-white/[0.06] cursor-pointer flex items-center gap-1 active:scale-95 shadow-xs"
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
