import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Search, 
  X, 
  ShieldCheck, 
  Tag,
  Share2,
  User
} from 'lucide-react';

export default function ResearchSection({ limit, showViewAll = false }) {
  const { articles = [] } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDrawerArticle, setActiveDrawerArticle] = useState(null);

  const categories = ['All', 'Market Updates', 'Forex News', 'Crypto Guides', 'Macro Analysis'];

  const safeArticles = Array.isArray(articles) ? articles : [];

  const filteredPosts = useMemo(() => {
    return safeArticles.filter(post => {
      if (!post) return false;
      const matchCat = selectedCategory === 'All' || (post?.category || '') === selectedCategory;
      const tagsList = Array.isArray(post?.tags) 
        ? post.tags 
        : (typeof post?.tags === 'string' ? post.tags.split(',') : []);
      const title = post?.title || '';
      const summary = post?.summary || '';
      const matchSearch = 
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tagsList.some(t => (t || '').toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [safeArticles, selectedCategory, searchQuery]);

  const displayedPosts = limit ? filteredPosts.slice(0, limit) : filteredPosts;

  return (
    <section id="research" className="py-12 border-b border-slate-200/80 dark:border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-2.5 border border-purple-500/20 font-mono uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Editorial Market Intelligence</span>
            </div>
            {limit ? (
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Financial Research & Intelligence Desk
              </h2>
            ) : (
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Financial Research & Intelligence Desk
              </h1>
            )}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Macroeconomic policy breakdowns, liquidity corridor dynamics, and deep-dive digital asset research.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search research reports..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-slate-200/80 dark:border-white/[0.06]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-[#0C1017] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.15]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Research Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedPosts.map((post) => {
            const tags = Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? post.tags.split(',') : []);

            return (
              <div
                key={post.id}
                className="bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.18] rounded-3xl overflow-hidden transition-all duration-200 flex flex-col justify-between group shadow-xs dark:shadow-xl"
              >
                <div>
                  {/* Thumbnail Banner */}
                  <div className="w-full h-44 overflow-hidden relative bg-slate-100 dark:bg-[#07090E] border-b border-slate-200 dark:border-white/[0.06]">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        width="400"
                        height="176"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600 font-mono text-xs">
                        FINPULSE RESEARCH
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] font-bold bg-white/90 dark:bg-[#07090E]/90 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-white/[0.1] backdrop-blur-md font-mono shadow-xs">
                      {post.category || 'Analysis'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 mb-2 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {post.date || 'Recent'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {post.readTime || '5 min read'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-[#07090E] px-2 py-0.5 rounded border border-slate-200 dark:border-white/[0.04]">
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions: Drawer Preview + Full Page Link */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-white/[0.05] mt-auto flex items-center justify-between text-xs font-mono">
                  <button
                    onClick={() => setActiveDrawerArticle(post)}
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
                  >
                    Quick Drawer
                  </button>

                  <Link
                    to={`/blog/${post.id}`}
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-bold group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Full Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {displayedPosts.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] rounded-3xl">
            <BookOpen className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">No research reports matched "{searchQuery}".</p>
          </div>
        )}

        {showViewAll && (
          <div className="mt-10 text-center">
            <Link
              to="/research"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20"
            >
              <span>Explore All Research & Intelligence Reports</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>

      {/* Slide-over Detail View Drawer */}
      {activeDrawerArticle && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
          onClick={() => setActiveDrawerArticle(null)}
        >
          <div 
            className="w-full max-w-xl h-full bg-white dark:bg-[#0C1017] border-l border-slate-200 dark:border-white/[0.08] shadow-2xl p-6 sm:p-8 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Top Controls */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06] mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {activeDrawerArticle.category}
                </span>
                <button
                  onClick={() => setActiveDrawerArticle(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title & Meta */}
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-snug tracking-tight">
                {activeDrawerArticle.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 my-4 font-mono">
                <span>By {activeDrawerArticle.author || 'FinPulse Desk'}</span>
                <span>•</span>
                <span>{activeDrawerArticle.date}</span>
                <span>•</span>
                <span>{activeDrawerArticle.readTime}</span>
              </div>

              {/* Drawer Image */}
              {activeDrawerArticle.image && (
                <div className="w-full h-56 rounded-2xl overflow-hidden mb-6 border border-slate-200 dark:border-white/[0.08]">
                  <img 
                    src={activeDrawerArticle.image} 
                    alt={activeDrawerArticle.title} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                    width="600"
                    height="224"
                  />
                </div>
              )}

              {/* Summary */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#07090E] border-l-4 border-blue-500 text-slate-700 dark:text-slate-300 text-sm italic mb-6">
                "{activeDrawerArticle.summary}"
              </div>

              {/* Excerpt Content */}
              <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-4">
                {(activeDrawerArticle.content || '').split('\n\n').slice(0, 3).map((p, idx) => (
                  <p key={idx}>{p.replace(/^###\s*/, '')}</p>
                ))}
              </div>
            </div>

            {/* Drawer Bottom Action */}
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">FinPulse Institutional Data</span>
              <Link
                to={`/blog/${activeDrawerArticle.id}`}
                onClick={() => setActiveDrawerArticle(null)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                Open Full Dedicated Page →
              </Link>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
