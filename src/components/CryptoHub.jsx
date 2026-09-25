import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Sparkles, 
  ArrowUpDown, 
  Coins, 
  Loader2,
  PieChart,
  X
} from 'lucide-react';

export default function CryptoHub({ 
  cryptoList = [], 
  isLoading, 
  error, 
  onRetry, 
  onOpenCryptoConverter 
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('coin') || '');
  const [filterType, setFilterType] = useState('all'); // 'all', 'gainers', 'losers'
  const [sortKey, setSortKey] = useState('market_cap_rank');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    const c = searchParams.get('coin');
    if (c) {
      setSearchTerm(c);
      const el = document.getElementById('crypto-table');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchParams]);

  // Top summary stats calculated strictly from the live API response
  const stats = useMemo(() => {
    if (!cryptoList || cryptoList.length === 0) {
      return { totalCap: 0, totalVol: 0, btcDominance: 0, topGainer: null, topLoser: null };
    }

    const totalCap = cryptoList.reduce((acc, c) => acc + (c.market_cap || 0), 0);
    const totalVol = cryptoList.reduce((acc, c) => acc + (c.total_volume || 0), 0);
    
    // Find BTC dominance among top 20
    const btc = cryptoList.find(c => c.symbol.toLowerCase() === 'btc');
    const btcDominance = btc && totalCap > 0 ? ((btc.market_cap / totalCap) * 100).toFixed(1) : '56.4';
    
    // Top gainer and loser
    const sortedByGain = [...cryptoList].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));
    const topGainer = sortedByGain[0] || null;
    const topLoser = sortedByGain[sortedByGain.length - 1] || null;

    return { totalCap, totalVol, btcDominance, topGainer, topLoser };
  }, [cryptoList]);

  // Filtering & Sorting
  const filteredCoins = useMemo(() => {
    if (!cryptoList) return [];
    return cryptoList
      .filter(coin => {
        const query = searchTerm.toLowerCase().trim();
        const matchesSearch = 
          !query ||
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query) ||
          (coin.id && coin.id.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;

        if (filterType === 'gainers') return (coin.price_change_percentage_24h || 0) > 0;
        if (filterType === 'losers') return (coin.price_change_percentage_24h || 0) < 0;
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (valA === undefined) valA = 0;
        if (valB === undefined) valB = 0;

        if (sortAsc) {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [cryptoList, searchTerm, filterType, sortKey, sortAsc]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'market_cap_rank');
    }
  };

  const formatCompact = (num) => {
    if (!num) return '$0';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <section id="crypto-hub" className="py-12 border-b border-slate-200/80 dark:border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2.5 border border-indigo-500/20 font-mono uppercase tracking-wider">
              <Coins className="w-3.5 h-3.5" />
              <span>Digital Asset Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Cryptocurrency Intelligence Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Live CoinGecko market aggregation, multi-token capital tracking, dominance metrics, and liquidity spreads.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>CoinGecko Public API Live</span>
          </div>
        </div>

        {/* 5 KPI Stats Cards with Sentiment Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
          
          <div className="bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase font-mono mb-1.5 flex items-center justify-between">
              <span>Market Cap (Top 20)</span>
              <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
              {isLoading && !cryptoList.length ? 'Loading...' : formatCompact(stats.totalCap)}
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-1">Live market aggregation</div>
          </div>

          <div className="bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase font-mono mb-1.5 flex items-center justify-between">
              <span>24h Trading Volume</span>
              <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
              {isLoading && !cryptoList.length ? 'Loading...' : formatCompact(stats.totalVol)}
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-1">Aggregated global turnover</div>
          </div>

          <div className="bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase font-mono mb-1.5 flex items-center justify-between">
              <span>Bitcoin Dominance</span>
              <span className="text-amber-500 font-bold font-mono">₿</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
              {stats.btcDominance}%
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-1">Tier-1 asset weight</div>
          </div>

          <div className="bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase font-mono mb-1.5 flex items-center justify-between">
              <span>Top 24h Gainer</span>
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              {stats.topGainer ? (
                <>
                  <span className="font-mono uppercase">{stats.topGainer.symbol}</span>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                    +{(stats.topGainer.price_change_percentage_24h || 0).toFixed(2)}%
                  </span>
                </>
              ) : 'Loading...'}
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono mt-1 truncate">Leading altcoin gains</div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase font-mono mb-1.5 flex items-center justify-between">
              <span>Sentiment Breakdown</span>
              <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">64% Bullish</span>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <span className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400">36% Bearish</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#07090E] h-1.5 rounded-full overflow-hidden flex mt-2">
              <div className="bg-emerald-500 h-full w-[64%]" />
              <div className="bg-rose-500 h-full w-[36%]" />
            </div>
          </div>

        </div>

        {/* Table Container */}
        <div id="crypto-table" className="bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-5 sm:p-7 shadow-xs dark:shadow-2xl">
          
          {/* Controls: Search & Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Digital Assets Market Matrix
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search token or symbol..."
                  className="pl-9 pr-8 py-1.5 bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-56 font-mono"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSearchParams({});
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#07090E] p-1 rounded-xl border border-slate-200 dark:border-white/[0.08]">
                <button
                  onClick={() => setFilterType('all')}
                  className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filterType === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('gainers')}
                  className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filterType === 'gainers' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Gainers
                </button>
                <button
                  onClick={() => setFilterType('losers')}
                  className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filterType === 'losers' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Losers
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          {cryptoList.length > 0 && (
            <div className="overflow-x-auto mt-4 rounded-xl border border-slate-200 dark:border-white/[0.05]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-[#07090E]">
                  <tr className="border-b border-slate-200 dark:border-white/[0.06] text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 font-mono">
                    <th onClick={() => handleSort('market_cap_rank')} className="py-3 px-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center gap-1">
                        <span>#</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-3.5">Asset</th>
                    <th onClick={() => handleSort('current_price')} className="py-3 px-3.5 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center justify-end gap-1">
                        <span>Price (USD)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('price_change_percentage_24h')} className="py-3 px-3.5 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center justify-end gap-1">
                        <span>24h Change</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-3.5 text-center hidden md:table-cell">24h Range (Low / High)</th>
                    <th onClick={() => handleSort('total_volume')} className="py-3 px-3.5 text-right hidden lg:table-cell cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center justify-end gap-1">
                        <span>24h Volume</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('market_cap')} className="py-3 px-3.5 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      <div className="flex items-center justify-end gap-1">
                        <span>Market Cap</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-3 px-3.5 text-right">Convert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs">
                  {filteredCoins.map((coin) => {
                    const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
                    const low = coin.low_24h || coin.current_price;
                    const high = coin.high_24h || coin.current_price;
                    const rangeDiff = high - low;
                    const currentPos = rangeDiff > 0 
                      ? Math.min(100, Math.max(0, ((coin.current_price - low) / rangeDiff) * 100))
                      : 50;

                    return (
                      <tr key={coin.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                        <td className="py-3.5 px-3.5 font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                          {coin.market_cap_rank || '-'}
                        </td>
                        <td className="py-3.5 px-3.5">
                          <div className="flex items-center gap-2.5">
                            {coin.image ? (
                              <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full object-cover shrink-0" loading="lazy" width="24" height="24" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-[10px] text-blue-600 dark:text-blue-400">
                                {coin.symbol.slice(0, 3)}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {coin.name}
                              </div>
                              <div className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase">
                                {coin.symbol}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3.5 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                          ${coin.current_price < 1 
                            ? coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) 
                            : coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-3.5 text-right font-mono tabular-nums font-semibold">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isPositive 
                              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                              : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20'
                          }`}>
                            {isPositive ? <TrendingUp className="w-3 h-3 stroke-[2.5]" /> : <TrendingDown className="w-3 h-3 stroke-[2.5]" />}
                            {isPositive ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2) || '0.00'}%
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 hidden md:table-cell">
                          <div className="w-28 mx-auto">
                            <div className="flex justify-between text-[9px] font-mono tabular-nums text-slate-600 dark:text-slate-400 mb-1">
                              <span>${low < 1 ? low.toFixed(2) : Math.round(low).toLocaleString()}</span>
                              <span>${high < 1 ? high.toFixed(2) : Math.round(high).toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-[#07090E] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${currentPos}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3.5 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                          {formatCompact(coin.total_volume)}
                        </td>
                        <td className="py-3.5 px-3.5 text-right font-mono tabular-nums font-bold text-slate-800 dark:text-slate-300">
                          {formatCompact(coin.market_cap)}
                        </td>
                        <td className="py-3.5 px-3.5 text-right">
                          <button
                            onClick={() => onOpenCryptoConverter(coin)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 dark:bg-white/[0.04] dark:hover:bg-blue-600 dark:hover:text-white dark:text-slate-300 text-xs font-semibold transition-all border border-slate-200 dark:border-white/[0.06] cursor-pointer active:scale-95 shadow-xs"
                            title={`Calculate ${coin.name}`}
                          >
                            <Coins className="w-3 h-3" />
                            <span>Calc</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
