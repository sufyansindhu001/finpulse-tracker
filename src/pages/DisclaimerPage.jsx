import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AlertTriangle, ChevronRight } from 'lucide-react';

export default function DisclaimerPage() {
  const { siteSettings } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 dark:text-slate-200 font-semibold">Financial Disclaimer</span>
      </nav>

      {/* Main Content Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Legal Disclosure
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Financial & Investment Disclaimer
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Please read this disclaimer carefully before using {siteSettings?.websiteName || 'FinPulse'} data tools and calculators.
            </p>
          </div>
        </div>


        {/* Content */}
        <div className="text-slate-700 dark:text-slate-300 text-sm sm:text-base space-y-6 leading-relaxed">
          
          {/* Prominent Warning Callout */}
          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-medium space-y-2">
            <strong className="block font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Important Regulatory Notice:
            </strong>
            <p>
              FinPulse is an educational and analytical financial software portal. FinPulse is NOT a broker-dealer, registered investment advisor (RIA), money services business (MSB), financial institution, or custodian under applicable international financial regulations.
            </p>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            1. No Investment, Legal, or Financial Advice
          </h2>
          <p>
            The information, calculators, exchange rates, cryptocurrency valuations, articles, and research commentary published on FinPulse are provided for general informational, educational, and reference purposes only. Nothing contained on this website constitutes a solicitation, recommendation, endorsement, or offer to buy or sell any currency, cryptocurrency, security, or financial instrument.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            2. Indicative Foreign Exchange Rates vs Retail Banking Spreads
          </h2>
          <p>
            The currency exchange rates displayed across the FinPulse Live Currency Calculator, Popular Forex Corridors, and USD Benchmark Matrix represent indicative <strong>mid-market interbank quotes</strong> derived from global central bank repositories and the Open Exchange Rates API.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <p>
              <strong>Important Difference:</strong> Mid-market rates do not account for retail banking markups, currency exchange booth commissions, credit card foreign transaction fees (typically 1.5% to 3%), or remittance service spreads. Real-world transactions executed with commercial banks or money transfer operators will differ from the quotes presented here.
            </p>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            3. Cryptocurrency High-Risk & Volatility Disclosure
          </h2>
          <p>
            Trading cryptocurrencies (including Bitcoin, Ethereum, Solana, and altcoins) involves substantial risk of loss and is not suitable for all investors. Cryptocurrency prices are highly volatile and can fluctuate dramatically within minutes due to global market conditions, regulatory actions, and network events.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Never invest funds that you cannot afford to lose entirely.</li>
            <li>Past performance of digital assets is not indicative of future market results.</li>
            <li>Smart contracts, decentralized finance (DeFi) protocols, and third-party custody wallets involve inherent technological vulnerabilities.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            4. Third-Party Data Accuracy & Disclaimers
          </h2>
          <p>
            FinPulse aggregates market data from third-party public APIs including Open Exchange Rates (<code className="text-blue-600 dark:text-blue-400 font-mono">open.er-api.com</code>) and CoinGecko. While we endeavor to ensure feed integrity, FinPulse makes no warranties, express or implied, regarding the accuracy, completeness, or timeliness of any market quote.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            5. Limitation of Liability
          </h2>
          <p>
            In no event shall FinPulse, its developers, authors, or corporate affiliates be held liable for any direct, indirect, incidental, or consequential damages resulting from the use of, or inability to use, the information and calculations provided on this website.
          </p>

          <div className="pt-4 flex items-center gap-3 text-xs">
            <Link
              to="/privacy-policy"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              View Privacy Policy →
            </Link>
            <span>•</span>
            <Link
              to="/contact"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Contact Legal Desk →
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
