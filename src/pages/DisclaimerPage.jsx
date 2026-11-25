import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useSEO } from '../hooks/useSEO';
import { AlertTriangle, ChevronRight, ShieldCheck, Scale, CheckCircle2, Mail, ArrowRight } from 'lucide-react';

export default function DisclaimerPage() {
  const { siteSettings } = useApp();

  useSEO({
    title: 'Financial & Regulatory Disclaimer | FGC Spot',
    description: 'FGC Spot regulatory disclaimer regarding educational market tools, indicative forex rates, gold calculations, delay notices, and non-broker advisory status.',
    canonical: '/disclaimer'
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16 px-4 sm:px-6">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <Link to="/" className="hover:text-[#00E676] transition-colors font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold">Financial Disclaimer</span>
      </nav>

      {/* Main Content Container */}
      <article className="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-xl space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-3.5 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Regulatory Disclosure &amp; Compliance Notice
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Financial &amp; Investment Disclaimer
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#A8B3C2] mt-1 font-medium">
              Applicable to all tools, calculators, market tickers, and published research on {siteSettings?.websiteName || 'FGC Spot'}
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="text-slate-700 dark:text-[#A8B3C2] text-xs sm:text-sm space-y-6 leading-relaxed font-normal">
          
          {/* Prominent Callout */}
          <div className="p-5 rounded-2xl bg-amber-500/5 border-l-4 border-amber-500 border-t border-r border-b border-amber-500/20 text-slate-700 dark:text-[#A8B3C2] text-xs sm:text-sm font-medium space-y-2">
            <strong className="block font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Statutory Advisory &amp; Regulatory Notice:
            </strong>
            <p>
              {siteSettings?.websiteName || 'FGC Spot'} is an independent financial technology media and market data publishing portal. We are NOT a licensed bank, stockbroker, securities brokerage firm, registered investment advisor (RIA), money services business (MSB), asset manager, or authorized foreign exchange dealer under the State Bank of Pakistan (SBP) Foreign Exchange Regulation Act, 1947 or the Securities and Exchange Commission of Pakistan (SECP) Securities Act, 2015.
            </p>
          </div>

          {/* Section 1: Educational & Informational Nature */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#00E676]/10 text-[#00E676] flex items-center justify-center text-xs font-bold">1</span>
              <span>Educational &amp; Informational Nature of Content</span>
            </h2>
            <p>
              All materials published on {siteSettings?.websiteName || 'FGC Spot'}—including interactive currency converters, bullion calculators, stock screeners, price charts, articles, and market news summaries—are prepared solely for general educational, analytical, and informational purposes. Nothing on this website constitutes, or should be construed as:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Individualized investment advice or financial planning recommendations.</li>
              <li>An offer, solicitation, or endorsement to purchase or sell any security, sovereign currency, commodity, or digital asset.</li>
              <li>Formal legal, tax, or accounting advice. Users must consult licensed chartered accountants (ICAP) or tax professionals regarding their specific FBR filings.</li>
            </ul>
          </div>

          {/* Section 2: Market Volatility & Rapidly Changing Prices */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#00E676]/10 text-[#00E676] flex items-center justify-center text-xs font-bold">2</span>
              <span>Market Volatility &amp; Price Fluctuations</span>
            </h2>
            <p>
              Financial markets are inherently volatile. Foreign exchange rates, international gold spot prices, cryptocurrency valuations, and Pakistan Stock Exchange equity quotes fluctuate rapidly due to macroeconomic events, central bank monetary policy adjustments, political developments, and international liquidity flows.
            </p>
            <p>
              A rate, price quote, or multiple displayed on this platform reflects market conditions at a specific timestamp and is subject to immediate change without prior notice. Past historical market performance, moving average trends, and past dividend yields do not guarantee or predict future outcomes.
            </p>
          </div>

          {/* Section 3: Delayed & Indicative Data */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#00E676]/10 text-[#00E676] flex items-center justify-center text-xs font-bold">3</span>
              <span>Delayed Quotes &amp; Indicative Pricing Notice</span>
            </h2>
            <p>
              Users should distinguish between wholesale electronic indices and retail over-the-counter transaction reality:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Forex Rates:</strong> Displayed rates reflect wholesale interbank mid-market indices and representative ECAP cash rates. They do not incorporate individual commercial bank credit/debit card international cross-border processing charges (1.5% to 3.5%) or advance withholding tax under Section 236Y of the Income Tax Ordinance.</li>
              <li><strong>Stock Quotes:</strong> Per standard exchange dissemination agreements, PSX and international equity quotes are delayed by at least 15 minutes during live trading sessions.</li>
              <li><strong>Precious Metals:</strong> Spot bullion calculations reflect unworked physical metal content. Retail jewelry stores apply non-recoverable making charges (Mazdoori) and potential resale assay deductions (Katt).</li>
            </ul>
          </div>

          {/* Section 4: Calculation Dependency on User Inputs & Upstream APIs */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#00E676]/10 text-[#00E676] flex items-center justify-center text-xs font-bold">4</span>
              <span>Calculation Dependency on Inputs &amp; Sources</span>
            </h2>
            <p>
              Our calculators (e.g., Gold Tola Calculator, Multi-Currency Converter, Equity P/E Screener) execute mathematical operations based on two variables: (1) upstream data feeds provided by third-party APIs and central bank bulletins, and (2) parameters entered directly by the user (such as weight, karat purity, currency pairs, or trade amount).
            </p>
            <p>
              Results generated by our calculators are mathematical estimates intended to illustrate pricing mechanics. They should not be relied upon as binding trade commitments or settlement agreements with any financial institution.
            </p>
          </div>

          {/* Section 5: Data Accuracy Commitment */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#00E676]/10 text-[#00E676] flex items-center justify-center text-xs font-bold">5</span>
              <span>Commitment to Accuracy (No Disclaimer Excuse)</span>
            </h2>
            <p>
              This disclaimer is designed to clarify the legal boundaries of financial publishing and user risk; it is <strong>never used as an excuse to tolerate inaccurate or negligent information</strong>.
            </p>
            <p>
              FGC Spot maintains an active data validation and fact-checking workflow. If you identify a computational bug, an outdated policy rate, or a data feed discrepancy, we invite you to notify our data desk immediately at <a href="mailto:fgcspot4@gmail.com" className="text-[#00E676] font-mono font-bold underline">fgcspot4@gmail.com</a>. We review all verified reports and commit to prompt rectification under our <Link to="/editorial-policy" className="text-[#00E676] underline font-semibold">Editorial Policy</Link>.
            </p>
          </div>

          {/* Section 6: Limitation of Liability */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#00E676]/10 text-[#00E676] flex items-center justify-center text-xs font-bold">6</span>
              <span>Limitation of Liability</span>
            </h2>
            <p>
              To the fullest extent permitted by applicable law, FGC Spot, its publisher, contributing analysts (including Sufyan Sindhu), developers, and officers disclaim all liability for any direct, indirect, incidental, punitive, or consequential financial losses, investment losses, or lost profits incurred by any individual or entity acting on information, tools, or data available on this website.
            </p>
          </div>

          {/* Footer Navigation */}
          <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00E676]" />
              <span className="font-semibold text-slate-800 dark:text-white">Editorial Governance Standards Active</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/editorial-policy" className="text-[#00E676] hover:underline font-bold">
                Editorial Policy
              </Link>
              <span className="text-slate-400">•</span>
              <Link to="/data-sources" className="text-[#00E676] hover:underline font-bold">
                Data Sources
              </Link>
              <span className="text-slate-400">•</span>
              <Link to="/contact" className="text-slate-600 dark:text-[#A8B3C2] hover:text-[#00E676] transition-colors">
                Contact Desk
              </Link>
            </div>
          </div>

        </div>

      </article>

    </div>
  );
}
