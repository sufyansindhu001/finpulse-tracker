import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  ArrowRight, 
  Coins, 
  Globe, 
  BookOpen, 
  TrendingUp,
  LineChart,
  ArrowLeftRight,
  Sparkles
} from 'lucide-react';
import { CURRENCIES } from '../data/currencies';
import { useApp } from '../context/AppContext';
import { BLOG_POSTS } from '../data/blogPosts';
import CurrencyFlag from './CurrencyFlag';

export default function SearchModal({ isOpen, onClose, cryptoList = [] }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { articles = [] } = useApp();
  const allArticles = Array.isArray(articles) && articles.length > 0 ? articles : BLOG_POSTS;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const defaultCryptos = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', current_price: 96420 },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', current_price: 2745.50 },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', current_price: 648.20 },
    { id: 'solana', symbol: 'SOL', name: 'Solana', current_price: 194.50 },
    { id: 'ripple', symbol: 'XRP', name: 'XRP', current_price: 2.34 },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', current_price: 0.82 },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', current_price: 0.28 },
    { id: 'tron', symbol: 'TRX', name: 'TRON', current_price: 0.24 },
  ];

  const sourceCrypto = (cryptoList && cryptoList.length > 0) ? cryptoList : defaultCryptos;

  const preciousMetals = [
    { id: 'gold-24k', code: 'XAU', name: 'Gold 24K (Pure Bullion)', purity: '24K', unit: 'tola', type: 'metal' },
    { id: 'gold-22k', code: 'XAU', name: 'Gold 22K (Jewelry Standard)', purity: '22K', unit: 'tola', type: 'metal' },
    { id: 'silver-spot', code: 'XAG', name: 'Silver Spot (Fine 999)', purity: '24K', unit: 'tola', type: 'metal' }
  ];

  const results = useMemo(() => {
    if (!query.trim()) return { cryptos: [], currencies: [], metals: [], articles: [] };
    const q = query.trim().toLowerCase();

    // 1. Detect if query is a currency pair like "USD/PKR" or "USD to PKR" or "EUR-USD"
    const pairRegex = /^([a-z]{3})\s*(?:\/|\s+to\s+|-)\s*([a-z]{3})$/i;
    const pairMatch = q.match(pairRegex);
    let pairResult = null;
    if (pairMatch) {
      pairResult = {
        from: pairMatch[1].toUpperCase(),
        to: pairMatch[2].toUpperCase()
      };
    }

    const matchingCryptos = sourceCrypto
      .filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
      .slice(0, 4);

    const matchingCurrencies = CURRENCIES
      .filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
      .slice(0, 5);

    const matchingMetals = preciousMetals
      .filter(m => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q) || q.includes('gold') || q.includes('silver') || q.includes('tola') || q.includes('metal'))
      .slice(0, 3);

    const matchingArticles = allArticles
      .filter(a => (a?.title || '').toLowerCase().includes(q) || (a?.summary || '').toLowerCase().includes(q))
      .slice(0, 3);

    return {
      pairResult,
      cryptos: matchingCryptos,
      currencies: matchingCurrencies,
      metals: matchingMetals,
      articles: matchingArticles
    };
  }, [query, sourceCrypto, allArticles]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-white/10 gap-3 bg-slate-50 dark:bg-[#06111F]">
          <Search className="w-5 h-5 text-[#00E676] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search currency (USD, PKR), crypto (BTC), gold, or guides..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#A8B3C2] focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 text-slate-500 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs font-medium scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
          {!query.trim() ? (
            <div className="py-6 text-center text-slate-500 dark:text-[#A8B3C2] space-y-2">
              <span className="block font-semibold text-slate-900 dark:text-white">Instant Deep Financial Instrument Search</span>
              <div className="flex flex-wrap justify-center gap-2 pt-1 text-[11px]">
                <button onClick={() => setQuery('USD/PKR')} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 text-[#00E676] hover:border-[#00E676]">USD/PKR</button>
                <button onClick={() => setQuery('BTC')} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 text-[#00E676] hover:border-[#00E676]">Bitcoin</button>
                <button onClick={() => setQuery('Gold 24K')} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 text-[#00E676] hover:border-[#00E676]">Gold 24K</button>
                <button onClick={() => setQuery('Forex Volatility')} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 text-[#00E676] hover:border-[#00E676]">Forex Guide</button>
              </div>
            </div>
          ) : (
            <>
              {/* Currency Pair Quick Converter & Chart Shortcut */}
              {results.pairResult && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#06111F] border border-[#00E676]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#00E676] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Direct Currency Corridor Match</span>
                    </span>
                    <span className="text-slate-900 dark:text-white font-extrabold">{results.pairResult.from} / {results.pairResult.to}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        navigate(`/converter?from=${results.pairResult.from}&to=${results.pairResult.to}`);
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#00E676] text-[#06111F] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>Convert Corridor</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/charts?pair=${results.pairResult.from}-${results.pairResult.to}`);
                        onClose();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:border-[#00E676]/40 cursor-pointer shadow-xs"
                    >
                      <LineChart className="w-3.5 h-3.5 text-[#00E676]" />
                      <span>View Chart</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Currencies matches */}
              {results.currencies.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-[#A8B3C2] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>Currencies &bull; Deep Links</span>
                  </div>
                  <div className="space-y-1">
                    {results.currencies.map(curr => (
                      <div
                        key={curr.code}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors group"
                      >
                        <div 
                          onClick={() => {
                            navigate(`/converter?from=${curr.code}&to=PKR`);
                            onClose();
                          }}
                          className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                        >
                          <CurrencyFlag code={curr.code} className="w-5 h-4 rounded shadow-xs shrink-0" />
                          <div className="truncate">
                            <span className="text-slate-900 dark:text-white font-bold">{curr.name}</span>
                            <span className="text-[#00E676] font-bold ml-1.5 font-mono">({curr.code})</span>
                          </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <button
                            onClick={() => {
                              navigate(`/converter?from=${curr.code}&to=PKR`);
                              onClose();
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-[#06111F] text-[#00E676] hover:bg-[#00E676] hover:text-[#06111F] border border-slate-200 dark:border-white/10 font-bold text-[10px] transition-all cursor-pointer"
                            title="Convert with PKR"
                          >
                            Convert
                          </button>
                          <button
                            onClick={() => {
                              navigate(`/rates?asset=${curr.code}&tab=currencies`);
                              onClose();
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-[#06111F] text-slate-600 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 font-bold text-[10px] transition-all cursor-pointer"
                            title="Highlight in rates matrix"
                          >
                            Rate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cryptocurrencies matches */}
              {results.cryptos.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-[#A8B3C2] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>Cryptocurrencies &bull; Deep Links</span>
                  </div>
                  <div className="space-y-1">
                    {results.cryptos.map(coin => (
                      <div
                        key={coin.id}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:border-white/10 transition-colors group"
                      >
                        <div 
                          onClick={() => {
                            navigate(`/crypto?asset=${coin.symbol.toUpperCase()}`);
                            onClose();
                          }}
                          className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                        >
                          <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 flex items-center justify-center text-[10px] font-black text-[#00E676]">
                            {coin.symbol.slice(0, 3)}
                          </div>
                          <div className="truncate">
                            <span className="text-slate-900 dark:text-white font-bold">{coin.name}</span>
                            <span className="text-slate-500 dark:text-[#A8B3C2] font-mono ml-1.5 uppercase">({coin.symbol})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-slate-900 dark:text-white font-bold tabular-nums">
                            ${coin.current_price?.toLocaleString()}
                          </span>
                          <button
                            onClick={() => {
                              navigate(`/rates?asset=${coin.symbol.toUpperCase()}&tab=crypto`);
                              onClose();
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-[#06111F] text-[#00E676] hover:bg-[#00E676] hover:text-[#06111F] border border-slate-200 dark:border-white/10 font-bold text-[10px] transition-all cursor-pointer"
                          >
                            Terminal
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gold & Bullion matches */}
              {results.metals.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-[#A8B3C2] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>Gold &amp; Precious Metals &bull; Deep Links</span>
                  </div>
                  <div className="space-y-1">
                    {results.metals.map(metal => (
                      <div
                        key={metal.id}
                        onClick={() => {
                          navigate(`/gold?purity=${metal.purity}&unit=${metal.unit}`);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:border-white/10 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-[10px]">
                            Au
                          </span>
                          <span className="text-slate-900 dark:text-white font-bold">{metal.name}</span>
                        </div>
                        <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px] group-hover:underline flex items-center gap-1">
                          <span>Bullion Rates</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Research & Blog Articles */}
              {results.articles.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-[#A8B3C2] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>Financial Guides &amp; Blog</span>
                  </div>
                  <div className="space-y-1">
                    {results.articles.map(art => (
                      <div
                        key={art.id}
                        onClick={() => {
                          navigate(`/blog/${art.slug || art.id}`);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:border-white/10 cursor-pointer transition-colors group"
                      >
                        <span className="text-slate-900 dark:text-white font-medium truncate max-w-sm group-hover:text-[#00E676] transition-colors">{art.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#A8B3C2] group-hover:text-[#00E676] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.cryptos.length === 0 && results.currencies.length === 0 && results.metals.length === 0 && results.articles.length === 0 && !results.pairResult && (
                <div className="py-8 text-center text-slate-500 dark:text-[#A8B3C2]">
                  No instruments found matching "{query}". Try "USD", "BTC", "Gold", or "Forex".
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#06111F] border-t border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-[#A8B3C2] flex justify-between font-medium">
          <span>ESC to close</span>
          <span className="text-[#00E676] font-mono">FGC Spot Deep Router</span>
        </div>
      </div>
    </div>
  );
}
