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
        text: article.summary,
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
      <nav className="flex items-center gap-2 text-xs text-[#A8B3C2] flex-wrap">
        <Link 
          to="/"
          className="hover:text-white transition-colors font-medium"
        >
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link 
          to="/blog"
          className="hover:text-white transition-colors font-medium flex items-center gap-1"
        >
          <span>Market Analysis &amp; Blog</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#00E676] font-semibold">{article.category}</span>
        <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
        <span className="truncate max-w-[220px] hidden sm:inline text-white font-medium">{article.title}</span>
      </nav>

      {/* Main Article Container */}
      <div className="bg-[#0A1726] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
          <span className="px-3 py-1 rounded-full font-bold bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
            {article.category}
          </span>
          <span className="flex items-center gap-1.5 text-[#A8B3C2] font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#00E676]" />
            {article.date}
          </span>
          <span className="flex items-center gap-1.5 text-[#A8B3C2] font-medium">
            <Clock className="w-3.5 h-3.5 text-[#00E676]" />
            {article.readTime}
          </span>
          <button
            onClick={handleShare}
            className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#06111F] hover:bg-[#0D1B2A] text-white text-xs font-semibold border border-white/10 hover:border-[#00E676]/40 transition-all cursor-pointer shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Share</span>
          </button>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6">
          {article.title}
        </h1>

        {/* Author Bio Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#06111F] border border-white/10 flex items-center justify-center text-[#00E676] font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{article.author || 'FGC Spot Macro Research Desk'}</div>
              <div className="text-xs text-[#A8B3C2] font-medium">FGC Spot Financial Research Desk &bull; Independent Intelligence</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#00E676] bg-[#00E676]/10 px-3 py-1 rounded-full border border-[#00E676]/20 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Editorial Peer Verified</span>
          </div>
        </div>

        {/* Featured Image */}
        {article.image && (
          <div className="w-full h-64 sm:h-96 rounded-2xl overflow-hidden mb-8 border border-white/10 bg-[#06111F]">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Executive Summary Callout */}
        <div className="p-6 rounded-2xl bg-[#06111F] border-l-4 border-[#00E676] border-t border-r border-b border-white/10 mb-8 text-[#A8B3C2] text-sm sm:text-base italic leading-relaxed">
          <strong className="text-white font-semibold not-italic block mb-1">Executive Takeaway:</strong>
          "{article.summary}"
        </div>

        {/* Full Article Content */}
        <div className="text-[#A8B3C2] text-base leading-relaxed space-y-6">
          {article.content.split('\n\n').map((paragraph, idx) => {
            const trimmed = paragraph.trim();
            if (trimmed.startsWith('###')) {
              return (
                <h2 key={idx} className="text-xl sm:text-2xl font-extrabold text-white pt-6 pb-2 border-b border-white/10">
                  {trimmed.replace('###', '').trim()}
                </h2>
              );
            }
            if (trimmed.startsWith('*') || trimmed.startsWith('1.')) {
              return (
                <div key={idx} className="my-4 pl-4 border-l-2 border-[#00E676]/50 space-y-2 py-1">
                  {trimmed.split('\n').map((line, lIdx) => (
                    <div key={lIdx} className="flex items-start gap-2 text-sm sm:text-base">
                      <span className="text-[#00E676] font-bold shrink-0">&bull;</span>
                      <span className="text-[#A8B3C2]">{line.replace(/^[*•-]\s*/, '').replace(/^\d+\.\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              );
            }
            return (
              <p key={idx} className="leading-relaxed">
                {trimmed}
              </p>
            );
          })}
        </div>

        {/* Market Tickers & Editorial Tags */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#A8B3C2] uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Tag className="w-3.5 h-3.5 text-[#00E676]" />
            TAGS:
          </span>
          {(Array.isArray(article.tags) ? article.tags : (typeof article.tags === 'string' ? article.tags.split(',') : [])).map((tag, tIdx) => (
            <span 
              key={tIdx} 
              className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-[#06111F] text-[#A8B3C2] border border-white/10"
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
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
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
                className="p-4 rounded-2xl bg-[#0A1726] border border-white/10 hover:border-[#00E676]/40 transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#00E676] uppercase tracking-wider">
                    {rel.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00E676] transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                </div>
                <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#A8B3C2]">
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
