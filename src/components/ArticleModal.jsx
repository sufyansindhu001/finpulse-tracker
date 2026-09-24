import React from 'react';
import { X, Calendar, Clock, User, Tag, Share2, ArrowLeft } from 'lucide-react';

export default function ArticleModal({ article, onClose }) {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl my-8 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close article"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Back Link */}
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </button>

        {/* Category & Date */}
        <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
          <span className="px-2.5 py-1 rounded-full font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {article.category}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {article.date}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            {article.readTime}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-4">
          {article.title}
        </h1>

        {/* Author info */}
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800 mb-6">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">{article.author}</div>
            <div className="text-[11px] text-slate-400">Market Research & Insights</div>
          </div>
        </div>

        {/* Featured Image */}
        {article.image && (
          <div className="w-full h-56 sm:h-72 rounded-xl overflow-hidden mb-6 border border-slate-800 relative">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Summary callout */}
        <div className="p-4 rounded-xl bg-slate-950/70 border-l-4 border-blue-500 mb-6 text-slate-300 text-sm italic">
          "{article.summary}"
        </div>

        {/* Article Body */}
        <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
          {article.content.split('\n\n').map((paragraph, idx) => {
            const trimmed = paragraph.trim();
            if (trimmed.startsWith('###')) {
              return (
                <h3 key={idx} className="text-lg sm:text-xl font-bold text-white pt-4 pb-1">
                  {trimmed.replace('###', '').trim()}
                </h3>
              );
            }
            if (trimmed.startsWith('*') || trimmed.startsWith('1.')) {
              return (
                <div key={idx} className="pl-4 border-l-2 border-slate-700 space-y-2 py-1 text-slate-300 text-sm">
                  {trimmed.split('\n').map((line, lIdx) => (
                    <p key={lIdx} className="my-1">{line.replace(/^[*•-]\s*/, '').replace(/^\d+\.\s*/, '')}</p>
                  ))}
                </div>
              );
            }
            return (
              <p key={idx} className="text-slate-300">
                {trimmed}
              </p>
            );
          })}
        </div>

        {/* Tags */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <Tag className="w-4 h-4 text-slate-500 mr-1" />
          {article.tags?.map((tag) => (
            <span 
              key={tag} 
              className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-6 p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
          <strong>Editorial Disclaimer:</strong> This article is published for educational and analytical purposes only. It should not be construed as investment, tax, or financial advice.
        </div>
      </div>
    </div>
  );
}
