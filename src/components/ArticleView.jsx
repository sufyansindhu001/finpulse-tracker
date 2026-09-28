import React, { useEffect } from 'react';
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

function formatInlineText(text) {
  if (!text) return '';
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-slate-900 dark:text-white font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function ArticleView() {
  const { slug, id } = useParams();
  const targetIdentifier = slug || id;

  const { articles = [] } = useApp();
  const allArticles = Array.isArray(articles) && articles.length > 0 ? articles : BLOG_POSTS;

  // Find article by id or slug
  const article = allArticles.find(
    p => p && (p.slug === targetIdentifier || p.id === targetIdentifier)
  ) || allArticles[0] || null;

  // Scroll to top and set document title
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (article?.title) {
      document.title = `${article.title} | FGC Spot Analysis`;
    }
  }, [targetIdentifier, article?.title]);

  const relatedArticles = allArticles.filter(p => p && p.id !== article?.id).slice(0, 3);

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
        <h2 className="text-2xl font-bold text-white">Article Not Found</h2>
        <p className="text-sm text-[#A8B3C2]">The requested financial analysis article does not exist or has been moved.</p>
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
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A8B3C2] flex-wrap">
        <Link 
          to="/"
          className="hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
        >
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link 
          to="/blog"
          className="hover:text-slate-900 dark:hover:text-white transition-colors font-medium flex items-center gap-1"
        >
          <span>Market Analysis &amp; Blog</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#00E676] font-semibold">{article.category}</span>
        <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
        <span className="truncate max-w-[220px] hidden sm:inline text-slate-900 dark:text-white font-medium">{article.title}</span>
      </nav>

      {/* Main Article Container */}
      <div className="bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-xl">
        
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
          <span className="px-3 py-1 rounded-full font-bold bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
            {article.category}
          </span>
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-[#A8B3C2] font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#00E676]" />
            {article.date}
          </span>
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-[#A8B3C2] font-medium">
            <Clock className="w-3.5 h-3.5 text-[#00E676]" />
            {article.readTime}
          </span>
          <button
            onClick={handleShare}
            className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#06111F] hover:bg-slate-200 dark:hover:bg-[#0D1B2A] text-slate-700 dark:text-white text-xs font-semibold border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 transition-all cursor-pointer shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Share</span>
          </button>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
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
          {article.content.replace(/\n(?=\d+\.\s)/g, '\n\n').split('\n\n').map((paragraph, idx) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            // Horizontal Rule
            if (trimmed === '---' || trimmed === '***') {
              return <hr key={idx} className="my-8 border-slate-200 dark:border-white/10" />;
            }

            // Subheadings (H4 -> H3)
            if (trimmed.startsWith('####')) {
              return (
                <h3 key={idx} className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-3 pb-1">
                  {trimmed.replace(/^####\s*/, '')}
                </h3>
              );
            }

            // Headings (H3 -> H2)
            if (trimmed.startsWith('###')) {
              return (
                <h2 key={idx} className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white pt-6 pb-2 border-b border-slate-200 dark:border-white/10">
                  {trimmed.replace(/^###\s*/, '')}
                </h2>
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
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedArticles.map((rel) => (
              <Link
                key={rel.id}
                to={`/blog/${rel.slug || rel.id}`}
                className="p-4 rounded-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 transition-all duration-200 group flex flex-col justify-between shadow-xs"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider">
                    {rel.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#00E676] transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-[#A8B3C2]">
                  <span>{rel.readTime}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#00E676] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </article>
  );
}
