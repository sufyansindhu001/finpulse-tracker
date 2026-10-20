import React from 'react';
import { BookOpen, ArrowUpRight, Calendar, Clock } from 'lucide-react';
import { getCategoryFallbackImage } from '../services/newsService';

const FEATURED_ARTICLES = [
  {
    slug: 'pakistan-stock-exchange-psx-vs-global-equities-kse-100-valuation-dividend-yields-sp500-guide',
    title: 'Pakistan Stock Exchange (PSX) vs Global Equities: KSE-100 Valuation Multiples, Dividend Yields, and S&P 500 Comparison Guide',
    excerpt: 'An institutional comparative analysis evaluating the PSX KSE-100’s sub-5.0x P/E multiple compression, double-digit dividend reinvestment yields (11.8%), and real purchasing power returns against the S&P 500 and emerging market peers.',
    category: 'Equity Research',
    readTime: '6 min read',
    date: 'October 19, 2026',
    author: 'Sufyan Saleem',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    tags: ['PSX', 'KSE-100', 'S&P 500', 'Dividend Yield', 'P/E Compression']
  },
  {
    slug: 'buying-gold-in-pakistan-tola-karat-making-charges-guide',
    title: 'Buying Gold in Pakistan: Complete Investor Guide to Tola, Karat Purity, Making Charges, and Sarafa Bazaar Rates',
    excerpt: 'Everything you need to know about purchasing physical gold bullion in Pakistan: 24K vs 22K karat testing, Tola (11.66g) vs 10-gram weight pricing, avoiding unfair jeweler making charges, and hallmarking standards.',
    category: 'Precious Metals',
    readTime: '5 min read',
    date: 'October 20, 2026',
    author: 'Sufyan Saleem',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=80',
    tags: ['Gold Bullion', 'Tola', 'Karat', 'Sarafa Bazaar', 'Hedging']
  },
  {
    slug: 'freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained',
    title: 'Freelance Remittances & Banking in Pakistan: FBR Tax Regimes, PSEB Registration, and Foreign Currency Exporter Retention Accounts',
    excerpt: 'Comprehensive roadmap for Pakistani software exporters and digital freelancers: opening 50% retention foreign currency accounts, PRC certificate issuance, PSEB tax exemptions (0.25% final tax), and avoiding interbank conversion spreads.',
    category: 'Banking & Remittances',
    readTime: '5 min read',
    date: 'October 20, 2026',
    author: 'Sufyan Saleem',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    tags: ['Freelance Banking', 'FBR Tax', 'PSEB', 'Remittances', 'Forex']
  }
];

export default function FeaturedResearchSection() {
  return (
    <section id="featured-research" className="py-14 sm:py-20 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#06111F] relative w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Flagship Analytical Guides</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Featured Institutional Research & <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E676] to-emerald-400">
                Market Intelligence
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
              Exhaustive investigations authored by FGC Spot financial analysts dissecting equity multiples, physical precious metals mechanics, and cross-border currency regulations.
            </p>
          </div>

          <a
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-[#00E676] hover:text-[#06111F] text-gray-900 dark:text-gray-100 font-bold text-xs transition-all cursor-pointer border border-slate-200 dark:border-white/10 shrink-0 self-start md:self-auto"
          >
            <span>Browse All Research Articles</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* 3 Featured Articles Grid with Direct Crawlable <a href="..."> links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {FEATURED_ARTICLES.map((article) => (
            <article 
              key={article.slug}
              className="group rounded-2xl bg-slate-50 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/50 transition-all duration-300 flex flex-col overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1"
            >
              {/* Direct Crawlable Anchor around Image */}
              <a 
                href={`/blog/${article.slug}`}
                className="relative aspect-video w-full overflow-hidden block bg-slate-200 dark:bg-white/5"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  width="400"
                  height="225"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getCategoryFallbackImage(article.category, 0);
                  }}
                />
                <div className="absolute top-3 left-3 bg-[#06111F]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-[#00E676] border border-[#00E676]/30">
                  {article.category}
                </div>
              </a>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-3 text-[11px] font-mono text-gray-600 dark:text-gray-300 bg-slate-100 dark:bg-white/[0.04] p-1.5 px-2.5 rounded-lg border border-slate-200/60 dark:border-white/5">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-[#00E676]" />
                      <span>{article.date}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{article.readTime}</span>
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#00E676] transition-colors leading-snug">
                    <a href={`/blog/${article.slug}`} className="block">
                      {article.title}
                    </a>
                  </h3>

                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between p-2 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <img 
                      src="/sufyan-author.jpg" 
                      alt="Sufyan Saleem - Financial Analyst" 
                      width="24"
                      height="24"
                      loading="lazy"
                      decoding="async"
                      className="w-6 h-6 rounded-full object-cover border border-[#00E676]/40"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/favicon.png';
                      }}
                    />
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {article.author}
                    </span>
                  </div>

                  <a 
                    href={`/blog/${article.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#00E676] hover:underline"
                  >
                    <span>Read Full Guide</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
