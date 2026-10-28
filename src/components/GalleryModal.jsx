import React, { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { CURATED_FINANCIAL_GALLERY, GALLERY_CATEGORIES } from '../data/curatedGallery';

export default function GalleryModal({ isOpen, onClose, onSelect, currentUrl = '' }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (!isOpen) return null;

  const filteredImages = selectedCategory === 'All'
    ? CURATED_FINANCIAL_GALLERY
    : CURATED_FINANCIAL_GALLERY.filter(img => img.category === selectedCategory);

  const handleSelect = (url) => {
    if (typeof onSelect === 'function') {
      onSelect(url);
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Curated Financial Cover Gallery
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#A8B3C2]">
                Select an institutional, high-resolution cover photo for your article
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close Gallery"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 p-4 sm:px-6 overflow-x-auto border-b border-slate-100 dark:border-white/5 scrollbar-none text-xs">
          {GALLERY_CATEGORIES.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === category
                  ? 'bg-[#00E676] text-[#06111F] shadow-sm font-bold'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#A8B3C2] hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gallery Image Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredImages.map(item => {
            const isSelected = currentUrl === item.url;
            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item.url)}
                className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 bg-slate-100 dark:bg-[#06111F] aspect-[16/10] hover:-translate-y-1 hover:shadow-xl ${
                  isSelected
                    ? 'border-[#00E676] ring-2 ring-[#00E676]/40'
                    : 'border-slate-200 dark:border-white/10 hover:border-[#00E676]/60'
                }`}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/60 text-[#00E676] backdrop-blur-sm border border-[#00E676]/20">
                      {item.category}
                    </span>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-[#00E676] text-[#06111F] flex items-center justify-center font-bold shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white line-clamp-1 group-hover:text-[#00E676] transition-colors">
                      {item.title}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-[#A8B3C2]">
            {filteredImages.length} verified high-resolution images available
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
