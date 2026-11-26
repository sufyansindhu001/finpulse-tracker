import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  ArrowLeftRight, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  ChevronRight,
  TrendingUp,
  Percent,
  Zap,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Info,
  FileText,
  Calculator,
  Scale
} from 'lucide-react';
import CurrencySelect from '../components/CurrencySelect';
import { getCurrencyFlagUrl } from '../utils/currencyFlags';
import { useSEO } from '../hooks/useSEO';
import { CALCULATOR_LIMITS, boundedDecimalInput, readBoundedAmount } from '../utils/calculatorMath';

const converterFaqs = [
  {
    q: "What is the difference between the mid-market rate and commercial bank retail rates?",
    a: "The mid-market (or interbank) rate is the midpoint between global buy and sell orders on electronic institutional currency networks. Commercial banks and retail credit card issuers typically add an undisclosed markup or margin (ranging between 1.5% and 4.5% above the mid-market rate) as an implicit conversion fee."
  },
  {
    q: "How does routing remittances through official SBP channels protect freelancers and overseas workers?",
    a: "Remitting funds through SBP-authorized commercial banking channels or the Roshan Digital Account (RDA) provides automatic generation of the Electronic Proceeds Realisation Certificate (e-PRC). Under Section 154A of the Income Tax Ordinance, e-PRC verification grants tax exemptions or concessionary tax rates for IT and IT-enabled export services."
  },
  {
    q: "Are inward foreign remittances subjected to taxes or withholding deductions in Pakistan?",
    a: "Legitimate home remittances sent by overseas Pakistani workers for household maintenance via formal banking channels or foreign exchange companies are 100% tax-free under Pakistani tax law and exempt from withholding tax. Freelancers receiving business revenue require e-PRC documentation to claim export tax concessions."
  },
  {
    q: "When is the optimal time of day or week to execute foreign currency conversions?",
    a: "Currency markets experience the deepest liquidity and tightest bid-ask spreads during the overlap of the London and New York trading sessions (typically 1:00 PM to 5:00 PM GMT / 6:00 PM to 10:00 PM PKT). Converting outside active market hours (such as over weekends) often carries wider defensive spreads from retail providers."
  },
  {
    q: "How can businesses minimize foreign wire transfer and intermediary correspondent bank fees?",
    a: "To eliminate intermediary wire deductions, enterprises and remote professionals use multi-currency international accounts (such as Wise Business, Payoneer, or local digital export accounts) that clear via domestic local ACH/SEPA/Raast clearing rails rather than multi-hop SWIFT telegraphic transfers."
  },
  {
    q: "What is an Electronic Proceeds Realisation Certificate (e-PRC) and how do I download it?",
    a: "An e-PRC is an electronically verifiable certificate issued by Pakistani commercial receiving banks verifying the inward remittance originator, sender bank, remittance amount, and conversion exchange rate. Recipients can generate and download their e-PRC directly from their bank's digital portal or the SBP e-PRC verification gateway."
  }
];

export default function ConverterPage({ rates = {} }) {
  useSEO({
    title: 'Real-Time Currency & Crypto Converter | FGC Spot',
    description: 'Instant currency converter with live mid-market exchange rates for 160+ global currencies, gold, and digital assets on FGC Spot.',
    canonical: '/converter'
  });

  const [searchParams, setSearchParams] = useSearchParams();

  const [amount, setAmount] = useState(() => {
    const amt = searchParams.get('amount');
    return amt && readBoundedAmount(amt, CALCULATOR_LIMITS.fiatAmount) !== null ? String(amt) : '100';
  });
  const [fromCurrency, setFromCurrency] = useState(searchParams.get('from')?.toUpperCase() || 'USD');
  const [toCurrency, setToCurrency] = useState(searchParams.get('to')?.toUpperCase() || 'PKR');
  const [isSwapping, setIsSwapping] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Sync state whenever URL query params change (e.g. from footer popular pairs or search)
  useEffect(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const amt = searchParams.get('amount');
    if (from) setFromCurrency(from.toUpperCase());
    if (to) setToCurrency(to.toUpperCase());
    if (amt && readBoundedAmount(amt, CALCULATOR_LIMITS.fiatAmount) !== null) setAmount(String(amt));
  }, [searchParams]);

  // Conversion math
  const { fromRate, toRate, convertedAmount, unitRate, inverseRate } = useMemo(() => {
    const fromR = fromCurrency === 'USD' ? 1 : Number(rates[fromCurrency]);
    const toR = toCurrency === 'USD' ? 1 : Number(rates[toCurrency]);
    const valid = Number.isFinite(fromR) && fromR > 0 && Number.isFinite(toR) && toR > 0;

    // Amount in USD = amount / fromR
    const inUsd = valid ? (readBoundedAmount(amount, CALCULATOR_LIMITS.fiatAmount) ?? 0) / fromR : Number.NaN;
    const finalAmount = valid ? inUsd * toR : Number.NaN;

    const unit = valid ? toR / fromR : Number.NaN;
    const inverse = valid ? fromR / toR : Number.NaN;

    return {
      fromRate: fromR,
      toRate: toR,
      convertedAmount: finalAmount,
      unitRate: unit,
      inverseRate: inverse
    };
  }, [amount, fromCurrency, toCurrency, rates]);

  // Swap currencies
  const handleSwap = () => {
    setIsSwapping(true);
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setSearchParams({ from: toCurrency, to: fromCurrency });
    setTimeout(() => setIsSwapping(false), 300);
  };

  // Shortcut chips
  const quickCorridors = [
    { from: 'USD', to: 'PKR', label: 'USD → PKR' },
    { from: 'EUR', to: 'PKR', label: 'EUR → PKR' },
    { from: 'GBP', to: 'PKR', label: 'GBP → PKR' },
    { from: 'SAR', to: 'PKR', label: 'SAR → PKR' },
    { from: 'AED', to: 'PKR', label: 'AED → PKR' },
    { from: 'CAD', to: 'PKR', label: 'CAD → PKR' },
    { from: 'EUR', to: 'USD', label: 'EUR → USD' },
    { from: 'GBP', to: 'USD', label: 'GBP → USD' },
  ];

  const handleSelectCorridor = (from, to) => {
    setFromCurrency(from);
    setToCurrency(to);
    setSearchParams({ from, to });
  };

  // Denomination table multiples
  const denominations = [1, 5, 10, 25, 50, 100, 500, 1000, 5000];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-white font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/rates" className="hover:text-slate-900 dark:hover:text-white font-medium">Rates</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold">Smart Converter</span>
      </nav>

      {/* Header Banner */}
      <div className="text-left space-y-2 pb-6 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
          <span className="text-xs uppercase font-bold tracking-widest text-[#00E676]">
            ZERO-MARKUP CALCULATION ENGINE
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Real-Time Currency Converter
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B3C2] max-w-2xl">
          Instantly calculate cross-currency conversions using authentic institutional mid-market rates without hidden bank markups.
        </p>
      </div>

      {/* Quick Corridor Shortcut Chips */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 dark:text-[#A8B3C2] uppercase tracking-wider block">
          Quick Currency Corridors:
        </span>
        <div className="flex flex-wrap gap-2">
          {quickCorridors.map((c) => {
            const isMatch = fromCurrency === c.from && toCurrency === c.to;
            return (
              <button
                key={c.label}
                onClick={() => handleSelectCorridor(c.from, c.to)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 touch-manipulation select-none ${
                  isMatch
                    ? 'bg-[#00E676] text-slate-950 shadow-sm'
                    : 'bg-white dark:bg-[#0A1726] hover:bg-slate-100 dark:hover:bg-[#0D1B2A] text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 hover:border-[#00E676]/30 shadow-sm'
                }`}
              >
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Glassmorphic Converter Card */}
      <div className="rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-xl space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          
          {/* FROM COLUMN (5 cols) */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A8B3C2]">
              You Convert
            </label>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 focus-within:border-[#00E676] transition-colors">
              <CurrencySelect
                value={fromCurrency}
                onChange={(code) => {
                  setFromCurrency(code);
                  setSearchParams({ from: code, to: toCurrency });
                }}
                align="left"
              />

              <input
                type="number"
                min="0"
                max={CALCULATOR_LIMITS.fiatAmount}
                step="any"
                value={amount}
                onChange={(e) => setAmount(boundedDecimalInput(e.target.value, CALCULATOR_LIMITS.fiatAmount))}
                className="w-full min-w-0 mt-3 bg-transparent text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-tabular focus:outline-none"
                placeholder="100"
              />
            </div>
          </div>

          {/* SWAP BUTTON (1 col) */}
          <div className="md:col-span-1 flex justify-center py-2 md:py-0">
            <button
              onClick={handleSwap}
              className={`p-3.5 rounded-2xl bg-slate-100 dark:bg-[#0D1B2A] hover:bg-[#00E676] text-slate-700 dark:text-white hover:text-slate-950 dark:hover:text-[#06111F] border border-slate-200 dark:border-white/10 hover:border-[#00E676] transition-all cursor-pointer shadow-sm dark:shadow-lg active:scale-90 ${
                isSwapping ? 'rotate-180 duration-300' : ''
              }`}
              title="Swap Currencies"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* TO COLUMN (5 cols) */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A8B3C2]">
              You Receive (Estimated)
            </label>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
              <CurrencySelect
                value={toCurrency}
                onChange={(code) => {
                  setToCurrency(code);
                  setSearchParams({ from: fromCurrency, to: code });
                }}
                align="left"
              />

              <div className="mt-3 text-2xl sm:text-3xl font-black text-[#00E676] font-tabular [overflow-wrap:anywhere]">
                {Number.isFinite(convertedAmount) ? convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
              </div>
            </div>
          </div>

        </div>

        {/* Live Exchange Rate Math Banner */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs text-slate-500 dark:text-[#A8B3C2] font-medium">Interbank Mid-Market Exchange Rate</div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-tabular">
              1 {fromCurrency} = {Number.isFinite(unitRate) ? unitRate.toLocaleString(undefined, { maximumFractionDigits: 4 }) : 'N/A'} {toCurrency}
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-[#A8B3C2] text-center sm:text-right font-medium">
            Inverse: 1 {toCurrency} = {Number.isFinite(inverseRate) ? inverseRate.toLocaleString(undefined, { maximumFractionDigits: 4 }) : 'N/A'} {fromCurrency}
          </div>
        </div>

      </div>

      {/* Multiples & Conversion Matrix Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Table 1: Base to Target Multiples */}
        <div className="rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 p-6 space-y-4 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Convert {fromCurrency} to {toCurrency}
            </h3>
            <span className="text-xs text-[#00E676] font-bold">Standard Multiples</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {denominations.map((d) => (
              <div key={d} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-slate-700 dark:text-white font-tabular">
                  {d.toLocaleString()} {fromCurrency}
                </span>
                <span className="font-bold text-[#00E676] font-tabular">
                  {Number.isFinite(unitRate) ? (d * unitRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'} {toCurrency}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Table 2: Target to Base Multiples (Reverse) */}
        <div className="rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 p-6 space-y-4 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Convert {toCurrency} to {fromCurrency}
            </h3>
            <span className="text-xs text-slate-500 dark:text-[#A8B3C2] font-bold">Reverse Multiples</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {denominations.map((d) => (
              <div key={d} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-slate-700 dark:text-white font-tabular">
                  {d.toLocaleString()} {toCurrency}
                </span>
                <span className="font-bold text-slate-900 dark:text-white font-tabular">
                  {Number.isFinite(inverseRate) ? (d * inverseRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'} {fromCurrency}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Comprehensive Currency Conversion & Remittance Educational Guide & AdSense Compliance Section */}
      <section className="mt-12 pt-8 border-t border-slate-200 dark:border-white/10 space-y-8">
        <div className="rounded-3xl bg-white dark:bg-[#0A1726]/80 border border-slate-200 dark:border-white/10 p-6 sm:p-10 shadow-sm dark:shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00E676]/10 text-[#00E676] flex items-center justify-center shrink-0 border border-[#00E676]/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00E676]">Currency Conversion Guide</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                How Currency Conversion Works: Mid-Market Rates &amp; Remittance Architecture
              </h2>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-4 font-normal">
            <p>
              Every international transaction—from paying an overseas supplier to converting remote freelance software earnings—relies on foreign exchange mathematics. However, retail consumers, importers, and remote professionals frequently lose between 2% and 5% of their total transferred capital due to hidden exchange rate markups and intermediary correspondent bank deductions.
            </p>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-4">
              1. The Anatomy of the Mid-Market Exchange Rate
            </h3>
            <p>
              The <strong>mid-market rate</strong> (also called the interbank or spot rate) is the exact mathematical midpoint between global buy (bid) and sell (ask) quotes across international wholesale forex markets. It represents the purest, unmanipulated value of one currency relative to another, free from retail margins. Financial institutions access this rate when trading billions of dollars between themselves.
            </p>
            <p>
              When commercial retail banks advertise &quot;0% Commission Currency Exchange,&quot; they typically build their profit directly into an inflated exchange rate. If the mid-market rate is \$1 = ₨ 277.50, a retail commercial bank might sell US Dollars at ₨ 282.00 and buy them at ₨ 273.00, quietly capturing a ₨ 4.50-per-dollar spread. FGC Spot utilizes real-time institutional mid-market rates to provide transparent, unskewed parity.
            </p>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-4">
              2. SBP Inward Remittance Channels &amp; The Electronic Proceeds Realisation Certificate (e-PRC)
            </h3>
            <p>
              In Pakistan, the State Bank of Pakistan (SBP) oversees inward foreign currency remittances to safeguard macroeconomic stability and ensure FATF compliance:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Roshan Digital Accounts (RDA):</strong> Established for Non-Resident Pakistanis (NRPs) to facilitate seamless, fee-free inward remittances, residential real estate investment, and sovereign bond subscriptions (Naya Pakistan Certificates).</li>
              <li><strong>Home Remittances:</strong> Inward remittances sent by overseas Pakistani workers for household maintenance via formal banking channels or authorized exchange companies are 100% tax-exempt.</li>
              <li><strong>Electronic Proceeds Realisation Certificate (e-PRC):</strong> For freelance technology professionals, exporters, and software consultancies, banks issue an electronic PRC. Under SBP regulations and FBR tax rules, the e-PRC is mandatory statutory proof that foreign funds entered through formal banking rails, unlocking concessionary 0.25%–1% final tax regime (FTR) treatment under Section 154A of the Income Tax Ordinance.</li>
            </ul>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-4">
              3. Strategies to Avoid Hidden Transfer Fees and SWIFT Markups
            </h3>
            <p>
              Traditional cross-border telegraphic transfers (SWIFT wire transfers) often route funds through one or two intermediary correspondent banks, each deducting \$15 to \$35 in handling fees. To avoid these deductions, tech freelancers and exporters utilize multi-currency digital accounts that connect directly to local clearing systems (such as SEPA in the EU, ACH in the US, Faster Payments in the UK, and Raast in Pakistan), ensuring near-instantaneous transfers with maximum dollar retention.
            </p>
          </div>
        </div>

        {/* Featured Educational Guides for Remittance & Bullion Conversion */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#00E676]">
                Featured Remittance &amp; Bullion Investor Guides
              </span>
            </div>
            <Link to="/blog" className="text-xs font-bold text-slate-500 hover:text-[#00E676] transition-colors flex items-center gap-1">
              <span>View All 30+ Guides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guide 1: Freelance Remittances & Banking */}
            <Link
              to="/blog/freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained"
              className="p-6 rounded-3xl bg-white dark:bg-[#0A1726]/90 border border-slate-200 dark:border-white/10 hover:border-[#00E676]/60 transition-all duration-300 group shadow-sm dark:shadow-xl flex flex-col justify-between space-y-4 hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
                    Remittances &amp; Banking Guide
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">5 min read</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#00E676] transition-colors leading-snug">
                  Freelance Remittances &amp; Banking in Pakistan: FBR Tax Regimes, PSEB Registration, and Retention Accounts Explained
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                  Comprehensive roadmap for Pakistani software exporters and digital freelancers: opening 50% retention foreign currency accounts, e-PRC certificate issuance, PSEB tax exemptions (0.25% final tax), and avoiding interbank conversion spreads.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-[#00E676] pt-3 border-t border-slate-100 dark:border-white/5">
                <span>Read Full Remittance Guide</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Guide 2: Buying Gold in Pakistan */}
            <Link
              to="/blog/buying-gold-in-pakistan-tola-karat-making-charges-guide"
              className="p-6 rounded-3xl bg-white dark:bg-[#0A1726]/90 border border-slate-200 dark:border-white/10 hover:border-amber-500/60 transition-all duration-300 group shadow-sm dark:shadow-xl flex flex-col justify-between space-y-4 hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Physical Bullion Guide
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">5 min read</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-snug">
                  Buying Gold in Pakistan: Complete Investor Guide to Tola, Karat Purity, Making Charges, and Sarafa Bazaar Rates
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                  Everything you need to know about purchasing physical gold bullion in Pakistan: 24K vs 22K karat testing, Tola (11.66g) vs 10-gram weight pricing, avoiding unfair jeweler making charges, and hallmarking standards.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-amber-500 pt-3 border-t border-slate-100 dark:border-white/5">
                <span>Read Full Gold Guide</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
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
                Frequently Asked Currency Conversion &amp; Remittance Questions
              </h2>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {converterFaqs.map((faq, idx) => (
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

      {/* Comprehensive Exchange Rate Calculation Framework & Methodology */}
      <section className="rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Section Header */}
        <div className="space-y-2 border-b border-slate-200 dark:border-white/10 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculation Methodology &amp; Data Transparency</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How FGC Spot Calculates Live Foreign Exchange Conversions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
            Detailed mathematical formulas, data sourcing protocols, update frequencies, and practical remittance cost comparisons.
          </p>
        </div>

        {/* 1. What This Tool Does */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-[#00E676]" />
            <span>1. What This Tool Does</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed">
            The FGC Spot Currency Converter calculates real-time currency exchanges across 160+ sovereign fiat currencies and precious metals using pure mid-market interbank exchange rates. It eliminates the 2% to 5% hidden exchange markups commonly embedded in commercial bank calculators, allowing freelance exporters, corporate treasurers, and remittance senders to verify true baseline market value.
          </p>
        </div>

        {/* 2. Mathematical Formulas Used */}
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#00E676]" />
            <span>2. Triangular Arbitrage Cross-Rate Formulas</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-2">
              <span className="text-xs font-bold text-[#00E676] uppercase tracking-wider">Cross-Rate Calculation Formula</span>
              <div className="font-mono text-xs sm:text-sm bg-white dark:bg-[#0D1B2A] p-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200">
                Converted Amount = Input Amount &times; (Rate_Target / Rate_Base)
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Where all exchange rates are pegged relative to the US Dollar (USD = 1.0) as the global clearing currency. For example, converting EUR to PKR divides the USD/PKR rate by the USD/EUR rate.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-2">
              <span className="text-xs font-bold text-[#00E676] uppercase tracking-wider">Unit &amp; Inverse Multipliers</span>
              <div className="space-y-1.5 font-mono text-xs bg-white dark:bg-[#0D1B2A] p-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200">
                <div>&bull; Unit Exchange Rate = Rate_Target / Rate_Base</div>
                <div>&bull; Inverse Exchange Rate = Rate_Base / Rate_Target</div>
                <div>&bull; Net Bid-Ask Spread = |Ask - Bid| / Mid_Rate &times; 100</div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Unit rates represent how much of the target currency you receive for 1 unit of the base currency.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Verified Data Sources & Update Frequency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00E676]" />
              <span>3. Data Sourcing &amp; Verification</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#00E676] font-bold">&bull;</span>
                <span><strong>Interbank Spot Feeds:</strong> Live quotes aggregated from Open Exchange Rates API (open.er-api.com) and FloatRates daily bank feeds.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00E676] font-bold">&bull;</span>
                <span><strong>SBP Benchmark Parity:</strong> Pakistani Rupee (PKR) quotes are calibrated against State Bank of Pakistan (SBP) weighted interbank clearing data.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00E676] font-bold">&bull;</span>
                <span><strong>Precious Metals:</strong> XAU (Gold) and XAG (Silver) spot feeds translated at international troy ounce ratios.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#00E676]" />
              <span>4. Update Frequency &amp; Latency</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#00E676] font-bold">&bull;</span>
                <span><strong>Continuous In-Session Sync:</strong> Updates every 45 to 60 seconds during live global foreign exchange trading windows (Sunday 22:00 GMT through Friday 22:00 GMT).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00E676] font-bold">&bull;</span>
                <span><strong>Weekend Rates:</strong> Over weekends, rates remain fixed at Friday's international market close.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00E676] font-bold">&bull;</span>
                <span><strong>Memory Cache:</strong> Clean client-side memory caching for 120 seconds prevents repetitive network queries.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 5. Data Limitations (Mid-Market vs Bank Fees & Taxes) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>5. Data Limitations: Mid-Market Wholesale Rates vs. Retail Bank Charges</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed">
            The conversion results shown on this calculator use real-time mid-market rates. These are wholesale electronic rates traded between institutional banks. If you convert money at a retail commercial bank or with a credit/debit card, your final received amount will be lower due to:
          </p>
          <ul className="text-xs text-slate-600 dark:text-[#A8B3C2] space-y-1 pl-4 list-disc">
            <li><strong>Retail Bank Spread:</strong> Commercial banks add 1.5% to 3.5% markup above the mid-market rate.</li>
            <li><strong>Statutory Advance Tax (Section 236Y):</strong> In Pakistan, international card transactions carry a statutory advance withholding tax (5% for active FBR tax filers, 10% for non-filers).</li>
            <li><strong>Correspondent Banking Fees:</strong> International multi-hop SWIFT wire transfers may incur intermediary deduction fees ($15 to $35 USD per transfer).</li>
          </ul>
        </div>

        {/* 6. Practical Remittance Example */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00E676]" />
            <span>6. Practical Example: Remitting $1,000 USD to Pakistan</span>
          </h3>
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed">
            <p>
              Compare sending $1,000 USD to a family bank account in Pakistan when the live interbank mid-market rate is <strong>Rs. 277.10</strong>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 font-mono text-xs">
              <div className="p-4 rounded-xl bg-white dark:bg-[#0D1B2A] border border-emerald-500/30 space-y-1">
                <span className="text-emerald-500 font-bold uppercase tracking-wider text-[10px]">SBP Compliant Bank Remittance</span>
                <div className="text-slate-900 dark:text-white font-bold text-sm">Payout: Rs. 277,100 PKR</div>
                <div className="text-slate-500 text-[11px]">&bull; 0% fee (covered by SBP incentive scheme)</div>
                <div className="text-slate-500 text-[11px]">&bull; Automatic e-PRC tax shield issued</div>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#0D1B2A] border border-rose-500/30 space-y-1">
                <span className="text-rose-500 font-bold uppercase tracking-wider text-[10px]">Opaque Transfer Service (3% Markup)</span>
                <div className="text-slate-900 dark:text-white font-bold text-sm">Payout: Rs. 268,787 PKR</div>
                <div className="text-slate-500 text-[11px]">&bull; Hidden spread: Rs. 8,313 lost on conversion</div>
                <div className="text-slate-500 text-[11px]">&bull; No official e-PRC tax exemption</div>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Regulatory & Financial Disclaimers */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-100 dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 text-[11px] leading-relaxed text-slate-500 dark:text-[#A8B3C2] space-y-1.5">
          <p className="font-bold uppercase tracking-wider text-slate-800 dark:text-white">Currency Conversion Disclaimer</p>
          <p>
            FGC Spot is an independent financial technology and informational publishing platform. We are not an authorized foreign exchange dealer, currency exchange bureau, or money services business under the State Bank of Pakistan (SBP) Foreign Exchange Regulation Act. Rates presented are indicative mid-market figures provided exclusively for personal reference and analytical research. Always verify executable commercial exchange quotes with SBP-licensed financial institutions before initiating transactions.
          </p>
        </div>

      </section>

    </div>
  );
}
