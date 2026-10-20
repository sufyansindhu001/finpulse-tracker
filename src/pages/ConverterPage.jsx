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
  ChevronDown
} from 'lucide-react';
import CurrencySelect from '../components/CurrencySelect';
import { getCurrencyFlagUrl } from '../utils/currencyFlags';
import { useSEO } from '../hooks/useSEO';

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
    return amt && !isNaN(Number(amt)) ? Number(amt) : 100;
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
    if (amt && !isNaN(Number(amt))) setAmount(Number(amt));
  }, [searchParams]);

  // Conversion math
  const { fromRate, toRate, convertedAmount, unitRate, inverseRate } = useMemo(() => {
    const fromR = rates[fromCurrency] || (fromCurrency === 'USD' ? 1.0 : 1.0);
    const toR = rates[toCurrency] || (toCurrency === 'PKR' ? 277.10 : 1.0);

    // Amount in USD = amount / fromR
    const inUsd = amount / fromR;
    const finalAmount = inUsd * toR;

    const unit = toR / fromR;
    const inverse = fromR / toR;

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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
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
                step="any"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full mt-3 bg-transparent text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-tabular focus:outline-none"
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

              <div className="mt-3 text-3xl sm:text-4xl font-black text-[#00E676] font-tabular truncate">
                {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

        </div>

        {/* Live Exchange Rate Math Banner */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs text-slate-500 dark:text-[#A8B3C2] font-medium">Interbank Mid-Market Exchange Rate</div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-tabular">
              1 {fromCurrency} = {unitRate.toLocaleString(undefined, { maximumFractionDigits: 4 })} {toCurrency}
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-[#A8B3C2] text-center sm:text-right font-medium">
            Inverse: 1 {toCurrency} = {inverseRate.toLocaleString(undefined, { maximumFractionDigits: 4 })} {fromCurrency}
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
                  {(d * unitRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
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
                  {(d * inverseRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {fromCurrency}
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

    </div>
  );
}
