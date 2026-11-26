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
    <section className="py-12 sm:py-16 lg:py-20 border-b border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#06111F]/70 relative w-full overflow-hidden">
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
            How FGC Spot uses available public reference feeds, transparent calculations and original research across foreign exchange, precious metals, digital assets and equity markets.
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
              Public FX Feeds • USD-Based Cross-Rates • Provider Timing
            </div>

            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-justify">
              Currency references come from available public providers, including open.er-api.com, FloatRates and currency API mirrors. Cross-rates use a common USD base. FGC Spot does not claim a direct wholesale dealing-desk feed or official SBP and ECB closing quotes.
            </p>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-justify">
              Banks and licensed cash dealers can offer rates that differ from a public FX reference, especially for physical currency and cross-border remittances. The calculator does not measure a dealer&apos;s executable cash spread unless independent bid-and-ask quotes are supplied. Compare final provider charges before transacting.
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
              Public Metals References • Troy Ounce • Tola &amp; Karat Conversion
            </div>

            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-justify">
              FGC Spot uses available public spot and commodity reference prices for gold and silver; these are not official LBMA fixings. The calculator translates USD-per-troy-ounce observations into grams and tolas using a mathematical unit conversion.
            </p>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-justify">
              Indicative local values—including the traditional South Asian <strong>tola (approximately 11.664 grams)</strong> and 10-gram units—depend on actual spot and USD/PKR reference data. Karat percentages are applied proportionally, without invented Sarafa premiums. Real jeweler prices, taxes and making charges may differ.
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
              Public Crypto Prices • 24h Market Data • USD/PKR Conversion
            </div>

            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-justify">
              Available digital-asset quotes come from public market-data endpoints such as CoinGecko. FGC Spot does not run an exchange order book, institutional WebSocket aggregator or independent VWAP price engine. Provider availability and quote timestamps can vary.
            </p>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-justify">
              When published by a source, the terminal shows asset prices, market capitalizations, 24-hour changes and other available metrics. PKR equivalents use a public FX reference. These values are for comparison and education, not executable exchange or custody offers.
            </p>

            {/* Footer Action Box */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono bg-gray-50/80 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-white/5">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Provider-Sourced Crypto Data</span>
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
              FGC Spot presents available quotes and company information for supported international markets, including Pakistan, the United States and other regions. Fundamental ratios are shown only when underlying provider data supports them; missing figures are marked unavailable.
            </p>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed text-justify">
              By pairing available company metrics with qualitative research, FGC Spot explains how equity valuation ratios, actual dividend records, index methodology, foreign exchange movements and industry exposure affect comparisons across markets. Ratios and company weights must be checked against dated disclosures rather than treated as permanent market averages.
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
              <strong>Source Transparency:</strong> Reference quotes depend on upstream publishers and can be delayed or unavailable. Our guides explain calculation methods, limitations and sources so readers can independently verify important decisions.
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
