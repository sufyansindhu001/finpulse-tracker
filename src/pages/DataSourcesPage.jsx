import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Database, 
  Globe, 
  TrendingUp, 
  Coins, 
  Sparkles, 
  Building2, 
  Newspaper, 
  ChevronRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export default function DataSourcesPage() {
  useSEO({
    title: 'Data Sources & Market Feeds Governance | FGC Spot',
    description: 'Detailed transparency regarding FGC Spot market data feeds: upstream providers, refresh frequencies, calculation methodologies, and real-world trading limitations.',
    canonical: '/data-sources'
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const dataProviders = [
    {
      tool: 'Currency Reference Rates',
      route: '/rates',
      provider: 'open.er-api.com, FloatRates and public currency API mirrors',
      dataType: 'Indicative Public FX Reference Quotes',
      frequency: 'Fetched when needed, with a two-minute fresh cache and up to ten minutes of stale-while-revalidate availability; upstream update frequency varies',
      methodology: 'Cross-rate calculation through a common USD base: Rate(Base/Quote) = (USD/Quote) / (USD/Base).',
      limitations: 'Not official SBP closing rates or executable interbank quotations. Retail provider spreads, card fees and applicable taxes are separate; consult current bank and FBR terms.'
    },
    {
      tool: 'Open-Market Cash Exchange Context',
      route: '/converter',
      provider: 'No direct live cash-dealer rate feed is integrated',
      dataType: 'Educational Comparison Only',
      frequency: 'No real-time ECAP or counter-quotation refresh is claimed',
      methodology: 'If a licensed dealer provides buy/ask quotations, spread can be calculated as ((Ask - Bid) / Mid) * 100.',
      limitations: 'Physical cash exchange uses separately quoted retail rates and charges. An e-PRC is a bank-issued record of qualifying inward remittances, not an automatic income-tax exemption.'
    },
    {
      tool: 'Gold & Silver Bullion Spot',
      route: '/gold',
      provider: 'Yahoo Finance Commodities (GC=F, SI=F) & PAXG Token Reference',
      dataType: 'International Troy Ounce Reference Quotes',
      frequency: 'Polled on request with 60-second client caching via api/metals.js',
      methodology: 'Indicative Rate per Tola (24K) = (Reference Spot USD / 31.1034768) * USD_PKR * 11.664. Mathematical conversion derived directly from international troy ounce quotes and prevailing exchange rates without arbitrary multipliers.',
      limitations: 'International commodity references do not reflect official LBMA fixings, physical Karachi Sarafa retail rates, or statutory import duties. When feeds are offline, quotes display N/A.'
    },
    {
      tool: 'Sarafa Gold Purity Calculations',
      route: '/gold',
      provider: 'Mathematical Purity Derivation (Standard Karat Assay Ratios)',
      dataType: 'Indicative Domestic Benchmark Estimator',
      frequency: 'Dynamically calculated from verified spot and USD/PKR inputs',
      methodology: 'Derived from 24K baseline using standard statutory fineness: 22K (22/24 = 91.67%), 21K (21/24 = 87.50%), and 18K (18/24 = 75.00%). Zero unverified retail markup or arbitrary local premiums are inserted.',
      limitations: 'This platform does not ingest official APSGJA association closing rate sheets. PKR valuations are mathematical models only; transaction-ready rates require a licensed local jeweler or sarafa dealer.'
    },
    {
      tool: 'Stock Screener & PSX Terminal',
      route: '/stocks',
      provider: 'Yahoo Finance Market API Proxy (api/stocks.js) & PSX Public Disclosures',
      dataType: 'Provider-Available Stock Quotes & Company Metrics',
      frequency: 'Updated when provider data is accessible; exchange, source and cache delays vary',
      methodology: 'Quantitative ratio calculation engine: Price-to-Earnings (P/E = Price/EPS), Dividend Yield (Annual DPS/Price), Piotroski F-Score (9-factor fundamental test).',
      limitations: 'Quotes and corporate ratios may be delayed or absent; fundamental metrics should be checked against dated exchange and issuer filings.'
    },
    {
      tool: 'Cryptocurrency Market Index',
      route: '/crypto',
      provider: 'CoinGecko Public Markets API (api.coingecko.com/api/v3/coins/markets)',
      dataType: 'CoinGecko-Reported Market Prices and Indicators',
      frequency: 'Fetched on demand with two-minute client caching; actual upstream timestamp varies',
      methodology: 'Indicative PKR Counter-Value = Public Coin Price (USD) * Available USD/PKR Reference Rate.',
      limitations: 'Not independently computed VWAP or an executable exchange offer. Excludes trading spreads, on-chain network charges and local conversion costs; confirm current rules with regulators.'
    },
    {
      tool: 'Market News Wire',
      route: '/news',
      provider: 'Public RSS Feeds (MarketWatch, CNBC, Business Recorder, Profit Pakistan, Cointelegraph)',
      dataType: 'Syndicated Headlines & Excerpt Dispatches',
      frequency: 'Fetched periodically when the news wire is used; timing and availability depend on upstream RSS publishers',
      methodology: 'Fair-use wire indexing extracting headline, category, publication timestamp, and short summary, redirecting readers directly to the original publisher.',
      limitations: 'FGC Spot does not claim copyright over external wire copy; full rights reside with originating publishers.'
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16 px-4 sm:px-6">
      
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <Link to="/" className="hover:text-[#00E676] transition-colors font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/about" className="hover:text-[#00E676] transition-colors font-medium">About</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold">Data Sources &amp; Governance</span>
      </nav>

      {/* Main Content Card */}
      <article className="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-xl space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-3.5 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.15)] shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#00E676]">
              Data Transparency &amp; Governance
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              FGC Spot Market Data Sources &amp; Feeds
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#A8B3C2] mt-1">
              Complete disclosure of data providers, polling intervals, mathematical formulas, and real-world limitations
            </p>
          </div>
        </header>

        {/* Intro */}
        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed space-y-4 font-normal">
          <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white leading-relaxed">
            Financial transparency begins with data integrity. FGC Spot aggregates market intelligence from verified global APIs, central bank public bulletins, and provincial trade associations. We never fabricate financial metrics, invent fictional institutional partnerships, or conceal market data limitations.
          </p>

          <p>
            The table below itemizes every financial tool on our platform, detailing the exact upstream provider, data classification, update cadence, calculation methodology, and practical transaction limitations.
          </p>
        </div>

        {/* Data Governance Cards */}
        <div className="space-y-6 pt-2">
          {dataProviders.map((dp, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/5 space-y-4 shadow-xs hover:border-[#00E676]/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-[#00E676]/10 text-[#00E676] font-extrabold flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {dp.tool}
                  </h2>
                </div>
                <Link 
                  to={dp.route}
                  className="text-xs font-bold text-[#00E676] hover:underline flex items-center gap-1 w-fit"
                >
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">Upstream Provider:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{dp.provider}</span>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">Data Nature:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{dp.dataType}</span>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">Refresh Frequency:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#00E676]" />
                    {dp.frequency}
                  </span>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">Calculation Methodology:</span>
                  <span className="text-slate-700 dark:text-[#A8B3C2] leading-relaxed">{dp.methodology}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                <strong className="text-amber-600 dark:text-amber-400 font-bold block mb-0.5">Real-World Limitations:</strong>
                {dp.limitations}
              </div>
            </div>
          ))}
        </div>

        {/* Data Inaccuracy Reporting */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00E676]" />
            <span>Reporting Feed Inaccuracies &amp; Inquiries</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            While FGC Spot utilizes multi-provider fallback pipelines, market volatility or upstream API interruptions can occasionally introduce latency. If you notice a pricing discrepancy, delayed benchmark, or calculation inconsistency, please alert our data desk:
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
            <span className="text-[#00E676] font-bold">fgcspot4@gmail.com</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">Subject: Data Quality Alert</span>
          </div>
        </div>

      </article>

    </div>
  );
}
