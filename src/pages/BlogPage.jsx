import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Calendar, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  ChevronRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Tag,
  ChevronDown
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { supabase, normalizeArticle } from '../lib/supabase';

export default function BlogPage() {
  const { articles: contextArticles = [] } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [visibleArticleCount, setVisibleArticleCount] = useState(6);

  const [articles, setArticles] = useState(() => {
    try {
      const saved = localStorage.getItem('fgc_portal_articles');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(normalizeArticle);
      }
    } catch (e) {
      console.error("Failed to parse articles from localStorage", e);
    }
    return BLOG_POSTS.map(normalizeArticle);
  });

  const fetchArticles = React.useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const normalized = data.map(normalizeArticle);
        setArticles(normalized);
        try {
          localStorage.setItem('fgc_portal_articles', JSON.stringify(normalized));
        } catch {}
        return;
      }
    } catch (e) {
      console.warn('[BlogPage] Supabase fetch error, using fallback:', e);
    } finally {
      setLoading(false);
    }

    // Fallback gracefully to localStorage or bundled default articles
    try {
      const saved = localStorage.getItem('fgc_portal_articles');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArticles(parsed.map(normalizeArticle));
          return;
        }
      }
    } catch (e) {
      console.error("Failed to parse articles from localStorage", e);
    }
    if (Array.isArray(contextArticles) && contextArticles.length > 0) {
      setArticles(contextArticles.map(normalizeArticle));
    } else {
      setArticles(BLOG_POSTS.map(normalizeArticle));
    }
  }, [contextArticles]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Market Analysis & Financial Blog | FGC Spot';
    fetchArticles();

    const handleSync = () => fetchArticles();
    window.addEventListener('fgc_articles_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('fgc_articles_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [fetchArticles]);

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
      const tagsList = Array.isArray(post.tags) 
        ? post.tags 
        : (typeof post.tags === 'string' ? post.tags.split(',') : []);
      const title = post.title || '';
      const summary = post.summary || post.excerpt || '';
      const matchSearch = 
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

  const displayedPosts = useMemo(() => {
    return filteredPosts.slice(0, visibleArticleCount);
  }, [filteredPosts, visibleArticleCount]);

  const handleLoadMoreArticles = () => {
    setVisibleArticleCount(prev => prev + 6);
  };

  const featuredPost = articles[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-white font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold">Financial Analysis & Blog</span>
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
              <div className="h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 relative">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
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
            Showing <strong className="text-slate-900 dark:text-white font-tabular">{displayedPosts.length}</strong> of <strong className="text-slate-900 dark:text-white font-tabular">{filteredPosts.length}</strong> articles
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
                <Link
                  key={post.id}
                  to={`/blog/${post.slug || post.id}`}
                  className="animate-fade-in rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 p-6 flex flex-col justify-between transition-all duration-300 group shadow-sm dark:shadow-xl hover:-translate-y-1 hover:shadow-xl hover:shadow-[#00E676]/10"
                >
                  <div className="space-y-4">
                    {post.image && (
                      <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#06111F] relative">
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          loading="lazy"
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
              ))}
            </div>

            {/* Progressive Load More Action Button */}
            {displayedPosts.length < filteredPosts.length && (
              <div className="pt-8 pb-2 flex justify-center">
                <button
                  onClick={handleLoadMoreArticles}
                  className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-white dark:bg-[#0A1726] hover:bg-slate-50 dark:hover:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/50 text-slate-900 dark:text-white font-bold text-xs sm:text-sm transition-all duration-300 shadow-sm dark:shadow-xl hover:shadow-lg hover:shadow-[#00E676]/15 hover:-translate-y-0.5 cursor-pointer group"
                >
                  <span>Load More Articles</span>
                  <ChevronDown className="w-4 h-4 text-[#00E676] group-hover:translate-y-0.5 transition-transform stroke-[2.5]" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
