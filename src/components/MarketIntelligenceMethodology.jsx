import React from 'react';
import { 
  ShieldCheck, 
  Globe2, 
  Coins, 
  Building2, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MarketIntelligenceMethodology() {
  return (
    <section className="py-14 sm:py-20 border-b border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#06111F]/70 relative w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Header Block */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Institutional Data Quality Framework</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            Institutional Market Intelligence & <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E676] to-emerald-400">
              Multi-Asset Research Methodology
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
            How FGC Spot aggregates, verifies, and normalizes low-latency market data across Foreign Exchange corridors, physical gold bullion benchmarks, decentralized digital assets, and cross-border equity exchanges.
          </p>
        </div>

        {/* 4 Pillars Grid (600+ Words Total Content) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Pillar 1: Foreign Exchange */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 shadow-xs hover:border-[#00E676]/40 transition-all space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold shrink-0">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                1. Foreign Exchange & Sovereign Currency Corridors
              </h3>
            </div>

            {/* Subtext Line Box */}
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2.5 text-xs text-gray-600 dark:text-gray-300 font-mono border border-gray-100 dark:border-white/5">
              Interbank Mid-Market • DXY Basket • SBP Reserves Parity
            </div>

            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-justify">
              Foreign exchange rates on FGC Spot are derived from tier-one institutional interbank liquidity feeds, tracking over 160 sovereign currencies continuously. Our pricing engine cross-checks live quotes against the US Dollar Index (DXY), European Central Bank (ECB) fixings, and central bank clearing networks—including the State Bank of Pakistan (SBP) interbank settlement windows.
            </p>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-justify">
              In emerging economies characterized by two-tier currency markets (such as Pakistan and frontier South Asia), FGC Spot monitors both the formal Interbank Clearing Rate and the Open Market / Exchange Companies Association of Pakistan (ECAP) cash rate. By calculating the interbank-open market spread in real-time, our terminal equips treasurers, freelance earners, and remittance senders with transparent data to prevent predatory banking exchange fees and hidden corridor markups.
            </p>

            {/* Footer Action Box */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-white/5">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Coverage: 160+ Sovereign Currencies</span>
              <Link to="/rates" className="hover:underline flex items-center gap-1 font-bold text-[#00E676] bg-[#00E676]/10 px-2.5 py-1 rounded-lg border border-[#00E676]/20 transition-all hover:bg-[#00E676]/20">
                <span>View Rates</span> →
              </Link>
            </div>
          </div>

          {/* Pillar 2: Gold Bullion */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 shadow-xs hover:border-[#00E676]/40 transition-all space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                2. Spot Gold (XAU/USD) & Domestic Tola Parity
              </h3>
            </div>

            {/* Subtext Line Box */}
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2.5 text-xs text-gray-600 dark:text-gray-300 font-mono border border-gray-100 dark:border-white/5">
              LBMA Fixings • 11.6638g Karat Conversion • Sarafa Bazaar
            </div>

            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-justify">
              Physical bullion and precious metals tracking on FGC Spot utilizes the international London Bullion Market Association (LBMA) spot gold benchmark (XAU/USD), quoted per fine troy ounce (31.1034768 grams). To bridge global commodity derivatives with local consumer and jeweler retail markets in South Asia and the GCC, our computational architecture applies dynamic unit conversion formulas.
            </p>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-justify">
              Domestic gold rates—including the traditional Pakistani and Indian <strong>Tola (11.6638 grams)</strong> and 10-Gram denominations—are mathematically computed from spot dollar metal prices, real-time USD/PKR interbank rates, plus official Karachi Sarafa Association import customs duties, logistics premia, and assay margins across 24-Karat, 22-Karat, and 18-Karat purity tiers. This mathematical transparency protects bullion investors against arbitrary local over-invoicing.
            </p>

            {/* Footer Action Box */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-white/5">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Standards: 24K, 22K, 21K, 18K Parity</span>
              <Link to="/gold" className="hover:underline flex items-center gap-1 font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 transition-all hover:bg-amber-500/20">
                <span>Gold Terminal</span> →
              </Link>
            </div>
          </div>

          {/* Pillar 3: Digital Assets */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 shadow-xs hover:border-[#00E676]/40 transition-all space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                3. Digital Assets & Multi-Exchange Liquidity
              </h3>
            </div>

            {/* Subtext Line Box */}
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2.5 text-xs text-gray-600 dark:text-gray-300 font-mono border border-gray-100 dark:border-white/5">
              Volume-Weighted Price Index (VWAP) • Order Book Depth
            </div>

            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-justify">
              Cryptocurrency valuations on FGC Spot are aggregated from premier spot exchanges (Binance, Coinbase, Kraken, OKX) through high-frequency WebSockets and REST APIs. Instead of relying on a single centralized order book, our analytics pipeline applies a Volume-Weighted Average Price (VWAP) algorithm to filter out localized slippage, flash-wick anomalies, and illiquid regional exchange premiums.
            </p>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-justify">
              Our terminal continuously monitors 24-hour liquidity depth, market capitalization dominance (BTC, ETH, SOL), circulating token supply metrics, and fiat on-ramp pricing parity (USDT/PKR and USDC/USD). Users can execute instant cross-asset evaluations between digital assets, sovereign fiat, and physical precious metals without leaving the analytics viewport.
            </p>

            {/* Footer Action Box */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-white/5">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Real-Time Crypto Stream</span>
              <Link to="/crypto" className="hover:underline flex items-center gap-1 font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 transition-all hover:bg-purple-500/20">
                <span>Crypto Terminal</span> →
              </Link>
            </div>
          </div>

          {/* Pillar 4: Global & PSX Equities */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 shadow-xs hover:border-[#00E676]/40 transition-all space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                4. Global & PSX Equity Market Intelligence
              </h3>
            </div>

            {/* Subtext Line Box */}
            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2.5 text-xs text-gray-600 dark:text-gray-300 font-mono border border-gray-100 dark:border-white/5">
              PSX KSE-100 • S&P 500 • Valuation Ratios • Dividend Yields
            </div>

            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-justify">
              FGC Spot’s Equity Intelligence Terminal tracks flagship blue-chip enterprises across the Pakistan Stock Exchange (PSX), Wall Street (NYSE/NASDAQ), London Stock Exchange (LSE), Saudi Tadawul, and Tokyo (TSE). We compile comprehensive corporate fundamentals—including Trailing Twelve Month (TTM) Price-to-Earnings (P/E), Return on Equity (ROE), Price-to-Book (P/B), and Debt-to-Equity ratios.
            </p>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-justify">
              By pairing quantitative screener metrics with qualitative 150–250 word institutional company profiles and investment theses, FGC Spot highlights critical cross-border dynamics: such as deep frontier P/E multiple compression (sub-5.0x P/E on PSX vs 27x on S&P 500), sustainable double-digit dividend reinvestment yields (DRIP), and natural currency-hedging properties possessed by export-oriented and dollar-indexed natural resource concessionaires.
            </p>

            {/* Footer Action Box */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-white/5">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Coverage: 28 Flagship Blue-Chips</span>
              <Link to="/stocks" className="hover:underline flex items-center gap-1 font-bold text-[#00E676] bg-[#00E676]/10 px-2.5 py-1 rounded-lg border border-[#00E676]/20 transition-all hover:bg-[#00E676]/20">
                <span>Open Stocks Terminal</span> →
              </Link>
            </div>
          </div>

        </div>

        {/* Institutional Disclosure Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#00E676] shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">
              <strong>Institutional Rigor:</strong> All price feeds, benchmark rates, and analytical guides are continuously maintained by the FGC Spot Financial Research Desk to support informed personal finance decisions and capital allocation.
            </span>
          </div>
          <Link
            to="/blog"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-[#00E676] hover:text-[#06111F] text-slate-900 dark:text-white font-bold transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            Explore Research Archive
          </Link>
        </div>

      </div>
    </section>
  );
}
