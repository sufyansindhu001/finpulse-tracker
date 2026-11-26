import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Sparkles
} from 'lucide-react';
import { fetchLiveMetals, calculateGoldLocalMetrics, DEFAULT_METALS } from '../services/metalsService';
import CurrencyFlag from './CurrencyFlag';

export default function MarketDashboard({ rates = {}, cryptoList = [], onSelectAsset, onOpenCryptoConverter }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'crypto', 'forex'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metalsData, setMetalsData] = useState(() => ({
    gold: DEFAULT_METALS.gold,
    silver: DEFAULT_METALS.silver,
    lastUpdated: DEFAULT_METALS.lastUpdated,
    source: DEFAULT_METALS.source
  }));

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

  const formatRangeVal = (val, asset) => {
    if (typeof val !== 'number') return val;
    // Major Forex pairs with 4 decimals (EUR/USD, GBP/USD, etc.)
    if (asset.symbol === 'EUR/USD' || asset.symbol === 'GBP/USD' || (asset.type === 'forex' && !asset.isGold && !asset.isSilver && val < 5)) {
      return val.toFixed(4);
    }
    // Emerging FX like USD/PKR
    if (asset.type === 'forex' && !asset.isGold && !asset.isSilver && val < 1000) {
      return val.toFixed(2);
    }
    if (val < 1) {
      return val.toFixed(4);
    }
    if (val < 20) {
      return val.toFixed(2);
    }
    return Math.round(val).toLocaleString();
  };

  // Extract Live Assets
  const assets = useMemo(() => {
    const list = Array.isArray(cryptoList) ? cryptoList : [];
    // 1. Cryptos from live list
    const btc = list.find(c => c && c.symbol && String(c.symbol).toLowerCase() === 'btc');
    const eth = list.find(c => c && c.symbol && String(c.symbol).toLowerCase() === 'eth');
    const sol = list.find(c => c && c.symbol && String(c.symbol).toLowerCase() === 'sol');
    const bnb = list.find(c => c && c.symbol && String(c.symbol).toLowerCase() === 'bnb');

    // 2. Forex Corridors (from real rates object)
    const usdPkrRate = Number.isFinite(rates?.PKR) && rates.PKR > 0 ? rates.PKR : null;
    const eurUsdRate = Number.isFinite(rates?.EUR) && rates.EUR > 0 ? 1 / rates.EUR : null;
    const gbpUsdRate = Number.isFinite(rates?.GBP) && rates.GBP > 0 ? 1 / rates.GBP : null;

    // 3. Live Precious Metals
    const goldPriceUsd = Number.isFinite(metalsData?.gold?.price) && metalsData.gold.price > 0
      ? metalsData.gold.price : (rates?.XAU > 0 ? Number((1 / rates.XAU).toFixed(2)) : null);

    const silverPriceUsd = Number.isFinite(metalsData?.silver?.price) && metalsData.silver.price > 0
      ? metalsData.silver.price : (rates?.XAG > 0 ? Number((1 / rates.XAG).toFixed(2)) : null);

    const goldChange = typeof metalsData?.gold?.change === 'number' ? metalsData.gold.change : null;
    const silverChange = typeof metalsData?.silver?.change === 'number' ? metalsData.silver.change : null;

    const goldHigh = typeof metalsData?.gold?.high === 'number' ? metalsData.gold.high : null;
    const goldLow = typeof metalsData?.gold?.low === 'number' ? metalsData.gold.low : null;

    const silverHigh = typeof metalsData?.silver?.high === 'number' ? metalsData.silver.high : null;
    const silverLow = typeof metalsData?.silver?.low === 'number' ? metalsData.silver.low : null;

    // Dynamic Local Benchmark (PKR per Tola & Gram)
    const pkrGold = calculateGoldLocalMetrics(goldPriceUsd, usdPkrRate, true);

    const cryptoItems = [];
    [btc, eth, sol, bnb].forEach((coin, idx) => {
      if (!coin || typeof coin.current_price !== 'number') return;
      const defaultCategories = ['Digital Gold', 'Smart Contracts', 'High-Throughput L1', 'Exchange Native'];
      const defaultSymbols = ['BTC', 'ETH', 'SOL', 'BNB'];
      const sym = (coin.symbol || defaultSymbols[idx]).toUpperCase();
      const sparklineData = Array.isArray(coin.sparkline_in_7d?.price) && coin.sparkline_in_7d.price.length > 5
        ? coin.sparkline_in_7d.price
        : null;

      cryptoItems.push({
        id: (coin.id || sym.toLowerCase()),
        type: 'crypto',
        flagCode: sym,
        name: coin.name || sym,
        symbol: sym,
        category: defaultCategories[idx] || 'Digital Asset',
        price: coin.current_price,
        formattedPrice: `$${coin.current_price < 1 ? coin.current_price.toFixed(4) : coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: typeof coin.price_change_percentage_24h === 'number' ? coin.price_change_percentage_24h : null,
        high: typeof coin.high_24h === 'number' ? coin.high_24h : null,
        low: typeof coin.low_24h === 'number' ? coin.low_24h : null,
        sparkline: sparklineData,
        coinObj: coin,
        rangePrefix: '$'
      });
    });

    const forexItems = [
      {
        id: 'usd-pkr',
        type: 'forex',
        flagCode: 'PKR',
        name: 'USD / PKR (Reference Rate)',
        symbol: 'USD/PKR',
        category: 'Emerging FX',
        price: usdPkrRate,
        formattedPrice: usdPkrRate !== null ? `₨ ${usdPkrRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
        change: null,
        high: null,
        low: null,
        sparkline: null,
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
        formattedPrice: eurUsdRate !== null ? `$${eurUsdRate.toFixed(4)}` : 'N/A',
        change: null,
        high: null,
        low: null,
        sparkline: null,
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
        formattedPrice: gbpUsdRate !== null ? `$${gbpUsdRate.toFixed(4)}` : 'N/A',
        change: null,
        high: null,
        low: null,
        sparkline: null,
        base: 'GBP',
        target: 'USD',
        rangePrefix: '$'
      },
      {
        id: 'gold-xau',
        type: 'forex',
        isGold: true,
        flagCode: 'XAU',
        name: 'Gold Spot / Troy Ounce',
        symbol: 'XAU/USD',
        category: 'Spot Bullion',
        price: goldPriceUsd,
        formattedPrice: goldPriceUsd !== null ? `$${goldPriceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
        change: goldChange,
        high: goldHigh,
        low: goldLow,
        sparkline: null,
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
        formattedPrice: silverPriceUsd !== null ? `$${silverPriceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
        change: silverChange,
        high: silverHigh,
        low: silverLow,
        sparkline: null,
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
        formattedPrice: pkrGold.pricePerTola24K !== null ? `₨ ${Math.round(pkrGold.pricePerTola24K).toLocaleString()}` : 'N/A',
        change: goldChange,
        high: null,
        low: null,
        sparkline: null,
        base: 'XAU',
        target: 'PKR',
        subMetric: pkrGold.pricePerGram24K !== null ? `₨ ${Math.round(pkrGold.pricePerGram24K).toLocaleString()}/g · 22K: ₨ ${Math.round(pkrGold.pricePerTola22K).toLocaleString()}` : null,
        rangePrefix: '₨ ',
        customTag: '24K Benchmark'
      }
    ];

    return [...cryptoItems, ...forexItems];
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
    <section id="markets" className="py-12 sm:py-16 lg:py-20 border-b border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2.5 border border-blue-500/20 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Asset Market Matrix</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Live Market Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1 max-w-xl font-medium">
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
              All Assets ({assets.length})
            </button>
            <button
              onClick={() => setActiveTab('crypto')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'crypto'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Crypto ({assets.filter(a => a.type === 'crypto').length})
            </button>
            <button
              onClick={() => setActiveTab('forex')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'forex'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Forex / Gold ({assets.filter(a => a.type === 'forex').length})
            </button>
          </div>
        </div>

        {/* Multi-Asset Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const hasChange = typeof asset.change === 'number' && !isNaN(asset.change);
            const isPositive = hasChange ? asset.change >= 0 : null;
            const hasSparkline = Array.isArray(asset.sparkline) && asset.sparkline.length > 1;

            let pointsStr = '';
            if (hasSparkline) {
              const sparkMin = Math.min(...asset.sparkline);
              const sparkMax = Math.max(...asset.sparkline);
              const sparkRange = sparkMax - sparkMin || 1;
              pointsStr = asset.sparkline
                .map((val, idx) => {
                  const x = (idx / (asset.sparkline.length - 1)) * 90;
                  const y = 40 - ((val - sparkMin) / sparkRange) * 32;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(' ');
            }

            return (
              <div
                key={asset.id}
                onClick={() => handleAssetAction(asset)}
                className={`border rounded-2xl p-3.5 sm:p-4.5 transition-all duration-200 group flex flex-col justify-between shadow-xs dark:shadow-lg cursor-pointer ${
                  asset.isGold
                    ? 'bg-gradient-to-b from-amber-500/[0.04] to-white dark:to-[#0C1017] border-amber-500/30 hover:border-amber-500/60 hover:shadow-amber-500/5'
                    : asset.isSilver
                    ? 'bg-gradient-to-b from-slate-400/[0.04] to-white dark:to-[#0C1017] border-slate-300 dark:border-slate-700 hover:border-slate-400'
                    : 'bg-white dark:bg-[#0C1017] border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18]'
                }`}
              >
                <div>
                  {/* Card Header: Flag/Badge, Symbol, Tag & 24h Change */}
                  <div className="flex items-center justify-between mb-2 gap-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <CurrencyFlag code={asset.flagCode || asset.base} className="w-5 h-5 shrink-0" />
                      <span className={`font-bold text-sm transition-colors truncate ${
                        asset.isGold 
                          ? 'text-amber-500 dark:text-amber-400 group-hover:text-amber-600' 
                          : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}>
                        {asset.symbol}
                      </span>
                      {asset.isGold ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                          {asset.customTag || 'Gold'}
                        </span>
                      ) : asset.isSilver ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-400/10 text-slate-500 dark:text-slate-300 border border-slate-400/20 shrink-0">
                          {asset.customTag || 'Silver'}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                          {asset.category}
                        </span>
                      )}
                    </div>

                    {isPositive !== null ? (
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums shrink-0 ${
                          isPositive 
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                            : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPositive ? '+' : ''}{asset.change.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0">
                        N/A
                      </span>
                    )}
                  </div>

                  {/* Asset Full Name */}
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate mb-2">
                    {asset.name}
                  </div>

                  {/* Price & Sparkline Row */}
                  <div className="flex items-baseline justify-between gap-2 mt-1">
                    <div className="min-w-0">
                      <div className={`text-xl sm:text-2xl font-black tabular-nums tracking-tight truncate ${
                        asset.isGold ? 'text-amber-500 dark:text-amber-400' : 'text-slate-900 dark:text-white'
                      }`}>
                        {asset.formattedPrice}
                      </div>
                      {asset.subMetric && (
                        <div className="text-[10px] sm:text-[11px] font-medium text-amber-600 dark:text-amber-400/90 mt-0.5 tabular-nums truncate">
                          {asset.subMetric}
                        </div>
                      )}
                    </div>

                    {/* Interactive SVG Sparkline or N/A */}
                    <div className="w-20 sm:w-24 h-8 sm:h-9 shrink-0 flex items-center justify-end">
                      {hasSparkline ? (
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
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          N/A
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 24h Range Bar & Action Footer */}
                <div className="mt-3.5 pt-2.5 sm:mt-4 sm:pt-3 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-[11px] sm:text-xs font-medium gap-2">
                  <div className="text-slate-600 dark:text-slate-400 min-w-0 truncate">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">24h: </span>
                    {asset.low != null && asset.high != null ? (
                      <>
                        <span className="text-slate-800 dark:text-slate-200 tabular-nums font-semibold">
                          {asset.rangePrefix || '$'}{formatRangeVal(asset.low, asset)}
                        </span>
                        <span className="text-slate-400 dark:text-slate-600 mx-1">-</span>
                        <span className="text-slate-800 dark:text-slate-200 tabular-nums font-semibold">
                          {asset.rangePrefix || '$'}{formatRangeVal(asset.high, asset)}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 font-semibold">N/A</span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssetAction(asset);
                    }}
                    className={`p-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer flex items-center gap-1 active:scale-95 shadow-xs shrink-0 ${
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
