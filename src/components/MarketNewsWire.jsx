import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Radio, 
  RefreshCw, 
  ArrowUpRight, 
  Clock, 
  ShieldCheck, 
  Newspaper 
} from 'lucide-react';
import { fetchLiveMarketNews } from '../services/newsService';

export default function MarketNewsWire({ limit = 6 }) {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('general');
  const [meta, setMeta] = useState({
    source: 'Institutional Wire Stream',
    lastUpdated: '',
    isLive: false
  });

  const loadNews = useCallback(async (category = activeCategory, isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await fetchLiveMarketNews(category);
      if (res && res.data) {
        setNews(res.data);
        setMeta({
          source: res.source,
          lastUpdated: res.lastUpdated,
          isLive: Boolean(res.isLive)
        });
      }
    } catch (err) {
      console.error('Failed to load news wire:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    loadNews(activeCategory, false);

    // Auto-refresh news every 90 seconds
    const interval = setInterval(() => {
      loadNews(activeCategory, false);
    }, 90000);

    return () => clearInterval(interval);
  }, [activeCategory, loadNews]);

  const handleCategoryChange = (catKey) => {
    setActiveCategory(catKey);
  };

  const categories = [
    { key: 'general', label: 'All Market Wire' },
    { key: 'forex', label: 'Forex & Corridors' },
    { key: 'crypto', label: 'Cryptocurrency' },
    { key: 'merger', label: 'Macro & M&A' },
  ];

  // Limit display if specified, or display up to 6 items by default
  const displayItems = limit ? news.slice(0, limit) : news;

  // Source badge styling generator
  const getSourceBadgeStyle = (source = '') => {
    const s = source.toLowerCase();
    if (s.includes('bloomberg')) {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
    if (s.includes('reuters')) {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
    if (s.includes('ft') || s.includes('financial times')) {
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }
    if (s.includes('wsj') || s.includes('wall street')) {
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    }
    if (s.includes('coindesk')) {
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    }
    return 'bg-slate-200/80 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-white/10';
  };

  return (
    <section id="news-wire" className="py-12 border-b border-slate-200/80 dark:border-white/[0.06] w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Live Market Wire with pulsing live beacon */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2.5 border border-emerald-500/20 uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Real-Time Dispatches</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Live Market Wire
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>• Real-Time Macro &amp; Crypto Intelligence</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl font-medium leading-relaxed">
              Automated high-frequency intelligence, macroeconomic indicators, and central bank developments curated directly from global financial wires.
            </p>
          </div>

          {/* Wire Controls & Source Status */}
          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-slate-100 dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] px-3 py-1.5 rounded-xl font-semibold flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="truncate max-w-[150px] sm:max-w-none">{meta.source}</span>
            </span>

            <button
              onClick={() => loadNews(activeCategory, true)}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0C1017] dark:hover:bg-[#111622] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] text-xs font-semibold transition-all cursor-pointer active:scale-95 disabled:opacity-60 shadow-xs"
              title="Force sync latest financial wire"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="hidden sm:inline">Sync Wire</span>
            </button>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200/80 dark:border-white/[0.06] text-xs scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-[#0C1017] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.15]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading Skeleton */}
        {isLoading && news.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-36 bg-slate-200/60 dark:bg-white/[0.04] rounded-xl border border-slate-200 dark:border-white/[0.06]" />
            ))}
          </div>
        ) : (
          /* Responsive 3-column grid on desktop and clean vertical stack on mobile */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {displayItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.08] hover:border-blue-500/50 dark:hover:border-blue-500/40 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between group shadow-xs dark:shadow-xl hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div>
                  {/* Top Metadata Row: Publisher Pill Badge + Timestamp + Subtle Link Arrow */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-xs uppercase px-2 py-0.5 rounded-full font-bold border ${getSourceBadgeStyle(item.source)} truncate max-w-[120px]`}>
                        {item.source}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {item.timeAgo}
                      </span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                  </div>

                  {/* Terminal News Body: Side-by-side Headline and Compact Thumbnail */}
                  <div className="flex items-start gap-3 mt-1.5">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold leading-snug text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {item.headline}
                      </h3>
                      {item.summary && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed font-normal">
                          {item.summary}
                        </p>
                      )}
                    </div>

                    {/* Compact Thumbnail (80x80) */}
                    {item.image && (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-[#07090E] border border-slate-200/80 dark:border-white/[0.06] relative">
                        <img
                          src={item.image}
                          alt={item.headline}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          width="80"
                          height="80"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Terminal Status Bar */}
                <div className="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Terminal Wire
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-0.5 font-sans font-medium">
                    Read dispatch &rarr;
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* AdSense Compliance Disclosure */}
        <div className="mt-8 pt-4 border-t border-slate-200/80 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 font-normal">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Syndicated live market news wire. All external dispatches attribute original publisher.</span>
          </div>
          <div>
            Independent Editorial Research available under{' '}
            <Link to="/research" className="text-blue-600 dark:text-blue-400 hover:underline">/research</Link>
          </div>
        </div>

      </div>
    </section>
  );
}
