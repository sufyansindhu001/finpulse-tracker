import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  BookOpen, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  Mail, 
  TrendingUp, 
  Scale, 
  Award,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { useSEO } from '../hooks/useSEO';
import OptimizedImage from '../components/OptimizedImage';
import { getCategoryFallbackImage } from '../services/newsService';

export default function AuthorPage() {
  useSEO({
    title: 'Sufyan Saleem — Lead Financial Analyst & Macro Strategist | FGC Spot',
    description: 'Author profile and verified financial publications by Sufyan Saleem, Lead Financial Analyst at FGC Spot covering Pakistan forex, gold bullion, PSX equities, and remittance tax regimes.',
    canonical: '/author/sufyan-saleem/'
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const articles = BLOG_POSTS || [];

  const editorialFocusAreas = [
    {
      title: 'Pakistan Foreign Exchange Corridors',
      desc: 'Interbank wholesale pricing, open market cash spread dynamics, SBP daily weighted closing benchmarks, and USD/PKR triangular parity.'
    },
    {
      title: 'Physical Gold & Bullion Valuation',
      desc: 'Sarafa Bazaar pricing mechanics, 24K vs 22K karat assay testing, tola-to-gram conversions, making charges (mazdoori), and inflation hedging.'
    },
    {
      title: 'Pakistan Stock Exchange (PSX KSE-100)',
      desc: 'Equity multiple compression (P/E), double-digit dividend reinvestment yields (DRIP), corporate balance sheet solvency, and Piotroski F-Scores.'
    },
    {
      title: 'Exporter & Freelance Remittance Banking',
      desc: 'FBR Section 154A final tax regimes (0.25% vs 1%), SBP 50% foreign currency retention accounts (ESFCA), and electronic e-PRC certificates.'
    },
    {
      title: 'Digital Asset Valuation & Custody',
      desc: 'Algorithmic PKR counter-value derivation, multi-exchange VWAP indexation, SBP Circular BPRD/2018-03 compliance, and hardware cold storage.'
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 animate-in fade-in duration-300 pb-16 px-4 sm:px-6">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <Link to="/" className="hover:text-[#00E676] transition-colors font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/about" className="hover:text-[#00E676] transition-colors font-medium">About</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold">Author Profile: Sufyan Saleem</span>
      </nav>

      {/* Author Profile Header Card */}
      <section className="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8 pb-8 border-b border-slate-200 dark:border-white/10">
          
          {/* Author Headshot */}
          <div className="relative shrink-0">
            <img 
              src="/sufyan-author.jpg" 
              alt="Sufyan Saleem — Lead Financial Analyst" 
              width="128" 
              height="128"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-slate-100 dark:border-white/10 shadow-md ring-2 ring-[#00E676]/30"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/logo.png';
              }}
            />
            <div className="absolute -bottom-2 -right-2 bg-[#00E676] text-[#06111F] p-1.5 rounded-xl shadow-md border-2 border-white dark:border-[#0A1726]" title="Verified Editorial Author">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Author Identity & Verified Details */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-3 py-1 rounded-full border border-[#00E676]/20">
                Lead Financial Analyst &amp; Macro Strategist
              </span>
              <span className="text-xs text-slate-500 dark:text-[#A8B3C2] flex items-center gap-1 font-medium bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" /> Verified Author
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Sufyan Saleem
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-[#A8B3C2] leading-relaxed max-w-3xl">
              Sufyan Saleem serves as the Lead Financial Analyst and Macro Strategist at FGC Spot. He is the author of FGC Spot's empirical market research series, focusing on South Asian foreign exchange architecture, physical bullion pricing mechanics, Pakistan Stock Exchange equity valuation multiples, and cross-border remittance banking compliance.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
              <a 
                href="mailto:fgcspot4@gmail.com" 
                className="inline-flex items-center gap-1.5 font-semibold text-[#00E676] hover:text-[#00FF88] transition-colors"
                title="Direct Editorial Inquiries"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>fgcspot4@gmail.com (Attn: Sufyan Saleem)</span>
              </a>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 dark:text-[#A8B3C2]">
                {articles.length} Published Research Guides
              </span>
              <span className="text-slate-400">•</span>
              <Link 
                to="/editorial-policy" 
                className="text-slate-600 dark:text-[#A8B3C2] hover:text-[#00E676] underline underline-offset-2 transition-colors"
              >
                Editorial Standards &amp; Review Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Editorial Standards & Analytical Methodology */}
        <div className="pt-8 space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              Areas of Editorial Focus &amp; Financial Coverage
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed max-w-3xl">
              Sufyan’s research is grounded strictly in primary regulatory statutes, central bank policy bulletins, and mathematical parity calculations. His analytical publications span five core pillars:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {editorialFocusAreas.map((area, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/5 space-y-2 hover:border-[#00E676]/40 transition-all"
              >
                <div className="flex items-center gap-2 text-[#00E676] font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <span>{area.title}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                  {area.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Editorial Ethics & Verification Notice */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00E676]" />
              <span>Editorial Integrity &amp; Transparency Statement</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
              In accordance with FGC Spot's Editorial Policy, all articles authored by Sufyan Saleem are subject to strict primary-source verification against State Bank of Pakistan (SBP) circulars, Federal Board of Revenue (FBR) tax schedules, and Karachi Sarafa market fixings. The author does not accept paid token promotions, sponsored cryptocurrency shilling, or undisclosed commercial sponsorships. All analytical opinions are objective, educational, and grounded in empirical data.
            </p>
          </div>
        </div>
      </section>

      {/* Published Research Guides by Sufyan Saleem */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-[#00E676]" />
              <span>Published Research Guides ({articles.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#A8B3C2] mt-0.5">
              Comprehensive empirical analyses authored by Sufyan Saleem on FGC Spot
            </p>
          </div>
          <Link 
            to="/blog" 
            className="text-xs text-[#00E676] hover:text-[#00FF88] font-bold flex items-center gap-1 group w-fit"
          >
            <span>Browse Full Blog Archive</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <article 
              key={art.slug || art.id}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:shadow-[#00E676]/5"
            >
              <div className="space-y-3">
                {art.image && (
                  <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#06111F] relative aspect-[16/9]">
                    <OptimizedImage
                      src={art.image}
                      alt={art.title}
                      width={400}
                      height={225}
                      quality={75}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fallbackSrc={getCategoryFallbackImage(art.category, 0)}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full border border-[#00E676]/20">
                    {art.category || 'Financial Research'}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#00E676]" />
                    {art.readTime || art.read_time || '5 min read'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                  <Link to={`/blog/${art.slug}`} className="hover:text-[#00E676] transition-colors">
                    {art.title}
                  </Link>
                </h3>

                <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed line-clamp-3">
                  {art.summary || art.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#00E676]" />
                  <span>{art.date}</span>
                </span>
                <Link 
                  to={`/blog/${art.slug}`}
                  className="font-bold text-[#00E676] hover:text-[#00FF88] flex items-center gap-1"
                >
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}
