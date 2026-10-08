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
  ArrowRight,
  ThumbsUp
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { supabase, normalizeArticle, parseTags } from '../lib/supabase';

function getBaseLikes(seed) {
  if (!seed) return 42;
  const str = String(seed);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return 28 + Math.abs(hash % 38);
}

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

// Helper to synchronously find matching article from localStorage or bundled posts
function findLocalArticle(target) {
  if (!target) return null;
  const clean = target.toLowerCase().trim();

  // 1. Check cached articles in localStorage (contains all synced articles from Supabase)
  try {
    const saved = localStorage.getItem('fgc_portal_articles');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const found = parsed.find(p => {
          if (!p) return false;
          const s = (p.slug || '').toLowerCase().trim();
          const i = (p.id || '').toLowerCase().trim();
          return s === clean || i === clean;
        });
        if (found) return normalizeArticle(found);
      }
    }
  } catch {}

  // 2. Check bundled BLOG_POSTS
  const bundled = BLOG_POSTS.find(p => {
    if (!p) return false;
    const s = (p.slug || '').toLowerCase().trim();
    const i = (p.id || '').toLowerCase().trim();
    return s === clean || i === clean;
  });
  if (bundled) return normalizeArticle(bundled);

  // Return null if not yet cached so a neutral skeleton placeholder is shown instead of flashing the wrong article
  return null;
}

export default function BlogDetailPage() {
  const { slug, id } = useParams();
  const rawIdentifier = slug || id;
  // Gracefully map legacy AI slug to the approved authentic guide to prevent 404s
  const targetIdentifier = rawIdentifier === 'usd-pkr-interbank-vs-open-market-guide'
    ? 'usd-to-pkr-interbank-vs-open-market-guide'
    : rawIdentifier;

  // Synchronously resolve local match without hardcoded fallback to article 0
  const initialMatch = useMemo(() => findLocalArticle(targetIdentifier), [targetIdentifier]);

  const [article, setArticle] = useState(initialMatch);
  const [allArticles, setAllArticles] = useState(() => {
    try {
      const saved = localStorage.getItem('fgc_portal_articles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeArticle);
        }
      }
    } catch {}
    return BLOG_POSTS.map(normalizeArticle);
  });
  const [loading, setLoading] = useState(() => !initialMatch);

  const articleKey = article?.slug || article?.id || targetIdentifier;
  const likedStorageKey = `fgc_liked_article_${articleKey}`;

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(() => {
    if (typeof initialMatch?.likes === 'number') return initialMatch.likes;
    return getBaseLikes(initialMatch?.slug || targetIdentifier);
  });
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync likes and user's voted state when article loads
  useEffect(() => {
    if (!articleKey) return;
    try {
      const userHasLiked = localStorage.getItem(likedStorageKey) === 'true';
      setIsLiked(userHasLiked);

      let initialCount = typeof article?.likes === 'number' ? article.likes : null;
      if (initialCount === null) {
        try {
          const storedArticles = JSON.parse(localStorage.getItem('fgc_portal_articles') || '[]');
          const stored = storedArticles.find(a => (a.slug || a.id) === articleKey);
          if (stored && typeof stored.likes === 'number') {
            initialCount = stored.likes;
          }
        } catch {}
      }

      if (initialCount === null) {
        initialCount = getBaseLikes(articleKey) + (userHasLiked ? 1 : 0);
      }

      setLikesCount(initialCount);
    } catch (e) {
      console.warn('Error reading like state:', e);
    }
  }, [articleKey, article?.likes]);

  const handleToggleLike = async () => {
    if (!articleKey) return;

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);

    const willLike = !isLiked;
    const nextCount = willLike ? likesCount + 1 : Math.max(0, likesCount - 1);

    setIsLiked(willLike);
    setLikesCount(nextCount);

    // 1. Persist user's personal vote in localStorage to prevent repeat spam
    try {
      if (willLike) {
        localStorage.setItem(likedStorageKey, 'true');
      } else {
        localStorage.removeItem(likedStorageKey);
      }
    } catch {}

    // 2. Update fgc_portal_articles in localStorage
    try {
      const storedArticles = JSON.parse(localStorage.getItem('fgc_portal_articles') || '[]');
      let updated = false;
      const newArticles = storedArticles.map(a => {
        if ((a.slug || a.id) === articleKey) {
          updated = true;
          return { ...a, likes: nextCount };
        }
        return a;
      });
      if (!updated && article) {
        newArticles.push({ ...article, likes: nextCount });
      }
      localStorage.setItem('fgc_portal_articles', JSON.stringify(newArticles));
      window.dispatchEvent(new Event('fgc_articles_updated'));
    } catch {}

    // 3. Sync to Supabase in background
    try {
      if (article?.id) {
        await supabase
          .from('articles')
          .update({ likes: nextCount })
          .eq('id', article.id);
      }
    } catch (err) {
      console.warn('[HelpfulReaction] Supabase update notice (persisted locally):', err?.message);
    }
  };

  // 1. Fetch exact article by slug from Supabase
  useEffect(() => {
    let isMounted = true;

    async function fetchArticleFromSupabase() {
      if (!targetIdentifier) return;
      const cleanTarget = targetIdentifier.toLowerCase().trim();

      // Check if we already have the article locally to prevent layout shifts
      const local = findLocalArticle(cleanTarget);
      if (local) {
        if (isMounted) {
          setArticle(local);
          setLoading(false);
        }
      } else {
        if (isMounted) {
          setArticle(null);
          setLoading(true);
        }
      }

      try {
        // Supabase query matching by slug
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', cleanTarget)
          .maybeSingle();

        if (data && isMounted) {
          const normalized = normalizeArticle(data);
          setArticle(normalized);
          setLoading(false);

          // Update local cache with newly resolved article
          try {
            const saved = localStorage.getItem('fgc_portal_articles');
            let list = saved ? JSON.parse(saved) : [];
            if (Array.isArray(list)) {
              const idx = list.findIndex(a => (a.slug || a.id) === (normalized.slug || normalized.id));
              if (idx >= 0) {
                list[idx] = normalized;
              } else {
                list.push(normalized);
              }
              localStorage.setItem('fgc_portal_articles', JSON.stringify(list));
            }
          } catch {}
          return;
        }

        // If not found by slug, fallback check by ID in Supabase
        const idQuery = await supabase
          .from('articles')
          .select('*')
          .eq('id', cleanTarget)
          .maybeSingle();

        if (idQuery.data && isMounted) {
          const normalized = normalizeArticle(idQuery.data);
          setArticle(normalized);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('[BlogDetailPage] Supabase fetch error, checking local articles:', err);
      } finally {
        if (isMounted) setLoading(false);
      }

      // If not found in Supabase, fallback check in local/bundled
      if (isMounted) {
        const fallback = findLocalArticle(cleanTarget);
        setArticle(fallback);
      }
    }

    fetchArticleFromSupabase();

    return () => {
      isMounted = false;
    };
  }, [targetIdentifier]);

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

  // Scroll to top and set dynamic document title & meta description for SEO
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!article?.title) return;

    // Document title: <Article Title> | FGC Spot
    document.title = `${article.title} | FGC Spot`;

    // Dynamic meta description with article excerpt
    const excerpt = article.excerpt || article.summary || '';
    let metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc ? metaDesc.getAttribute('content') : '';

    if (excerpt) {
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', excerpt);
    }

    // OpenGraph & Social Crawler Meta Tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', `${article.title} | FGC Spot`);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', excerpt);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', window.location.href);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://www.fgcspot.com/blog/${article.slug || targetIdentifier}`);

    return () => {
      if (metaDesc && prevDesc) metaDesc.setAttribute('content', prevDesc);
      document.title = 'FGC Spot — Live Forex, Gold & Crypto Terminals';
    };
  }, [targetIdentifier, article?.title, article?.excerpt, article?.summary, article?.slug]);

  const relatedArticles = useMemo(() => {
    return allArticles.filter(p => p && p.id !== article?.id && p.slug !== article?.slug).slice(0, 3);
  }, [allArticles, article]);

  const cleanTags = useMemo(() => {
    return parseTags(article?.tags);
  }, [article?.tags]);

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

  // Skeleton / Shimmer placeholder while resolving article to eliminate layout shifts and prevent wrong post flashing
  if (loading && !article) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-pulse pb-16 px-4 sm:px-6">
        {/* Top Navigation & Action Skeleton */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-36 bg-slate-200 dark:bg-white/10 rounded-lg" />
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-24 bg-slate-200 dark:bg-white/10 rounded-xl" />
            <div className="h-8 w-20 bg-slate-200 dark:bg-white/10 rounded-xl" />
          </div>
        </div>

        {/* Main Card Skeleton */}
        <div className="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-sm dark:shadow-2xl space-y-6">
          {/* Category & Date Skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-6 w-24 bg-slate-200 dark:bg-white/10 rounded-full" />
            <div className="h-4 w-24 bg-slate-200 dark:bg-white/10 rounded-md" />
            <div className="h-4 w-20 bg-slate-200 dark:bg-white/10 rounded-md" />
          </div>

          {/* Title Skeleton */}
          <div className="space-y-3">
            <div className="h-9 sm:h-11 w-11/12 bg-slate-200 dark:bg-white/10 rounded-xl" />
            <div className="h-9 sm:h-11 w-3/5 bg-slate-200 dark:bg-white/10 rounded-xl" />
          </div>

          {/* Author Bar Skeleton */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded-md" />
                <div className="h-3 w-48 bg-slate-200 dark:bg-white/10 rounded-md" />
              </div>
            </div>
            <div className="h-8 w-28 bg-slate-200 dark:bg-white/10 rounded-full hidden sm:block" />
          </div>

          {/* Featured Image Skeleton (exact match h-64 sm:h-96 rounded-2xl to prevent layout shift) */}
          <div className="w-full h-64 sm:h-96 rounded-2xl bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-300/60 dark:bg-white/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
          </div>

          {/* Executive Summary Skeleton */}
          <div className="p-6 rounded-2xl bg-slate-100 dark:bg-[#06111F] border-l-4 border-[#00E676]/40 space-y-2">
            <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded-md" />
            <div className="h-4 w-full bg-slate-200 dark:bg-white/10 rounded-md" />
            <div className="h-4 w-4/5 bg-slate-200 dark:bg-white/10 rounded-md" />
          </div>

          {/* Content Body Paragraphs Skeleton */}
          <div className="space-y-3 pt-2">
            <div className="h-4 w-full bg-slate-200 dark:bg-white/10 rounded-md" />
            <div className="h-4 w-11/12 bg-slate-200 dark:bg-white/10 rounded-md" />
            <div className="h-4 w-full bg-slate-200 dark:bg-white/10 rounded-md" />
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-white/10 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

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

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleLike}
            title={isLiked ? "You marked this as helpful" : "Mark as helpful"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer shadow-xs ${
              isLiked
                ? 'bg-[#00E676]/15 border-[#00E676]/50 text-[#00E676] ring-1 ring-[#00E676]/30'
                : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 text-slate-700 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white'
            } ${isAnimating ? 'scale-110' : 'hover:-translate-y-0.5'}`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#00E676] text-[#00E676]' : 'text-[#00E676]'}`} />
            <span>{isLiked ? 'Helpful' : 'Helpful'}</span>
            <span className={`px-1.5 py-0.2 rounded-md font-tabular text-[11px] ${
              isLiked ? 'bg-[#00E676]/20 text-[#00E676]' : 'bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-300'
            }`}>
              {likesCount}
            </span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 text-slate-700 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Share</span>
          </button>
        </div>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10 mb-8 gap-4">
          <div className="flex items-center gap-3">
            {article.author?.includes('Sufyan Saleem') ? (
              <img
                src="/sufyan-author.jpg"
                alt="Sufyan Saleem - Financial Analyst"
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-[#00E676]/40 shadow-xs shrink-0"
                width="40"
                height="40"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 flex items-center justify-center text-[#00E676] font-bold shrink-0">
                <User className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{article.author || 'Sufyan Saleem'}</div>
              <div className="text-xs text-slate-500 dark:text-[#A8B3C2] font-medium">
                {article.author?.includes('Sufyan Saleem') 
                  ? 'Contributing Financial Columnist & Forex Analyst' 
                  : 'FGC Spot Financial Research Desk • Independent Intelligence'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handleToggleLike}
              title={isLiked ? "You marked this as helpful" : "Mark as helpful"}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all duration-300 cursor-pointer shadow-xs ${
                isLiked
                  ? 'bg-[#00E676]/15 border-[#00E676]/50 text-[#00E676] ring-1 ring-[#00E676]/30'
                  : 'bg-slate-100 dark:bg-[#06111F] border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 text-slate-700 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white'
              } ${isAnimating ? 'scale-105' : 'hover:-translate-y-0.5'}`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#00E676] text-[#00E676]' : 'text-[#00E676]'}`} />
              <span>{isLiked ? 'Helpful' : 'Helpful'}</span>
              <span className={`px-2 py-0.5 rounded-full font-tabular text-[11px] font-bold ${
                isLiked ? 'bg-[#00E676]/20 text-[#00E676]' : 'bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-300'
              }`}>
                {likesCount}
              </span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 text-xs text-[#00E676] bg-[#00E676]/10 px-3 py-1.5 rounded-full border border-[#00E676]/20 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Editorial Verified</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {article.image && (
          <div className="w-full h-64 sm:h-96 rounded-2xl overflow-hidden mb-8 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#06111F] relative">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
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

        {/* Helpful Reader Reaction & Share Banner */}
        <div 
          className="mt-10 p-4 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-[#06111F]/70 border border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full max-w-full box-border overflow-hidden"
          style={{ boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-3.5 w-full md:w-auto min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676] shrink-0">
              <ThumbsUp className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">Did this analysis help you?</h4>
              <p className="text-xs text-slate-500 dark:text-[#A8B3C2] leading-relaxed">Your reaction supports our independent macroeconomic research desk.</p>
            </div>
          </div>

          <div 
            className="flex flex-wrap items-center justify-start md:justify-end gap-3 w-full md:w-auto box-border"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', boxSizing: 'border-box' }}
          >
            <button
              onClick={handleToggleLike}
              className={`flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer shadow-sm box-border shrink-0 ${
                isLiked
                  ? 'bg-[#00E676] text-[#06111F] border-[#00E676] shadow-md shadow-[#00E676]/25 font-black ring-2 ring-[#00E676]/30'
                  : 'bg-white dark:bg-[#0A1726] hover:bg-slate-50 dark:hover:bg-[#0D1B2A] border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 text-slate-800 dark:text-white'
              } ${isAnimating ? 'scale-105' : 'hover:-translate-y-0.5'}`}
            >
              <ThumbsUp className={`w-4 h-4 shrink-0 ${isLiked ? 'fill-[#06111F]' : 'text-[#00E676]'}`} />
              <span>{isLiked ? 'Marked as Helpful' : 'Helpful'}</span>
              <span className={`px-2 py-0.5 rounded-lg text-xs font-tabular font-bold shrink-0 ${
                isLiked ? 'bg-[#06111F]/20 text-[#06111F]' : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-[#00E676]'
              }`}>
                {likesCount}
              </span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-white dark:bg-[#0A1726] hover:bg-slate-50 dark:hover:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 text-slate-700 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs box-border shrink-0"
            >
              <Share2 className="w-3.5 h-3.5 text-[#00E676] shrink-0" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Market Tickers & Editorial Tags */}
        {cleanTags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-2 w-full max-w-full box-border">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#A8B3C2] uppercase tracking-wider flex items-center gap-1.5 mr-1 shrink-0">
              <Tag className="w-3.5 h-3.5 text-[#00E676]" />
              TAGS:
            </span>
            {cleanTags.map((tag, tIdx) => (
              <span 
                key={tIdx} 
                className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#06111F] text-slate-600 dark:text-[#A8B3C2] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

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
