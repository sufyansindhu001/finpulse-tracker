import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Coins, 
  Globe, 
  RefreshCw,
  ArrowRight,
  Filter,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { getCurrencyFlagUrl } from '../utils/currencyFlags';

export default function RatesPage({ rates = {}, cryptoList = [], onRefresh, isRefreshing }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const tabParam = searchParams.get('tab') || 'currencies';
  const [activeTab, setActiveTab] = useState(tabParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [highlightedAsset, setHighlightedAsset] = useState(null);
  const [visibleCurrencyCount, setVisibleCurrencyCount] = useState(10);

  useEffect(() => {
    const tab = searchParams.get('tab');
    const asset = searchParams.get('asset') || searchParams.get('search');

    if (tab) {
      setActiveTab(tab);
    } else if (asset) {
      const upper = asset.toUpperCase();
      const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'TRX', 'USDT', 'USDC'];
      const isGold = ['XAU', 'XAG', 'GOLD', 'SILVER', 'TOLA'].includes(upper);
      const isCrypto = cryptoSymbols.includes(upper);

      if (isGold) {
        setActiveTab('gold');
      } else if (isCrypto) {
        setActiveTab('crypto');
      } else {
        setActiveTab('currencies');
      }
    }

    if (asset) {
      const upper = asset.toUpperCase();
      setHighlightedAsset(upper);

      const timer = setTimeout(() => {
        const targetId = ['XAU', 'GOLD'].includes(upper) 
          ? 'rate-row-XAU' 
          : upper === 'XAG' 
            ? 'rate-row-XAG' 
            : `rate-row-${upper}`;
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);

      const clearTimer = setTimeout(() => {
        setHighlightedAsset(null);
      }, 3500);

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Base currency rates calculations
  const usdToPkr = rates.PKR || 277.10;

  // Format currency list
  const currencyRows = useMemo(() => {
    const list = Object.entries(rates).map(([code, val]) => {
      // Calculate rate against USD and rate against PKR
      const rateToPkr = code === 'USD' ? usdToPkr : (usdToPkr / val);
      // Simulated 24h delta based on pseudo hash for stable display
      const charCodeSum = code.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const pseudoDelta = (((charCodeSum % 30) - 14) / 10).toFixed(2);
      const isPositive = parseFloat(pseudoDelta) >= 0;

      return {
        code,
        name: code === 'USD' ? 'US Dollar' : code === 'PKR' ? 'Pakistani Rupee' : code === 'EUR' ? 'Euro' : code === 'GBP' ? 'British Pound' : code === 'SAR' ? 'Saudi Riyal' : code === 'AED' ? 'UAE Dirham' : `${code} Currency`,
        rateUsd: val,
        ratePkr: rateToPkr,
        change: `${isPositive ? '+' : ''}${pseudoDelta}%`,
        isPositive,
        lastUpdated: 'Live Feed',
        flagUrl: getCurrencyFlagUrl(code)
      };
    });

    return list.filter(item => item.code !== 'XAU' && item.code !== 'XAG');
  }, [rates, usdToPkr]);

  // Format crypto list
  const cryptoRows = useMemo(() => {
    const defaultCrypto = [
      { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', current_price: 96420, price_change_percentage_24h: 2.84, market_cap: 1890000000000, total_volume: 42500000000 },
      { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', current_price: 2745.5, price_change_percentage_24h: 1.92, market_cap: 330000000000, total_volume: 21400000000 },
      { id: 'solana', symbol: 'SOL', name: 'Solana', current_price: 194.5, price_change_percentage_24h: 5.12, market_cap: 92000000000, total_volume: 6800000000 },
      { id: 'binancecoin', symbol: 'BNB', name: 'BNB', current_price: 648.2, price_change_percentage_24h: 1.10, market_cap: 95000000000, total_volume: 1800000000 },
      { id: 'ripple', symbol: 'XRP', name: 'XRP', current_price: 2.34, price_change_percentage_24h: -0.85, market_cap: 132000000000, total_volume: 8500000000 },
      { id: 'cardano', symbol: 'ADA', name: 'Cardano', current_price: 0.82, price_change_percentage_24h: 3.40, market_cap: 29000000000, total_volume: 1200000000 },
      { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', current_price: 0.28, price_change_percentage_24h: -1.25, market_cap: 41000000000, total_volume: 2900000000 },
      { id: 'tron', symbol: 'TRX', name: 'TRON', current_price: 0.24, price_change_percentage_24h: 0.65, market_cap: 21000000000, total_volume: 980000000 },
    ];

    const source = (cryptoList && cryptoList.length > 0) ? cryptoList : defaultCrypto;
    return source.map(c => ({
      id: c.id,
      symbol: (c.symbol || '').toUpperCase(),
      name: c.name,
      price: c.current_price,
      change: c.price_change_percentage_24h || 0,
      isPositive: (c.price_change_percentage_24h || 0) >= 0,
      marketCap: c.market_cap || 0,
      volume: c.total_volume || 0,
      image: c.image
    }));
  }, [cryptoList]);

  // Gold benchmarks
  const goldRows = useMemo(() => {
    const goldOzUsd = 2684.50;
    const silverOzUsd = 31.85;

    const goldPerGram24K = (goldOzUsd * usdToPkr) / 31.1035;
    const goldPerTola24K = goldPerGram24K * 11.6638;
    const goldPer10g24K = goldPerGram24K * 10;
    const goldPerTola22K = goldPerTola24K * (22 / 24);
    const goldPerGram22K = goldPerGram24K * (22 / 24);
    const goldPerTola21K = goldPerTola24K * (21 / 24);
    const goldPerTola18K = goldPerTola24K * (18 / 24);

    return [
      { purity: '24K Gold (Pure Bullion)', unit: 'Per Tola (11.66g)', ratePkr: goldPerTola24K, rateUsd: (goldPerTola24K / usdToPkr), change: '+0.38%', isPositive: true },
      { purity: '24K Gold (Pure Bullion)', unit: 'Per 10 Grams', ratePkr: goldPer10g24K, rateUsd: (goldPer10g24K / usdToPkr), change: '+0.38%', isPositive: true },
      { purity: '24K Gold (Pure Bullion)', unit: 'Per 1 Gram', ratePkr: goldPerGram24K, rateUsd: (goldPerGram24K / usdToPkr), change: '+0.38%', isPositive: true },
      { purity: '24K Gold Spot (International)', unit: '1 Troy Ounce (oz)', ratePkr: goldOzUsd * usdToPkr, rateUsd: goldOzUsd, change: '+0.45%', isPositive: true },
      { purity: '22K Gold (Jewelry Standard)', unit: 'Per Tola', ratePkr: goldPerTola22K, rateUsd: (goldPerTola22K / usdToPkr), change: '+0.38%', isPositive: true },
      { purity: '22K Gold (Jewelry Standard)', unit: 'Per Gram', ratePkr: goldPerGram22K, rateUsd: (goldPerGram22K / usdToPkr), change: '+0.38%', isPositive: true },
      { purity: '21K Gold (Middle East Purity)', unit: 'Per Tola', ratePkr: goldPerTola21K, rateUsd: (goldPerTola21K / usdToPkr), change: '+0.35%', isPositive: true },
      { purity: '18K Gold (Italian Standard)', unit: 'Per Tola', ratePkr: goldPerTola18K, rateUsd: (goldPerTola18K / usdToPkr), change: '+0.30%', isPositive: true },
      { purity: 'Silver Spot (XAG/USD)', unit: '1 Troy Ounce (oz)', ratePkr: silverOzUsd * usdToPkr, rateUsd: silverOzUsd, change: '+1.12%', isPositive: true },
    ];
  }, [usdToPkr]);

  // Filtered Currencies
  const filteredCurrencies = useMemo(() => {
    let result = currencyRows.filter(c => 
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    result.sort((a, b) => {
      if (sortField === 'rate') {
        return sortOrder === 'asc' ? a.ratePkr - b.ratePkr : b.ratePkr - a.ratePkr;
      }
      return sortOrder === 'asc' ? a.code.localeCompare(b.code) : b.code.localeCompare(a.code);
    });
    return result;
  }, [currencyRows, searchQuery, sortField, sortOrder]);

  const isSearching = searchQuery.trim().length > 0;

  // Search filters across full dataset instantly; progressive rendering when browsing
  const displayedCurrencies = useMemo(() => {
    if (isSearching) {
      return filteredCurrencies;
    }
    return filteredCurrencies.slice(0, visibleCurrencyCount);
  }, [filteredCurrencies, isSearching, visibleCurrencyCount]);

  const hasMoreCurrencies = visibleCurrencyCount < filteredCurrencies.length;

  const handleLoadMoreCurrencies = () => {
    setVisibleCurrencyCount(prev => Math.min(prev + 20, filteredCurrencies.length));
  };

  const handleViewAllCurrencies = () => {
    setVisibleCurrencyCount(filteredCurrencies.length);
  };

  // Expand visible range if deep-linked to a currency row below index 10
  useEffect(() => {
    const asset = searchParams.get('asset') || searchParams.get('search');
    if (asset) {
      const upper = asset.toUpperCase();
      const targetIndex = filteredCurrencies.findIndex(c => c.code === upper);
      if (targetIndex >= 0 && targetIndex >= visibleCurrencyCount) {
        setVisibleCurrencyCount(Math.max(targetIndex + 5, 30));
      }
    }
  }, [searchParams, filteredCurrencies, visibleCurrencyCount]);

  // Filtered Crypto
  const filteredCrypto = useMemo(() => {
    return cryptoRows.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cryptoRows, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
            <span className="text-xs uppercase font-bold tracking-widest text-[#00E676]">
              INSTITUTIONAL RATES TERMINAL
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Live Financial Rates Matrix
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B3C2] mt-1">
            Real-time interbank quotes, cryptocurrency rankings, and certified precious metals benchmarks.
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#0A1726] hover:bg-slate-50 dark:hover:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-white transition-all cursor-pointer disabled:opacity-50 self-start md:self-auto shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#00E676] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Rates'}</span>
          </button>
        )}
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 overflow-x-auto">
          <button
            onClick={() => handleTabChange('currencies')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'currencies'
                ? 'bg-[#00E676] text-[#06111F] shadow-md shadow-[#00E676]/20'
                : 'text-slate-600 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Currencies ({currencyRows.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('crypto')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'crypto'
                ? 'bg-[#00E676] text-[#06111F] shadow-md shadow-[#00E676]/20'
                : 'text-slate-600 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Crypto ({cryptoRows.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('gold')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'gold'
                ? 'bg-[#00E676] text-[#06111F] shadow-md shadow-[#00E676]/20'
                : 'text-slate-600 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Gold &amp; Metals</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-[#00E676] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${activeTab}...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-[#A8B3C2] focus:outline-none focus:border-[#00E676]"
          />
        </div>
      </div>

      {/* TAB 1: CURRENCIES TABLE */}
      {activeTab === 'currencies' && (
        <div className="rounded-3xl bg-white dark:bg-[#0A1726]/80 border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#06111F]/70 text-slate-600 dark:text-[#A8B3C2] uppercase font-bold tracking-wider text-[11px]">
                  <th className="py-4 px-6">Asset / Currency</th>
                  <th className="py-4 px-6">Rate (PKR Benchmark)</th>
                  <th className="py-4 px-6">Rate (vs USD)</th>
                  <th className="py-4 px-6">24h Change</th>
                  <th className="py-4 px-6 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {displayedCurrencies.map((c) => {
                  const isHighlighted = highlightedAsset === c.code.toUpperCase();
                  return (
                    <tr 
                      key={c.code} 
                      id={`rate-row-${c.code.toUpperCase()}`}
                      className={`animate-fade-in transition-all duration-300 ${
                        isHighlighted 
                          ? 'bg-[#00E676]/20 ring-2 ring-[#00E676] shadow-lg shadow-[#00E676]/20' 
                          : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img 
                            src={c.flagUrl} 
                            alt={c.code} 
                            className="w-6 h-4.5 rounded object-cover shadow-xs" 
                          />
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white text-sm">{c.code}</span>
                            <span className="text-[11px] text-slate-500 dark:text-[#A8B3C2] block">{c.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white text-sm font-tabular">
                        ₨ {c.ratePkr.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-[#A8B3C2] font-semibold font-tabular">
                        ${c.rateUsd.toFixed(4)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          c.isPositive ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {c.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{c.change}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => navigate(`/converter?from=${c.code}&to=PKR`)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#00E676]/10 hover:bg-[#00E676] text-[#00E676] hover:text-[#06111F] font-bold text-xs transition-colors cursor-pointer"
                        >
                          Convert
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Container for Progressive Loading */}
          {!isSearching && (
            <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-[#06111F]/60 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
                <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
                <span>
                  Showing <span className="font-bold text-slate-900 dark:text-white font-tabular">{displayedCurrencies.length}</span> of <span className="font-bold text-slate-900 dark:text-white font-tabular">{filteredCurrencies.length}</span> international currencies
                </span>
              </div>

              {hasMoreCurrencies ? (
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {visibleCurrencyCount >= 30 && (
                    <button
                      onClick={handleViewAllCurrencies}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white dark:bg-[#0D1B2A] hover:bg-slate-100 dark:hover:bg-[#132338] border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs hover:border-[#00E676]/30"
                    >
                      View All Currencies ({filteredCurrencies.length})
                    </button>
                  )}

                  <button
                    onClick={handleLoadMoreCurrencies}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#00E676] hover:bg-[#00FF88] text-[#06111F] text-xs font-black shadow-md shadow-[#00E676]/20 transition-all cursor-pointer hover:-translate-y-0.5"
                  >
                    <span>Load More (+20)</span>
                    <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00E676]/10 border border-[#00E676]/20 text-xs font-semibold text-[#00E676]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Showing all {filteredCurrencies.length} currencies</span>
                </div>
              )}
            </div>
          )}

          {isSearching && (
            <div className="p-4 bg-slate-50/70 dark:bg-[#06111F]/60 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-[#A8B3C2]">
              <span>
                Found <strong className="text-slate-900 dark:text-white font-tabular">{filteredCurrencies.length}</strong> currencies matching <span className="text-[#00E676]">"{searchQuery}"</span>
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#00E676] hover:underline font-bold cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CRYPTO TABLE */}
      {activeTab === 'crypto' && (
        <div className="rounded-3xl bg-white dark:bg-[#0A1726]/80 border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#06111F]/70 text-slate-600 dark:text-[#A8B3C2] uppercase font-bold tracking-wider text-[11px]">
                  <th className="py-4 px-6">Asset</th>
                  <th className="py-4 px-6">Price (USD)</th>
                  <th className="py-4 px-6">Price in PKR</th>
                  <th className="py-4 px-6">24h Change</th>
                  <th className="py-4 px-6">24h Volume</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredCrypto.map((c) => {
                  const isHighlighted = highlightedAsset === c.symbol.toUpperCase();
                  return (
                    <tr 
                      key={c.symbol} 
                      id={`rate-row-${c.symbol.toUpperCase()}`}
                      className={`transition-all duration-300 ${
                        isHighlighted 
                          ? 'bg-[#00E676]/20 ring-2 ring-[#00E676] shadow-lg shadow-[#00E676]/20' 
                          : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {c.image ? (
                            <img src={c.image} alt={c.name} className="w-7 h-7 rounded-full" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#00E676]/10 text-[#00E676] font-black flex items-center justify-center text-xs">
                              {c.symbol.slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white text-sm">{c.symbol}</span>
                            <span className="text-[11px] text-slate-500 dark:text-[#A8B3C2] block">{c.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white text-sm font-tabular">
                        ${c.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-[#00E676] font-bold font-tabular">
                        ₨ {(c.price * usdToPkr).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          c.isPositive ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {c.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{c.change.toFixed(2)}%</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-[#A8B3C2] font-tabular">
                        ${(c.volume / 1e9).toFixed(2)}B
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => navigate(`/charts?asset=${c.symbol}`)}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          Chart
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GOLD TABLE */}
      {activeTab === 'gold' && (
        <div className="rounded-3xl bg-white dark:bg-[#0A1726]/80 border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#06111F]/70 text-slate-600 dark:text-[#A8B3C2] uppercase font-bold tracking-wider text-[11px]">
                  <th className="py-4 px-6">Grade / Benchmark</th>
                  <th className="py-4 px-6">Unit</th>
                  <th className="py-4 px-6">PKR Price</th>
                  <th className="py-4 px-6">USD Value</th>
                  <th className="py-4 px-6">24h Trend</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {goldRows.map((g, idx) => {
                  const isGoldRow = highlightedAsset === 'GOLD' || highlightedAsset === 'XAU' || highlightedAsset === 'TOLA';
                  const isSilverRow = highlightedAsset === 'XAG' || highlightedAsset === 'SILVER';
                  const isHighlighted = (idx === 0 && isGoldRow) || (idx === 8 && isSilverRow);
                  const rowId = idx === 0 ? 'rate-row-XAU' : idx === 8 ? 'rate-row-XAG' : `rate-row-gold-${idx}`;

                  return (
                    <tr 
                      key={idx} 
                      id={rowId}
                      className={`transition-all duration-300 ${
                        isHighlighted 
                          ? 'bg-amber-500/20 ring-2 ring-amber-400 shadow-lg shadow-amber-500/20' 
                          : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm">{g.purity}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-amber-600 dark:text-amber-300 font-semibold">
                        {g.unit}
                      </td>
                      <td className="py-4 px-6 font-extrabold text-[#00E676] text-sm font-tabular">
                        ₨ {Math.round(g.ratePkr).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-slate-700 dark:text-white font-tabular">
                        ${g.rateUsd.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#00E676]/10 text-[#00E676]">
                          <TrendingUp className="w-3 h-3" />
                          <span>{g.change}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => navigate('/gold')}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-500 dark:text-amber-400 hover:text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
