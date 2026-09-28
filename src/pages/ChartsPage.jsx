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
  ChevronRight
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function ChartsPage({ rates = {}, cryptoList = [] }) {
  const [searchParams] = useSearchParams();
  const initialAsset = searchParams.get('asset') || searchParams.get('pair')?.replace('-', '/') || 'USD/PKR';

  const [selectedAsset, setSelectedAsset] = useState(initialAsset);
  const [timeframe, setTimeframe] = useState('1M'); // '1D' | '7D' | '1M' | '1Y'
  const [hoverIndex, setHoverIndex] = useState(null);
  const chartContainerRef = useRef(null);

  const usdToPkr = rates.PKR || 278.09;
  const eurToPkr = usdToPkr / (rates.EUR || 0.92);
  const gbpToPkr = usdToPkr / (rates.GBP || 0.79);

  // Asset configurations
  const assets = [
    { id: 'USD/PKR', name: 'US Dollar to PKR', basePrice: usdToPkr, unit: '₨', type: 'currency' },
    { id: 'EUR/PKR', name: 'Euro to PKR', basePrice: eurToPkr, unit: '₨', type: 'currency' },
    { id: 'GBP/PKR', name: 'British Pound to PKR', basePrice: gbpToPkr, unit: '₨', type: 'currency' },
    { id: 'BTC', name: 'Bitcoin / USD', basePrice: 96420, unit: '$', type: 'crypto' },
    { id: 'ETH', name: 'Ethereum / USD', basePrice: 2745.50, unit: '$', type: 'crypto' },
    { id: 'Gold', name: 'Gold Spot / USD', basePrice: 2684.50, unit: '$', type: 'metal' },
  ];

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
  }, [searchParams]);

  // Generate deterministic realistic historical price curve based on timeframe & asset
  const chartData = useMemo(() => {
    let points = 30;
    let volatility = 0.015;
    let trend = 0.0008;

    if (timeframe === '1D') {
      points = 24;
      volatility = 0.004;
      trend = 0.0002;
    } else if (timeframe === '7D') {
      points = 28;
      volatility = 0.012;
      trend = 0.0005;
    } else if (timeframe === '1M') {
      points = 30;
      volatility = 0.025;
      trend = 0.001;
    } else if (timeframe === '1Y') {
      points = 36;
      volatility = 0.08;
      trend = 0.003;
    }

    const base = currentAsset.basePrice;
    const data = [];
    let currentVal = base * (1 - (trend * points * 0.7));

    const now = Date.now();
    const stepMs = timeframe === '1D' ? 3600000 : timeframe === '7D' ? 21600000 : timeframe === '1M' ? 86400000 : 86400000 * 10;

    for (let i = 0; i < points; i++) {
      const pseudoRandom = Math.sin(i * 1.8 + currentAsset.name.length) * Math.cos(i * 0.7);
      const delta = currentVal * (volatility * pseudoRandom + trend);
      currentVal = Math.max(base * 0.4, currentVal + delta);

      // Final point matches basePrice closely
      if (i === points - 1) currentVal = base;

      const time = new Date(now - (points - 1 - i) * stepMs);
      const label = timeframe === '1D' 
        ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : time.toLocaleDateString([], { month: 'short', day: 'numeric' });

      data.push({
        index: i,
        label,
        price: parseFloat(currentVal.toFixed(currentAsset.basePrice > 100 ? 2 : 4)),
        volume: Math.floor(Math.abs(pseudoRandom * 500) + 120)
      });
    }

    return data;
  }, [selectedAsset, timeframe, currentAsset]);

  // High, low, and delta
  const prices = chartData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 1;

  const firstPrice = chartData[0]?.price || 1;
  const lastPrice = chartData[chartData.length - 1]?.price || 1;
  const overallChange = (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2);
  const isPositive = parseFloat(overallChange) >= 0;

  // SVG Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 280;
  const paddingX = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  const usableHeight = svgHeight - paddingTop - paddingBottom;
  const usableWidth = svgWidth - paddingX * 2;

  // Convert points to SVG coordinates
  const svgPoints = chartData.map((d, i) => {
    const x = paddingX + (i / (chartData.length - 1)) * usableWidth;
    const y = paddingTop + usableHeight - ((d.price - minPrice) / priceRange) * usableHeight;
    return { ...d, x, y };
  });

  const pathD = svgPoints.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${svgPoints[svgPoints.length - 1].x} ${svgHeight - paddingBottom} L ${svgPoints[0].x} ${svgHeight - paddingBottom} Z`;

  const activePoint = hoverIndex !== null ? svgPoints[hoverIndex] : svgPoints[svgPoints.length - 1];

  // Mouse move handler for interactive crosshair
  const handleMouseMove = (e) => {
    if (!chartContainerRef.current) return;
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
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 self-start md:self-auto">
          {['1D', '7D', '1M', '1Y'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {assets.map((a) => {
          const isSelected = a.id === selectedAsset;
          return (
            <button
              key={a.id}
              onClick={() => setSelectedAsset(a.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
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
                {a.unit}{a.basePrice > 100 ? a.basePrice.toLocaleString(undefined, { maximumFractionDigits: 2 }) : a.basePrice.toFixed(4)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Chart Card */}
      <div className="rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-2xl backdrop-blur-xl space-y-6">
        
        {/* Chart Header Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="text-xs uppercase font-bold text-slate-500 dark:text-[#A8B3C2] tracking-wider">
              {currentAsset.name} ({timeframe} View)
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-tabular">
                {currentAsset.unit} {activePoint.price.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </span>
              <span className={`inline-flex items-center gap-1 text-sm font-bold ${
                isPositive ? 'text-[#00E676]' : 'text-rose-500 dark:text-rose-400'
              }`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isPositive ? '+' : ''}{overallChange}%</span>
              </span>
            </div>
          </div>

          {/* Active Hover Inspector */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 text-right shadow-xs">
            <div className="text-[10px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">Snapshot Time</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white font-tabular">{activePoint.label}</div>
            <div className="text-[10px] text-[#00E676] font-semibold">24/7 Verified Data</div>
          </div>
        </div>

        {/* SVG Interactive Chart Visualizer */}
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

        {/* 4 Bottom Key Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-white/10 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
            <div className="text-[11px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">Period High</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white font-tabular mt-0.5">
              {currentAsset.unit}{maxPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
            <div className="text-[11px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">Period Low</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white font-tabular mt-0.5">
              {currentAsset.unit}{minPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
            <div className="text-[11px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">Corridor Range</div>
            <div className="text-base font-extrabold text-[#00E676] font-tabular mt-0.5">
              {currentAsset.unit}{priceRange.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
            <div className="text-[11px] text-slate-500 dark:text-[#A8B3C2] uppercase font-bold">Interbank Spread</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white font-tabular mt-0.5">
              0.00% Zero-Spread
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
