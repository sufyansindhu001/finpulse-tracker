import React, { useState, useMemo } from 'react';
import { X, Sparkles } from 'lucide-react';
import { PRE_BUILT_SCREENS } from '../data/stocksData';

export default function ScreensModal({ isOpen, onClose, onApplyScreen, activeCountry }) {
  const [activeCategory, setActiveCategory] = useState('Popular');

  const categories = [
    'Popular',
    'Value',
    'Growth',
    'Momentum',
    'Quality',
    'Small-Cap',
    'Sector Focused',
    'Defensive',
    'Dividend',
    'Events'
  ];

  const filteredScreens = useMemo(() => {
    if (activeCategory === 'Popular') {
      return PRE_BUILT_SCREENS;
    }
    return PRE_BUILT_SCREENS.filter(s => s.category.toLowerCase() === activeCategory.toLowerCase());
  }, [activeCategory]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#06111F]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#00E676]" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Screens
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 px-6 py-3 border-b border-slate-200 dark:border-white/10 overflow-x-auto scrollbar-none bg-white dark:bg-[#0A1726]">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#00E676] text-[#06111F] font-extrabold shadow-sm'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#A8B3C2] hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 2-Column Scrollable Grid of Screen Cards */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredScreens.map((screen) => (
              <div
                key={screen.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#00E676] transition-colors">
                      {screen.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-[#A8B3C2] leading-relaxed line-clamp-2">
                      {screen.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onApplyScreen(screen);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 dark:bg-[#00E676] dark:hover:bg-[#00FF88] text-white dark:text-[#06111F] font-bold text-xs transition-all cursor-pointer shrink-0 shadow-xs"
                  >
                    Apply
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-200 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold">
                      {activeCountry?.flag || '🇵🇰'} {activeCountry?.code || 'PK'}
                    </span>
                    <span className="text-[#00E676] font-bold flex items-center gap-1">
                      <span>3 Month Return {screen.return3M}</span>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold">
                    {screen.riskLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#06111F] flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredScreens.length} pre-built quantitative strategies</span>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 dark:text-slate-300 hover:text-[#00E676] cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
