import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Globe, 
  ShieldCheck, 
  ArrowUpDown, 
  BookOpen, 
  Info,
  DollarSign,
  Percent
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { BENCHMARK_INDICES, SECTORS, STOCKS_DATA } from '../data/stocksData';
import CompanyModal from '../components/CompanyModal';

export default function StocksPage() {
  useSEO({
    title: 'Global & PSX Stock Market Intelligence Terminal | FGC Spot',
    description: 'Institutional multi-country equity screener, PSX KSE-100 valuation multiples, NYSE/NASDAQ tracking, dividend yield screening, and equity research.',
    canonical: '/stocks'
  });

  const [selectedCountry, setSelectedCountry] = useState('all'); // 'all' | 'us' | 'pk' | 'uk' | 'sa' | 'jp'
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [quickFilter, setQuickFilter] = useState('all'); // 'all' | 'gainers' | 'dividends' | 'value'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('marketCap');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activeModalStock, setActiveModalStock] = useState(null);

  // Filter benchmark indices
  const displayedBenchmarks = useMemo(() => {
    if (selectedCountry === 'all') return BENCHMARK_INDICES;
    return BENCHMARK_INDICES.filter(b => b.id === selectedCountry);
  }, [selectedCountry]);

  // Filtered & Sorted Stocks
  const filteredStocks = useMemo(() => {
    return STOCKS_DATA.filter(stock => {
      // 1. Country Filter
      if (selectedCountry !== 'all' && stock.country !== selectedCountry) return false;

      // 2. Sector Filter
      if (selectedSector !== 'All Sectors' && stock.sector !== selectedSector) return false;

      // 3. Quick Filter Pills
      if (quickFilter === 'gainers' && stock.changePercent <= 0) return false;
      if (quickFilter === 'dividends' && stock.dividendYield < 5.0) return false;
      if (quickFilter === 'value' && stock.peRatio > 15.0) return false;

      // 4. Search Query (Ticker or Name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTicker = stock.ticker.toLowerCase().includes(q);
        const matchesName = stock.name.toLowerCase().includes(q);
        const matchesSector = stock.sector.toLowerCase().includes(q);
        if (!matchesTicker && !matchesName && !matchesSector) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle numerical conversions if needed
      if (sortField === 'price' || sortField === 'changePercent' || sortField === 'peRatio' || sortField === 'dividendYield') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [selectedCountry, selectedSector, quickFilter, searchQuery, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const countries = [
    { id: 'all', label: 'All Markets', flag: '🌐' },
    { id: 'us', label: 'United States', flag: '🇺🇸', sub: 'NYSE / NASDAQ' },
    { id: 'pk', label: 'Pakistan', flag: '🇵🇰', sub: 'PSX KSE-100' },
    { id: 'uk', label: 'United Kingdom', flag: '🇬🇧', sub: 'LSE FTSE 100' },
    { id: 'sa', label: 'Saudi Arabia', flag: '🇸🇦', sub: 'Tadawul TASI' },
    { id: 'jp', label: 'Japan & APAC', flag: '🇯🇵', sub: 'TSE Nikkei 225' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 animate-in fade-in duration-300">
      
      {/* 1. HERO TERMINAL BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0A1726] to-[#06111F] border border-slate-200 dark:border-white/10 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Multi-Exchange Equity Terminal</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Global & PSX Stock Market <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E676] to-emerald-400">
              Intelligence Terminal
            </span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
            Real-time equity screener tracking Pakistan Stock Exchange (PSX KSE-100), Wall Street (NYSE/NASDAQ), London Stock Exchange (LSE), Saudi Tadawul, and Tokyo (TSE). Cross-evaluate deep-value frontier multiples, P/E compression, and double-digit dividend yields against Mega-Cap tech benchmarks.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
              <span>28 Flagship Blue-Chips</span>
            </span>
            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              Frontier Avg P/E: <strong className="text-[#00E676]">5.2x</strong>
            </span>
            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              S&P 500 Avg P/E: <strong className="text-amber-400">27.4x</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. COUNTRY MARKET SWITCHER TABS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#00E676]" />
            <span>Select Exchange / Country Benchmark</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Active Filter: <strong className="text-slate-900 dark:text-white uppercase">{selectedCountry}</strong>
          </span>
        </div>

        {/* Country Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {countries.map(c => {
            const isSelected = selectedCountry === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCountry(c.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-[#00E676] text-[#06111F] border-[#00E676] shadow-lg shadow-[#00E676]/25 font-black scale-102'
                    : 'bg-white dark:bg-[#0A1726] text-slate-700 dark:text-[#A8B3C2] border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="text-base">{c.flag}</span>
                <div className="text-left">
                  <span className="block leading-none">{c.label}</span>
                  {c.sub && (
                    <span className={`text-[10px] font-mono leading-none ${isSelected ? 'text-[#06111F]/80' : 'text-slate-400'}`}>
                      {c.sub}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Benchmark Index Overview Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 pt-2">
          {displayedBenchmarks.map(bm => (
            <div 
              key={bm.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 transition-all shadow-xs space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{bm.flag}</span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {bm.country}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {bm.exchange}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 font-bold">
                  {bm.sentiment}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">{bm.primaryIndex}</span>
                  <span className="text-base font-black font-mono text-slate-900 dark:text-white">
                    {bm.primaryValue}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#00E676]">
                  {bm.primaryChangePercent}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                <span>Avg P/E: <strong className="text-slate-800 dark:text-slate-200">{bm.peAvg}</strong></span>
                <span>Div Yield: <strong className="text-[#00E676]">{bm.divYieldAvg}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. COMPREHENSIVE EQUITY SCREENER & FILTERS */}
      <div className="space-y-4">
        
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 shadow-xs space-y-4">
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticker (e.g. MEBL, NVDA, OGDC, AAPL)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#00E676] transition-colors"
              />
            </div>

            {/* Sector Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#00E676] shrink-0" />
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#00E676] cursor-pointer"
              >
                {SECTORS.map(sec => (
                  <option key={sec} value={sec} className="bg-white dark:bg-[#0A1726]">
                    {sec}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-white/5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
              Quick Filter:
            </span>
            {[
              { id: 'all', label: 'All Equities' },
              { id: 'gainers', label: 'Top Gainers' },
              { id: 'dividends', label: 'High Dividend Yield (>5%)' },
              { id: 'value', label: 'Low P/E Value (<15x)' },
            ].map(p => {
              const active = quickFilter === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setQuickFilter(p.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#00E676] text-[#06111F] shadow-xs font-extrabold'
                      : 'bg-slate-100 dark:bg-[#06111F] text-slate-600 dark:text-[#A8B3C2] hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}

            <span className="ml-auto text-xs font-mono text-slate-500">
              Showing <strong className="text-slate-900 dark:text-white">{filteredStocks.length}</strong> of {STOCKS_DATA.length} Assets
            </span>
          </div>

        </div>

        {/* Screener Table */}
        <div className="w-full bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#06111F] border-b border-slate-200 dark:border-white/10 text-slate-500 uppercase tracking-wider font-mono text-[11px]">
                  <th className="py-3.5 px-4 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('ticker')}>
                    <div className="flex items-center gap-1">
                      <span>Ticker & Company</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 font-bold">Country / Exchange</th>
                  <th className="py-3.5 px-3 font-bold">Sector</th>
                  <th className="py-3.5 px-3 font-bold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('price')}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Ref. Price</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 font-bold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('changePercent')}>
                    <div className="flex items-center justify-end gap-1">
                      <span>24h Change</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 font-bold text-right">Market Cap</th>
                  <th className="py-3.5 px-3 font-bold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('peRatio')}>
                    <div className="flex items-center justify-end gap-1">
                      <span>P/E Ratio</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 font-bold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('dividendYield')}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Div Yield</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-bold text-center">52W Range Bar</th>
                  <th className="py-3.5 px-4 font-bold text-center">Technical Rating</th>
                  <th className="py-3.5 px-3 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-sans">
                {filteredStocks.map((stock) => {
                  const isPos = stock.changePercent >= 0;
                  const range = stock.high52 - stock.low52 || 1;
                  const posPct = Math.min(100, Math.max(0, ((stock.price - stock.low52) / range) * 100));

                  return (
                    <tr
                      key={stock.id}
                      onClick={() => setActiveModalStock(stock)}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      {/* Ticker & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center font-mono font-bold text-slate-800 dark:text-white text-xs border border-slate-200 dark:border-white/10 group-hover:border-[#00E676] group-hover:text-[#00E676] transition-colors">
                            {stock.ticker.slice(0, 3)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block group-hover:text-[#00E676] transition-colors">
                              {stock.name}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 font-semibold">
                              {stock.ticker}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Country / Exchange */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                          <span>{stock.flag}</span>
                          <span>{stock.exchange}</span>
                        </div>
                      </td>

                      {/* Sector */}
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                          {stock.sector}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {stock.currencySymbol}{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* 24h Change */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded ${
                          isPos 
                            ? 'text-[#00E676] bg-[#00E676]/10' 
                            : 'text-rose-500 bg-rose-500/10'
                        }`}>
                          {isPos ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </td>

                      {/* Market Cap */}
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap font-medium">
                        {stock.marketCap}
                      </td>

                      {/* P/E Ratio */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                        <span className={`${stock.peRatio < 8 ? 'text-[#00E676]' : stock.peRatio < 20 ? 'text-slate-800 dark:text-slate-200' : 'text-amber-500'}`}>
                          {stock.peRatio.toFixed(1)}x
                        </span>
                      </td>

                      {/* Dividend Yield */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                        <span className={`${stock.dividendYield >= 10 ? 'text-[#00E676] font-black' : stock.dividendYield >= 4 ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {stock.dividendYield.toFixed(1)}%
                        </span>
                      </td>

                      {/* 52W Range Mini Bar */}
                      <td className="py-3.5 px-4 w-36">
                        <div className="space-y-1">
                          <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-[#00E676] h-full rounded-full" 
                              style={{ width: `${posPct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] font-mono text-slate-400">
                            <span>{stock.low52.toFixed(0)}</span>
                            <span className="text-[#00E676] font-bold">{posPct.toFixed(0)}%</span>
                            <span>{stock.high52.toFixed(0)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Technical Rating */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          stock.technicalRating === 'Strong Buy'
                            ? 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30'
                            : stock.technicalRating === 'Buy'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : stock.technicalRating === 'Neutral'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}>
                          {stock.technicalRating}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModalStock(stock);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#00E676] hover:text-[#06111F] dark:bg-white/5 dark:hover:bg-[#00E676] dark:hover:text-[#06111F] text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Deep-Dive
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 4. PERMANENT 800+ WORD INSTITUTIONAL RESEARCH GUIDE ON GLOBAL & PSX VALUATION */}
      <section className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 shadow-xl space-y-8">
        
        <div className="space-y-2 border-b border-slate-200 dark:border-white/10 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Institutional Research & Valuation Compendium</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Valuation Architecture: Analyzing P/E Compression, Dividend Reinvestment, and Currency-Adjusted Returns
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#A8B3C2] font-mono">
            Authored by Sufyan Saleem (Senior Financial Analyst, FGC Spot) • Updated Institutional Edition
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-[#CBD5E1] leading-relaxed">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00E676]" />
            <span>1. Emerging Market Multiples vs Developed Tech: Understanding P/E Compression</span>
          </h3>
          <p>
            When cross-evaluating international equity valuations, institutional portfolio managers frequently encounter a striking disparity: the Pakistan Stock Exchange (PSX KSE-100) trades at an aggregate Price-to-Earnings (P/E) multiple hovering between <strong>4.5x and 5.8x</strong>, whereas the United States benchmark S&P 500 commands multiples exceeding <strong>27.0x to 35.0x</strong> for Mega-Cap technology leaders.
          </p>
          <p>
            This phenomenon—widely termed <em>multiple compression</em> or the <em>frontier market risk premium</em>—does not signify that frontier equities possess inferior earning capacity or deteriorating operational margins. On the contrary, premier Pakistani blue-chips such as Meezan Bank (MEBL), Fauji Fertilizer (FFC), and Mari Petroleum (MARI) consistently generate Return on Equity (ROE) figures ranging from <strong>25% to 48%</strong>, vastly outperforming the capital efficiency of many Western index constituents.
          </p>
          <p>
            Instead, multiple compression is driven by sovereign macroeconomic discount factors:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-[#94A3B8]">
            <li><strong>Sovereign Risk Premia (EMBI Spreads):</strong> Investors require substantial additional yield spreads to compensate for balance-of-payments volatility and external debt amortizations.</li>
            <li><strong>Cost of Capital Discrepancies:</strong> Elevated central bank policy rates in developing economies naturally elevate the risk-free rate of return, discounting future terminal cash flows at higher rates and compressing public multiples.</li>
            <li><strong>Sovereign Energy Sector Circular Debt:</strong> Receivables bottlenecks in downstream state-owned utilities create paper earnings discounts on cash-generative upstream E&P operators like OGDC and PPL.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-[#CBD5E1] leading-relaxed border-t border-slate-200 dark:border-white/10 pt-6">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Percent className="w-4 h-4 text-[#00E676]" />
            <span>2. The Mechanics of Dividend Reinvestment (DRIP) in High-Yield Regimes</span>
          </h3>
          <p>
            In mature developed markets, equity total return is predominantly generated through share price appreciation and corporate buyback programs, with index dividend yields typically averaging a modest <strong>1.2% to 1.8%</strong>. Conversely, the Pakistan Stock Exchange is one of the highest cash dividend-yielding equity complexes on earth, frequently offering market-wide dividend yields between <strong>10.5% and 14.5%</strong>.
          </p>
          <p>
            In a high-dividend regime, the primary engine of multi-year wealth accumulation is not daily speculative capital appreciation; it is the mathematical phenomenon of <strong>Dividend Reinvestment Compounding (DRIP)</strong>.
          </p>
          
          {/* Institutional Calculation Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 font-mono text-xs space-y-2">
            <div className="text-slate-900 dark:text-white font-bold uppercase tracking-wider">
              Mathematical Compounding Comparison (10-Year Simulation):
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-lg bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10">
                <span className="text-[#00E676] font-bold block">Portfolio A: Cash Consumption Model</span>
                <span className="text-slate-400 block mt-1">Starting Capital: PKR 1,000,000</span>
                <span className="text-slate-400 block">Annual Cash Yield: 12% (PKR 120,000 withdrawn)</span>
                <span className="text-slate-400 block">10-Year Ending Capital: ~PKR 1,800,000</span>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10">
                <span className="text-emerald-400 font-bold block">Portfolio B: Systematic DRIP Reinvestment</span>
                <span className="text-slate-400 block mt-1">Starting Capital: PKR 1,000,000</span>
                <span className="text-slate-400 block">Annual Cash Yield: 12% (100% Reinvested at compressed P/E)</span>
                <span className="text-[#00E676] font-bold block">10-Year Ending Capital: ~PKR 4,820,000+ (3.1x Acceleration)</span>
              </div>
            </div>
          </div>

          <p>
            When dividends are mechanically reinvested into equities trading at sub-5.0x P/E multiples, the investor systematically acquires a greater number of underlying productive shares during market sell-offs, accelerating exponential share count accumulation independent of macroeconomic headline sentiment.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-[#CBD5E1] leading-relaxed border-t border-slate-200 dark:border-white/10 pt-6">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#00E676]" />
            <span>3. Currency-Adjusted Equity Returns: Real Purchasing Power Parity (PKR vs USD)</span>
          </h3>
          <p>
            A common institutional critique of investing in emerging and frontier equity markets is the risk of national currency depreciation eroding nominal equity returns when converted back into global reserve currencies (USD or EUR). Over the past three decades, the Pakistani Rupee (PKR) has experienced historic annualized depreciation rates of approximately <strong>6% to 9%</strong> against the US Dollar.
          </p>
          <p>
            However, rigorous empirical analysis reveals that high-quality corporate assets inherently act as <strong>natural real-asset inflation and currency hedges</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-[#94A3B8]">
            <li><strong>Dollar-Linked Hydrocarbon Pricing:</strong> Upstream exploration concession agreements (OGDC, PPL, MARI) tie domestic natural gas and crude sales directly to international crude benchmarks (Arab Light) and USD/PKR exchange rates. When the Rupee depreciates, top-line revenues automatically adjust upward in PKR terms.</li>
            <li><strong>Pure IT and Software Exporters:</strong> Flagship technology firms like Systems Limited (SYS) generate over 80% of revenue in USD, EUR, and SAR, insulating operational profits and expanding domestic profit margins upon PKR realignment.</li>
            <li><strong>Agricultural Pricing Power:</strong> Fertilizer producers (FFC) manufacture essential inputs whose global replacement costs are determined by international urea import parity, allowing domestic price adjustments that preserve real purchasing power.</li>
          </ul>
          <p>
            When combined with double-digit dividend yields and multiple expansion during monetary easing cycles, currency-hedged frontier portfolios historically deliver competitive risk-adjusted real returns for patient capital allocators.
          </p>
        </div>

        {/* Institutional Disclosure Box */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200/90 space-y-1">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Institutional Research Notice & Financial Disclaimer</span>
          </div>
          <p className="leading-relaxed">
            All metrics, ratios, valuations, and company profiles presented in the FGC Spot Stock Market Intelligence Terminal are synthesized for informational and analytical purposes. Past performance and historical dividend distributions do not guarantee future capital outcomes. Market participants must conduct independent fiduciary due diligence prior to executing capital allocations.
          </p>
        </div>

      </section>

      {/* Active Modal */}
      {activeModalStock && (
        <CompanyModal
          stock={activeModalStock}
          onClose={() => setActiveModalStock(null)}
        />
      )}

    </div>
  );
}
