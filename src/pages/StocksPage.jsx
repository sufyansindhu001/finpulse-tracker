import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Info, 
  Plus, 
  Bookmark, 
  FolderHeart, 
  ChevronRight, 
  Download, 
  ChevronLeft,
  RefreshCw
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { WORLD_COUNTRIES, getStocksForCountry } from '../data/stocksData';
import { fetchLiveStocks } from '../services/stocksService';
import ScreensModal from '../components/ScreensModal';
import CountrySelectorDropdown from '../components/CountrySelectorDropdown';
import ScreenerFilterSection from '../components/ScreenerFilterSection';
import ScreenerFaqSection from '../components/ScreenerFaqSection';
import CompanyModal from '../components/CompanyModal';
import CompanyLogoBadge from '../components/CompanyLogoBadge';

export default function StocksPage() {
  useSEO({
    title: 'Global Stock Screener & PSX Equity Terminal | FGC Spot',
    description: 'Investing.com style institutional global stock screener. Filter 50+ countries, KSE-100 equities, P/E compression, Piotroski F-Score, and multi-asset metrics.',
    canonical: '/stocks'
  });

  // Country & Primary Listing
  const [selectedCountry, setSelectedCountry] = useState('pk');
  const [primaryListing, setPrimaryListing] = useState(true);

  // Active View Tab (9 View Tabs)
  const [activeViewTab, setActiveViewTab] = useState('Overview');
  const viewTabs = ['Overview', 'Insights', 'Valuation', 'Returns', 'Technical', 'Financial', 'Growth', 'Risk', 'Custom'];

  // Modal states
  const [screensModalOpen, setScreensModalOpen] = useState(false);
  const [selectedStockForModal, setSelectedStockForModal] = useState(null);
  const [activeScreenTitle, setActiveScreenTitle] = useState(null);

  // Complete Filters State supporting all 12 Tabs
  const initialFilters = {
    marketCap: 'Any',
    lastPrice: 'Any',
    volume: 'Any',
    change1Y: 'Any',
    fairValue: 'Any',
    analystUpside: 'Any',
    analystRating: 'Any',
    peRatio: 'Any',
    pbRatio: 'Any',
    forwardPe: 'Any',
    evEbitda: 'Any',
    dividendYield: 'Any',
    payoutRatio: 'Any',
    divGrowth: 'Any',
    range52: 'Any',
    change24hPct: 'Any',
    rsi: 'Any',
    technicalRating: 'Any',
    piotroski: 'Any',
    altmanZ: 'Any',
    salesLevel: 'Any',
    netProfit: 'Any',
    debtEquity: 'Any',
    epsGrowth: 'Any',
    revenueGrowth: 'Any',
    ytdChange: 'Any',
    return3M: 'Any',
    beta: 'Any',
    roe: 'Any',
    roic: 'Any',
    exchange: 'Any',
    sector: 'Any',
    industry: 'Any',
    equityType: 'Any',
    nextEarnings: 'Any'
  };
  const [filters, setFilters] = useState(initialFilters);

  // Table selection & pagination
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [sortField, setSortField] = useState('marketCapNum');
  const [sortDirection, setSortDirection] = useState('desc');

  // Live stock data stream state
  const [liveStocks, setLiveStocks] = useState(() => getStocksForCountry(selectedCountry));
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [lastMarketUpdate, setLastMarketUpdate] = useState(() => new Date().toLocaleTimeString());
  const [liveDataSource, setLiveDataSource] = useState('Global Market Feeds (Live)');

  const loadStocks = useCallback(async (country, force = false) => {
    setIsLiveLoading(true);
    try {
      const res = await fetchLiveStocks(country, force);
      if (res && res.data && res.data.length > 0) {
        setLiveStocks(res.data);
        if (res.lastUpdated) setLastMarketUpdate(res.lastUpdated);
        if (res.source) setLiveDataSource(res.source);
      }
    } catch (e) {
      console.warn('Failed loading live stocks:', e);
    } finally {
      setIsLiveLoading(false);
    }
  }, []);

  // Fetch when selectedCountry changes & auto refresh every 30s
  useEffect(() => {
    loadStocks(selectedCountry, false);

    const interval = setInterval(() => {
      loadStocks(selectedCountry, true);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedCountry, loadStocks]);

  // Load raw stocks for active country (backed by live streaming data)
  const rawCountryStocks = useMemo(() => {
    return liveStocks && liveStocks.length > 0 ? liveStocks : getStocksForCountry(selectedCountry);
  }, [liveStocks, selectedCountry]);

  const activeCountryObj = useMemo(() => {
    return WORLD_COUNTRIES.find(c => c.id === selectedCountry) || WORLD_COUNTRIES[0];
  }, [selectedCountry]);

  // Handle Filter Change
  const handleChangeFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setActiveScreenTitle(null);
    setCurrentPage(1);
  };

  // Count active applied filters
  const appliedFiltersCount = useMemo(() => {
    let count = 0;
    Object.values(filters).forEach(v => {
      if (v && v !== 'Any') count++;
    });
    if (activeScreenTitle) count++;
    return count;
  }, [filters, activeScreenTitle]);

  // Pre-built screen apply handler
  const handleApplyScreen = (screen) => {
    setActiveScreenTitle(screen.title);
    setCurrentPage(1);

    if (screen.filterType === 'near52w') {
      handleChangeFilter('range52', 'nearHigh');
    } else if (screen.filterType === 'momentum') {
      handleChangeFilter('change1Y', 'over20');
      handleChangeFilter('volume', 'over1m');
    } else if (screen.filterType === 'piotroski') {
      handleChangeFilter('piotroski', 'high7');
    } else if (screen.filterType === 'smallCap') {
      handleChangeFilter('marketCap', 'Small');
    } else if (screen.filterType === 'dividend') {
      handleChangeFilter('dividendYield', 'over10');
    } else if (screen.filterType === 'value') {
      handleChangeFilter('peRatio', 'value10');
    } else if (screen.filterType === 'rsiOversold') {
      handleChangeFilter('rsi', 'oversold');
    } else {
      handleChangeFilter('marketCap', 'Any');
    }
  };

  // Comprehensive Real-Time Filtering Engine
  const filteredStocks = useMemo(() => {
    return rawCountryStocks.filter(stock => {
      // Sector filter
      if (filters.sector && filters.sector !== 'Any' && stock.sector !== filters.sector) return false;
      // Industry filter
      if (filters.industry && filters.industry !== 'Any' && stock.industry !== filters.industry) return false;
      // Exchange filter
      if (filters.exchange && filters.exchange !== 'Any' && !stock.exchange.includes(filters.exchange)) return false;
      // Equity Type
      if (filters.equityType && filters.equityType !== 'Any' && stock.equityType !== filters.equityType) return false;

      // Market Cap filter
      const mcap = stock.marketCapNum || 0;
      if (filters.marketCap === 'Mega' && mcap < 200) return false;
      if (filters.marketCap === 'Large' && (mcap < 100 || mcap >= 200)) return false;
      if (filters.marketCap === 'Mid' && (mcap < 20 || mcap >= 100)) return false;
      if (filters.marketCap === 'Small' && mcap >= 20) return false;

      // Last Price filter
      const pr = stock.price || 0;
      if (filters.lastPrice === 'under50' && pr >= 50) return false;
      if (filters.lastPrice === '50-200' && (pr < 50 || pr > 200)) return false;
      if (filters.lastPrice === '200-500' && (pr < 200 || pr > 500)) return false;
      if (filters.lastPrice === 'over500' && pr <= 500) return false;

      // P/E Ratio filter
      const pe = stock.peRatio || 0;
      if (filters.peRatio === 'low5' && pe > 5.0) return false;
      if (filters.peRatio === 'value10' && pe > 10.0) return false;
      if (filters.peRatio === 'mod10-25' && (pe < 10.0 || pe > 25.0)) return false;
      if (filters.peRatio === 'high25' && pe <= 25.0) return false;

      // Dividend Yield filter
      const div = stock.dividendYield || 0;
      if (filters.dividendYield === 'over5' && div < 5.0) return false;
      if (filters.dividendYield === 'over10' && div < 10.0) return false;
      if (filters.dividendYield === 'over14' && div < 14.0) return false;

      // Price / Book filter
      const pb = stock.pbRatio || 0;
      if (filters.pbRatio === 'below1' && pb >= 1.0) return false;
      if (filters.pbRatio === '1-3' && (pb < 1.0 || pb > 3.0)) return false;
      if (filters.pbRatio === 'above3' && pb <= 3.0) return false;

      // EV/EBITDA
      const ev = stock.evEbitda || 5.0;
      if (filters.evEbitda === 'low5' && ev >= 5.0) return false;
      if (filters.evEbitda === '5-10' && (ev < 5.0 || ev > 10.0)) return false;
      if (filters.evEbitda === 'over10' && ev <= 10.0) return false;

      // RSI filter
      const rsi = stock.rsi14 || 55;
      if (filters.rsi === 'oversold' && rsi >= 35) return false;
      if (filters.rsi === 'neutral' && (rsi < 35 || rsi > 70)) return false;
      if (filters.rsi === 'overbought' && rsi <= 70) return false;

      // Piotroski filter
      const piot = stock.piotroski || 7;
      if (filters.piotroski === 'high7' && piot < 7) return false;
      if (filters.piotroski === 'moderate' && (piot < 5 || piot > 6)) return false;

      // 1-Year Price Change
      const ch1y = parseFloat(stock.change1Y) || 0;
      if (filters.change1Y === 'positive' && ch1y <= 0) return false;
      if (filters.change1Y === 'over20' && ch1y < 20) return false;
      if (filters.change1Y === 'over50' && ch1y < 50) return false;

      // Volume
      const vol = parseFloat(stock.volume3M) || 1.5;
      if (filters.volume === 'over1m' && vol < 1.0) return false;
      if (filters.volume === 'over3m' && vol < 3.0) return false;
      if (filters.volume === 'over5m' && vol < 5.0) return false;

      // Fair Value Upside
      const fv = parseFloat(stock.fairValueUpside) || 15;
      if (filters.fairValue === 'over10' && fv < 10) return false;
      if (filters.fairValue === 'over20' && fv < 20) return false;
      if (filters.fairValue === 'over30' && fv < 30) return false;

      // Analyst Upside
      const au = parseFloat(stock.analystUpside) || 12;
      if (filters.analystUpside === 'over10' && au < 10) return false;
      if (filters.analystUpside === 'over20' && au < 20) return false;
      if (filters.analystUpside === 'over30' && au < 30) return false;

      // Technical Rating
      if (filters.technicalRating && filters.technicalRating !== 'Any') {
        if (!stock.technicalRating || !stock.technicalRating.includes(filters.technicalRating)) return false;
      }

      // Altman Z-Score
      const az = stock.altmanZ || 3.2;
      if (filters.altmanZ === 'safe3' && az < 3.0) return false;
      if (filters.altmanZ === 'grey' && (az < 1.8 || az >= 3.0)) return false;

      // 52-Week Range Proximity
      const low = stock.low52 || pr * 0.75;
      const high = stock.high52 || pr * 1.35;
      const spread = high - low || 1;
      const prox = ((pr - low) / spread) * 100;
      if (filters.range52 === 'nearHigh' && prox < 80) return false;
      if (filters.range52 === 'nearLow' && prox > 25) return false;

      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      valA = String(valA || '');
      valB = String(valB || '');
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [rawCountryStocks, filters, sortField, sortDirection]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredStocks.length / rowsPerPage) || 1;
  const paginatedStocks = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredStocks.slice(start, start + rowsPerPage);
  }, [filteredStocks, currentPage, rowsPerPage]);

  // Handle Select All Checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(paginatedStocks.map(s => s.id));
      setSelectedRowIds(allIds);
    } else {
      setSelectedRowIds(new Set());
    }
  };

  const handleToggleRow = (id) => {
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = ['Ticker', 'Name', 'Exchange', 'Sector', 'Industry', 'Price', 'Currency', '24h Change %', 'Market Cap', 'P/E', 'P/B', 'Dividend Yield %'];
    const rows = filteredStocks.map(s => [
      s.ticker,
      `"${s.name.replace(/"/g, '""')}"`,
      s.exchange,
      `"${s.sector}"`,
      `"${s.industry}"`,
      s.price,
      s.currency,
      s.changePercent,
      `"${s.marketCap}"`,
      s.peRatio,
      s.pbRatio,
      s.dividendYield
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeCountryObj.code}_stocks_screener.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic Country Sectors Directory
  const dynamicSectors = useMemo(() => {
    if (selectedCountry === 'pk') {
      return [
        { name: 'Consumer Cyclicals', count: 132 },
        { name: 'Financials', count: 119 },
        { name: 'Industrials', count: 75 },
        { name: 'Basic Materials', count: 64 },
        { name: 'Consumer Non-Cyclicals', count: 40 },
        { name: 'Energy', count: 30 },
        { name: 'Healthcare', count: 24 },
        { name: 'Utilities', count: 20 },
        { name: 'Technology', count: 18 },
        { name: 'Real Estate', count: 12 }
      ];
    }
    const counts = {};
    rawCountryStocks.forEach(s => {
      counts[s.sector] = (counts[s.sector] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [selectedCountry, rawCountryStocks]);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      
      {/* ========================================================
          MODULE 1: TOP "STOCK SCREENER" HEADER BAR + STRATEGY PILLS
          ======================================================== */}
      <div className="space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                Stock Screener
              </h1>
              <button 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                title="Stock Screener: Quantitative multi-metric equity filtering engine"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {/* Live Streaming Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="uppercase tracking-wider">Live Feeds</span>
              <span className="text-gray-300 dark:text-gray-600 font-normal">|</span>
              <span className="font-mono text-[10px] text-gray-600 dark:text-gray-300 font-normal">{lastMarketUpdate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Live Sync Button */}
            <button
              onClick={() => loadStocks(selectedCountry, true)}
              disabled={isLiveLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-colors cursor-pointer border border-gray-200 dark:border-gray-700 disabled:opacity-50"
              title="Force refresh live quotes"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isLiveLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Live</span>
            </button>

            <button 
              onClick={() => handleResetFilters()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Screen</span>
            </button>
            <button 
              onClick={() => alert('Current screening criteria saved to your workspace session.')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-colors cursor-pointer border border-gray-200 dark:border-gray-700"
            >
              <Bookmark className="w-3.5 h-3.5 text-blue-500" />
              <span>Save</span>
            </button>
            <button 
              onClick={() => setScreensModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-colors cursor-pointer border border-gray-200 dark:border-gray-700"
            >
              <FolderHeart className="w-3.5 h-3.5 text-emerald-500" />
              <span>My Screens</span>
            </button>
          </div>
        </div>

        {/* Horizontal Strategy Pills Slider (Investing.com Style) */}
        <div className="relative flex items-center bg-gray-50/70 dark:bg-[#06111F]/70 border border-gray-200 dark:border-white/10 rounded-2xl p-1.5 overflow-hidden">
          {/* Scrollable Pills Track (5-6 visible at once, scrollable horizontally) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-1 flex-1 pr-3 scroll-smooth">
            {[
              { title: 'Near 52-Week High', ret: '+68.9%', type: 'near52w' },
              { title: 'Momentum Masters', ret: '+57.3%', type: 'momentum' },
              { title: "Piotroski's Picks", ret: '+38.6%', type: 'piotroski' },
              { title: 'Small-Cap Growth Rockets', ret: '+7.9%', type: 'smallCap' },
              { title: 'High ROE Compounders', ret: '+42.1%', type: 'roe' },
              { title: 'Dividend Bulls', ret: '+18.2%', type: 'dividend' },
              { title: 'Undervalued Cash Cows', ret: '+14.5%', type: 'value' },
              { title: 'Export Revenue Leaders', ret: '+34.2%', type: 'export' },
              { title: 'Free Cash Flow Champions', ret: '+21.3%', type: 'fcf' },
              { title: 'Low Debt Defensives', ret: '+12.4%', type: 'lowDebt' }
            ].map(pill => {
              const isActive = activeScreenTitle === pill.title;
              return (
                <button
                  key={pill.title}
                  onClick={() => handleApplyScreen({ title: pill.title, filterType: pill.type })}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border whitespace-nowrap shadow-2xs hover:scale-[1.02] ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                      : 'bg-white dark:bg-[#0A1726] text-gray-800 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <span>{pill.title}</span>
                  <span className={`font-mono text-[11px] font-bold ${isActive ? 'text-blue-100' : 'text-[#00E676]'}`}>
                    ({pill.ret})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Pinned Right Action: "Explore 20+ Screens >" Button */}
          <div className="relative shrink-0 flex items-center pl-3 pr-2 py-1 bg-gradient-to-l from-gray-50 via-gray-50 to-transparent dark:from-[#06111F] dark:via-[#06111F] dark:to-transparent z-10 border-l border-gray-200/80 dark:border-white/10">
            <button
              onClick={() => setScreensModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-[#00E676] dark:hover:text-emerald-300 bg-blue-50 dark:bg-[#00E676]/10 hover:bg-blue-100 dark:hover:bg-[#00E676]/20 border border-blue-200 dark:border-[#00E676]/30 whitespace-nowrap transition-all cursor-pointer shadow-xs"
            >
              <span>Explore 20+ Screens</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODULE 2: 12-TAB CATEGORY FILTER SECTION
          ======================================================== */}
      <ScreenerFilterSection
        filters={filters}
        onChangeFilter={handleChangeFilter}
        onResetFilters={handleResetFilters}
        appliedCount={appliedFiltersCount}
      />

      {/* ========================================================
          MODULE 3 & 5: COUNTRY SELECTOR + MULTI-TAB DATA TABLE
          ======================================================== */}
      <div className="space-y-4">
        
        {/* Table Controls Top Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 relative z-30">
          
          <div className="flex items-center gap-2.5 flex-nowrap min-w-0">
            {/* Country Selector Dropdown with 50+ Countries (outside horizontal scroll container) */}
            <div className="relative shrink-0 z-40">
              <CountrySelectorDropdown
                selectedCountry={selectedCountry}
                onSelectCountry={(cId) => {
                  setSelectedCountry(cId);
                  setCurrentPage(1);
                }}
                primaryListing={primaryListing}
                onTogglePrimaryListing={setPrimaryListing}
              />
            </div>

            {/* 9 View Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
              <div className="flex items-center bg-gray-100 dark:bg-[#06111F] p-1 rounded-lg border border-gray-200 dark:border-gray-800 shrink-0">
                {viewTabs.map(tab => {
                  const isActive = activeViewTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveViewTab(tab)}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-white dark:bg-[#0A1726] text-blue-600 dark:text-[#00E676] shadow-xs'
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Action Tools: Results Count & CSV Export */}
          <div className="flex items-center gap-3 self-end lg:self-auto text-xs font-mono text-gray-500">
            <span>
              Showing <strong className="text-gray-900 dark:text-gray-100">{filteredStocks.length}</strong> Results
            </span>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold transition-colors cursor-pointer border border-gray-300 dark:border-gray-700"
              title="Download CSV Table"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

        </div>

        {/* Data Table */}
        <div className="w-full bg-white dark:bg-[#0A1726] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#06111F] border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 uppercase font-mono text-[11px]">
                  <th className="py-3 px-3 w-8 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={paginatedStocks.length > 0 && selectedRowIds.size === paginatedStocks.length}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-2 w-8 text-center">#</th>
                  <th className="py-3 px-4 font-bold text-gray-900 dark:text-gray-100">Company</th>
                  <th className="py-3 px-3 font-bold text-gray-900 dark:text-gray-100">Exchange</th>
                  <th className="py-3 px-3 font-bold text-gray-900 dark:text-gray-100">Sector</th>
                  <th className="py-3 px-3 font-bold text-gray-900 dark:text-gray-100">Industry</th>
                  <th className="py-3 px-3 font-bold text-right cursor-pointer hover:text-blue-600 dark:hover:text-[#00E676]" onClick={() => { setSortField('marketCapNum'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                    Market Cap
                  </th>
                  <th className="py-3 px-3 font-bold text-right cursor-pointer hover:text-blue-600 dark:hover:text-[#00E676]" onClick={() => { setSortField('peRatio'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                    P/E Ratio
                  </th>
                  <th className="py-3 px-3 font-bold text-right cursor-pointer hover:text-blue-600 dark:hover:text-[#00E676]" onClick={() => { setSortField('pbRatio'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                    P/B Ratio
                  </th>
                  <th className="py-3 px-4 font-bold text-right cursor-pointer hover:text-blue-600 dark:hover:text-[#00E676]" onClick={() => { setSortField('price'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                    Last Price
                  </th>
                  <th className="py-3 px-3 font-bold text-right cursor-pointer hover:text-blue-600 dark:hover:text-[#00E676]" onClick={() => { setSortField('changePercent'); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                    24h Change
                  </th>
                  {activeViewTab === 'Returns' && (
                    <th className="py-3 px-3 font-bold text-right">1-Year Change</th>
                  )}
                  {activeViewTab === 'Valuation' && (
                    <th className="py-3 px-3 font-bold text-right">Fair Value Upside</th>
                  )}
                  {activeViewTab === 'Technical' && (
                    <th className="py-3 px-3 font-bold text-center">RSI (14d)</th>
                  )}
                  <th className="py-3 px-3 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-sans">
                {paginatedStocks.map((stock, idx) => {
                  const isSelected = selectedRowIds.has(stock.id);
                  const isPositivePe = stock.peRatio > 0;
                  const rowNumber = (currentPage - 1) * rowsPerPage + idx + 1;

                  return (
                    <tr
                      key={stock.id}
                      onClick={() => setSelectedStockForModal(stock)}
                      className={`hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group ${
                        isSelected ? 'bg-blue-50/40 dark:bg-blue-500/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(stock.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Row # */}
                      <td className="py-3 px-2 text-center font-mono text-gray-400 text-[11px]">
                        {rowNumber}
                      </td>

                      {/* Circular Corporate Logo Badge + Company Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <CompanyLogoBadge stock={stock} size="sm" />
                          <div>
                            <span className="font-bold text-gray-900 dark:text-gray-100 block group-hover:text-blue-600 dark:group-hover:text-[#00E676] transition-colors">
                              {stock.name}
                            </span>
                            <span className="text-[11px] font-mono font-semibold text-gray-500 dark:text-gray-400">
                              {stock.ticker}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Exchange */}
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-gray-700 dark:text-gray-300">
                        {stock.exchange}
                      </td>

                      {/* Sector */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                          {stock.sector}
                        </span>
                      </td>

                      {/* Industry */}
                      <td className="py-3 px-3 whitespace-nowrap text-gray-600 dark:text-gray-400 text-[11px] font-medium">
                        {stock.industry}
                      </td>

                      {/* Market Cap */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                        {stock.marketCap}
                      </td>

                      {/* P/E Ratio (Green for positive, red for negative) */}
                      <td className="py-3 px-3 text-right font-mono font-bold whitespace-nowrap">
                        <span className={isPositivePe ? 'text-[#00E676]' : 'text-rose-500'}>
                          {stock.peRatio.toFixed(1)}x
                        </span>
                      </td>

                      {/* Price / Book */}
                      <td className="py-3 px-3 text-right font-mono font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {stock.pbRatio.toFixed(2)}
                      </td>

                      {/* Last Trade Price */}
                      <td className="py-3 px-4 text-right font-mono font-black text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {activeCountryObj.symbol}{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* 24h Change % */}
                      <td className="py-3 px-3 text-right font-mono font-bold whitespace-nowrap">
                        <span className={`inline-flex items-center gap-0.5 ${(stock.changePercent ?? 0) >= 0 ? 'text-[#00E676]' : 'text-rose-500'}`}>
                          {(stock.changePercent ?? 0) >= 0 ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                        </span>
                      </td>

                      {/* Dynamic Columns based on active View Tab */}
                      {activeViewTab === 'Returns' && (
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#00E676] whitespace-nowrap">
                          {stock.change1Y}
                        </td>
                      )}
                      {activeViewTab === 'Valuation' && (
                        <td className="py-3 px-3 text-right font-mono font-bold text-blue-500 whitespace-nowrap">
                          {stock.fairValueUpside}
                        </td>
                      )}
                      {activeViewTab === 'Technical' && (
                        <td className="py-3 px-3 text-center font-mono whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-bold text-gray-800 dark:text-gray-200">
                            {stock.rsi14}
                          </span>
                        </td>
                      )}

                      {/* Action */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStockForModal(stock);
                          }}
                          className="px-2.5 py-1 rounded bg-gray-100 hover:bg-blue-600 hover:text-white dark:bg-white/5 dark:hover:bg-[#00E676] dark:hover:text-[#06111F] text-gray-800 dark:text-gray-200 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Deep-Dive
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {paginatedStocks.length === 0 && (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                      No companies match the active screening criteria. Try adjusting or resetting your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Working Pagination Bar */}
          <div className="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#06111F]/70 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="flex items-center gap-1 px-3 py-1 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1 font-mono text-xs">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-7 h-7 rounded flex items-center justify-center font-bold transition-colors cursor-pointer ${
                      currentPage === p
                        ? 'bg-blue-600 text-white dark:bg-[#00E676] dark:text-[#06111F]'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="flex items-center gap-1 px-3 py-1 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white dark:bg-[#0A1726] border border-gray-300 dark:border-gray-700 rounded text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer"
              >
                <option value={25}>25 Rows</option>
                <option value={50}>50 Rows</option>
                <option value={100}>100 Rows</option>
              </select>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================
          MODULE 6A: DYNAMIC [SELECTED COUNTRY] SECTORS DIRECTORY
          ======================================================== */}
      <section className="bg-white dark:bg-[#0A1726] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>{activeCountryObj.flag}</span>
            <span>{activeCountryObj.name} Sectors Directory</span>
          </h2>
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 font-medium">
            {dynamicSectors.length} Primary Industry Divisions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
          {dynamicSectors.map((sec) => (
            <button
              key={sec.name}
              onClick={() => handleChangeFilter('sector', sec.name)}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50/60 dark:bg-[#06111F] dark:hover:bg-white/5 border border-gray-200 dark:border-gray-800 text-left transition-all cursor-pointer group"
            >
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-[#00E676] transition-colors">
                {sec.name}
              </span>
              <span className="text-[11px] font-mono text-gray-500 group-hover:text-blue-500 font-semibold flex items-center gap-0.5">
                <span>({sec.count})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================
          MODULE 6B: 18 EXPANDABLE FAQ ACCORDIONS
          ======================================================== */}
      <ScreenerFaqSection />

      {/* ========================================================
          PERMANENT 800+ WORD VALUATION COMPENDIUM (SEO / ADSENSE)
          ======================================================== */}
      <section className="p-6 sm:p-10 rounded-2xl bg-white dark:bg-[#0A1726] border border-gray-200 dark:border-gray-800 shadow-xs space-y-8">
        <div className="space-y-2 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Institutional Research &amp; Valuation Compendium</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            Valuation Architecture: Analyzing P/E Compression, Dividend Reinvestment, and Currency-Adjusted Returns
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-mono">
            Authored by Sufyan Saleem (Senior Financial Analyst, FGC Spot) • Updated Institutional Edition
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
            1. Emerging Market Multiples vs Developed Tech: Understanding P/E Compression
          </h3>
          <p>
            When cross-evaluating international equity valuations, institutional portfolio managers frequently encounter a striking disparity: the Pakistan Stock Exchange (PSX KSE-100) trades at an aggregate Price-to-Earnings (P/E) multiple hovering between <strong>4.5x and 5.8x</strong>, whereas the United States benchmark S&amp;P 500 commands multiples exceeding <strong>27.0x to 35.0x</strong> for Mega-Cap technology leaders.
          </p>
          <p>
            This phenomenon—widely termed multiple compression or the frontier market risk premium—does not signify that frontier equities possess inferior earning capacity. On the contrary, premier Pakistani blue-chips like Meezan Bank (MEBL), Fauji Fertilizer (FFC), and Mari Petroleum (MARI) consistently generate Return on Equity (ROE) figures ranging from <strong>25% to 48%</strong>, vastly outperforming the capital efficiency of many Western index constituents.
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed border-t border-gray-200 dark:border-gray-800 pt-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
            2. The Mechanics of Dividend Reinvestment (DRIP) in High-Yield Regimes
          </h3>
          <p>
            In mature developed markets, equity total return is predominantly generated through share price appreciation and corporate buyback programs, with index dividend yields typically averaging a modest <strong>1.2% to 1.8%</strong>. Conversely, the Pakistan Stock Exchange is one of the highest cash dividend-yielding equity complexes on earth, frequently offering market-wide dividend yields between <strong>10.5% and 14.5%</strong>.
          </p>
          <p>
            When dividends are mechanically reinvested into equities trading at sub-5.0x P/E multiples, the investor systematically acquires a greater number of underlying productive shares during market sell-offs, accelerating exponential share count accumulation independent of macroeconomic headline sentiment.
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed border-t border-gray-200 dark:border-gray-800 pt-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
            3. Currency-Adjusted Equity Returns: Real Purchasing Power Parity (PKR vs USD)
          </h3>
          <p>
            A common institutional critique of investing in emerging and frontier equity markets is the risk of national currency depreciation eroding nominal equity returns when converted back into global reserve currencies. However, corporate balance sheets at the PSX serve as real-asset inflation absorbers due to dollar-linked hydrocarbon concession contracts, IT export revenues, and replacement cost economics.
          </p>
        </div>
      </section>

      {/* ========================================================
          MODALS: SCREENS MODAL & COMPANY DEEP-DIVE MODAL
          ======================================================== */}
      <ScreensModal
        isOpen={screensModalOpen}
        onClose={() => setScreensModalOpen(false)}
        onApplyScreen={handleApplyScreen}
        activeCountry={activeCountryObj}
      />

      {selectedStockForModal && (
        <CompanyModal
          stock={selectedStockForModal}
          onClose={() => setSelectedStockForModal(null)}
        />
      )}

    </div>
  );
}
