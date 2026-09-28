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

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);

  const loadNews = async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    try {
      const res = await fetchLiveMarketNews('all');
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
    loadNews(false);

    // Re-evaluate timestamps every 60 seconds
    const timer = setInterval(() => {
      setNewsItems(prev => [...prev]);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const categories = [
    { id: 'All', label: 'All News' },
    { id: 'Crypto', label: 'Cryptocurrency' },
    { id: 'Markets', label: 'Markets & Forex' },
    { id: 'Gold', label: 'Gold & Commodities' },
    { id: 'Economy', label: 'Economy & Central Banks' },
  ];

  const filteredNews = useMemo(() => {
    return newsItems.filter(item => {
      const matchCat = selectedCategory === 'All' 
        ? true 
        : selectedCategory === 'Markets' 
          ? (item.category === 'Forex' || item.category === 'Macro' || item.category === 'Markets')
          : selectedCategory === 'Crypto'
            ? (item.category === 'Crypto' || item.category === 'Digital Assets' || item.headline?.toLowerCase().includes('bitcoin') || item.headline?.toLowerCase().includes('crypto') || item.headline?.toLowerCase().includes('ethereum'))
            : selectedCategory === 'Gold'
              ? (item.category === 'Commodities' || item.headline?.toLowerCase().includes('gold') || item.headline?.toLowerCase().includes('silver') || item.headline?.toLowerCase().includes('oil'))
              : (item.category === 'Economy' || item.category === 'Macro' || item.category === 'Central Bank');

      const matchQuery = searchQuery.trim() === ''
        ? true
        : (item.headline?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.source?.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCat && matchQuery;
    });
  }, [newsItems, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#A8B3C2]">
        <Link to="/" className="hover:text-white font-medium">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white font-semibold">Market News Wire</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
            <span className="text-xs uppercase font-bold tracking-widest text-[#00E676]">
              REAL-TIME FINANCIAL WIRE
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Global Market Intelligence
          </h1>
          <p className="text-sm text-[#A8B3C2] mt-2 max-w-2xl leading-relaxed">
            Direct high-frequency wire reports covering foreign exchange policy, crypto liquidity, central bank decisions, and precious metals markets.
          </p>
        </div>

        {/* Live Feed Pill & Sync Button */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#0A1726] border border-white/10 text-xs text-[#00E676] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
            <span>Live RSS Feed &bull; 0 Mock Data</span>
          </div>

          <button
            onClick={() => loadNews(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#0A1726] hover:bg-[#0D1B2A] border border-white/10 text-xs text-[#A8B3C2] hover:text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
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
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0A1726] border border-white/10 overflow-x-auto scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#00E676] text-[#06111F] shadow-sm'
                  : 'text-[#A8B3C2] hover:text-white hover:bg-white/5'
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0A1726] border border-white/10 text-white text-xs placeholder-[#A8B3C2] focus:outline-none focus:border-[#00E676]"
          />
        </div>
      </div>

      {/* News Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="rounded-3xl bg-[#0A1726]/60 border border-white/5 p-6 h-64 animate-pulse space-y-4">
              <div className="h-4 bg-white/10 rounded w-1/3" />
              <div className="h-6 bg-white/10 rounded w-3/4" />
              <div className="h-16 bg-white/5 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#0A1726] border border-white/10 space-y-3">
          <Newspaper className="w-10 h-10 text-[#A8B3C2] mx-auto opacity-50" />
          <h3 className="text-lg font-bold text-white">No News Discovered</h3>
          <p className="text-xs text-[#A8B3C2]">Try clearing your search query or selecting a different category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item, idx) => (
            <div
              key={item.id || idx}
              className="rounded-3xl bg-[#0A1726]/80 hover:bg-[#0A1726] border border-white/10 hover:border-[#00E676]/40 p-6 transition-all duration-300 shadow-xl backdrop-blur-xl flex flex-col justify-between group hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#00E676]/10"
            >
              <div className="space-y-4">
                {/* Image if available */}
                {item.image && (
                  <div className="w-full h-44 rounded-2xl overflow-hidden bg-[#06111F] relative">
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

                {/* Source & Time */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#00E676] bg-[#00E676]/10 px-2.5 py-0.5 rounded-full border border-[#00E676]/20 truncate max-w-[150px]">
                    {item.source || 'Wire Feed'}
                  </span>
                  <span className="text-[#A8B3C2] flex items-center gap-1 font-medium shrink-0">
                    <Clock className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>{getLiveTimeAgo(item.datetime || item.pubDate)}</span>
                  </span>
                </div>

                {/* Headline & Summary */}
                <div className="space-y-2">
                  <h3 
                    onClick={() => setActiveArticle(item)}
                    className="text-base sm:text-lg font-extrabold text-white group-hover:text-[#00E676] transition-colors line-clamp-2 leading-snug cursor-pointer"
                  >
                    {item.headline}
                  </h3>
                  {item.summary && (
                    <p className="text-xs text-[#A8B3C2] line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Actions: Read Modal and Direct Source Link */}
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveArticle(item)}
                  className="flex items-center gap-1 text-[#A8B3C2] hover:text-white transition-colors cursor-pointer"
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
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-[#0A1726] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase px-2.5 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
                  {activeArticle.source}
                </span>
                <span className="text-xs text-[#A8B3C2]">
                  {getLiveTimeAgo(activeArticle.datetime || activeArticle.pubDate)}
                </span>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1.5 rounded-xl bg-[#06111F] text-[#A8B3C2] hover:text-white border border-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image */}
            {activeArticle.image && (
              <img 
                src={activeArticle.image} 
                alt={activeArticle.headline} 
                className="w-full h-56 sm:h-64 object-cover rounded-2xl bg-[#06111F]"
              />
            )}

            {/* Modal Headline & Content */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {activeArticle.headline}
              </h2>
              <p className="text-sm text-[#A8B3C2] leading-relaxed whitespace-pre-line">
                {activeArticle.summary}
              </p>
            </div>

            {/* Modal Footer with External Link */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#A8B3C2]">
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
