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
  BookOpen 
} from 'lucide-react';

export default function ArticleView() {
  const { id } = useParams();
  const { articles = [] } = useApp();
  const safeArticles = Array.isArray(articles) ? articles : [];

  // Scroll to top on navigation to this article
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Find article by id or slug
  const article = safeArticles.find(p => p && (p.id === id || p.slug === id)) || safeArticles[0] || null;

  const relatedArticles = safeArticles.filter(p => p && p.id !== article?.id).slice(0, 3);


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
      <div className="w-full max-w-3xl mx-auto py-16 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Article Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">The requested financial analysis article does not exist or has been moved.</p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Blog & Market Analysis</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      
      {/* Breadcrumb Navigation with dynamic router links */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
        <Link 
          to="/"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
        >
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link 
          to="/blog"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium flex items-center gap-1"
        >
          <span>Market Analysis & Blog</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-blue-600 dark:text-blue-400 font-semibold">{article.category}</span>
        <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
        <span className="truncate max-w-[200px] hidden sm:inline text-slate-700 dark:text-slate-300">{article.title}</span>
      </nav>

      {/* Main Article Container */}
      <div className="bg-white/80 dark:bg-[#0B0F19]/90 border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
        
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
          <span className="px-3 py-1 rounded-full font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            {article.category}
          </span>
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium font-mono">
            <Calendar className="w-3.5 h-3.5" />
            {article.date}
          </span>
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium font-mono">
            <Clock className="w-3.5 h-3.5" />
            {article.readTime}
          </span>
          <button
            onClick={handleShare}
            className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-white/[0.08] transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
          {article.title}
        </h1>

        {/* Author Bio Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-white/[0.06] mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 flex items-center justify-center text-blue-500 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{article.author}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Senior Financial & Macro Research Analyst</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Peer-Reviewed & Fact Checked</span>
          </div>
        </div>

        {/* Featured Image */}
        {article.image && (
          <div className="w-full h-64 sm:h-96 rounded-2xl overflow-hidden mb-8 border border-slate-200/80 dark:border-white/[0.08] shadow-md">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        )}

        {/* Executive Summary Callout */}
        <div className="p-6 rounded-2xl bg-blue-500/5 dark:bg-white/[0.02] border-l-4 border-blue-500 mb-8 text-slate-700 dark:text-slate-300 text-sm sm:text-base italic leading-relaxed">
          <strong className="text-slate-900 dark:text-white font-semibold">Executive Takeaway:</strong> "{article.summary}"
        </div>

        {/* Full Article Content with Proper Headings & Formatting */}
        <div className="text-slate-800 dark:text-slate-200 text-base leading-relaxed space-y-5">
          {article.content.split('\n\n').map((paragraph, idx) => {
            const trimmed = paragraph.trim();
            if (trimmed.startsWith('###')) {
              return (
                <h2 key={idx} className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white pt-6 pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                  {trimmed.replace('###', '').trim()}
                </h2>
              );
            }
            if (trimmed.startsWith('*') || trimmed.startsWith('1.')) {
              return (
                <div key={idx} className="my-4 pl-4 border-l-2 border-blue-500/50 dark:border-blue-500/30 space-y-2 py-1">
                  {trimmed.split('\n').map((line, lIdx) => (
                    <div key={lIdx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                      <span className="text-blue-500 font-bold shrink-0">•</span>
                      <span>{line.replace(/^[*•-]\s*/, '').replace(/^\d+\.\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              );
            }
            return (
              <p key={idx} className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {trimmed}
              </p>
            );
          })}
        </div>

        {/* Tags */}
        <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-white/[0.06] flex flex-wrap items-center gap-2">
          <Tag className="w-4 h-4 text-slate-400 mr-1" />
          {(Array.isArray(article.tags) ? article.tags : (typeof article.tags === 'string' ? article.tags.split(',') : [])).map((tag, tIdx) => (
            <span 
              key={tIdx} 
              className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] font-mono font-medium"
            >
              #{tag.trim()}
            </span>
          ))}

        </div>

        {/* AdSense Compliance Editorial Disclaimer */}
        <div className="mt-8 p-4.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <strong className="text-slate-800 dark:text-slate-200">Editorial & Financial Standards:</strong> All articles published on FinPulse are independent, objective market research. We do not offer registered financial advice, broker recommendations, or securities trading signals. Always consult an authorized financial advisor before executing high-volume currency or cryptocurrency transactions.
        </div>

      </div>

      {/* Related Analysis Section with Router Links */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Related Financial Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {relatedArticles.map((rel) => (
            <Link
              key={rel.id}
              to={`/blog/${rel.id}`}
              className="bg-white/80 dark:bg-[#0B0F19]/90 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 hover:border-blue-500/50 hover:shadow-xl transition-all cursor-pointer group shadow-sm flex flex-col justify-between backdrop-blur-2xl"
            >
              <div>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block mb-1 font-mono">
                  {rel.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors line-clamp-2">
                  {rel.title}
                </h4>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span>{rel.readTime}</span>
                <span className="font-bold text-blue-500 group-hover:translate-x-1 transition-transform">Read →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </article>
  );
}
