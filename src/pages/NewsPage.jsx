import React, { useState, useEffect, useMemo } from 'react';
import { 
  Newspaper, 
  Search, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  Coins, 
  Globe, 
  TrendingUp, 
  Filter, 
  ChevronRight,
  X,
  Share2,
  BookOpen,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchLiveMarketNews, getLiveTimeAgo } from '../services/newsService';
import { useSEO } from '../hooks/useSEO';

export default function NewsPage() {
  useSEO({
    title: 'Live Financial News Wire & Market Intelligence | FGC Spot',
    description: 'Breaking macroeconomic news, central bank policy updates, forex developments, and market intelligence on FGC Spot.',
    canonical: '/news'
  });

  const [newsItems, setNewsItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);

  const loadNews = async (cat = selectedCategory, isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const res = await fetchLiveMarketNews(cat);
      const items = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
      setNewsItems(items);
    } catch (e) {
      console.warn('Failed to load live news wire:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews('all', false);

    // Re-evaluate timestamps every 60 seconds
    const timer = setInterval(() => {
      setNewsItems(prev => [...prev]);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    loadNews(catId, false);
  };

  const categories = [
    { id: 'all', label: 'All Dispatches' },
    { id: 'local-stocks', label: 'Local Stocks (PSX)' },
    { id: 'international-stocks', label: 'International Stocks' },
    { id: 'commodities-economy', label: 'Global Economy & Commodities' },
  ];

  const getCategoryBadgeStyle = (cat = '') => {
    const c = (cat || '').toLowerCase();
    if (c.includes('local') || c.includes('psx')) {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }
    if (c.includes('international') || c.includes('wall street') || c.includes('stocks')) {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  };

  const filteredNews = useMemo(() => {
    return newsItems.filter(item => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        item.headline?.toLowerCase().includes(q) || 
        item.summary?.toLowerCase().includes(q) ||
        item.source?.toLowerCase().includes(q) ||
        item.author?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      );
    });
  }, [newsItems, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2]">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-white font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold">Market News Wire</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
            <span className="text-xs uppercase font-bold tracking-widest text-[#00E676]">
              REAL-TIME FINANCIAL WIRE
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Global Market Intelligence
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#A8B3C2] mt-2 max-w-2xl leading-relaxed">
            Direct high-frequency wire reports covering foreign exchange policy, crypto liquidity, central bank decisions, and precious metals markets.
          </p>
        </div>

        {/* Live Feed Pill & Sync Button */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-xs text-[#00E676] font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
            <span>Live Financial Wire &bull; Real-Time</span>
          </div>

          <button
            onClick={() => loadNews(selectedCategory, true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#0A1726] hover:bg-slate-100 dark:hover:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh News Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00E676]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 overflow-x-auto scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => handleCategoryChange(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#00E676] text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-[#00E676] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news by headline, source..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-[#A8B3C2] focus:outline-none focus:border-[#00E676] shadow-xs"
          />
        </div>
      </div>

      {/* News Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="rounded-3xl bg-slate-100 dark:bg-[#0A1726]/60 border border-slate-200 dark:border-white/5 p-6 h-64 animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/3" />
              <div className="h-6 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
              <div className="h-16 bg-slate-200/50 dark:bg-white/5 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 space-y-3 shadow-sm">
          <Newspaper className="w-10 h-10 text-slate-400 dark:text-[#A8B3C2] mx-auto opacity-50" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No News Discovered</h3>
          <p className="text-xs text-slate-500 dark:text-[#A8B3C2]">Try clearing your search query or selecting a different category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item, idx) => (
            <div
              key={item.id || idx}
              className="rounded-3xl bg-white dark:bg-[#0A1726]/80 hover:bg-slate-50 dark:hover:bg-[#0A1726] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 p-6 transition-all duration-300 shadow-sm dark:shadow-xl backdrop-blur-xl flex flex-col justify-between group hover:-translate-y-1 hover:shadow-xl hover:shadow-[#00E676]/10"
            >
              <div className="space-y-4">
                {/* Image if available */}
                {item.image && (
                  <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#06111F] relative">
                    <img 
                      src={item.image} 
                      alt={item.headline} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Source, Category & Time */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span className="font-bold text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full border border-[#00E676]/20 truncate max-w-[140px]">
                        {item.source || 'Wire Feed'}
                      </span>
                      {item.category && (
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(item.category)} truncate max-w-[150px]`}>
                          {item.category}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 dark:text-[#A8B3C2] flex items-center gap-1 font-medium shrink-0">
                      <Clock className="w-3.5 h-3.5 text-[#00E676]" />
                      <span>{getLiveTimeAgo(item.datetime || item.pubDate)}</span>
                    </span>
                  </div>

                  {item.author && item.author !== item.source && (
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Reported by <span className="text-slate-900 dark:text-white font-bold">{item.author}</span>
                    </div>
                  )}
                </div>

                {/* Headline & Summary */}
                <div className="space-y-2">
                  <h3 
                    onClick={() => setActiveArticle(item)}
                    className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-[#00E676] transition-colors line-clamp-2 leading-snug cursor-pointer"
                  >
                    {item.headline}
                  </h3>
                  {item.summary && (
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed font-medium">
                      {item.summary}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Actions: Read Modal and Direct Source Link */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveArticle(item)}
                  className="flex items-center gap-1 text-slate-500 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#00E676]" />
                  <span>Quick Read</span>
                </button>

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#00E676] hover:underline transition-colors"
                    title="Open external source article"
                  >
                    <span>Source</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Article Reader Modal */}
      {activeArticle && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveArticle(null)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs uppercase px-2.5 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
                  {activeArticle.source}
                </span>
                {activeArticle.category && (
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(activeArticle.category)}`}>
                    {activeArticle.category}
                  </span>
                )}
                {activeArticle.author && (
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    by {activeArticle.author}
                  </span>
                )}
                <span className="text-xs text-slate-500 dark:text-[#A8B3C2]">
                  &bull; {getLiveTimeAgo(activeArticle.datetime || activeArticle.pubDate)}
                </span>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-[#06111F] text-slate-500 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image */}
            {activeArticle.image && (
              <img 
                src={activeArticle.image} 
                alt={activeArticle.headline} 
                className="w-full h-56 sm:h-64 object-cover rounded-2xl bg-slate-100 dark:bg-[#06111F]"
              />
            )}

            {/* Modal Headline & Content */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {activeArticle.headline}
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                {activeArticle.summary}
              </p>
            </div>

            {/* Modal Footer with External Link */}
            <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-[#A8B3C2]">
                Verified Institutional Wire Feed &bull; Live Syndication
              </div>

              {activeArticle.url && (
                <a
                  href={activeArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-[#00E676] hover:bg-[#00FF88] text-[#06111F] font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-[#00E676]/20"
                >
                  <span>Open Full Article Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
