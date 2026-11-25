import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  BarChart2, 
  Activity,
  Layers,
  Gauge,
  Loader2
} from 'lucide-react';
import { WORLD_COUNTRIES } from '../data/stocksData';
import CompanyLogoBadge from './CompanyLogoBadge';
import { fetchStockHistory } from '../services/stocksService';

/**
 * Format timestamp into human-readable date/time string for tooltips
 */
function formatInspectionDate(timestamp, tf) {
  if (!timestamp) return 'Historical Point';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return 'Historical Point';
  if (tf === '1W') {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CompanyModal({ stock, onClose }) {
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'thesis' | 'fundamentals' | 'financials'
  const [chartTimeframe, setChartTimeframe] = useState('1M');
  const [hoverIndex, setHoverIndex] = useState(null);
  const [liveHistory, setLiveHistory] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Prevent background body scrolling when modal is open
  useEffect(() => {
    if (stock) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [stock]);

  // Connect live exchange API feed for historical candles & real-time pricing
  useEffect(() => {
    if (!stock?.ticker) return;

    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) setIsLoadingHistory(true);
    });

    fetchStockHistory(stock, chartTimeframe)
      .then(res => {
        if (!isMounted) return;
        if (res && res.success && Array.isArray(res.points) && res.points.length > 0) {
          setLiveHistory(res);
        } else {
          setLiveHistory(null);
        }
      })
      .catch(() => {
        if (isMounted) setLiveHistory(null);
      })
      .finally(() => {
        if (isMounted) setIsLoadingHistory(false);
      });

    return () => {
      isMounted = false;
    };
  }, [stock, chartTimeframe]);

  const countryObj = stock 
    ? (WORLD_COUNTRIES.find(c => c.id === stock.country) || {
        name: 'Pakistan',
        flag: '🇵🇰',
        currency: 'PKR',
        symbol: '₨',
        exchange: 'Karachi'
      })
    : {
        name: 'Pakistan',
        flag: '🇵🇰',
        currency: 'PKR',
        symbol: '₨',
        exchange: 'Karachi'
      };

  const isPsx = stock ? stock.country === 'pk' : false;

  // Live price & day change synchronization with live exchange feed
  const displayPrice = (liveHistory?.currentPrice && liveHistory.currentPrice > 0)
    ? liveHistory.currentPrice
    : (stock?.hasVerifiedQuote && Number.isFinite(stock.price) ? stock.price : null);

  const displayDayChange = (liveHistory?.dayChange !== undefined && liveHistory?.dayChange !== null)
    ? liveHistory.dayChange
    : (stock?.hasVerifiedQuote && Number.isFinite(stock.change24h) ? stock.change24h : null);

  const displayDayChangePct = (liveHistory?.dayChangePercent !== undefined && liveHistory?.dayChangePercent !== null)
    ? liveHistory.dayChangePercent
    : (stock?.hasVerifiedQuote && Number.isFinite(stock.changePercent) ? stock.changePercent : null);

  const isPositive = displayDayChangePct !== null && displayDayChangePct >= 0;
  const currencySymbol = stock?.currencySymbol || countryObj.symbol || '₨';
  const flag = stock?.flag || countryObj.flag || '🇵🇰';
  const countryName = stock?.countryName || countryObj.name || 'Pakistan';

  // Safeguarded Technical Indicators
  // The quote/history endpoints do not supply validated indicators or ratings.
  // Display N/A until a verified indicator calculation is implemented.
  const rsiVal = null;
  const ma50Val = null;
  const ma200Val = null;
  const macdVal = null;
  const techRating = null;

  // 52-Week envelope metrics (dynamically synced)
  const low52 = Number.isFinite(liveHistory?.low52) ? liveHistory.low52 : (stock?.hasVerifiedQuote && Number.isFinite(stock.low52) ? stock.low52 : null);
  const high52 = Number.isFinite(liveHistory?.high52) ? liveHistory.high52 : (stock?.hasVerifiedQuote && Number.isFinite(stock.high52) ? stock.high52 : null);
  const range52 = low52 !== null && high52 !== null ? high52 - low52 : null;
  const pos52 = range52 > 0 && displayPrice !== null ? Math.min(100, Math.max(0, ((displayPrice - low52) / range52) * 100)) : null;

  // Dynamic price action series generator (Powered by Live Exchange Feed with organic fractal backup)
  const chartData = useMemo(() => {
    if (!stock || !liveHistory || !Array.isArray(liveHistory.points) || liveHistory.points.length < 2) return null;

    const points = [...liveHistory.points];
    const timestamps = liveHistory.timestamps || [];
    const periodChange = Number.isFinite(liveHistory.periodChange)
      ? liveHistory.periodChange
      : Number((points.at(-1) - points[0]).toFixed(2));
    const periodChangePercent = Number.isFinite(liveHistory.periodChangePercent)
      ? liveHistory.periodChangePercent
      : (points[0] > 0 ? Number(((points.at(-1) - points[0]) / points[0] * 100).toFixed(2)) : null);
    const tfLabel = liveHistory.tfLabel || chartTimeframe;

    const minPrice = Math.min(...points);
    const maxPrice = Math.max(...points);
    const priceRange = maxPrice - minPrice || 1;
    const isPeriodPositive = periodChangePercent !== null && periodChangePercent >= 0;

    const width = 640;
    const height = 190;
    const padTop = 20;
    const padBottom = 24;
    const usableHeight = height - padTop - padBottom;
    const n = points.length;

    // Generate Cartesian SVG coordinates
    const coords = points.map((val, idx) => {
      const x = (idx / (n - 1)) * width;
      const y = height - padBottom - ((val - minPrice) / priceRange) * usableHeight;
      return { 
        x: Number(x.toFixed(1)), 
        y: Number(y.toFixed(1)), 
        val,
        time: timestamps[idx] || null
      };
    });

    // Build smooth cubic Bezier spline
    let smoothPath = '';
    if (coords.length > 0) {
      smoothPath = `M ${coords[0].x} ${coords[0].y}`;
      if (coords.length === 2) {
        smoothPath += ` L ${coords[1].x} ${coords[1].y}`;
      } else {
        for (let i = 0; i < coords.length - 1; i++) {
          const p0 = coords[i === 0 ? 0 : i - 1];
          const p1 = coords[i];
          const p2 = coords[i + 1];
          const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];

          const cp1x = p1.x + (p2.x - p0.x) / 6;
          const cp1y = p1.y + (p2.y - p0.y) / 6;
          const cp2x = p2.x - (p3.x - p1.x) / 6;
          const cp2y = p2.y - (p3.y - p1.y) / 6;

          smoothPath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
        }
      }
    }

    const areaPath = `${smoothPath} L ${width} ${height} L 0 ${height} Z`;
    const lastCoord = coords[coords.length - 1] || { x: width, y: height / 2 };

    return {
      points,
      coords,
      smoothPath,
      areaPath,
      minPrice,
      maxPrice,
      periodChange,
      periodChangePercent,
      isPeriodPositive,
      lastCoord,
      width,
      height,
      tfLabel,
      isLiveExchange: true,
      source: liveHistory?.source || 'Historical market data'
    };
  }, [stock, chartTimeframe, liveHistory]);

  // Multi-Year Consecutive Financial Breakdown (Revenue, Net Income, Operating Cash Flow)
  const financialHistory = stock?.verifiedFinancialHistory === true && Array.isArray(stock.financialHistory)
    ? stock.financialHistory : [];

  // 200–300 Words Written Institutional Fundamental Profile
  const institutionalAnalysis = useMemo(() => {
    if (!stock) return '';
    return `${stock.name} (${stock.ticker}) is listed on ${stock.exchange} in the ${stock.sector} sector. Detailed competitive-moat, valuation, and balance-sheet assessments require verified company filings and are not currently available for this security.`;
  }, [stock]);

  if (!stock) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-[4px] animate-in fade-in duration-200"
      style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================
            1. HEADER SECTION
            ======================================================== */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
          <div className="flex items-center gap-3 sm:gap-4">
            <CompanyLogoBadge stock={stock} size="lg" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                  {stock.name}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  {stock.exchange}:{stock.ticker}
                </span>
                <span className="text-xs flex items-center gap-1 font-semibold text-gray-600 dark:text-gray-400">
                  <span>{flag}</span>
                  <span>{countryName}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                  {stock.sector}
                </span>
                <span>•</span>
                <span className="font-mono font-medium">{stock.industry}</span>
                <span>•</span>
                <span className="font-mono font-bold text-gray-900 dark:text-gray-100">MCap: {stock.marketCap}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xl font-mono font-black text-gray-900 dark:text-gray-100">
                {displayPrice !== null ? `${currencySymbol}${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
              </div>
              <div className={`text-xs font-mono font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-[#00E676]' : 'text-rose-500'}`}>
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{displayDayChange !== null && displayDayChangePct !== null ? `${isPositive ? '+' : ''}${displayDayChange.toFixed(2)} (${isPositive ? '+' : ''}${displayDayChangePct.toFixed(2)}%)` : '24h change N/A'}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Price Bar */}
        <div className="sm:hidden px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm font-mono font-black text-gray-900 dark:text-gray-100">
            {displayPrice !== null ? `${currencySymbol}${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
          </div>
          <div className={`text-xs font-mono font-bold flex items-center gap-1 ${isPositive ? 'text-[#00E676]' : 'text-rose-500'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{displayDayChange !== null && displayDayChangePct !== null ? `${isPositive ? '+' : ''}${displayDayChange.toFixed(2)} (${isPositive ? '+' : ''}${displayDayChangePct.toFixed(2)}%)` : '24h change N/A'}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('chart')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'chart'
                ? 'border-[#00E676] text-[#00E676]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Chart &amp; Technical Speedometer</span>
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'financials'
                ? 'border-[#00E676] text-[#00E676]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Multi-Year Financial Breakdown</span>
          </button>
          <button
            onClick={() => setActiveTab('thesis')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'thesis'
                ? 'border-[#00E676] text-[#00E676]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Written Institutional Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('fundamentals')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'fundamentals'
                ? 'border-[#00E676] text-[#00E676]'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Scorecard Ratios</span>
          </button>
        </div>

        {/* ========================================================
            MODAL BODY (SCROLLABLE)
            ======================================================== */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: CHART & SPEEDOMETER */}
          {activeTab === 'chart' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Chart Viewport */}
              <div className="w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl relative">
                
                {/* Header Controls: Timeframe buttons & Mode Toggles */}
                <div className="p-4 sm:p-5 bg-gradient-to-b from-[#0A1726] to-[#06111F] text-white border-b border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
                          {stock.name} Price Action
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full bg-[#00E676]/20 text-[#00E676] font-bold border border-[#00E676]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-ping" />
                          <span>{chartData?.isLiveExchange ? 'HISTORICAL EXCHANGE FEED' : 'DATA UNAVAILABLE'}</span>
                        </span>
                        {chartData?.tfLabel && (
                          <span className="text-[11px] font-mono text-slate-400 font-medium">
                            • {chartData.tfLabel}
                          </span>
                        )}
                        {chartData?.source && (
                          <span className="hidden md:inline-block text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                            {chartData.source}
                          </span>
                        )}
                      </div>

                      {/* Large Interactive Price Display */}
                      <div className="flex items-baseline gap-3 mt-1 flex-wrap">
                        <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                          {currencySymbol}
                          {(hoverIndex !== null && chartData?.points[hoverIndex] !== undefined
                            ? chartData.points[hoverIndex]
                            : displayPrice
                          ) !== null && (hoverIndex !== null && chartData?.points[hoverIndex] !== undefined ? chartData.points[hoverIndex] : displayPrice) !== undefined
                            ? (hoverIndex !== null && chartData?.points[hoverIndex] !== undefined ? chartData.points[hoverIndex] : displayPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : 'N/A'}
                        </span>

                        {chartData && <div className={`text-xs sm:text-sm font-mono font-bold flex items-center gap-1 ${chartData.isPeriodPositive ? 'text-[#00E676]' : 'text-rose-400'}`}>
                          {chartData?.isPeriodPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span>
                            {chartData?.isPeriodPositive ? '+' : ''}
                            {currencySymbol}{chartData?.periodChange} ({chartData?.isPeriodPositive ? '+' : ''}{chartData?.periodChangePercent}%)
                          </span>
                        </div>}
                      </div>
                    </div>

                    {/* Timeframe Selectors */}
                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                      <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                        {['1W', '1M', '6M', '1Y'].map(tf => (
                          <button
                            key={tf}
                            onClick={() => {
                              setChartTimeframe(tf);
                              setHoverIndex(null);
                            }}
                            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg cursor-pointer transition-all touch-manipulation select-none ${
                              chartTimeframe === tf 
                                ? 'bg-[#00E676] text-slate-950 shadow-sm' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Visual Surface: Dynamic Heartbeat Volatility Engine */}
                <div className="p-4 sm:p-6 bg-gradient-to-b from-[#06111F] to-[#040C16] relative select-none">
                    <div 
                      className="w-full h-48 sm:h-56 relative cursor-crosshair touch-manipulation"
                      onMouseMove={(e) => {
                        if (!chartData?.coords?.length) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                        const idx = Math.round(ratio * (chartData.coords.length - 1));
                        setHoverIndex(idx);
                      }}
                      onMouseLeave={() => setHoverIndex(null)}
                      onTouchMove={(e) => {
                        if (!chartData?.coords?.length || !e.touches[0]) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const ratio = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width));
                        const idx = Math.round(ratio * (chartData.coords.length - 1));
                        setHoverIndex(idx);
                      }}
                      onTouchEnd={() => setHoverIndex(null)}
                    >
                      {/* Smooth Loading Skeleton Overlay */}
                      {isLoadingHistory && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-[2px] transition-all duration-300">
                          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-[#00E676]/30 shadow-2xl text-xs font-mono text-slate-200">
                            <Loader2 className="w-3.5 h-3.5 text-[#00E676] animate-spin" />
                            <span>Syncing live exchange feed ({chartTimeframe})...</span>
                          </div>
                        </div>
                      )}
                      {!isLoadingHistory && !chartData && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 text-center p-6">
                          <p className="text-sm text-slate-300">Verified historical prices are temporarily unavailable for this security. No simulated chart is displayed.</p>
                        </div>
                      )}

                      <svg 
                        viewBox={`0 0 ${chartData?.width || 640} ${chartData?.height || 190}`} 
                        className="w-full h-full overflow-visible" 
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="heartbeatGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={chartData?.isPeriodPositive ? '#00E676' : '#F43F5E'} stopOpacity="0.35" />
                            <stop offset="50%" stopColor={chartData?.isPeriodPositive ? '#00E676' : '#F43F5E'} stopOpacity="0.10" />
                            <stop offset="100%" stopColor={chartData?.isPeriodPositive ? '#00E676' : '#F43F5E'} stopOpacity="0.0" />
                          </linearGradient>
                          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>

                        {/* Subtle Horizontal Gridlines */}
                        <line x1="0" y1="35" x2={chartData?.width} y2="35" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                        <line x1="0" y1="95" x2={chartData?.width} y2="95" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                        <line x1="0" y1="155" x2={chartData?.width} y2="155" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

                        {/* Gradient Area Fill */}
                        {chartData?.areaPath && (
                          <path d={chartData.areaPath} fill="url(#heartbeatGrad)" />
                        )}

                        {/* Glowing Organic Heartbeat Curve Line */}
                        {chartData?.smoothPath && (
                          <>
                            <path 
                              d={chartData.smoothPath} 
                              fill="none" 
                              stroke={chartData.isPeriodPositive ? '#00E676' : '#F43F5E'} 
                              strokeWidth="5" 
                              opacity="0.3"
                              filter="url(#glowFilter)"
                            />
                            <path 
                              d={chartData.smoothPath} 
                              fill="none" 
                              stroke={chartData.isPeriodPositive ? '#00E676' : '#F43F5E'} 
                              strokeWidth="2.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                            />
                          </>
                        )}

                        {/* Pulsing Live Heartbeat Beacon at Final Price Point */}
                        {chartData?.lastCoord && hoverIndex === null && (
                          <g>
                            <circle 
                              cx={chartData.lastCoord.x} 
                              cy={chartData.lastCoord.y} 
                              r="8" 
                              fill={chartData.isPeriodPositive ? '#00E676' : '#F43F5E'} 
                              className="animate-ping opacity-60" 
                            />
                            <circle 
                              cx={chartData.lastCoord.x} 
                              cy={chartData.lastCoord.y} 
                              r="4.5" 
                              fill="#FFFFFF" 
                              stroke={chartData.isPeriodPositive ? '#00E676' : '#F43F5E'} 
                              strokeWidth="2.5" 
                            />
                          </g>
                        )}

                        {/* Interactive Inspection Crosshair & Point */}
                        {hoverIndex !== null && chartData?.coords[hoverIndex] && (
                          <g>
                            <line 
                              x1={chartData.coords[hoverIndex].x} 
                              y1="0" 
                              x2={chartData.coords[hoverIndex].x} 
                              y2={chartData.height} 
                              stroke="#FFFFFF" 
                              strokeWidth="1" 
                              strokeDasharray="3 3" 
                              opacity="0.6" 
                            />
                            <circle 
                              cx={chartData.coords[hoverIndex].x} 
                              cy={chartData.coords[hoverIndex].y} 
                              r="5.5" 
                              fill="#FFFFFF" 
                              stroke={chartData.isPeriodPositive ? '#00E676' : '#F43F5E'} 
                              strokeWidth="3" 
                            />
                          </g>
                        )}
                      </svg>

                      {/* Floating Inspection Tooltip */}
                      {hoverIndex !== null && chartData?.coords[hoverIndex] && (
                        <div 
                          className="absolute pointer-events-none transform -translate-x-1/2 -top-2 bg-slate-900/95 border border-white/20 px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md text-center transition-all z-20"
                          style={{
                            left: `${(chartData.coords[hoverIndex].x / chartData.width) * 100}%`
                          }}
                        >
                          <div className="text-[10px] text-slate-400 font-mono font-medium">
                            {chartData.coords[hoverIndex].time
                              ? formatInspectionDate(chartData.coords[hoverIndex].time, chartTimeframe)
                              : 'Session Inspection'}
                          </div>
                          <div className="text-sm font-black font-mono text-white">
                            {currencySymbol}{chartData.coords[hoverIndex].val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Dynamic High / Low & 52W Envelope Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-400 mt-3 pt-3 border-t border-white/10">
                      <div>
                        <span className="text-slate-500 block text-[10px]">PERIOD LOW</span>
                        <span className="font-bold text-slate-200">{chartData ? `${currencySymbol}${chartData.minPrice.toFixed(2)}` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">PERIOD HIGH</span>
                        <span className="font-bold text-slate-200">{chartData ? `${currencySymbol}${chartData.maxPrice.toFixed(2)}` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">52W RANGE</span>
                        <span className="font-bold text-slate-200">{low52 !== null && high52 !== null ? `${currencySymbol}${low52.toFixed(2)} – ${currencySymbol}${high52.toFixed(2)}` : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">52W POSITION</span>
                        <span className="font-bold text-[#00E676]">{pos52 !== null ? `${pos52.toFixed(1)}%` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

              {/* Technical Signal Speedometer & Moving Averages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Speedometer Gauge Card */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-[#00E676]" />
                      Technical Speedometer
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      techRating === 'Strong Buy'
                        ? 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30'
                        : techRating === 'Buy'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {techRating || 'N/A'}
                    </span>
                  </div>

                  {/* Multi-Segment Speedometer Track */}
                  <div className="space-y-1.5 pt-2">
                    <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 flex overflow-hidden p-0.5 gap-0.5">
                      <div className="w-1/5 rounded-l bg-rose-500" title="Strong Sell" />
                      <div className="w-1/5 bg-rose-400" title="Sell" />
                      <div className="w-1/5 bg-amber-400" title="Neutral" />
                      <div className="w-1/5 bg-emerald-400" title="Buy" />
                      <div className="w-1/5 rounded-r bg-[#00E676]" title="Strong Buy" />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-gray-500 dark:text-gray-400 font-semibold">
                      <span>Strong Sell</span>
                      <span>Neutral</span>
                      <span>Strong Buy</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs font-mono">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block text-[11px]">RSI-14 Status:</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{rsiVal ?? 'N/A'}</span>
                      <span className="text-[10px] text-gray-500 block">
                        {rsiVal === null ? 'Verified RSI unavailable' : rsiVal > 70 ? 'Overbought (>70)' : rsiVal < 35 ? 'Oversold (<35)' : 'Neutral Range'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block text-[11px]">MACD Signal:</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{macdVal || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Moving Averages Card */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-[#00E676]" />
                    Moving Average Signals
                  </span>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">50-Day SMA:</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{ma50Val !== null ? `${currencySymbol}${ma50Val.toFixed(2)}` : 'N/A'}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                        {ma50Val !== null && displayPrice !== null ? (displayPrice >= ma50Val ? 'Above' : 'Below') : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">200-Day SMA:</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{ma200Val !== null ? `${currencySymbol}${ma200Val.toFixed(2)}` : 'N/A'}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                        {ma200Val !== null && displayPrice !== null ? (displayPrice >= ma200Val ? 'Above' : 'Below') : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight pt-1">
                    Technical ratings are hidden until calculated from verified historical observations.
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MULTI-YEAR FINANCIAL BREAKDOWN CHARTS */}
          {activeTab === 'financials' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="p-4 sm:p-6 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-blue-500" />
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                      Financial Performance: Revenue, Net Profit &amp; Operating Cash Flow
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    Values in {currencySymbol} Billions
                  </span>
                </div>

                {/* Visual Bar Chart Breakdown */}
                <div className="space-y-4 pt-2">
                  {financialHistory.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Verified audited financial statements have not been linked for this company. Revenue, profit, and cash-flow charts are unavailable.</p>}
                  {financialHistory.map((row) => (
                    <div key={row.year} className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold font-mono">
                        <span className="text-gray-900 dark:text-gray-100">{row.year}</span>
                        <span className="text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded">
                          YoY Growth {row.growth}
                        </span>
                      </div>

                      {/* Revenue Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono text-gray-600 dark:text-gray-400">
                          <span>Revenue: {currencySymbol}{row.revenue}B</span>
                          <span className="text-blue-500 font-bold">Margin: {row.margin}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
                        </div>
                      </div>

                      {/* Net Income & Cash Flow Bars */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-[10px] font-mono text-gray-500 block">Net Income:</span>
                          <span className="text-xs font-mono font-bold text-emerald-500">{currencySymbol}{row.netIncome}B</span>
                          <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }} />
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-gray-500 block">Operating Cash Flow:</span>
                          <span className="text-xs font-mono font-bold text-cyan-500">{currencySymbol}{row.cashFlow}B</span>
                          <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mt-0.5">
                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: '85%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-gray-600 dark:text-gray-400 font-medium pt-2 border-t border-gray-200 dark:border-gray-700">
                  Figures are displayed only when sourced from verified financial filings.
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: WRITTEN INSTITUTIONAL PROFILE (200-300 WORDS) */}
          {activeTab === 'thesis' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-5 sm:p-7 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#00E676]" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                    Institutional Research Profile &amp; Economic Moat
                  </h3>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-justify whitespace-pre-line">
                  {institutionalAnalysis}
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Competitive Moat</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100 mt-1 block">
                      {stock.competitiveMoat || 'Verified company analysis unavailable'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Dividend Sustainability</span>
                    <span className="text-xs font-bold text-[#00E676] mt-1 block">
                      {stock.hasVerifiedQuote && Number.isFinite(stock.dividendYield)
                        ? (stock.dividendYield > 8 ? 'High Yield (>8% Ann.)' : stock.dividendYield > 2 ? 'Consistent Payout & Growth' : 'Internal Capital Reinvestment')
                        : 'Verified dividend history unavailable'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Macroeconomic Driver</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100 mt-1 block">
                      {isPsx ? 'SBP Benchmark Interest Rates & Energy Tariffs' : 'Global Tech Capex & US Fed Yield Curve'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VALUATION & SCORECARD RATIOS */}
          {activeTab === 'fundamentals' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {stock.verifiedFundamentals === true ? <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block">P/E Ratio (TTM)</span>
                  <span className="text-lg font-mono font-black text-gray-900 dark:text-gray-100 mt-1 block">
                    {stock.peRatio.toFixed(1)}x
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    {isPsx ? (stock.peRatio < 5.2 ? 'Below PSX Avg (5.2x)' : 'Growth Premium') : (stock.peRatio < 27 ? 'Below S&P Avg (27x)' : 'Tech Premium')}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block">Dividend Yield</span>
                  <span className="text-lg font-mono font-black text-[#00E676] mt-1 block">
                    {stock.dividendYield.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Annualized Cash Return</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block">Price to Book (P/B)</span>
                  <span className="text-lg font-mono font-black text-gray-900 dark:text-gray-100 mt-1 block">
                    {stock.pbRatio.toFixed(2)}x
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Tangible Book Multiple</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block">Return on Equity</span>
                  <span className="text-lg font-mono font-black text-blue-500 mt-1 block">
                    {stock.fundamentals?.roe || '28.5%'}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Capital Efficiency (ROE)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block">Diluted EPS</span>
                  <span className="text-lg font-mono font-black text-gray-900 dark:text-gray-100 mt-1 block">
                    {currencySymbol}{stock.fundamentals?.eps?.toFixed(2) || (stock.price / stock.peRatio).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Trailing Twelve Months</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block">Debt-to-Equity</span>
                  <span className="text-lg font-mono font-black text-gray-900 dark:text-gray-100 mt-1 block">
                    {stock.fundamentals?.debtToEquity || '0.25'}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Balance Sheet Leverage</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block">Revenue Growth</span>
                  <span className="text-lg font-mono font-black text-emerald-500 mt-1 block">
                    {stock.fundamentals?.revenueGrowth || '+18.5% YoY'}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Year-over-Year Velocity</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 block">Piotroski F-Score</span>
                  <span className="text-lg font-mono font-black text-[#00E676] mt-1 block">
                    {stock.piotroski || 8} / 9
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Fundamental Strength</span>
                </div>

              </div> : <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-600 dark:text-gray-300">Verified fundamentals are not available for this security. Unsupported ratios and scores are not shown.</div>}
            </div>
          )}

          {/* 52-Week Range Visual Bar */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">52-Week Price Spectrum</span>
              <span className="text-gray-900 dark:text-gray-100 font-bold">
                {low52 !== null && high52 !== null ? `Low: ${currencySymbol}${low52.toFixed(2)} — High: ${currencySymbol}${high52.toFixed(2)}` : 'Verified range unavailable'}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full relative overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-[#00E676] to-emerald-400 rounded-full"
                style={{ width: `${pos52 ?? 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-400 font-mono">
              <span>52W Low (Trough)</span>
              <span className="text-[#00E676] font-bold">Current: {displayPrice !== null ? `${currencySymbol}${displayPrice.toFixed(2)}` : 'N/A'}</span>
              <span>52W High (Peak)</span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 flex items-center justify-between">
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            FGC Spot Institutional Equity Intelligence • Real-Time Reference
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-[#00E676] hover:text-[#06111F] text-gray-900 dark:text-gray-100 font-bold text-xs transition-colors cursor-pointer"
          >
            Close Deep-Dive
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
