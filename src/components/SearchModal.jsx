import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Coins, Globe, BookOpen, Layers } from 'lucide-react';
import { CURRENCIES } from '../data/currencies';
import { useApp } from '../context/AppContext';

export default function SearchModal({ isOpen, onClose, cryptoList = [] }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { articles = [] } = useApp();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle modal
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return { cryptos: [], currencies: [], articles: [] };
    const q = query.toLowerCase();

    const matchingCryptos = (cryptoList || [])
      .filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
      .slice(0, 4);

    const matchingCurrencies = CURRENCIES
      .filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
      .slice(0, 4);

    const matchingArticles = (Array.isArray(articles) ? articles : [])
      .filter(a => (a?.title || '').toLowerCase().includes(q))
      .slice(0, 3);

    return {
      cryptos: matchingCryptos,
      currencies: matchingCurrencies,
      articles: matchingArticles
    };
  }, [query, cryptoList, articles]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#0C1017] border border-slate-200 dark:border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-white/[0.08] gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search currencies, crypto tokens, or research reports..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-mono"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs font-mono">
          {!query.trim() ? (
            <div className="py-6 text-center text-slate-500">
              <span className="block mb-1">Quick Search for Market Instruments</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-600">Type "USD", "Bitcoin", "PKR", "Gold", or "Rate"</span>
            </div>
          ) : (
            <>
              {/* Crypto matches */}
              {results.cryptos.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Coins className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                    <span>Cryptocurrencies</span>
                  </div>
                  <div className="space-y-1">
                    {results.cryptos.map(coin => (
                      <div
                        key={coin.id}
                        onClick={() => {
                          navigate('/crypto');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {coin.image && <img src={coin.image} alt={coin.name} className="w-4 h-4 rounded-full" />}
                          <span className="text-slate-900 dark:text-white font-bold">{coin.name}</span>
                          <span className="text-slate-500 uppercase">({coin.symbol})</span>
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 font-bold tabular-nums">
                          ${coin.current_price?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Currency matches */}
              {results.currencies.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                    <span>World Currencies</span>
                  </div>
                  <div className="space-y-1">
                    {results.currencies.map(curr => (
                      <div
                        key={curr.code}
                        onClick={() => {
                          navigate('/forex');
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span>{curr.flag}</span>
                          <span className="text-slate-900 dark:text-white font-bold">{curr.name}</span>
                          <span className="text-slate-500">({curr.code})</span>
                        </div>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">{curr.symbol}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Research matches */}
              {results.articles.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                    <span>Research Articles</span>
                  </div>
                  <div className="space-y-1">
                    {results.articles.map(art => (
                      <div
                        key={art.id}
                        onClick={() => {
                          navigate(`/blog/${art.id}`);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] cursor-pointer transition-colors"
                      >
                        <span className="text-slate-800 dark:text-slate-200 truncate max-w-sm">{art.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.cryptos.length === 0 && results.currencies.length === 0 && results.articles.length === 0 && (
                <div className="py-6 text-center text-slate-500">
                  No market results found for "{query}".
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#07090E] border-t border-slate-200 dark:border-white/[0.06] text-[10px] text-slate-500 flex justify-between font-mono">
          <span>Press ESC to close</span>
          <span>FinPulse Real-Time Engine</span>
        </div>
      </div>
    </div>
  );
}
