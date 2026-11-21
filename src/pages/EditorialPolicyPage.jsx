import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  BookOpen, 
  ChevronRight, 
  CheckCircle2, 
  Scale, 
  RefreshCw, 
  AlertCircle, 
  Mail, 
  FileCheck2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

export default function EditorialPolicyPage() {
  useSEO({
    title: 'Editorial Policy & Fact-Checking Standards | FGC Spot',
    description: 'FGC Spot editorial standards, empirical research methodologies, primary source verification, data check procedures, corrections policy, and independence standards.',
    canonical: '/editorial-policy'
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16 px-4 sm:px-6">
      
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <Link to="/" className="hover:text-[#00E676] transition-colors font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/about" className="hover:text-[#00E676] transition-colors font-medium">About</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold">Editorial Policy</span>
      </nav>

      {/* Main Content Card */}
      <article className="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-xl space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-3.5 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.15)] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#00E676]">
              Publishing Ethics &amp; Integrity
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              FGC Spot Editorial Policy &amp; Standards
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#A8B3C2] mt-1">
              Effective Date: October 2026 • Governs all financial analysis, tools, and published articles
            </p>
          </div>
        </header>

        {/* Intro */}
        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-[#A8B3C2] leading-relaxed space-y-6 font-normal">
          <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white leading-relaxed">
            FGC Spot is committed to producing accurate, objective, and actionable financial research and data tools. This Editorial Policy defines the mandatory standards governing topic selection, primary source verification, data validation, correction workflows, and commercial independence across our publications.
          </p>

          {/* Section 1: Topic Selection */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#00E676]/10 text-[#00E676] flex items-center justify-center text-xs font-bold">1</span>
              <span>Topic Selection &amp; Financial Utility</span>
            </h2>
            <p>
              We prioritize topics that offer genuine, high-utility value to individuals, businesses, exporters, and investors navigating the Pakistani and global financial ecosystems. Topics are selected based on:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Practical Utility:</strong> Providing actionable clarity on currency conversion, remittance fee structures, bullion purity, tax exemptions, or stock screening.</li>
              <li><strong>Regulatory Timeliness:</strong> Responding to revisions in State Bank of Pakistan (SBP) foreign exchange regulations, Federal Board of Revenue (FBR) finance acts, and international central bank monetary policies.</li>
              <li><strong>Market Opacity Resolution:</strong> Demystifying areas where consumers are vulnerable to hidden banking spreads, dealer commissions, or deceptive making charges.</li>
            </ul>
          </div>

          {/* Section 2: Research & Analysis Standards */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#00E676]/10 text-[#00E676] flex items-center justify-center text-xs font-bold">2</span>
              <span>Research Methodology &amp; Primary Sources</span>
            </h2>
            <p>
              All original research authored by our analytical desk (led by Sufyan Saleem) is grounded strictly in verified primary documentation:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Statutory Authorities:</strong> State Bank of Pakistan (SBP) Foreign Exchange Manual and BPRD circulars; Federal Board of Revenue (FBR) Income Tax Ordinance 2001; Securities and Exchange Commission of Pakistan (SECP) circulars.</li>
              <li><strong>Market Associations:</strong> Official daily rate cards issued by the All Pakistan Sarafa Gems and Jewellers Association (APSGJA) and the Exchange Companies Association of Pakistan (ECAP).</li>
              <li><strong>Exchange Disclosures:</strong> Pakistan Stock Exchange (PSX) listed company quarterly filings, audited balance sheets, and dividend announcements.</li>
              <li><strong>Global Clearing Feeds:</strong> London Bullion Market Association (LBMA) spot benchmarks and institutional multi-bank forex clearing networks.</li>
            </ul>
            <p>
              We do not rely on unverified social media commentary, secondary rumors, or marketing press releases as the evidentiary basis for financial analysis.
            </p>
          </div>

          {/* Section 3: Data Checking & Algorithmic Verification */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#00E676]/10 text-[#00E676] flex items-center justify-center text-xs font-bold">3</span>
              <span>Financial Data Checking &amp; Model Validation</span>
            </h2>
            <p>
              Before publishing mathematical formulas, calculation examples, or ticker models:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>All conversion formulas (such as triangular cross-currency parity or 24K tola gold conversions) are cross-checked against live SBP weighted closing benchmarks.</li>
              <li>Calculators and screening tools are tested with boundary conditions, edge cases, and historical data to prevent calculation errors.</li>
              <li>Data limitations—such as 15-minute stock delays, retail making charges, or cross-border card fees—are explicitly disclosed adjacent to calculations.</li>
            </ul>
          </div>

          {/* Section 4: Corrections Policy */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#00E676]/10 text-[#00E676] flex items-center justify-center text-xs font-bold">4</span>
              <span>Transparent Corrections &amp; Retractions</span>
            </h2>
            <p>
              FGC Spot adheres to a strict corrections policy. If a factual or computational inaccuracy is identified in an article or calculation tool:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Immediate Correction:</strong> The error is corrected immediately in the published text or code.</li>
              <li><strong>Correction Notice:</strong> For substantive changes, a clear correction notice is appended at the top or bottom of the article specifying the date, the nature of the error, and the corrected figures.</li>
              <li><strong>Reader Reporting:</strong> Readers can report potential inaccuracies directly to our editorial desk via email at <a href="mailto:fgcspot4@gmail.com" className="text-[#00E676] underline font-mono font-bold">fgcspot4@gmail.com</a>. Every inquiry is reviewed within 24 to 48 business hours.</li>
            </ul>
          </div>

          {/* Section 5: Update Cadence */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#00E676]/10 text-[#00E676] flex items-center justify-center text-xs font-bold">5</span>
              <span>Article Maintenance &amp; Update Cadence</span>
            </h2>
            <p>
              Financial regulations, central bank policy rates, and tax withholding percentages evolve over time. To ensure readers receive accurate information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Research articles are reviewed whenever the State Bank of Pakistan updates the policy discount rate or when the Federal Budget amends export tax regimes (e.g., Section 154A or Section 236Y).</li>
              <li>When substantive updates occur, the article displays an updated date stamp alongside its original publication date.</li>
              <li>We never alter publication dates cosmetically to make historical articles appear artificially recent.</li>
            </ul>
          </div>

          {/* Section 6: Original Research vs. Syndicated News */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#00E676]/10 text-[#00E676] flex items-center justify-center text-xs font-bold">6</span>
              <span>Separation of Original Research vs. Syndicated News</span>
            </h2>
            <p>
              FGC Spot maintains an unambiguous boundary between original editorial research and third-party news syndication:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Research &amp; Analysis Portal (`/blog`):</strong> 100% original, empirical long-form analysis written by our in-house analyst Sufyan Saleem. Zero third-party syndicated copy is published here.</li>
              <li><strong>Market News Wire (`/news`):</strong> An automated indexing service that aggregates breaking headlines and short fair-use summaries from external newsrooms (including MarketWatch, CNBC, Business Recorder, Profit Pakistan, and Cointelegraph). The feed carries prominent wire syndication disclosures and links out directly to the originating publisher.</li>
            </ul>
          </div>

          {/* Section 7: Sponsored Content & Commercial Independence */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#00E676]/10 text-[#00E676] flex items-center justify-center text-xs font-bold">7</span>
              <span>Sponsored Content &amp; Commercial Independence</span>
            </h2>
            <p>
              Our editorial independence is absolute:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>We do not accept paid compensation to review, promote, or endorse cryptocurrency tokens, Initial Coin Offerings (ICOs), commercial bank products, or jewelry vendors.</li>
              <li>No commercial advertiser or institutional partner has pre-publication review privileges or influence over editorial conclusions.</li>
              <li>Any future sponsored advertising will be labeled clearly as "Sponsored" or "Advertisement" in full compliance with Google AdSense and Federal Trade Commission guidelines.</li>
            </ul>
          </div>

          {/* Section 8: Conflict of Interest */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-2">
              <span className="w-6 h-6 rounded-lg bg-[#00E676]/10 text-[#00E676] flex items-center justify-center text-xs font-bold">8</span>
              <span>Conflicts of Interest &amp; Personal Trading Policy</span>
            </h2>
            <p>
              To maintain objective analysis, authors and contributors are prohibited from taking front-running speculative positions in individual micro-cap equities or illiquid digital tokens that they write about within 72 hours before or after publication.
            </p>
          </div>

          {/* Contact / Oversight Box */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 space-y-3 not-prose">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#00E676]" />
              <span>Editorial Inquiries &amp; Oversight</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
              For questions regarding our editorial policy, fact-checking procedures, or to submit a correction request, please contact our editorial desk:
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <span className="text-[#00E676] font-bold">fgcspot4@gmail.com</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">Attention: Editorial Review Board</span>
            </div>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/author/sufyan-saleem/" className="text-xs font-bold text-[#00E676] hover:underline flex items-center gap-1">
                <span>View Author Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-slate-400">•</span>
              <Link to="/data-sources" className="text-xs font-bold text-slate-600 dark:text-[#A8B3C2] hover:text-[#00E676] transition-colors">
                View Data Sources &amp; Governance
              </Link>
            </div>
          </div>

        </div>

      </article>

    </div>
  );
}
