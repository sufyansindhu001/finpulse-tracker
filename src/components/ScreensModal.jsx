import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  // Prevent background body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const filteredScreens = useMemo(() => {
    const screens = Array.isArray(PRE_BUILT_SCREENS) ? PRE_BUILT_SCREENS : [];
    if (activeCategory === 'Popular') {
      return screens;
    }
    const targetCat = (activeCategory || '').toLowerCase();
    return screens.filter(s => s && String(s.category || '').toLowerCase() === targetCat);
  }, [activeCategory]);


  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-[4px] animate-in fade-in duration-200"
      style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-6 flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00E676]/10 flex items-center justify-center border border-[#00E676]/20">
              <Sparkles className="w-4 h-4 text-[#00E676]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                Screens
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Quantitative institutional screeners for {activeCountry?.name || 'Global'} equities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 py-3 border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#00E676] text-[#06111F] font-extrabold shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 2-Column Scrollable Grid of Screen Cards */}
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredScreens.map((screen) => (
              <div
                key={screen.id}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-[#00E676]/50 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 group-hover:text-[#00E676] transition-colors">
                      {screen.title}
                    </h3>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed line-clamp-2">
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

                <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold">
                      {activeCountry?.flag || '🇵🇰'} {activeCountry?.code || 'PK'}
                    </span>
                    <span className="text-[#00E676] font-bold flex items-center gap-1">
                      <span>3M Return {screen.return3M}</span>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    {screen.riskLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>Showing {filteredScreens.length} pre-built quantitative strategies</span>
          <button
            onClick={onClose}
            className="font-bold text-gray-800 dark:text-gray-200 hover:text-[#00E676] cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
