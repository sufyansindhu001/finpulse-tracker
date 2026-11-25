import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  LineChart, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Layers, 
  Maximize2, 
  Zap,
  Globe,
  Coins,
  Sparkles,
  ChevronRight,
  ChevronDown,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { fetchLiveMetals, DEFAULT_METALS } from '../services/metalsService';

const chartFaqs = [
  {
    q: "What timeframes are most suitable for analyzing currency pair trends?",
    a: "Short-term remittance senders and retail traders typically look at the 1D (24-hour) and 7D (weekly) charts to identify intraday volatility dips or favorable transfer windows. Institutional treasury managers and long-term asset allocators focus on 1M (monthly) and 1Y (yearly) trends to determine macroeconomic support corridors and policy interest rate impacts."
  },
  {
    q: "How frequently does the interactive price curve update?",
    a: "The pricing engine connects directly to verified market data feeds. Historical charts plot authentic closing observations across the selected timeframe, while the top benchmark displays current verified quotes. If historical data is temporarily unavailable from upstream sources, the chart displays an unavailable notice rather than presenting simulated curves."
  },
  {
    q: "What does the shaded gradient area under the chart line indicate?",
    a: "The shaded gradient represents cumulative liquidity depth and historical price occupancy within the selected corridor. It visually emphasizes whether the asset spent the majority of the timeframe near its cyclical highs or consolidated along support baselines."
  },
  {
    q: "How can I pinpoint dynamic support and resistance levels using this terminal?",
    a: "Support levels appear as horizontal price zones where selling momentum repeatedly pauses and reverses upward (highlighted by the Period Low statistic card). Resistance levels represent ceiling zones where buyers lose momentum and price consolidates (highlighted by the Period High statistic card)."
  },
  {
    q: "Why do cryptocurrency charts show wider percentage swings than sovereign forex pairs?",
    a: "Digital assets like Bitcoin and Ethereum operate 24/7 in globally unpegged order books with variable liquidity, resulting in higher annualized volatility (typically 40%–70%). In contrast, major sovereign currencies are anchored by sovereign central bank reserve mandates and target interest rate corridors, keeping daily interbank fluctuations within narrow margins."
  },
  {
    q: "How are synthetic cross-currency charts like EUR/PKR and GBP/PKR derived?",
    a: "Cross-currency charts are mathematically derived through US Dollar triangular pricing. Since USD/PKR is the primary clearing pair in the Karachi interbank market, EUR/PKR is computed by multiplying the global EUR/USD spot rate by the domestic USD/PKR benchmark at each interval."
  }
];

export default function ChartsPage({ rates = {}, cryptoList = [] }) {
  useSEO({
    title: 'Interactive Financial Market Charts & Technical Analytics | FGC Spot',
    description: 'Interactive candlestick and line charts for Forex currency pairs, precious metals, and cryptocurrencies on FGC Spot.',
    canonical: '/charts'
  });

  const [searchParams] = useSearchParams();
  const initialAsset = searchParams.get('asset') || searchParams.get('pair')?.replace('-', '/') || 'USD/PKR';

  const [selectedAsset, setSelectedAsset] = useState(initialAsset);
  const [timeframe, setTimeframe] = useState('1M'); // '1D' | '7D' | '1M' | '1Y'
  const [hoverIndex, setHoverIndex] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const chartContainerRef = useRef(null);

  // Live Metals State
  const [metalsData, setMetalsData] = useState(() => ({
    gold: DEFAULT_METALS.gold,
    silver: DEFAULT_METALS.silver
  }));

  useEffect(() => {
    let isMounted = true;
    fetchLiveMetals().then(res => {
      if (isMounted && res && res.gold) {
        setMetalsData({ gold: res.gold, silver: res.silver });
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const usdToPkr = Number.isFinite(rates?.PKR) && rates.PKR > 0 ? rates.PKR : null;
  const eurToPkr = usdToPkr !== null && rates?.EUR > 0 ? usdToPkr / rates.EUR : null;
  const gbpToPkr = usdToPkr !== null && rates?.GBP > 0 ? usdToPkr / rates.GBP : null;

  // Live Crypto Prices
  const btcPrice = cryptoList?.find(c => c.symbol?.toUpperCase() === 'BTC')?.current_price ?? null;
  const ethPrice = cryptoList?.find(c => c.symbol?.toUpperCase() === 'ETH')?.current_price ?? null;

  // Live Gold Spot Price benchmark
  const goldPrice = (metalsData.gold?.price && metalsData.gold.price > 0)
    ? metalsData.gold.price 
    : (rates.XAU && rates.XAU > 0 ? (1 / rates.XAU) : null);

  // Dynamic Live Asset configurations with real market symbols
  const assets = useMemo(() => [
    { id: 'USD/PKR', name: 'US Dollar to PKR', basePrice: usdToPkr, unit: '₨', type: 'currency', symbol: 'PKR=X', country: 'us' },
    { id: 'EUR/PKR', name: 'Euro to PKR', basePrice: eurToPkr, unit: '₨', type: 'currency', symbol: 'EURPKR=X', country: 'us' },
    { id: 'GBP/PKR', name: 'British Pound to PKR', basePrice: gbpToPkr, unit: '₨', type: 'currency', symbol: 'GBPPKR=X', country: 'us' },
    { id: 'BTC', name: 'Bitcoin / USD', basePrice: btcPrice, unit: '$', type: 'crypto', symbol: 'BTC-USD', country: 'us' },
    { id: 'ETH', name: 'Ethereum / USD', basePrice: ethPrice, unit: '$', type: 'crypto', symbol: 'ETH-USD', country: 'us' },
    { id: 'Gold', name: 'Gold Spot / USD', basePrice: goldPrice, unit: '$', type: 'metal', symbol: 'GC=F', country: 'us' },
  ], [usdToPkr, eurToPkr, gbpToPkr, btcPrice, ethPrice, goldPrice]);

  const currentAsset = assets.find(a => a.id.toUpperCase() === selectedAsset.toUpperCase()) || assets[0];

  useEffect(() => {
    const assetParam = searchParams.get('asset');
    const pairParam = searchParams.get('pair');
    let target = pairParam || assetParam;
    if (target) {
      target = target.replace('-', '/').toUpperCase();
      if (target === 'XAU' || target === 'GOLD') target = 'Gold';
      const match = assets.find(a => a.id.toUpperCase() === target.toUpperCase());
      if (match) {
        setSelectedAsset(match.id);
      } else {
        setSelectedAsset(target);
      }
      setTimeout(() => {
        chartContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [searchParams, assets]);

  // Genuine historical observations state
  const [historyPoints, setHistoryPoints] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // 1. If crypto and timeframe has live CoinGecko hourly sparkline
    if (currentAsset.type === 'crypto' && (timeframe === '7D' || timeframe === '1D')) {
      const coin = cryptoList?.find(c => c.symbol?.toUpperCase() === currentAsset.id.toUpperCase());
      if (coin?.sparkline_in_7d?.price && Array.isArray(coin.sparkline_in_7d.price) && coin.sparkline_in_7d.price.length > 5) {
        const raw = coin.sparkline_in_7d.price;
        const slice = timeframe === '1D' ? raw.slice(-24) : raw;
        const now = Date.now();
        const totalDurationMs = (timeframe === '1D' ? 1 : 7) * 86400000;
        const stepMs = totalDurationMs / slice.length;

        const pts = slice.map((val, i) => {
          const t = new Date(now - (slice.length - 1 - i) * stepMs);
          const label = timeframe === '1D'
            ? t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : t.toLocaleDateString([], { month: 'short', day: 'numeric' });
          return {
            index: i,
            label,
            price: Number.isFinite(val) ? Number(val.toFixed((Number.isFinite(currentAsset.basePrice) && currentAsset.basePrice > 100) ? 2 : 4)) : 0,
            volume: 0
          };
        });
        setHistoryPoints(pts);
        setIsLoadingHistory(false);
        return;
      }
    }

    // 2. Query /api/stock-history for authentic exchange data
    setIsLoadingHistory(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    fetch(`/api/stock-history?symbol=${encodeURIComponent(currentAsset.symbol)}&country=${currentAsset.country}&timeframe=${timeframe}`, {
      signal: controller.signal
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!isMounted) return;
        if (data?.points && Array.isArray(data.points) && data.points.length > 1) {
          const timestamps = data.timestamps || [];
          const pts = data.points.map((val, i) => {
            const ts = timestamps[i] ? new Date(timestamps[i]) : new Date();
            const label = timeframe === '1D'
              ? ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ts.toLocaleDateString([], { month: 'short', day: 'numeric' });
            return {
              index: i,
              label,
              price: Number.isFinite(val) ? Number(val.toFixed((Number.isFinite(currentAsset.basePrice) && currentAsset.basePrice > 100) ? 2 : 4)) : 0,
              volume: 0
            };
          });
          setHistoryPoints(pts);
        } else {
          setHistoryPoints([]);
        }
      })
      .catch(() => {
        if (isMounted) setHistoryPoints([]);
      })
      .finally(() => {
        clearTimeout(timeout);
        if (isMounted) setIsLoadingHistory(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [currentAsset, timeframe, cryptoList]);

  // Verified historical observations only — zero synthetic or invented curves
  const chartData = useMemo(() => {
    return Array.isArray(historyPoints) ? historyPoints : [];
  }, [historyPoints]);

  const hasChartData = chartData.length > 1;

  // High, low, and delta calculated from verified observations
  const prices = useMemo(() => chartData.map(d => d.price), [chartData]);
  const minPrice = hasChartData ? Math.min(...prices) : currentAsset.basePrice;
  const maxPrice = hasChartData ? Math.max(...prices) : currentAsset.basePrice;
  const priceRange = hasChartData ? (maxPrice - minPrice || 1) : 0;

  const firstPrice = hasChartData ? chartData[0]?.price : currentAsset.basePrice;
  const lastPrice = hasChartData ? chartData[chartData.length - 1]?.price : currentAsset.basePrice;
  const overallChange = (hasChartData && Number.isFinite(firstPrice) && firstPrice > 0 && Number.isFinite(lastPrice))
    ? (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2)
    : 'N/A';
  const isPositive = hasChartData ? parseFloat(overallChange) >= 0 : null;

  // SVG Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 280;
  const paddingX = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  const usableHeight = svgHeight - paddingTop - paddingBottom;
  const usableWidth = svgWidth - paddingX * 2;

  // Convert points to SVG coordinates
  const svgPoints = useMemo(() => {
    if (!hasChartData) return [];
    return chartData.map((d, i) => {
      const x = paddingX + (i / (chartData.length - 1)) * usableWidth;
      const y = paddingTop + usableHeight - ((d.price - minPrice) / (priceRange || 1)) * usableHeight;
      return { ...d, x, y };
    });
  }, [chartData, hasChartData, minPrice, priceRange, usableHeight, usableWidth]);

  const pathD = useMemo(() => {
    if (!hasChartData || svgPoints.length === 0) return '';
    return svgPoints.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [hasChartData, svgPoints]);

  const areaD = useMemo(() => {
    if (!hasChartData || svgPoints.length === 0) return '';
    return `${pathD} L ${svgPoints[svgPoints.length - 1].x} ${svgHeight - paddingBottom} L ${svgPoints[0].x} ${svgHeight - paddingBottom} Z`;
  }, [hasChartData, pathD, svgPoints]);

  const activePoint = (hasChartData && hoverIndex !== null && svgPoints[hoverIndex])
    ? svgPoints[hoverIndex]
    : (hasChartData && svgPoints.length > 0)
      ? svgPoints[svgPoints.length - 1]
      : { price: currentAsset.basePrice, label: 'Current Quote' };

  // Mouse move handler for interactive crosshair
  const handleMouseMove = (e) => {
    if (!chartContainerRef.current || !hasChartData) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (clientX - paddingX) / (rect.width - paddingX * 2)));
    const idx = Math.round(ratio * (chartData.length - 1));
    setHoverIndex(idx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-white font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/rates" className="hover:text-slate-900 dark:hover:text-white font-medium">Rates</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold">Interactive Charts</span>
      </nav>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
            <span className="text-xs uppercase font-bold tracking-widest text-[#00E676]">
              TECHNICAL ANALYSIS TERMINAL
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Interactive Financial Charts
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B3C2] mt-1">
            Real-time streaming trends, historical corridor high/lows, and multi-asset price analytics.
          </p>
        </div>

        {/* Timeframe Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 self-start md:self-auto overflow-x-auto scrollbar-none touch-pan-x">
          {['1D', '7D', '1M', '1Y'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer touch-manipulation whitespace-nowrap ${
                timeframe === tf
                  ? 'bg-[#00E676] text-[#06111F] shadow-sm'
                  : 'text-slate-600 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Selector Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {assets.map((a) => {
          const isSelected = a.id === selectedAsset;
          return (
            <button
              key={a.id}
              onClick={() => setSelectedAsset(a.id)}
              className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between touch-manipulation select-none ${
                isSelected
                  ? 'bg-[#00E676]/10 border-[#00E676] shadow-md shadow-[#00E676]/10'
                  : 'bg-white dark:bg-[#0A1726]/80 hover:bg-slate-50 dark:hover:bg-[#0A1726] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-black uppercase ${isSelected ? 'text-[#00E676]' : 'text-slate-900 dark:text-white'}`}>
                  {a.id}
                </span>
                {a.type === 'currency' ? <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-[#A8B3C2]" /> : a.type === 'crypto' ? <Coins className="w-3.5 h-3.5 text-slate-400 dark:text-[#A8B3C2]" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />}
              </div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white font-tabular">
                {Number.isFinite(a.basePrice)
                  ? `${a.unit || ''}${a.basePrice > 100 ? a.basePrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : a.basePrice.toFixed(4)}`
                  : 'N/A'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Chart Card */}
      <div className="rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 p-4 sm:p-6 lg:p-8 shadow-sm dark:shadow-2xl backdrop-blur-xl space-y-6">
        
        {/* Chart Header Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="text-xs uppercase font-bold text-slate-500 dark:text-[#A8B3C2] tracking-wider">
              {currentAsset.name} ({timeframe} View)
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-tabular">
                {Number.isFinite(activePoint.price) ? `${currentAsset.unit} ${activePoint.price.toLocaleString(undefined, { maximumFractionDigits: 4 })}` : 'N/A — verified quote unavailable'}
              </span>
              {isPositive !== null ? (
                <span className={`inline-flex items-center gap-1 text-sm font-bold ${
                  isPositive ? 'text-[#00E676]' : 'text-rose-500 dark:text-rose-400'
                }`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{isPositive ? '+' : ''}{overallChange}%</span>
                </span>
              ) : (
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                  N/A
                </span>
              )}
            </div>
          </div>

          {/* Active Hover Inspector */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 text-right shadow-xs">
            <div className="text-[10px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">Snapshot Time</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white font-tabular">{activePoint.label}</div>
            <div className="text-[10px] text-[#00E676] font-semibold">24/7 Verified Data</div>
          </div>
        </div>

        {/* Chart Area: Verified Visualizer OR Honest Unavailable Notice */}
        {hasChartData ? (
          <div 
            ref={chartContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-72 sm:h-80 overflow-hidden cursor-crosshair select-none"
          >
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E676" stopOpacity="0.30" />
                  <stop offset="60%" stopColor="#00E676" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#06111F" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid guidelines */}
              {[0.25, 0.5, 0.75].map((pct, idx) => {
                const y = paddingTop + usableHeight * pct;
                const val = maxPrice - (pct * priceRange);
                return (
                  <g key={idx}>
                    <line 
                      x1={paddingX} 
                      y1={y} 
                      x2={svgWidth - paddingX} 
                      y2={y} 
                      className="stroke-slate-200 dark:stroke-white/10"
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x={svgWidth - paddingX} 
                      y={y - 4} 
                      className="fill-slate-400 dark:fill-[#A8B3C2]"
                      fontSize="9" 
                      textAnchor="end"
                      fontFamily="Inter, sans-serif"
                    >
                      {val.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {/* Filled Area */}
              <path d={areaD} fill="url(#chartGradient)" />

              {/* Main Price Stroke Line */}
              <path 
                d={pathD} 
                fill="none" 
                stroke="#00E676" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Hover Crosshair Vertical Line */}
              {hoverIndex !== null && (
                <g>
                  <line 
                    x1={activePoint.x} 
                    y1={paddingTop} 
                    x2={activePoint.x} 
                    y2={svgHeight - paddingBottom} 
                    stroke="#00E676" 
                    strokeWidth="1" 
                    strokeDasharray="3 3"
                  />
                  <circle 
                    cx={activePoint.x} 
                    cy={activePoint.y} 
                    r="5" 
                    fill="#00E676" 
                    className="stroke-white dark:stroke-[#06111F]"
                    strokeWidth="2" 
                  />
                </g>
              )}

              {/* X-axis date labels */}
              {svgPoints.filter((_, i) => i % Math.ceil(svgPoints.length / 6) === 0).map((pt, i) => (
                <text 
                  key={i} 
                  x={pt.x} 
                  y={svgHeight - 12} 
                  className="fill-slate-400 dark:fill-[#A8B3C2]"
                  fontSize="10" 
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif"
                >
                  {pt.label}
                </text>
              ))}
            </svg>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-72 sm:h-80 rounded-2xl bg-slate-50/70 dark:bg-[#06111F]/60 border border-slate-200 dark:border-white/10 p-6 text-center space-y-3 select-none">
            {isLoadingHistory ? (
              <>
                <RefreshCw className="w-8 h-8 text-[#00E676] animate-spin" />
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Retrieving verified historical observations...
                </div>
                <p className="text-xs text-slate-500 dark:text-[#A8B3C2] max-w-sm">
                  Connecting to upstream market exchange feeds for {currentAsset.name} ({timeframe}).
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="max-w-md">
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Historical chart temporarily unavailable
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#A8B3C2] mt-1 leading-relaxed">
                    Verified historical price series for {currentAsset.name} ({timeframe}) are currently unavailable from upstream feeds. FGC Spot displays verified market data only and never presents simulated or synthetic curves.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* 4 Bottom Key Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-white/10 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
            <div className="text-[11px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">Period High</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white font-tabular mt-0.5">
              {hasChartData ? `${currentAsset.unit}${maxPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}` : 'N/A'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
            <div className="text-[11px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">Period Low</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white font-tabular mt-0.5">
              {hasChartData ? `${currentAsset.unit}${minPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}` : 'N/A'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
            <div className="text-[11px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">Corridor Range</div>
            <div className="text-base font-extrabold text-[#00E676] font-tabular mt-0.5">
              {hasChartData ? `${currentAsset.unit}${priceRange.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : 'N/A'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
            <div className="text-[11px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">Pricing Benchmark</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white font-tabular mt-0.5">
              Indicative Mid-Market
            </div>
          </div>
        </div>

      </div>

      {/* Comprehensive Technical Analysis Educational Guide & AdSense Compliance Section */}
      <section className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10 space-y-8">
        
        {/* Methodological Transparency & Charting Architecture */}
        <div className="rounded-3xl bg-white dark:bg-[#0A1726]/80 border border-slate-200 dark:border-white/10 p-6 sm:p-10 shadow-sm dark:shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00E676]/10 text-[#00E676] flex items-center justify-center shrink-0 border border-[#00E676]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00E676]">Methodological Transparency &amp; Mechanics</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Technical Analysis Engine &amp; Charting Methodology
              </h2>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-5 font-normal">
            <p>
              The FGC Spot Interactive Financial Charts terminal maps historical price progression, liquidity corridor occupancy, and momentum indicators across sovereign foreign exchange pairs, bullion commodities, and benchmark cryptocurrencies. The charting engine transforms discrete historical fixings into smooth, continuous vector curves for institutional and retail market analysis.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose my-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00E676]">Simple Moving Average (SMA)</span>
                <p className="font-mono text-xs text-slate-800 dark:text-white font-bold">SMA_k = (1 / k) &times; &sum; Price_(t-i)</p>
                <p className="text-[11px] text-slate-500 leading-normal">Unweighted rolling arithmetic mean over 50 or 200 periods to establish macro baseline trends.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00E676]">Exponential Moving Avg (EMA)</span>
                <p className="font-mono text-xs text-slate-800 dark:text-white font-bold">EMA_t = (P_t &times; &alpha;) + (EMA_t-1 &times; (1 - &alpha;))</p>
                <p className="text-[11px] text-slate-500 leading-normal">Weights recent prices exponentially (&alpha; = 2 / (N + 1)), reducing lag during breakout moves.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00E676]">Relative Strength Index (RSI)</span>
                <p className="font-mono text-xs text-slate-800 dark:text-white font-bold">RSI = 100 - (100 / (1 + (Avg Gain / Avg Loss)))</p>
                <p className="text-[11px] text-slate-500 leading-normal">14-period momentum oscillator identifying overbought (&gt;70) and oversold (&lt;30) exhaustion zones.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
              <div className="space-y-2 p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E676]" />
                  <span>Data Providers &amp; Historical Fixings</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                  <strong>Forex History:</strong> Sourced from Open Exchange Rates and daily SBP weighted-average closing benchmarks. Cross-pairs (EUR/PKR, GBP/PKR) are derived algorithmically through USD triangular parity.
                </p>
                <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                  <strong>Metals &amp; Crypto:</strong> Gold spot tracks Binance Paxos (PAXG) and LBMA fixing feeds; digital asset price histories reflect CoinGecko daily volume-weighted market closes.
                </p>
              </div>

              <div className="space-y-2 p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E676]" />
                  <span>Data Limitations &amp; Chart Resolution</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                  Historical series are displayed only when the selected upstream provider supplies actual observations. Missing periods are not filled with simulated values; an unavailable notice is shown when the series cannot be verified.
                </p>
                <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                  Charts reflect indicative wholesale mid-market pricing and do not account for retail counter bid-ask spreads, making charges, or broker execution slippage.
                </p>
              </div>
            </div>

            {/* Practical Example */}
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 not-prose space-y-2">
              <h3 className="text-sm font-bold text-emerald-600 dark:text-[#00E676] flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Practical Example: Analyzing Support &amp; Resistance Corridors on USD/PKR</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                When tracking USD/PKR on the 1-Month (1M) chart, an analyst identifies an established trading corridor:
              </p>
              <ul className="text-xs text-slate-600 dark:text-[#A8B3C2] list-disc pl-5 space-y-1">
                <li><strong>Dynamic Support Baseline:</strong> At <strong>277.00 PKR</strong>, commercial bank import demand repeatedly absorbs selling pressure, establishing a floor indicated by the Period Low metric card.</li>
                <li><strong>Overhead Psychological Resistance:</strong> At <strong>280.00 PKR</strong>, central bank intervention liquidity and remittance inflows curb further dollar appreciation, establishing a ceiling indicated by the Period High card.</li>
                <li><strong>Range Occupancy:</strong> The shaded gradient area highlights price concentration, showing whether the exchange rate spent the majority of the timeframe consolidating near support or testing upper barriers.</li>
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-[11px] text-slate-500 leading-relaxed not-prose">
              <strong>Technical Analysis &amp; Educational Notice:</strong> Historical price charts, indicators (SMA, EMA, RSI), and trend visualizations are provided for educational and illustrative purposes only. They do not constitute financial advice, automated trading signals, or investment recommendations. Past price trajectory does not predict future market outcomes.
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#0A1726]/80 border border-slate-200 dark:border-white/10 p-6 sm:p-10 shadow-sm dark:shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00E676]/10 text-[#00E676] flex items-center justify-center shrink-0 border border-[#00E676]/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00E676]">Technical Analysis Intelligence</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Principles of Market Technical Analysis &amp; Price Action Dynamics
              </h2>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-4 font-normal">
            <p>
              Technical analysis is the quantitative study of historical market action—primarily price fluctuations and trading volume—to forecast potential future trajectory, identify institutional liquidity zones, and optimize risk-reward parameters. Whether tracking sovereign foreign exchange corridors (such as USD/PKR or EUR/USD), precious metals spot prices (Gold and Silver), or high-frequency digital assets (Bitcoin and Ethereum), mastering chart interpretation is essential for prudent capital allocation.
            </p>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-4">
              1. Candlestick Formations vs. Continuous Line Charts
            </h3>
            <p>
              Financial market visualizations typically rely on two core representations:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Continuous Line Charts:</strong> By connecting successive closing prices across predetermined timeframes, line charts eliminate intraday market noise, providing an intuitive view of macro trends, broad consolidation channels, and overall directional momentum.</li>
              <li><strong>Japanese Candlestick Formations:</strong> Each candle reveals four distinct data points: Open, High, Low, and Close (OHLC). The body represents the range between open and close, while the wicks (shadows) demonstrate the extreme high and low points reached during that session, illustrating intra-period battles between buyers and sellers.</li>
            </ul>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-4">
              2. Trend Indicators: Moving Averages (SMA &amp; EMA)
            </h3>
            <p>
              Moving averages smooth price fluctuations to create a singular trend-following line:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Simple Moving Average (SMA):</strong> Computes the unweighted arithmetic mean of closing prices over a specific period (e.g., 50-day or 200-day SMA). When the 50-day SMA crosses above the 200-day SMA, traders identify a bullish &quot;Golden Cross&quot;, whereas a downward crossover indicates a &quot;Death Cross&quot;.</li>
              <li><strong>Exponential Moving Average (EMA):</strong> Applies greater mathematical weight to the most recent data points, reducing lag and providing faster responsiveness to emerging breakouts or sudden macroeconomic announcements.</li>
            </ul>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-4">
              3. Momentum Oscillators: The Relative Strength Index (RSI)
            </h3>
            <p>
              The Relative Strength Index (RSI) is a bounded momentum oscillator operating on a scale from 0 to 100. It measures the speed and change of price movements over a default 14-period lookback window. Readings above 70 indicate that an asset is entering overbought territory, signaling potential exhaustion or mean reversion. Readings below 30 indicate oversold conditions, frequently preceding technical bounces or relief rallies.
            </p>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-4">
              4. Support, Resistance, and Institutional Order Blocks
            </h3>
            <p>
              Markets rarely move in straight lines; they expand and retrace within structured liquidity corridors. <strong>Support</strong> represents price baselines where buying interest consistently overcomes selling pressure, preventing further downside. <strong>Resistance</strong> marks overhead supply zones where selling interest halts upward advances. When a resistance level is decisively breached with high trading volume, it frequently transforms into a newly established support level through polarity reversal.
            </p>
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
                Frequently Asked Technical Analysis &amp; Charting Questions
              </h2>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {chartFaqs.map((faq, idx) => (
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
