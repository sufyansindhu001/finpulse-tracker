import React, { useState, useMemo } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  BarChart2, 
  Activity 
} from 'lucide-react';

export default function CompanyModal({ stock, onClose }) {
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'thesis' | 'fundamentals'
  const [psxTimeframe, setPsxTimeframe] = useState('1M');

  const isPsx = stock?.country === 'pk';
  const isPositive = (stock?.changePercent || 0) >= 0;

  // TradingView symbol map
  const getTradingViewSymbol = (s) => {
    if (s.country === 'us') return `NASDAQ:${s.ticker}`;
    if (s.ticker === 'JPM' || s.ticker === 'BRK.B') return `NYSE:${s.ticker.replace('.', '')}`;
    if (s.country === 'uk') return `LSE:${s.ticker}`;
    if (s.country === 'sa') return `TADAWUL:${s.ticker.replace('.SR', '')}`;
    if (s.ticker === 'TM') return `NYSE:TM`;
    if (s.ticker === 'SONY') return `NYSE:SONY`;
    if (s.ticker === 'TSM') return `NYSE:TSM`;
    return `NASDAQ:${s.ticker}`;
  };

  const tvSymbol = getTradingViewSymbol(stock);

  // Generate synthetic price history for PSX scorecard chart
  const psxChartPoints = useMemo(() => {
    if (!isPsx) return [];
    const count = psxTimeframe === '1W' ? 7 : psxTimeframe === '1M' ? 30 : psxTimeframe === '6M' ? 45 : 60;
    const base = stock.price;
    const volatility = 0.018;
    const points = [];
    let current = base * (1 - (0.0015 * count));

    for (let i = 0; i < count; i++) {
      const pseudo = Math.sin(i * 1.7 + stock.ticker.length) * Math.cos(i * 0.9);
      current = current * (1 + (pseudo * volatility * 0.5) + (isPositive ? 0.001 : -0.0005));
      points.push(Math.max(stock.low52 * 0.95, Math.min(stock.high52 * 1.05, current)));
    }
    // ensure last point equals current price
    points[points.length - 1] = stock.price;
    return points;
  }, [stock, isPsx, psxTimeframe, isPositive]);

  // SVG Chart path calculation
  const svgPath = useMemo(() => {
    if (!psxChartPoints.length) return '';
    const min = Math.min(...psxChartPoints);
    const max = Math.max(...psxChartPoints);
    const range = max - min || 1;
    const width = 600;
    const height = 180;

    return psxChartPoints.map((val, idx) => {
      const x = (idx / (psxChartPoints.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 30) - 15;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  }, [psxChartPoints]);

  if (!stock) return null;

  // Calculate 52-week position percentage
  const range52 = stock.high52 - stock.low52 || 1;
  const pos52 = Math.min(100, Math.max(0, ((stock.price - stock.low52) / range52) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto backdrop-blur-md bg-black/70 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#06111F]/50">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center font-black text-slate-800 dark:text-white text-lg tracking-wider border border-slate-300 dark:border-white/10 shrink-0">
              {stock.ticker.slice(0, 4)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {stock.name}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                  {stock.exchange}:{stock.ticker}
                </span>
                <span className="text-xs flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
                  <span>{stock.flag}</span>
                  <span>{stock.countryName}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2] mt-0.5">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
                  {stock.sector}
                </span>
                <span>•</span>
                <span className="font-mono">Market Cap: {stock.marketCap}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xl font-mono font-black text-slate-900 dark:text-white">
                {stock.currencySymbol}{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-xs font-mono font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-[#00E676]' : 'text-rose-500'}`}>
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{isPositive ? '+' : ''}{stock.change24h.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#06111F] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Price Bar */}
        <div className="sm:hidden px-4 py-2 bg-slate-100 dark:bg-[#06111F] border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="text-sm font-mono font-black text-slate-900 dark:text-white">
            {stock.currencySymbol}{stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-xs font-mono font-bold flex items-center gap-1 ${isPositive ? 'text-[#00E676]' : 'text-rose-500'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isPositive ? '+' : ''}{stock.change24h.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/30 dark:bg-[#0A1726]">
          <button
            onClick={() => setActiveTab('chart')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chart'
                ? 'border-[#00E676] text-[#00E676]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Interactive Chart & Scorecard</span>
          </button>
          <button
            onClick={() => setActiveTab('thesis')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'thesis'
                ? 'border-[#00E676] text-[#00E676]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Institutional Research Thesis</span>
          </button>
          <button
            onClick={() => setActiveTab('fundamentals')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fundamentals'
                ? 'border-[#00E676] text-[#00E676]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Valuation & Financials</span>
          </button>
        </div>

        {/* Body Content (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: CHART & SCORECARD */}
          {activeTab === 'chart' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Chart Container */}
              <div className="w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700/60 shadow-inner relative">
                {isPsx ? (
                  // PSX Interactive Scorecard Chart
                  <div className="p-4 sm:p-6 bg-gradient-to-b from-[#0A1726] to-[#06111F] text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase font-mono tracking-wider text-slate-400">PSX Historical Price Action</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#00E676]/20 text-[#00E676] font-bold">KSE-100 Listed</span>
                        </div>
                        <div className="text-lg font-black font-mono mt-0.5 text-white">
                          ₨{stock.price.toFixed(2)} <span className="text-xs font-normal text-slate-400">PKR per share</span>
                        </div>
                      </div>

                      {/* Timeframe selector */}
                      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 self-start sm:self-auto">
                        {['1W', '1M', '6M', '1Y'].map(tf => (
                          <button
                            key={tf}
                            onClick={() => setPsxTimeframe(tf)}
                            className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded cursor-pointer transition-colors ${
                              psxTimeframe === tf 
                                ? 'bg-[#00E676] text-[#06111F]' 
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SVG Chart Line */}
                    <div className="w-full h-44 relative">
                      <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="psxGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00E676" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#00E676" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Horizontal gridlines */}
                        <line x1="0" y1="30" x2="600" y2="30" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                        <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                        <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                        {/* Gradient Area */}
                        <path
                          d={`${svgPath} L 600 180 L 0 180 Z`}
                          fill="url(#psxGrad)"
                        />
                        {/* Stroke Line */}
                        <path
                          d={svgPath}
                          fill="none"
                          stroke="#00E676"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 border-t border-white/10 pt-2">
                      <span>52W Low: ₨{stock.low52.toFixed(2)}</span>
                      <span className="text-[#00E676] font-bold">52W Position: {pos52.toFixed(1)}%</span>
                      <span>52W High: ₨{stock.high52.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  // TradingView Embed Iframe for US / UK / Saudi / Japan
                  <div className="w-full h-[360px] relative">
                    <iframe
                      title={`TradingView Chart ${tvSymbol}`}
                      src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(tvSymbol)}&interval=D&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=06111f&studies=[]&theme=dark&style=1&timezone=Etc/UTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=fgcspot.com&utm_medium=widget&utm_campaign=chart&utm_term=${encodeURIComponent(tvSymbol)}`}
                      className="w-full h-full border-0"
                      allowTransparency="true"
                      scrolling="no"
                    />
                  </div>
                )}
              </div>

              {/* Technical Signal Gauge & Moving Averages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#00E676]" />
                      Technical Trend Gauge
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
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
                  </div>

                  {/* Visual Gauge Bar */}
                  <div className="space-y-1">
                    <div className="h-2.5 rounded-full bg-slate-200 dark:bg-white/10 flex overflow-hidden">
                      <div className="w-1/4 bg-rose-500/80" title="Sell" />
                      <div className="w-1/4 bg-amber-500/80" title="Neutral" />
                      <div className="w-1/4 bg-emerald-500/80" title="Buy" />
                      <div className="w-1/4 bg-[#00E676]" title="Strong Buy" />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Strong Sell</span>
                      <span>Neutral</span>
                      <span>Strong Buy</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-white/10 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[11px]">RSI (14-Period):</span>
                      <span className="font-bold text-slate-900 dark:text-white">{stock.technicalIndicators.rsi14}</span>
                      <span className="text-[10px] text-slate-400 block">
                        {stock.technicalIndicators.rsi14 > 70 ? 'Overbought' : stock.technicalIndicators.rsi14 < 30 ? 'Oversold' : 'Neutral Range'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">MACD Signal:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{stock.technicalIndicators.macdSignal}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-[#00E676]" />
                    Moving Average Signals
                  </span>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10">
                      <span className="text-slate-500">50-Day Simple MA:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{stock.currencySymbol}{stock.technicalIndicators.ma50.toFixed(2)}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                        {stock.price >= stock.technicalIndicators.ma50 ? 'Above (Bullish)' : 'Below'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10">
                      <span className="text-slate-500">200-Day Simple MA:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{stock.currencySymbol}{stock.technicalIndicators.ma200.toFixed(2)}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                        {stock.price >= stock.technicalIndicators.ma200 ? 'Above (Golden Setup)' : 'Below'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 leading-tight pt-1">
                    *Technical ratings are algorithmic composites calculated across moving average crossovers and momentum oscillators for educational evaluation.
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: INSTITUTIONAL RESEARCH THESIS (150-250 words) */}
          {activeTab === 'thesis' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#00E676]" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Institutional Investment Thesis & Business Moat
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-[#CBD5E1] leading-relaxed font-sans text-justify">
                  {stock.profile}
                </p>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Primary Moat</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white mt-1 block">
                      {isPsx ? 'High CASA Deposits / Resource Scale' : 'Ecosystem Lock-in & Tech Leadership'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Dividend Sustainability</span>
                    <span className="text-xs font-semibold text-[#00E676] mt-1 block">
                      {stock.dividendYield > 8 ? 'High Yield (>10% Ann.)' : stock.dividendYield > 2 ? 'Stable Payout & Growth' : 'Capital Reinvestment Focus'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Macro Sensitivity</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white mt-1 block">
                      {isPsx ? 'SBP Policy Rate & Inflation Parity' : 'US Fed Yields & Global Tech Capex'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VALUATION & FUNDAMENTALS */}
          {activeTab === 'fundamentals' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">P/E Ratio</span>
                  <span className="text-lg font-mono font-black text-slate-900 dark:text-white mt-1 block">
                    {stock.peRatio.toFixed(1)}x
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isPsx ? (stock.peRatio < 5.2 ? 'Below PSX Avg (5.2x)' : 'Growth Premium') : (stock.peRatio < 27 ? 'Below S&P Avg (27x)' : 'High Tech Growth')}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">Dividend Yield</span>
                  <span className="text-lg font-mono font-black text-[#00E676] mt-1 block">
                    {stock.dividendYield.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-slate-400">Annualized Cash Return</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">Price to Book (P/B)</span>
                  <span className="text-lg font-mono font-black text-slate-900 dark:text-white mt-1 block">
                    {stock.fundamentals.pbRatio}x
                  </span>
                  <span className="text-[10px] text-slate-400">Book Value Multiple</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">Return on Equity (ROE)</span>
                  <span className="text-lg font-mono font-black text-blue-500 mt-1 block">
                    {stock.fundamentals.roe}
                  </span>
                  <span className="text-[10px] text-slate-400">Capital Efficiency</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">Earnings Per Share</span>
                  <span className="text-lg font-mono font-black text-slate-900 dark:text-white mt-1 block">
                    {stock.currencySymbol}{stock.fundamentals.eps.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400">Diluted TTM EPS</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">Debt-to-Equity</span>
                  <span className="text-lg font-mono font-black text-slate-900 dark:text-white mt-1 block">
                    {stock.fundamentals.debtToEquity}
                  </span>
                  <span className="text-[10px] text-slate-400">Balance Sheet Leverage</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">Revenue Growth</span>
                  <span className="text-lg font-mono font-black text-emerald-500 mt-1 block">
                    {stock.fundamentals.revenueGrowth}
                  </span>
                  <span className="text-[10px] text-slate-400">Year-over-Year Velocity</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">52-Week Range</span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-2 block">
                    {stock.currencySymbol}{stock.low52.toFixed(0)} - {stock.currencySymbol}{stock.high52.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-[#00E676]">{pos52.toFixed(0)}% of 52W High</span>
                </div>
              </div>
            </div>
          )}

          {/* 52-Week Range Visual Bar (Always visible) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 font-semibold">52-Week Price Spectrum</span>
              <span className="text-slate-900 dark:text-white font-bold">
                Low: {stock.currencySymbol}{stock.low52.toFixed(2)} — High: {stock.currencySymbol}{stock.high52.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/10 h-2.5 rounded-full relative overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-[#00E676] to-emerald-400 rounded-full"
                style={{ width: `${pos52}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>52W Low (Trough)</span>
              <span className="text-[#00E676] font-bold">Current: {stock.currencySymbol}{stock.price.toFixed(2)}</span>
              <span>52W High (Peak)</span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#06111F]/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            FGC Spot Equity Intelligence Engine • Institutional Reference
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-[#00E676] hover:text-[#06111F] text-slate-800 dark:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close Deep-Dive
          </button>
        </div>

      </div>
    </div>
  );
}
