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
  ChevronRight,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  ChevronDown,
  Lock
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

const cryptoFaqs = [
  {
    q: "How are cryptocurrency counter-values in Pakistani Rupees (PKR) calculated?",
    a: "Our engine multiplies the live global US Dollar spot price (sourced from multi-exchange volume-weighted average pricing) by the prevailing SBP interbank USD/PKR benchmark. This provides a standardized baseline for macroeconomic tracking and cross-asset portfolio valuation."
  },
  {
    q: "What is the legal and regulatory status of cryptocurrency in Pakistan?",
    a: "Under State Bank of Pakistan (SBP) Circular BPRD/2018-03, virtual currencies and crypto tokens are not recognized as legal tender and commercial banks are prohibited from facilitating crypto-related transactions or remittances. FGC Spot displays cryptocurrency data strictly for educational, research, and macroeconomic benchmarking purposes."
  },
  {
    q: "Why do peer-to-peer (P2P) exchange rates in Pakistan differ from interbank spot prices?",
    a: "In retail P2P marketplaces (e.g., USDT/PKR), sellers charge a liquidity and risk premium (typically 1.5% to 4.5% above interbank USD/PKR) to compensate for local banking freeze risks, escrow hold times, and domestic payment platform limits."
  },
  {
    q: "What is the difference between circulating supply and total supply?",
    a: "Circulating supply represents the number of tokens actively available and circulating in the public market. Total supply includes coins currently locked in founder vesting schedules, protocol treasuries, or staking reserve contracts."
  },
  {
    q: "Why is cold hardware wallet storage recommended over custodial exchange accounts?",
    a: "Centralized exchanges retain your private cryptographic keys, exposing balances to insolvency, regulatory freezes, or security breaches (the 'not your keys, not your coins' principle). Hardware wallets (such as Ledger or Trezor) keep private keys isolated offline."
  }
];

export default function CryptoPage({ cryptoList = [], onOpenCryptoConverter, rates = {} }) {
  useSEO({
    title: 'Live Cryptocurrency Market Terminal & Prices | FGC Spot',
    description: 'Real-time cryptocurrency tracking, market capitalizations, 24h volume, and instant conversions for top digital assets on FGC Spot.',
    canonical: '/crypto'
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rank'); // 'rank' | 'price' | 'change'
  const [highlightedCoin, setHighlightedCoin] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const usdToPkr = Number.isFinite(Number(rates.PKR)) && Number(rates.PKR) > 0 ? Number(rates.PKR) : null;

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

  const sourceData = Array.isArray(cryptoList) ? cryptoList : [];

  const totalMarketCap = useMemo(() => {
    if (!sourceData.length) return null;
    return sourceData.reduce((acc, c) => acc + (c.market_cap || 0), 0);
  }, [sourceData]);

  const btcDominance = useMemo(() => {
    if (!totalMarketCap || totalMarketCap === 0) return null;
    const btc = sourceData.find(c => (c.symbol || '').toLowerCase() === 'btc');
    if (!btc || !btc.market_cap) return null;
    return ((btc.market_cap / totalMarketCap) * 100).toFixed(1);
  }, [sourceData, totalMarketCap]);

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
            <div className="text-[10px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">Tracked Market Cap</div>
            <div className="text-base font-black text-slate-900 dark:text-white font-tabular">
              {totalMarketCap ? `$${(totalMarketCap / 1e12).toFixed(2)}T` : 'N/A'}
            </div>
            <div className="text-[10px] text-[#00E676] font-semibold">Tier-1 Cryptos</div>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-right shadow-xs">
            <div className="text-[10px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">BTC Dominance</div>
            <div className="text-base font-black text-slate-900 dark:text-white font-tabular">
              {btcDominance ? `${btcDominance}%` : 'N/A'}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-[#A8B3C2]">Relative Share</div>
          </div>
        </div>
      </div>

      {/* Top 4 Featured Cards Grid */}
      {topFeatured.length > 0 ? (
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
                      <img src={coin.image} alt={coin.name} width="32" height="32" decoding="async" loading="lazy" className="w-8 h-8 rounded-full" />
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
                    {usdToPkr !== null ? `≈ ₨ ${(coin.current_price * usdToPkr).toLocaleString(undefined, { maximumFractionDigits: 0 })} PKR` : 'PKR: N/A (FX quote unavailable)'}
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
      ) : (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#0A1726]/60 border border-slate-200 dark:border-white/10 text-center text-xs text-slate-500 dark:text-slate-400">
          Cryptocurrency market feeds are temporarily offline. Upstream connection in progress.
        </div>
      )}

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
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#06111F]/70 text-slate-600 dark:text-[#A8B3C2] uppercase font-bold tracking-wider text-[11px]">
                  <th className="py-3.5 px-3.5 sm:px-6 whitespace-nowrap">Asset Name</th>
                  <th className="py-3.5 px-3.5 sm:px-6 whitespace-nowrap">Price (USD)</th>
                  <th className="py-3.5 px-3.5 sm:px-6 whitespace-nowrap">PKR Equiv.</th>
                  <th className="py-3.5 px-3.5 sm:px-6 whitespace-nowrap">24h Change</th>
                  <th className="py-3.5 px-3.5 sm:px-6 whitespace-nowrap">24h High / Low</th>
                  <th className="py-3.5 px-3.5 sm:px-6 whitespace-nowrap">Market Cap</th>
                  <th className="py-3.5 px-3.5 sm:px-6 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredCoins.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                      {sourceData.length === 0
                        ? 'Cryptocurrency market data is temporarily unavailable from upstream exchange feeds. Please check back shortly.'
                        : 'No cryptocurrencies match your search query.'}
                    </td>
                  </tr>
                ) : (
                  filteredCoins.map((coin) => {
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
                        <td className="py-3.5 px-3.5 sm:px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {coin.image ? (
                              <img src={coin.image} alt={coin.name} width="28" height="28" decoding="async" loading="lazy" className="w-7 h-7 rounded-full" />
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
                        <td className="py-3.5 px-3.5 sm:px-6 font-extrabold text-slate-900 dark:text-white text-sm font-tabular whitespace-nowrap">
                          ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: coin.current_price < 1 ? 4 : 2 })}
                        </td>
                        <td className="py-3.5 px-3.5 sm:px-6 text-[#00E676] font-bold font-tabular whitespace-nowrap">
                          {usdToPkr !== null ? `₨ ${(coin.current_price * usdToPkr).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'PKR: N/A'}
                        </td>
                        <td className="py-3.5 px-3.5 sm:px-6 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isUp ? 'bg-[#00E676]/10 text-[#00E676]' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 sm:px-6 text-slate-600 dark:text-[#A8B3C2] font-tabular whitespace-nowrap">
                          ${coin.high_24h ? coin.high_24h.toLocaleString() : '-'} / ${coin.low_24h ? coin.low_24h.toLocaleString() : '-'}
                        </td>
                        <td className="py-3.5 px-3.5 sm:px-6 text-slate-600 dark:text-[#A8B3C2] font-tabular whitespace-nowrap">
                          ${(coin.market_cap / 1e9).toFixed(2)}B
                        </td>
                        <td className="py-3.5 px-3.5 sm:px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onOpenCryptoConverter && onOpenCryptoConverter(coin)}
                              className="px-3 py-1.5 rounded-lg bg-[#00E676]/10 hover:bg-[#00E676] text-[#00E676] hover:text-[#06111F] font-bold text-xs transition-colors cursor-pointer touch-manipulation select-none"
                            >
                              Convert
                            </button>
                            <button
                              onClick={() => navigate(`/charts?asset=${coin.symbol.toUpperCase()}`)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-xs transition-colors cursor-pointer touch-manipulation select-none"
                            >
                              Chart
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Comprehensive Methodological & Regulatory Intelligence Section */}
      <section className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10 space-y-8">
        
        {/* Methodological Transparency & Calculation Framework */}
        <div className="rounded-3xl bg-white dark:bg-[#0A1726]/80 border border-slate-200 dark:border-white/10 p-6 sm:p-10 shadow-sm dark:shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00E676]/10 text-[#00E676] flex items-center justify-center shrink-0 border border-[#00E676]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00E676]">Methodological Transparency &amp; Valuation</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Cryptocurrency Valuation Framework &amp; Calculation Engine
              </h2>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-5 font-normal">
            <p>
              The FGC Spot Cryptocurrency Terminal provides continuous price discovery, circulating supply tracking, and volume-weighted valuations across Tier-1 digital assets. Each token&apos;s Pakistani Rupee (PKR) counter-value is derived algorithmically to provide an objective macroeconomic benchmark against sovereign fiat purchasing power.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose my-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00E676]">PKR Parity Formula</span>
                <p className="font-mono text-xs text-slate-800 dark:text-white font-bold">Valuation (PKR) = Spot (USD) &times; Interbank (USD/PKR)</p>
                <p className="text-[11px] text-slate-500 leading-normal">Bridges global cryptocurrency spot pricing to domestic currency purchasing power.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00E676]">Market Capitalization</span>
                <p className="font-mono text-xs text-slate-800 dark:text-white font-bold">Market Cap = Circulating Supply &times; Spot Price (USD)</p>
                <p className="text-[11px] text-slate-500 leading-normal">Excludes illiquid treasury lockups and unvested team allocations.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00E676]">24h Price Momentum</span>
                <p className="font-mono text-xs text-slate-800 dark:text-white font-bold">&Delta; (%) = ((Price_t - Price_t-24h) / Price_t-24h) &times; 100</p>
                <p className="text-[11px] text-slate-500 leading-normal">Tracks rolling intraday percentage fluctuations across international liquidity pools.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
              <div className="space-y-2 p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E676]" />
                  <span>Data Providers &amp; Refresh Architecture</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                  <strong>Spot Pricing Feeds:</strong> Aggregated from CoinGecko Public Markets API, synthesizing Volume-Weighted Average Prices (VWAP) across global decentralized and centralized exchanges.
                </p>
                <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                  <strong>Update Frequency:</strong> Tickers poll every 60 seconds. In the event of upstream rate limits or network latency, resilient cached baselines ensure uninterrupted user access.
                </p>
              </div>

              <div className="space-y-2 p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E676]" />
                  <span>Data Limitations &amp; P2P Market Premium</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                  Displayed quotes represent wholesale mid-market pricing. Real-world domestic peer-to-peer (P2P) transactions typically reflect a 1.5% to 4.5% premium over interbank conversion due to domestic payment platform risks, bank account holding friction, and vendor margins.
                </p>
                <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                  Network transaction fees (e.g., Bitcoin mining fees or Ethereum gas) and centralized exchange withdrawal charges are excluded from table spot values.
                </p>
              </div>
            </div>

            {/* Practical Example */}
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 not-prose space-y-2">
              <h3 className="text-sm font-bold text-emerald-600 dark:text-[#00E676] flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Practical Example: Portfolio Valuation of 0.1 Bitcoin (BTC)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                If Bitcoin trades at <strong>$96,420 USD</strong> and the SBP USD/PKR benchmark is <strong>277.10 PKR</strong>:
              </p>
              <ul className="text-xs text-slate-600 dark:text-[#A8B3C2] list-disc pl-5 space-y-1">
                <li><strong>Theoretical Interbank Parity:</strong> 0.1 BTC &times; $96,420 = $9,642 USD &times; 277.10 = <strong>₨ 2,671,798 PKR</strong>.</li>
                <li><strong>Domestic P2P Cash Premium:</strong> If acquiring USDT via local peer-to-peer counters at an effective rate of 285.00 PKR, the acquisition cost increases to <strong>₨ 2,747,970 PKR</strong> (a ~2.85% spread reflecting domestic liquidity friction).</li>
                <li><strong>Cold Storage Security:</strong> Transferring 0.1 BTC to a dedicated hardware wallet incurs a native network mining fee, isolating the asset from custodial third-party counterparty risk.</li>
              </ul>
            </div>

            {/* Regulatory Notice & Cold Storage Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose pt-2">
              <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>State Bank of Pakistan (SBP) Regulatory Stance</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                  Pursuant to State Bank of Pakistan Circular BPRD/2018-03, virtual currencies, initial coin offerings (ICOs), and crypto tokens are neither legal tender nor recognized by the Government of Pakistan. Commercial banks and payment providers are prohibited from dealing in virtual currencies. All cryptocurrency content on FGC Spot is presented strictly for educational, macroeconomic, and software research purposes.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2">
                <h3 className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Self-Custody &amp; Cold Storage Best Practices</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                  Investors interacting with digital assets in authorized global jurisdictions should observe strict cryptographic security. Storing funds on custodial centralized exchanges subjects balances to insolvency and freezing risks. Non-custodial hardware wallets ensure private key sovereignty.
                </p>
                <div className="pt-2">
                  <Link to="/blog/storing-crypto-safely-exchanges-vs-wallets-guide" className="text-xs font-bold text-purple-500 hover:underline flex items-center gap-1">
                    <span>Read Full Cold Storage Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-[11px] text-slate-500 leading-relaxed not-prose">
              <strong>Risk &amp; Compliance Disclosure:</strong> Digital assets exhibit extreme price volatility and regulatory scrutiny. FGC Spot does not provide cryptocurrency brokerage, wallet custody, OTC conversion, or financial advisory services. Nothing published herein constitutes an offer, solicitation, or recommendation to acquire or sell digital assets.
            </div>
          </div>
        </div>

        {/* Interactive FAQ Accordion */}
        <div className="rounded-3xl bg-white dark:bg-[#0A1726]/80 border border-slate-200 dark:border-white/10 p-6 sm:p-10 shadow-sm dark:shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00E676]/10 text-[#00E676] flex items-center justify-center shrink-0 border border-[#00E676]/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00E676]">Frequently Asked Questions</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Frequently Asked Cryptocurrency &amp; Digital Asset Questions
              </h2>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {cryptoFaqs.map((faq, idx) => (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-slate-900 dark:text-white text-sm sm:text-base cursor-pointer group"
                >
                  <span className="group-hover:text-[#00E676] transition-colors pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-[#00E676] transition-transform duration-200 shrink-0 ${openFaq === idx ? 'rotate-180 text-[#00E676]' : ''}`} />
                </button>
                {openFaq === idx && (
                  <p className="mt-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-normal animate-in fade-in duration-200">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
}
