import React, { useState, useMemo } from 'react';
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
  AlertCircle
} from 'lucide-react';

export default function CryptoTracker({ 
  cryptoList = [], 
  isLoading, 
  error, 
  onRetry,
  onOpenCryptoConverter 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'gainers', 'losers'
  const [sortKey, setSortKey] = useState('market_cap_rank');
  const [sortAsc, setSortAsc] = useState(true);

  // Top summary stats calculated strictly from the live API response
  const stats = useMemo(() => {
    if (!cryptoList || cryptoList.length === 0) {
      return { totalCap: 0, totalVol: 0, btcDominance: 0, topGainer: null };
    }

    const totalCap = cryptoList.reduce((acc, c) => acc + (c.market_cap || 0), 0);
    const totalVol = cryptoList.reduce((acc, c) => acc + (c.total_volume || 0), 0);
    
    // Find BTC dominance among top 20
    const btc = cryptoList.find(c => c.symbol.toLowerCase() === 'btc');
    const btcDominance = btc && totalCap > 0 ? ((btc.market_cap / totalCap) * 100).toFixed(1) : 0;
    
    // Top gainer
    const sortedByGain = [...cryptoList].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));
    const topGainer = sortedByGain[0] || null;

    return { totalCap, totalVol, btcDominance, topGainer };
  }, [cryptoList]);

  // Filtering & Sorting
  const filteredCoins = useMemo(() => {
    if (!cryptoList) return [];
    return cryptoList
      .filter(coin => {
        const matchesSearch = 
          coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(searchTerm.toLowerCase());
        
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

  // Helper formatter for compact numbers
  const formatCompact = (num) => {
    if (!num) return '$0';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="w-full">
      {/* Top Stat Cards Calculated from Live API Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 backdrop-blur-sm shadow-sm transition-colors duration-200">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Market Cap (Top 20)</span>
            <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {isLoading && !cryptoList.length ? (
              <span className="inline-block w-20 h-6 bg-slate-200 dark:bg-slate-800 animate-pulse rounded"></span>
            ) : (
              formatCompact(stats.totalCap)
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Live CoinGecko aggregation
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 backdrop-blur-sm shadow-sm transition-colors duration-200">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>24h Trading Volume</span>
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {isLoading && !cryptoList.length ? (
              <span className="inline-block w-20 h-6 bg-slate-200 dark:bg-slate-800 animate-pulse rounded"></span>
            ) : (
              formatCompact(stats.totalVol)
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Aggregated 24h turnover
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 backdrop-blur-sm shadow-sm transition-colors duration-200">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Bitcoin Share (Top 20)</span>
            <span className="text-amber-500 font-bold font-mono">₿</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {isLoading && !cryptoList.length ? (
              <span className="inline-block w-16 h-6 bg-slate-200 dark:bg-slate-800 animate-pulse rounded"></span>
            ) : (
              `${stats.btcDominance}%`
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Top-tier asset weighting
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-4 backdrop-blur-sm shadow-sm transition-colors duration-200">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>24h Top Gainer</span>
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            {isLoading && !cryptoList.length ? (
              <span className="inline-block w-24 h-6 bg-slate-200 dark:bg-slate-800 animate-pulse rounded"></span>
            ) : stats.topGainer ? (
              <>
                <span className="font-mono uppercase">{stats.topGainer.symbol}</span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 font-bold">
                  +{(stats.topGainer.price_change_percentage_24h || 0).toFixed(2)}%
                </span>
              </>
            ) : (
              <span className="text-sm text-slate-400">Loading...</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {stats.topGainer ? `${stats.topGainer.name} is leading gains` : 'Real-time feed'}
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-xl transition-colors duration-200">
        
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Live Cryptocurrency Prices</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                CoinGecko Live API
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time USD prices, 24h percentage changes, and market caps for top digital assets.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search BTC, ETH, SOL..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-full sm:w-52"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setFilterType('all')}
                className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                  filterType === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('gainers')}
                className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                  filterType === 'gainers' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Gainers
              </button>
              <button
                onClick={() => setFilterType('losers')}
                className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                  filterType === 'losers' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Losers
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="my-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center justify-between text-xs text-rose-600 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium cursor-pointer"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && !cryptoList.length && (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Fetching latest prices from CoinGecko public API...</p>
          </div>
        )}

        {/* Table View */}
        {cryptoList.length > 0 && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th 
                    onClick={() => handleSort('market_cap_rank')} 
                    className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    <div className="flex items-center gap-1">
                      <span>#</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3">Cryptocurrency</th>
                  <th 
                    onClick={() => handleSort('current_price')} 
                    className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Live Price (USD)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('price_change_percentage_24h')} 
                    className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>24h Change %</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center hidden md:table-cell">24h Range (Low / High)</th>
                  <th 
                    onClick={() => handleSort('total_volume')} 
                    className="py-3 px-3 text-right hidden lg:table-cell cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>24h Volume</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('market_cap')} 
                    className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Market Cap</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right">Convert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {filteredCoins.map((coin) => {
                  const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
                  
                  // 24h range calculation
                  const low = coin.low_24h || coin.current_price;
                  const high = coin.high_24h || coin.current_price;
                  const rangeDiff = high - low;
                  const currentPos = rangeDiff > 0 
                    ? Math.min(100, Math.max(0, ((coin.current_price - low) / rangeDiff) * 100))
                    : 50;

                  return (
                    <tr 
                      key={coin.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                        {coin.market_cap_rank || '-'}
                      </td>

                      {/* Name, Symbol & Real CoinGecko Image */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          {coin.image ? (
                            <img 
                              src={coin.image} 
                              alt={coin.name} 
                              className="w-7 h-7 rounded-full object-cover shrink-0" 
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs uppercase text-blue-600 dark:text-blue-400 shrink-0">
                              {coin.symbol.slice(0, 3)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {coin.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                              {coin.symbol}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ${coin.current_price < 1 
                          ? coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) 
                          : coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* 24h Change */}
                      <td className="py-3.5 px-3 text-right font-mono font-semibold">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold ${
                            isPositive 
                              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20' 
                              : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20'
                          }`}
                        >
                          {isPositive ? <TrendingUp className="w-3 h-3 stroke-[2.5]" /> : <TrendingDown className="w-3 h-3 stroke-[2.5]" />}
                          {isPositive ? '+' : ''}
                          {coin.price_change_percentage_24h !== undefined && coin.price_change_percentage_24h !== null
                            ? coin.price_change_percentage_24h.toFixed(2) 
                            : '0.00'}%
                        </span>
                      </td>

                      {/* 24h Range Bar */}
                      <td className="py-3.5 px-3 hidden md:table-cell">
                        <div className="w-32 mx-auto">
                          <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                            <span>${low < 1 ? low.toFixed(2) : low.toLocaleString()}</span>
                            <span>${high < 1 ? high.toFixed(2) : high.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all"
                              style={{ width: `${currentPos}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* 24h Volume */}
                      <td className="py-3.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300 hidden lg:table-cell text-xs">
                        {formatCompact(coin.total_volume)}
                      </td>

                      {/* Market Cap */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {formatCompact(coin.market_cap)}
                      </td>

                      {/* Quick Convert Button */}
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => onOpenCryptoConverter(coin)}
                          title={`Calculate ${coin.name} in live fiat currencies`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm"
                        >
                          <Coins className="w-3 h-3" />
                          <span className="hidden sm:inline">Calc</span>
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredCoins.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Coins className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                <p className="text-sm">No cryptocurrency found matching "{searchTerm}".</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
