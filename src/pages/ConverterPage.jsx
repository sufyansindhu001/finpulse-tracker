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
    a: "A mid-market rate is the midpoint between a currency pair's buy and sell quotes at a particular time. Reference exchange-rate feeds are indicative, not executable wholesale bids or retail bank offers. Banks and card issuers may apply their own spreads and fees; compare the quoted payout before sending money."
  },
  {
    q: "How does routing remittances through official SBP channels protect freelancers and overseas workers?",
    a: "SBP-authorized banks can issue electronic Proceeds Realisation Certificates (e-PRCs) documenting qualifying inward remittances. An e-PRC proves receipt; it does not automatically exempt income from tax. Eligibility for any IT-export concession under Section 154A depends on current FBR law, registration and transaction-specific conditions."
  },
  {
    q: "Are inward foreign remittances subjected to taxes or withholding deductions in Pakistan?",
    a: "Tax treatment depends on the source and purpose of funds and the recipient's circumstances. A family remittance is not automatically the same as taxable business or export income. Preserve banking records and e-PRCs, and check the current FBR requirements or seek qualified tax advice before claiming an exemption or concession."
  },
  {
    q: "When is the optimal time of day or week to execute foreign currency conversions?",
    a: "Currency markets experience the deepest liquidity and tightest bid-ask spreads during the overlap of the London and New York trading sessions (typically 1:00 PM to 5:00 PM GMT / 6:00 PM to 10:00 PM PKT). Converting outside active market hours (such as over weekends) often carries wider defensive spreads from retail providers."
  },
  {
    q: "How can businesses minimize foreign wire transfer and intermediary correspondent bank fees?",
    a: "Where supported, multi-currency accounts or local settlement routes may reduce intermediary bank fees compared with some SWIFT transfers. Compare each provider's actual exchange rate, transfer charges, eligibility and delivery terms; no route guarantees zero fees."
  },
  {
    q: "What is an Electronic Proceeds Realisation Certificate (e-PRC) and how do I download it?",
    a: "An e-PRC is a bank-issued record of an eligible inward remittance, including relevant transaction details. Ask the receiving bank how to obtain or verify the certificate; availability of online download varies by bank. The certificate does not by itself grant a tax exemption."
  }
];

export default function ConverterPage({ rates = {} }) {
  useSEO({
    title: 'Real-Time Currency & Crypto Converter | FGC Spot',
    description: 'Currency converter using public reference exchange-rate feeds for global currencies and supported metals, with clear data-source and fee limitations.',
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
            REFERENCE-RATE CALCULATION ENGINE
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Real-Time Currency Converter
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#A8B3C2] max-w-2xl">
          Estimate cross-currency values using available public market-rate feeds. This calculator adds no fee, but bank and transfer-provider rates may differ.
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
            <div className="text-xs text-slate-500 dark:text-[#A8B3C2] font-medium">Indicative Public FX Reference Rate</div>
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
              Every international transaction—from paying an overseas supplier to converting freelance earnings—relies on foreign exchange mathematics. Retail rates may differ from reference feeds because banks and transfer providers apply spreads, commissions, and correspondent-bank charges. Compare the final amount received rather than assuming a fixed industry-wide fee percentage.
            </p>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-4">
              1. The Anatomy of the Mid-Market Exchange Rate
            </h3>
            <p>
              A <strong>mid-market rate</strong> is the midpoint between the bid and ask prices for a currency pair at a given time and venue. The public exchange-rate feeds used by FGC Spot provide indicative reference values; they are not a guaranteed executable quote from a bank or wholesale trading venue.
            </p>
            <p>
              A &quot;0% commission&quot; offer can still include a currency spread. For illustration only, if a reference USD/PKR rate were Rs. 277.50, one bank might quote Rs. 282.00 to sell dollars and Rs. 273.00 to buy them. FGC Spot calculates mathematical cross-rates from available external feeds without adding a transaction markup; actual bank quotes may vary.
            </p>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-4">
              2. SBP Inward Remittance Channels &amp; The Electronic Proceeds Realisation Certificate (e-PRC)
            </h3>
            <p>
              In Pakistan, the State Bank of Pakistan (SBP) oversees inward foreign currency remittances to safeguard macroeconomic stability and ensure FATF compliance:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Roshan Digital Accounts (RDA):</strong> Offer eligible non-resident Pakistanis banking and investment facilities. Eligibility, exchange rates and charges depend on the account, bank and transaction.</li>
              <li><strong>Home Remittances:</strong> Inward family transfers and payments for business or exported services can have different tax treatment. Do not assume every transfer received from abroad is tax-exempt.</li>
              <li><strong>Electronic Proceeds Realisation Certificate (e-PRC):</strong> Authorized banks provide a digital record of qualifying funds received from abroad. This evidence supports reporting but does not by itself establish an income-tax exemption or a concession under Section 154A.</li>
            </ul>
            <p>
              Verify the current rules with the <a href="https://www.sbp.org.pk/circulars/fe-circular-no-05-of-2022" target="_blank" rel="noopener noreferrer" className="text-[#00E676] underline">SBP e-PRC circular</a> and <a href="https://www.fbr.gov.pk/Budget2026-27/SalientFeatures/Salient-Feature.pdf" target="_blank" rel="noopener noreferrer" className="text-[#00E676] underline">FBR Finance Act 2026–27 summary</a> before relying on any tax calculation.
            </p>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-4">
              3. Strategies to Avoid Hidden Transfer Fees and SWIFT Markups
            </h3>
            <p>
              Some cross-border SWIFT transfers pass through intermediary banks that can deduct handling fees. Multi-currency accounts and local clearing options (such as SEPA, ACH or Faster Payments) may reduce costs for eligible corridors, but neither zero fees nor a specific delivery time is guaranteed. Compare the provider's full price and settlement terms.
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
              <span>View All Research Guides</span>
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
                  An educational guide to Pakistani exporter retention accounts, e-PRC records, conditional tax treatment and how to compare exchange charges.
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
            FGC Spot calculates indicative currency conversions from available public exchange-rate feeds and supported metals data. Results are mathematical references, not executable bank quotes or a promise of a particular payout. Compare a provider&apos;s quoted rate, fees and taxes before transferring money.
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
                The rates dictionary is quoted against USD (USD = 1.0) as the calculation base. For example, converting EUR to PKR divides the USD/PKR reference rate by the USD/EUR reference rate.
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
                <span><strong>Public FX Reference Feeds:</strong> Currency data is fetched from open.er-api.com, FloatRates and public currency API mirrors when available. These sources are not guaranteed executable interbank quotes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00E676] font-bold">&bull;</span>
                <span><strong>PKR Reference Rates:</strong> PKR is taken from an available public data provider. FGC Spot does not claim to reproduce the State Bank of Pakistan&apos;s official closing rate.</span>
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
                <span><strong>Provider-Dependent Refresh:</strong> The site requests updated rates when needed, but actual quote timestamps and frequency depend on the upstream feeds and connectivity.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00E676] font-bold">&bull;</span>
                <span><strong>Weekend &amp; Holiday Data:</strong> Some providers may return older reference quotes outside active market sessions; users should check the quote date before transacting.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00E676] font-bold">&bull;</span>
                <span><strong>Client Cache:</strong> Recently fetched FX data is cached for two minutes. Previously fetched quotes may display for up to ten minutes while the app tries to refresh them.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 5. Data Limitations (Mid-Market vs Bank Fees & Taxes) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>5. Data Limitations: Reference Rates vs. Retail Bank Charges</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed">
            Results use indicative public reference rates rather than quotes at which a bank or dealer is obliged to trade. The amount received in a real transaction may differ because of:
          </p>
          <ul className="text-xs text-slate-600 dark:text-[#A8B3C2] space-y-1 pl-4 list-disc">
            <li><strong>Retail Bank Spread:</strong> Banks and exchange services set their own conversion margins; compare the final payable amount and effective rate.</li>
            <li><strong>Applicable Taxes:</strong> Pakistani card transactions or remittances may have withholding obligations depending on current law and the transaction. Check the <a href="https://www.fbr.gov.pk/" target="_blank" rel="noopener noreferrer" className="underline">FBR</a> for current rates and applicability.</li>
            <li><strong>Correspondent Banking Fees:</strong> International SWIFT payments can involve intermediary and receiving-bank deductions that vary by provider and route.</li>
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
              Hypothetical comparison only: sending $1,000 USD at an assumed reference rate of <strong>Rs. 277.10</strong> (not a live quotation):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 font-mono text-xs">
              <div className="p-4 rounded-xl bg-white dark:bg-[#0D1B2A] border border-emerald-500/30 space-y-1">
                <span className="text-emerald-500 font-bold uppercase tracking-wider text-[10px]">Illustrative Fee-Free Scenario</span>
                <div className="text-slate-900 dark:text-white font-bold text-sm">Payout: Rs. 277,100 PKR</div>
                <div className="text-slate-500 text-[11px]">&bull; Assumes no transfer fee or exchange spread</div>
                <div className="text-slate-500 text-[11px]">&bull; Ask the receiving bank about e-PRC documentation</div>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#0D1B2A] border border-rose-500/30 space-y-1">
                <span className="text-rose-500 font-bold uppercase tracking-wider text-[10px]">Illustrative Service (3% Markup)</span>
                <div className="text-slate-900 dark:text-white font-bold text-sm">Payout: Rs. 268,787 PKR</div>
                <div className="text-slate-500 text-[11px]">&bull; Assumed spread: Rs. 8,313 versus reference</div>
                <div className="text-slate-500 text-[11px]">&bull; Tax treatment depends on the actual transaction</div>
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
