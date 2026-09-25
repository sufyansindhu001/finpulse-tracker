import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';

export default function BlogSection() {
  const { articles = [] } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  const featuredPost = safeArticles[0] || null;


  return (
    <div className="w-full">
      {/* Blog Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2.5 border border-blue-500/20 tracking-wide">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Market Analysis & Research</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Insights & Research
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Macroeconomic analysis on central bank foreign exchange policies, liquidity corridors, and digital asset economics.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides & news..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-100/90 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-slate-200/80 dark:border-white/[0.06]">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 font-bold'
                : 'bg-slate-100/90 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.06]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Highlight */}
      {selectedCategory === 'All' && !searchQuery && featuredPost && (
        <Link 
          to={`/blog/${featuredPost.id}`}
          className="block mb-8 rounded-3xl bg-white/80 dark:bg-[#0B0F19]/90 border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-8 hover:border-blue-500/50 transition-all cursor-pointer group shadow-2xl relative overflow-hidden backdrop-blur-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full font-bold border border-blue-500/20">
                  Featured Story
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium font-mono">
                  <Calendar className="w-3.5 h-3.5" /> {featuredPost.date}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium font-mono">
                  <Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors leading-snug">
                {featuredPost.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">
                {featuredPost.summary}
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-blue-500 group-hover:translate-x-1 transition-transform">
                <span>Read Institutional Report</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="lg:col-span-5 h-48 sm:h-60 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] relative shadow-md">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                width="480"
                height="240"
              />
            </div>
          </div>
        </Link>
      )}

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.id}`}
            className="bg-white/80 dark:bg-[#0B0F19]/90 border border-slate-200/80 dark:border-white/[0.08] rounded-3xl overflow-hidden hover:border-blue-500/50 hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between group shadow-lg backdrop-blur-2xl"
          >
            <div>
              {/* Thumbnail */}
              <div className="w-full h-44 overflow-hidden relative border-b border-slate-200/80 dark:border-white/[0.06] bg-slate-100 dark:bg-[#070A12]">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  width="400"
                  height="176"
                />
                <span className="absolute top-3 left-3 text-[10px] font-bold bg-white/90 dark:bg-[#0B0F19]/90 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm">
                  {post.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {post.summary}
                </p>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-5 pb-5 pt-3 flex items-center justify-between border-t border-slate-100 dark:border-white/[0.04] mt-auto text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium truncate max-w-[160px]">{post.author.split(',')[0]}</span>
              <span className="inline-flex items-center gap-1 text-blue-500 font-bold group-hover:translate-x-0.5 transition-transform">
                Read Article <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-16 bg-white/80 dark:bg-[#0B0F19]/90 border border-slate-200/80 dark:border-white/[0.08] rounded-3xl">
          <BookOpen className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No articles matched your criteria.</p>
        </div>
      )}
    </div>
  );
}
