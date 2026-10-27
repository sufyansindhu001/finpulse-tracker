import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Calendar, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { parseTags } from '../lib/supabase';
import { useSEO } from '../hooks/useSEO';
import { getCategoryFallbackImage } from '../services/newsService';
import { getCachedArticles, fetchArticlesSWR } from '../services/articlesService';
import OptimizedImage from '../components/OptimizedImage';

/**
 * High-Performance Memoized Article Card
 * Eliminates redundant re-renders when "Load More" appends new articles or parent states update.
 */
const BlogArticleCard = memo(function BlogArticleCard({ post }) {
  const fallbackCover = useMemo(() => getCategoryFallbackImage(post?.category, 0), [post?.category]);

  return (
    <Link
      to={`/blog/${post.slug || post.id}`}
      className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 p-4 sm:p-6 flex flex-col justify-between transition-all duration-300 group shadow-sm dark:shadow-xl hover:-translate-y-1 hover:shadow-xl hover:shadow-[#00E676]/10"
    >
      <div className="space-y-3 sm:space-y-4">
        {post.image && (
          <div className="w-full h-36 sm:h-44 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#06111F] relative aspect-[16/9]">
            <OptimizedImage 
              src={post.image} 
              alt={post.title} 
              width={400}
              height={225}
              quality={75}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              fallbackSrc={fallbackCover}
            />
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full border border-[#00E676]/20">
            {post.category}
          </span>
          <span className="text-slate-500 dark:text-[#A8B3C2] flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#00E676]" />
            <span>{post.readTime}</span>
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#00E676] transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-[#A8B3C2] line-clamp-3 leading-relaxed">
            {post.summary || post.excerpt}
          </p>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-[#00E676]">
        <span>Read Article</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
});

export default function BlogPage() {
  const { articles: contextArticles = [] } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleArticleCount, setVisibleArticleCount] = useState(6);

  useSEO({
    title: 'Market Analysis & Financial Blog | FGC Spot',
    description: 'In-depth economic research, currency market breakdowns, and financial intelligence articles by FGC Spot analysts.',
    canonical: '/blog'
  });

  // Single source of truth from AppContext / getCachedArticles with instant 0ms SSR/hydration speed
  const articles = useMemo(() => {
    if (Array.isArray(contextArticles) && contextArticles.length > 0) {
      return contextArticles;
    }
    return getCachedArticles();
  }, [contextArticles]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Market Analysis & Financial Blog | FGC Spot';
  }, []);

  // Dynamically include all categories present across published articles
  const categories = useMemo(() => {
    const list = ['All'];
    articles.forEach(a => {
      if (a?.category && !list.includes(a.category)) {
        list.push(a.category);
      }
    });
    return list;
  }, [articles]);

  const filteredPosts = useMemo(() => {
    return articles.filter(post => {
      if (!post) return false;
      const matchCat = selectedCategory === 'All' || (post.category || '') === selectedCategory;
      const tagsList = parseTags(post.tags);
      const title = post.title || '';
      const summary = post.summary || post.excerpt || '';
      const matchSearch = 
        !searchQuery ||
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tagsList.some(t => (t || '').toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  // Reset pagination back to initial 6 when category filter or search query changes
  useEffect(() => {
    setVisibleArticleCount(6);
  }, [selectedCategory, searchQuery]);

  const featuredPost = articles[0] || null;
  const isShowingFeatured = selectedCategory === 'All' && !searchQuery && Boolean(featuredPost);

  // De-duplicate featured post from the grid below when featured block is actively rendered
  const gridPosts = useMemo(() => {
    if (isShowingFeatured && featuredPost) {
      return filteredPosts.filter(p => p.id !== featuredPost.id && (p.slug ? p.slug !== featuredPost.slug : true));
    }
    return filteredPosts;
  }, [filteredPosts, isShowingFeatured, featuredPost]);

  const displayedPosts = useMemo(() => {
    return gridPosts.slice(0, visibleArticleCount);
  }, [gridPosts, visibleArticleCount]);

  const handleLoadMoreArticles = useCallback(() => {
    setVisibleArticleCount(prev => prev + 6);
  }, []);

  const featuredFallbackCover = useMemo(() => 
    featuredPost ? getCategoryFallbackImage(featuredPost.category, 0) : ''
  , [featuredPost]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-white font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold">Financial Analysis &amp; Blog</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
            <span className="text-xs uppercase font-bold tracking-widest text-[#00E676]">
              MACROECONOMIC RESEARCH &amp; GUIDES
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Market Analysis &amp; Research Desk
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B3C2] mt-2 max-w-2xl leading-relaxed">
            In-depth guides, central bank policy breakdowns, foreign exchange corridor stability analysis, and digital asset security.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00E676] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides, tags, topics..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#A8B3C2] focus:outline-none focus:border-[#00E676] transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-white/10 text-xs scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#00E676] text-slate-950 shadow-sm font-bold'
                : 'bg-white dark:bg-[#0A1726] text-slate-600 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-xs'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Highlight Card */}
      {selectedCategory === 'All' && !searchQuery && featuredPost && (
        <Link 
          to={`/blog/${featuredPost.slug || featuredPost.id}`}
          className="block rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 p-6 sm:p-10 transition-all duration-300 group shadow-sm dark:shadow-2xl relative overflow-hidden backdrop-blur-2xl hover:-translate-y-1"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs uppercase bg-[#00E676]/10 text-[#00E676] px-3 py-1 rounded-full font-bold border border-[#00E676]/20 tracking-wider">
                  Featured Research
                </span>
                <span className="text-xs text-slate-500 dark:text-[#A8B3C2] flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#00E676]" /> {featuredPost.date}
                </span>
                <span className="text-xs text-slate-500 dark:text-[#A8B3C2] flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#00E676]" /> {featuredPost.readTime}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white group-hover:text-[#00E676] transition-colors leading-tight">
                {featuredPost.title}
              </h2>

              <p className="text-sm text-slate-600 dark:text-[#A8B3C2] leading-relaxed line-clamp-3">
                {featuredPost.summary || featuredPost.excerpt}
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#00E676]">
                <span>Read Full Analysis</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 relative aspect-[16/9]">
                <OptimizedImage 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  width={600}
                  height={338}
                  quality={80}
                  priority={true}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  fallbackSrc={featuredFallbackCover}
                />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Articles Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#00E676]" />
            <span>Latest Educational Articles &amp; Dispatches</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-[#A8B3C2]">
            Showing <strong className="text-slate-900 dark:text-white font-tabular">{displayedPosts.length}</strong> of <strong className="text-slate-900 dark:text-white font-tabular">{gridPosts.length}</strong> articles
          </span>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3 shadow-sm">
            <BookOpen className="w-10 h-10 text-slate-400 dark:text-[#A8B3C2] mx-auto opacity-50" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Articles Found</h3>
            <p className="text-xs text-slate-500 dark:text-[#A8B3C2]">No articles matching "{searchQuery}". Try a different keyword.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedPosts.map((post) => (
                <BlogArticleCard key={post.id || post.slug} post={post} />
              ))}
            </div>

            {/* Progressive Load More Action Button */}
            {displayedPosts.length < gridPosts.length && (
              <div className="pt-8 pb-2 flex justify-center">
                <button
                  onClick={handleLoadMoreArticles}
                  className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-white dark:bg-[#0A1726] hover:bg-slate-50 dark:hover:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/50 text-slate-900 dark:text-white font-bold text-xs sm:text-sm transition-all duration-300 shadow-sm dark:shadow-xl hover:shadow-lg hover:shadow-[#00E676]/15 hover:-translate-y-0.5 cursor-pointer group"
                >
                  <span>Load More Articles ({gridPosts.length - displayedPosts.length} remaining)</span>
                  <ChevronDown className="w-4 h-4 text-[#00E676] group-hover:translate-y-0.5 transition-transform stroke-[2.5]" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================
          CRAWLABLE ALL-ARTICLES DIRECTORY & FLAGSHIP RESEARCH GUIDES
          (Guarantees Googlebot 100% Internal Links to Every Single Article)
          ======================================================== */}
      <section id="research-directory" className="pt-12 border-t border-slate-200 dark:border-white/10 space-y-8">
        
        {/* Flagship Guides Highlight Cards */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#00E676]">
              Essential Reading • Flagship Editorial Guides
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guide 1: Buying Gold in Pakistan */}
            <Link
              to="/blog/buying-gold-in-pakistan-tola-karat-making-charges-guide"
              className="p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 hover:border-amber-500 transition-all duration-300 group shadow-sm flex flex-col justify-between space-y-4 hover:-translate-y-1"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    Physical Bullion Guide
                  </span>
                  <span className="text-slate-500 dark:text-[#A8B3C2] font-mono text-[11px]">5 min read</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-snug">
                  Buying Gold in Pakistan: Complete Investor Guide to Tola, Karat Purity, Making Charges, and Sarafa Bazaar Rates
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed line-clamp-2">
                  Everything you need to know about purchasing physical gold bullion in Pakistan: 24K vs 22K karat testing, Tola (11.66g) vs 10-gram weight pricing, avoiding unfair jeweler making charges, and hallmarking standards.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 pt-2 border-t border-amber-500/20">
                <span>Read Full Gold Guide</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Guide 2: Freelance Remittances & Banking */}
            <Link
              to="/blog/freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained"
              className="p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#00E676]/10 via-[#00E676]/5 to-transparent border border-[#00E676]/30 hover:border-[#00E676] transition-all duration-300 group shadow-sm flex flex-col justify-between space-y-4 hover:-translate-y-1"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30">
                    Banking &amp; Tax Exemption
                  </span>
                  <span className="text-slate-500 dark:text-[#A8B3C2] font-mono text-[11px]">5 min read</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#00E676] transition-colors leading-snug">
                  Freelance Remittances &amp; Banking in Pakistan: FBR Tax Regimes, PSEB Registration, and Retention Accounts Explained
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#A8B3C2] leading-relaxed line-clamp-2">
                  Comprehensive roadmap for Pakistani software exporters and digital freelancers: opening 50% retention foreign currency accounts, e-PRC issuance, PSEB tax exemptions (0.25% final tax), and avoiding interbank conversion spreads.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-[#00E676] pt-2 border-t border-[#00E676]/20">
                <span>Read Full Banking Guide</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Complete Research Index Table / Grid */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-[#0A1726]/60 border border-slate-200 dark:border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#00E676]" />
                <span>Complete Research &amp; Editorial Archives Directory</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#A8B3C2] mt-0.5">
                Direct permanent links to all published analytical guides, macro research papers, and financial tutorials.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#00E676] self-start sm:self-auto bg-[#00E676]/10 px-3 py-1 rounded-full border border-[#00E676]/20">
              {articles.length} Articles Total
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((art) => {
              const slug = art.slug || art.id;
              return (
                <Link
                  key={art.id || slug}
                  to={`/blog/${slug}`}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#0D1B2A] border border-slate-200/70 dark:border-white/5 hover:border-[#00E676]/50 transition-all group flex flex-col justify-between space-y-2 hover:shadow-md"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-[#A8B3C2]">
                      <span className="text-[#00E676] font-semibold">{art.category || 'Analysis'}</span>
                      <span>{art.readTime || art.read_time || '5 min'}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#00E676] transition-colors line-clamp-2 leading-snug">
                      {art.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 group-hover:text-[#00E676] pt-1">
                    <span>{art.date || (art.created_at ? new Date(art.created_at).toLocaleDateString() : 'October 2026')}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </section>

    </div>
  );
}
