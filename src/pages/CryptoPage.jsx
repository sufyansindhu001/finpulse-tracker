import React, { useState, useMemo, useEffect } from 'react';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Layers, 
  ArrowUpDown, 
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function CryptoPage({ cryptoList = [], onOpenCryptoConverter, rates = {} }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rank'); // 'rank' | 'price' | 'change'
  const [highlightedCoin, setHighlightedCoin] = useState(null);
  const usdToPkr = rates.PKR || 277.10;

  useEffect(() => {
    const asset = searchParams.get('asset') || searchParams.get('coin');
    if (asset) {
      const sym = asset.toUpperCase();
      setHighlightedCoin(sym);
      setTimeout(() => {
        const el = document.getElementById(`crypto-row-${sym}`) || document.getElementById(`crypto-card-${sym}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      const timer = setTimeout(() => setHighlightedCoin(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const defaultCrypto = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', current_price: 96420, price_change_percentage_24h: 2.84, high_24h: 97800, low_24h: 94100, market_cap: 1890000000000, total_volume: 42500000000, circulating_supply: 19780000 },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', current_price: 2745.50, price_change_percentage_24h: 1.92, high_24h: 2810, low_24h: 2680, market_cap: 330000000000, total_volume: 21400000000, circulating_supply: 120400000 },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', current_price: 648.20, price_change_percentage_24h: 1.10, high_24h: 658, low_24h: 636, market_cap: 95000000000, total_volume: 1800000000, circulating_supply: 146000000 },
    { id: 'solana', symbol: 'SOL', name: 'Solana', current_price: 194.50, price_change_percentage_24h: 5.12, high_24h: 198, low_24h: 182, market_cap: 92000000000, total_volume: 6800000000, circulating_supply: 472000000 },
    { id: 'ripple', symbol: 'XRP', name: 'XRP', current_price: 2.34, price_change_percentage_24h: -0.85, high_24h: 2.45, low_24h: 2.28, market_cap: 132000000000, total_volume: 8500000000, circulating_supply: 56000000000 },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', current_price: 0.82, price_change_percentage_24h: 3.40, high_24h: 0.86, low_24h: 0.78, market_cap: 29000000000, total_volume: 1200000000, circulating_supply: 35600000000 },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', current_price: 0.28, price_change_percentage_24h: -1.25, high_24h: 0.31, low_24h: 0.27, market_cap: 41000000000, total_volume: 2900000000, circulating_supply: 146000000000 },
    { id: 'tron', symbol: 'TRX', name: 'TRON', current_price: 0.24, price_change_percentage_24h: 0.65, high_24h: 0.25, low_24h: 0.23, market_cap: 21000000000, total_volume: 980000000, circulating_supply: 86000000000 },
  ];

  const sourceData = (cryptoList && cryptoList.length > 0) ? cryptoList : defaultCrypto;

  const filteredCoins = useMemo(() => {
    let result = sourceData.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === 'price') {
      result.sort((a, b) => b.current_price - a.current_price);
    } else if (sortBy === 'change') {
      result.sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0));
    }
    return result;
  }, [sourceData, searchQuery, sortBy]);

  // Featured top 4 cards
  const topFeatured = sourceData.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-white font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/rates" className="hover:text-slate-900 dark:hover:text-white font-medium">Rates</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold">Cryptocurrency Tracker</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
            <span className="text-xs uppercase font-bold tracking-widest text-[#00E676]">
              REAL-TIME CRYPTO MARKET TERMINAL
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Cryptocurrency Price &amp; Volume Index
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B3C2] mt-2 max-w-2xl leading-relaxed">
            Live prices, circulating liquidity, 24-hour volume metrics, and instant Pakistani Rupee parity across Tier-1 digital assets.
          </p>
        </div>

        {/* Global Market Overview Badges */}
        <div className="flex flex-wrap gap-3">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-right shadow-xs">
            <div className="text-[10px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">Total Market Cap</div>
            <div className="text-base font-black text-slate-900 dark:text-white font-tabular">$3.42T</div>
            <div className="text-[10px] text-[#00E676] font-semibold">+2.15% 24h</div>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-right shadow-xs">
            <div className="text-[10px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">BTC Dominance</div>
            <div className="text-base font-black text-slate-900 dark:text-white font-tabular">58.4%</div>
            <div className="text-[10px] text-slate-500 dark:text-[#A8B3C2]">ETH 14.2%</div>
          </div>
        </div>
      </div>

      {/* Top 4 Featured Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {topFeatured.map((coin) => {
          const isUp = (coin.price_change_percentage_24h || 0) >= 0;
          const isHighlighted = highlightedCoin === coin.symbol.toUpperCase();
          return (
            <div
              key={coin.id}
              id={`crypto-card-${coin.symbol.toUpperCase()}`}
              onClick={() => navigate(`/charts?asset=${coin.symbol.toUpperCase()}`)}
              className={`rounded-3xl border p-5 transition-all duration-300 shadow-sm dark:shadow-xl backdrop-blur-xl space-y-4 cursor-pointer group ${
                isHighlighted
                  ? 'bg-[#00E676]/20 border-[#00E676] ring-2 ring-[#00E676] shadow-lg shadow-[#00E676]/20'
                  : 'bg-white dark:bg-[#0A1726]/80 hover:bg-slate-50 dark:hover:bg-[#0A1726] border-slate-200 dark:border-white/10 hover:border-[#00E676]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {coin.image ? (
                    <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 flex items-center justify-center font-bold text-xs text-[#00E676]">
                      {coin.symbol.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-[#00E676] transition-colors">
                      {coin.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#A8B3C2] uppercase">{coin.symbol}</div>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                  isUp ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%</span>
                </span>
              </div>

              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-tabular">
                  ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: coin.current_price < 1 ? 4 : 2 })}
                </div>
                <div className="text-xs text-[#00E676] font-semibold font-tabular mt-0.5">
                  ≈ ₨ {(coin.current_price * usdToPkr).toLocaleString(undefined, { maximumFractionDigits: 0 })} PKR
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-[#A8B3C2]">
                <span>24h Vol: ${(coin.total_volume / 1e9).toFixed(1)}B</span>
                <span className="text-slate-800 dark:text-white font-bold group-hover:text-[#00E676] flex items-center gap-1">
                  <span>Chart</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Crypto Table Section */}
      <div className="space-y-4">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#00E676] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coin name or symbol (e.g. BTC, Solana)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-[#A8B3C2] focus:outline-none focus:border-[#00E676]"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500 dark:text-[#A8B3C2]">
            <span>Sort by:</span>
            <button
              onClick={() => setSortBy('rank')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                sortBy === 'rank' ? 'bg-[#00E676] text-[#06111F]' : 'bg-white dark:bg-[#0A1726] text-slate-700 dark:text-white border border-slate-200 dark:border-white/10'
              }`}
            >
              Market Cap
            </button>
            <button
              onClick={() => setSortBy('price')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                sortBy === 'price' ? 'bg-[#00E676] text-[#06111F]' : 'bg-white dark:bg-[#0A1726] text-slate-700 dark:text-white border border-slate-200 dark:border-white/10'
              }`}
            >
              Price
            </button>
            <button
              onClick={() => setSortBy('change')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                sortBy === 'change' ? 'bg-[#00E676] text-[#06111F]' : 'bg-white dark:bg-[#0A1726] text-slate-700 dark:text-white border border-slate-200 dark:border-white/10'
              }`}
            >
              24h Gain
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-3xl bg-white dark:bg-[#0A1726]/80 border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#06111F]/70 text-slate-600 dark:text-[#A8B3C2] uppercase font-bold tracking-wider text-[11px]">
                  <th className="py-4 px-6">Asset Name</th>
                  <th className="py-4 px-6">Price (USD)</th>
                  <th className="py-4 px-6">PKR Equiv.</th>
                  <th className="py-4 px-6">24h Change</th>
                  <th className="py-4 px-6">24h High / Low</th>
                  <th className="py-4 px-6">Market Cap</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredCoins.map((coin) => {
                  const isUp = (coin.price_change_percentage_24h || 0) >= 0;
                  const isHighlighted = highlightedCoin === coin.symbol.toUpperCase();
                  return (
                    <tr 
                      key={coin.id} 
                      id={`crypto-row-${coin.symbol.toUpperCase()}`}
                      className={`transition-all duration-300 ${
                        isHighlighted 
                          ? 'bg-[#00E676]/20 ring-2 ring-[#00E676] shadow-lg shadow-[#00E676]/20' 
                          : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {coin.image ? (
                            <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#00E676]/10 text-[#00E676] font-black flex items-center justify-center text-xs">
                              {coin.symbol.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white text-sm block">{coin.name}</span>
                            <span className="text-[11px] text-slate-500 dark:text-[#A8B3C2] uppercase">{coin.symbol}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white text-sm font-tabular">
                        ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: coin.current_price < 1 ? 4 : 2 })}
                      </td>
                      <td className="py-4 px-6 text-[#00E676] font-bold font-tabular">
                        ₨ {(coin.current_price * usdToPkr).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isUp ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-[#A8B3C2] font-tabular">
                        ${coin.high_24h ? coin.high_24h.toLocaleString() : '-'} / ${coin.low_24h ? coin.low_24h.toLocaleString() : '-'}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-[#A8B3C2] font-tabular">
                        ${(coin.market_cap / 1e9).toFixed(2)}B
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onOpenCryptoConverter && onOpenCryptoConverter(coin)}
                            className="px-3 py-1.5 rounded-lg bg-[#00E676]/10 hover:bg-[#00E676] text-[#00E676] hover:text-[#06111F] font-bold text-xs transition-colors cursor-pointer"
                          >
                            Convert
                          </button>
                          <button
                            onClick={() => navigate(`/charts?asset=${coin.symbol.toUpperCase()}`)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            Chart
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
