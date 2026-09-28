import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  ArrowLeft, 
  Share2, 
  ShieldCheck, 
  ChevronRight, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { supabase, normalizeArticle } from '../lib/supabase';

function formatInlineText(text) {
  if (!text) return '';
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const parts = [];
  let lastIdx = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="text-slate-900 dark:text-white font-bold">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#00E676] font-mono text-xs font-semibold">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-800 dark:text-slate-300">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }
  return parts.length > 0 ? parts : text;
}

export default function BlogDetailPage() {
  const { slug, id } = useParams();
  const rawIdentifier = slug || id;
  // Gracefully map legacy AI slug to the approved authentic guide to prevent 404s
  const targetIdentifier = rawIdentifier === 'usd-pkr-interbank-vs-open-market-guide'
    ? 'usd-to-pkr-interbank-vs-open-market-guide'
    : rawIdentifier;

  // Immediate fallback from bundled articles to ensure instantaneous initial paint
  const defaultMatch = useMemo(() => {
    if (!targetIdentifier) return normalizeArticle(BLOG_POSTS[0]);
    const cleanTarget = targetIdentifier.toLowerCase().trim();
    const found = BLOG_POSTS.find(p => {
      const s = (p.slug || '').toLowerCase().trim();
      const i = (p.id || '').toLowerCase().trim();
      return s === cleanTarget || i === cleanTarget;
    });
    return found ? normalizeArticle(found) : normalizeArticle(BLOG_POSTS[0]);
  }, [targetIdentifier]);

  const [article, setArticle] = useState(defaultMatch);
  const [allArticles, setAllArticles] = useState(BLOG_POSTS.map(normalizeArticle));
  const [loading, setLoading] = useState(false);

  // 1. Fetch exact article by slug from Supabase
  useEffect(() => {
    let isMounted = true;

    async function fetchArticleFromSupabase() {
      if (!targetIdentifier) return;
      const cleanTarget = targetIdentifier.toLowerCase().trim();

      try {
        setLoading(true);
        // Supabase query matching by slug
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', cleanTarget)
          .maybeSingle();

        if (data && isMounted) {
          setArticle(normalizeArticle(data));
          setLoading(false);
          return;
        }

        // If not found by slug, fallback check by ID in Supabase
        const idQuery = await supabase
          .from('articles')
          .select('*')
          .eq('id', cleanTarget)
          .maybeSingle();

        if (idQuery.data && isMounted) {
          setArticle(normalizeArticle(idQuery.data));
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('[BlogDetailPage] Supabase fetch error, checking default articles:', err);
      } finally {
        if (isMounted) setLoading(false);
      }

      // If not found in Supabase, fallback check in default bundled articles and localStorage
      if (isMounted) {
        let localList = [];
        try {
          const saved = localStorage.getItem('fgc_portal_articles');
          if (saved) localList = JSON.parse(saved);
        } catch {}
        const fallbackList = [...(Array.isArray(localList) ? localList : []), ...BLOG_POSTS];
        const match = fallbackList.find(p => {
          if (!p) return false;
          const s = (p.slug || '').toLowerCase().trim();
          const i = (p.id || '').toLowerCase().trim();
          return s === cleanTarget || i === cleanTarget;
        }) || defaultMatch;

        setArticle(normalizeArticle(match));
      }
    }

    fetchArticleFromSupabase();

    return () => {
      isMounted = false;
    };
  }, [targetIdentifier, defaultMatch]);

  // Load all articles for related stories list
  useEffect(() => {
    async function loadAllArticles() {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          setAllArticles(data.map(normalizeArticle));
          return;
        }
      } catch {}

      try {
        const saved = localStorage.getItem('fgc_portal_articles');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllArticles(parsed.map(normalizeArticle));
            return;
          }
        }
      } catch {}

      setAllArticles(BLOG_POSTS.map(normalizeArticle));
    }

    loadAllArticles();
  }, []);

  // Scroll to top and set document title
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (article?.title) {
      document.title = `${article.title} | FGC Spot Analysis`;
    }
  }, [targetIdentifier, article?.title]);

  const relatedArticles = useMemo(() => {
    return allArticles.filter(p => p && p.id !== article?.id && p.slug !== article?.slug).slice(0, 3);
  }, [allArticles, article]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary || article.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  if (!article) {
    return (
      <div className="w-full max-w-3xl mx-auto py-20 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-[#A8B3C2] mx-auto opacity-50" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Article Not Found</h2>
        <p className="text-sm text-slate-600 dark:text-[#A8B3C2]">The requested financial analysis article does not exist or has been moved.</p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00E676] hover:bg-[#00FF88] text-[#06111F] text-xs font-bold rounded-xl transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Blog &amp; Analysis Desk</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16 px-4 sm:px-6">
      
      {/* Top Navigation & Share Bar */}
      <div className="flex items-center justify-between pt-2">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-[#A8B3C2] hover:text-[#00E676] dark:hover:text-[#00E676] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Analysis Desk</span>
        </Link>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 text-slate-700 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5 text-[#00E676]" />
          <span>Share</span>
        </button>
      </div>

      {/* Main Container Card */}
      <div className="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-sm dark:shadow-2xl">
        
        {/* Category & Read Time Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
          <span className="font-bold text-[#00E676] bg-[#00E676]/10 px-3 py-1 rounded-full border border-[#00E676]/20 uppercase tracking-wider">
            {article.category}
          </span>
          <span className="text-slate-500 dark:text-[#A8B3C2] flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#00E676]" /> {article.date}
          </span>
          <span className="text-slate-500 dark:text-[#A8B3C2] flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#00E676]" /> {article.readTime}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-6">
          {article.title}
        </h1>

        {/* Author Bio Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 flex items-center justify-center text-[#00E676] font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{article.author || 'FGC Spot Macro Research Desk'}</div>
              <div className="text-xs text-slate-500 dark:text-[#A8B3C2] font-medium">
                {article.author === 'Sufyan Saleem' 
                  ? 'Contributing Financial Columnist & Forex Analyst' 
                  : 'FGC Spot Financial Research Desk • Independent Intelligence'}
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#00E676] bg-[#00E676]/10 px-3 py-1 rounded-full border border-[#00E676]/20 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Editorial Peer Verified</span>
          </div>
        </div>

        {/* Featured Image */}
        {article.image && (
          <div className="w-full h-64 sm:h-96 rounded-2xl overflow-hidden mb-8 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#06111F]">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Executive Summary Callout */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#06111F] border-l-4 border-[#00E676] border-t border-r border-b border-slate-200 dark:border-white/10 mb-8 text-slate-600 dark:text-[#A8B3C2] text-sm sm:text-base italic leading-relaxed">
          <strong className="text-slate-900 dark:text-white font-semibold not-italic block mb-1">Executive Takeaway:</strong>
          "{article.summary || article.excerpt}"
        </div>

        {/* Full Article Content */}
        <div className="text-slate-700 dark:text-[#A8B3C2] text-base leading-relaxed space-y-6">
          {(article.content || '').replace(/\n(?=\d+\.\s)/g, '\n\n').split('\n\n').map((paragraph, idx) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            // Horizontal Rule
            if (trimmed === '---' || trimmed === '***') {
              return <hr key={idx} className="my-8 border-slate-200 dark:border-white/10" />;
            }

            // Headings (H1)
            if (trimmed.startsWith('# ')) {
              return (
                <h2 key={idx} className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white pt-6 pb-2 border-b border-slate-200 dark:border-white/10">
                  {trimmed.replace(/^#\s*/, '')}
                </h2>
              );
            }

            // Headings (H2)
            if (trimmed.startsWith('## ')) {
              return (
                <h2 key={idx} className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white pt-6 pb-2 border-b border-slate-200 dark:border-white/10">
                  {trimmed.replace(/^##\s*/, '')}
                </h2>
              );
            }

            // Subheadings (H4)
            if (trimmed.startsWith('####')) {
              return (
                <h4 key={idx} className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-3 pb-1">
                  {trimmed.replace(/^####\s*/, '')}
                </h4>
              );
            }

            // Headings (H3)
            if (trimmed.startsWith('###')) {
              return (
                <h3 key={idx} className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white pt-5 pb-1">
                  {trimmed.replace(/^###\s*/, '')}
                </h3>
              );
            }

            // Blockquotes
            if (trimmed.startsWith('>')) {
              return (
                <blockquote key={idx} className="my-5 pl-4 sm:pl-6 border-l-4 border-[#00E676] bg-slate-50 dark:bg-[#06111F] p-4 rounded-r-xl italic text-slate-700 dark:text-[#A8B3C2]">
                  {formatInlineText(trimmed.replace(/^>\s*/, ''))}
                </blockquote>
              );
            }

            // Golden Rule / Editorial Callouts
            if (trimmed.startsWith('**The Golden Rule:**') || trimmed.startsWith('**Important:**')) {
              return (
                <div key={idx} className="my-5 p-5 sm:p-6 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 text-slate-800 dark:text-[#A8B3C2] text-sm sm:text-base leading-relaxed shadow-xs">
                  {formatInlineText(trimmed)}
                </div>
              );
            }

            // Numbered List Items / Rules (1. **Title:**\nDescription)
            if (/^\d+\.\s/.test(trimmed)) {
              const match = trimmed.match(/^(\d+)\.\s+([\s\S]*)/);
              if (match) {
                const num = match[1];
                const body = match[2];
                const lines = body.split('\n').filter(l => l.trim().length > 0);
                return (
                  <div key={idx} className="my-5 p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 flex items-start gap-4 shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] font-extrabold text-sm shrink-0 mt-0.5 shadow-[0_0_10px_rgba(0,230,118,0.15)]">
                      {num}
                    </div>
                    <div className="space-y-2 flex-1 text-slate-700 dark:text-[#A8B3C2] text-sm sm:text-base leading-relaxed">
                      {lines.map((line, bIdx) => {
                        const trimmedLine = line.trim();
                        if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
                          return (
                            <div key={bIdx} className="flex items-start gap-2.5 pl-3 py-0.5 text-xs sm:text-sm">
                              <span className="text-[#00E676] font-bold shrink-0 mt-0.5">&bull;</span>
                              <span className="text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                                {formatInlineText(trimmedLine.replace(/^[*•-]\s*/, ''))}
                              </span>
                            </div>
                          );
                        }
                        return (
                          <p key={bIdx} className={bIdx === 0 ? "font-bold text-slate-900 dark:text-white" : "leading-relaxed"}>
                            {formatInlineText(trimmedLine)}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            }

            // Bullet Lists
            if (trimmed.startsWith('*') || trimmed.startsWith('-') || trimmed.includes('\n*') || trimmed.includes('\n-')) {
              const lines = trimmed.split('\n').filter(l => l.trim().length > 0);
              return (
                <div key={idx} className="my-4 pl-4 border-l-2 border-[#00E676]/50 space-y-2.5 py-1">
                  {lines.map((line, lIdx) => (
                    <div key={lIdx} className="flex items-start gap-2.5 text-sm sm:text-base">
                      <span className="text-[#00E676] font-bold shrink-0 mt-0.5">&bull;</span>
                      <span className="text-slate-600 dark:text-[#A8B3C2] leading-relaxed">
                        {formatInlineText(line.replace(/^[*•-]\s*/, ''))}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }

            // Standard Paragraph
            return (
              <p key={idx} className="leading-relaxed">
                {formatInlineText(trimmed)}
              </p>
            );
          })}
        </div>

        {/* Market Tickers & Editorial Tags */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-[#A8B3C2] uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Tag className="w-3.5 h-3.5 text-[#00E676]" />
            TAGS:
          </span>
          {(Array.isArray(article.tags) ? article.tags : (typeof article.tags === 'string' ? article.tags.split(',') : [])).map((tag, tIdx) => (
            <span 
              key={tIdx} 
              className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#06111F] text-slate-600 dark:text-[#A8B3C2] border border-slate-200 dark:border-white/10"
            >
              #{tag.trim()}
            </span>
          ))}
        </div>

      </div>

      {/* Related Research Articles */}
      {relatedArticles.length > 0 && (
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#00E676]" />
              <span>Related Market Research</span>
            </h3>
            <Link to="/blog" className="text-xs text-[#00E676] hover:underline font-semibold flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {relatedArticles.map((rel) => (
              <Link
                key={rel.id}
                to={`/blog/${rel.slug || rel.id}`}
                className="p-4 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 transition-all group flex flex-col justify-between shadow-xs hover:-translate-y-0.5"
              >
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#00E676]">
                    {rel.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#00E676] transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-[#A8B3C2]">
                  <span>{rel.readTime}</span>
                  <ArrowRight className="w-3 h-3 text-[#00E676] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </article>
  );
}
