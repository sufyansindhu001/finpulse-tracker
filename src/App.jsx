import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate, Link } from 'react-router-dom';
import { fetchLiveExchangeRates, DEFAULT_RATES } from './services/forexService';
import { fetchLiveCryptoMarkets } from './services/cryptoService';

import Header from './components/Header';
import CryptoTickerBar from './components/CryptoTickerBar';
import AdBanner from './components/AdBanner';
import CurrencyConverter from './components/CurrencyConverter';
import CryptoTracker from './components/CryptoTracker';
import QuickConversionMatrix from './components/QuickConversionMatrix';
import BlogSection from './components/BlogSection';
import ArticleView from './components/ArticleView';
import CryptoConverterModal from './components/CryptoConverterModal';
import Footer from './components/Footer';

// Standalone dedicated pages for full Google AdSense & SEO compliance
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import DisclaimerPage from './pages/DisclaimerPage';
import AdminPage from './pages/AdminPage';


import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  CheckCircle
} from 'lucide-react';

export default function App() {
  const navigate = useNavigate();

  // Theme state: initialized from localStorage (defaults to 'dark')
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('finpulse_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Apply theme class to documentElement and persist in localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('finpulse_theme', theme);
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };
  
  // Market data states initialized with reliable DEFAULT_RATES (1 USD = 278.09 PKR)
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [cryptoList, setCryptoList] = useState([]);
  
  // Loading & Error states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isForexLoading, setIsForexLoading] = useState(false);
  const [isCryptoLoading, setIsCryptoLoading] = useState(true);
  const [forexError, setForexError] = useState(null);
  const [cryptoError, setCryptoError] = useState(null);

  // Metadata
  const [forexMeta, setForexMeta] = useState({
    lastUpdated: '',
    source: 'open.er-api.com (Live)'
  });
  const [cryptoMeta, setCryptoMeta] = useState({
    lastUpdated: '',
    source: 'CoinGecko Live API'
  });

  // Quick crypto conversion modal state (retained exclusively for instant math calculation)
  const [selectedCryptoForConvert, setSelectedCryptoForConvert] = useState(null);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // Live Data Fetcher: Calls Open Exchange Rates and CoinGecko concurrently
  const loadLiveData = useCallback(async (isManual = false) => {
    setIsRefreshing(true);

    // 1. Fetch Live Fiat Rates (https://open.er-api.com/v6/latest/USD)
    const forexPromise = fetchLiveExchangeRates()
      .then((res) => {
        if (res && res.rates) {
          setRates(res.rates);
          setForexMeta({
            lastUpdated: res.lastUpdated || new Date().toLocaleTimeString(),
            source: res.source || 'Open Exchange Rates (Live)'
          });
        }
        setForexError(null);
        setIsForexLoading(false);
      })
      .catch((err) => {
        console.warn('Forex fetch warning:', err);
        setIsForexLoading(false);
      });

    // 2. Fetch Live Crypto Markets (CoinGecko public endpoint)
    const cryptoPromise = fetchLiveCryptoMarkets()
      .then((res) => {
        setCryptoList(res.data);
        setCryptoMeta({
          lastUpdated: res.lastUpdated,
          source: res.source
        });
        setCryptoError(null);
        setIsCryptoLoading(false);
      })
      .catch((err) => {
        console.error('Crypto fetch error:', err);
        setCryptoError(err.message || 'Failed to fetch CoinGecko live prices');
        setIsCryptoLoading(false);
      });

    await Promise.allSettled([forexPromise, cryptoPromise]);
    setIsRefreshing(false);

    if (isManual) {
      showToast('Live market rates successfully updated from APIs!');
    }
  }, []);

  // Initial fetch on mount & automatic refresh every 45 seconds
  useEffect(() => {
    loadLiveData(false);

    const interval = setInterval(() => {
      loadLiveData(false);
    }, 45000); // 45 seconds auto-refresh interval

    return () => clearInterval(interval);
  }, [loadLiveData]);

  // Quick pair select handler
  const handleSelectPair = (base, target) => {
    navigate('/');
    window.scrollTo({ top: 120, behavior: 'smooth' });
    showToast(`Loaded ${base} / ${target}`);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans transition-colors duration-200 selection:bg-blue-500 selection:text-white`}>
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom duration-300 border border-blue-400">
          <CheckCircle className="w-4 h-4 text-white" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. Real-time Crypto Marquee Ticker */}
      <CryptoTickerBar 
        cryptoList={cryptoList} 
        onSelectCoin={(coin) => setSelectedCryptoForConvert(coin)} 
      />

      {/* 2. Main Header / Navigation with Dark/Light Toggle */}
      <Header
        isRefreshing={isRefreshing}
        onRefresh={() => loadLiveData(true)}
        forexSource={forexMeta.source}
        cryptoSource={cryptoMeta.source}
        lastUpdated={forexMeta.lastUpdated || cryptoMeta.lastUpdated}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* 3. Top Header 728x90 AdSense Leaderboard */}
      <AdBanner slotType="header-leaderboard" />

      {/* 4. Main Page Content Container with React Router Standalone Routes */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        <Routes>
          {/* ROUTE 1: CURRENCY CONVERTER (HOME) */}
          <Route path="/" element={
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Main Converter Column */}
                <div className="lg:col-span-8">
                  <CurrencyConverter
                    rates={rates}
                    lastUpdated={forexMeta.lastUpdated}
                    source={forexMeta.source}
                    isLoading={isForexLoading}
                    error={forexError}
                    onRetry={() => loadLiveData(true)}
                  />
                </div>

                {/* Sidebar with 300x250 Ad & Live Crypto Highlights */}
                <div className="lg:col-span-4 space-y-6">
                  <AdBanner slotType="sidebar-rectangle" />

                  <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-sm transition-colors duration-200">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Live Crypto Movers</span>
                      </span>
                      <button
                        onClick={() => navigate('/crypto')}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {cryptoList.length > 0 ? (
                        cryptoList.slice(0, 4).map((coin) => {
                          const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
                          return (
                            <div
                              key={coin.id}
                              onClick={() => setSelectedCryptoForConvert(coin)}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                {coin.image ? (
                                  <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
                                ) : (
                                  <span className="text-xs font-bold text-slate-800 dark:text-white uppercase">{coin.symbol}</span>
                                )}
                                <span className="text-xs font-bold text-slate-800 dark:text-white uppercase">{coin.symbol}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                                  ${coin.current_price < 1 
                                    ? coin.current_price.toFixed(4) 
                                    : coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div className={`text-[10px] font-mono font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                  {isPositive ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : isCryptoLoading ? (
                        <div className="py-6 text-center text-xs text-slate-500 font-mono">
                          Loading live coin prices...
                        </div>
                      ) : (
                        <div className="py-4 text-center text-xs text-slate-500">
                          {cryptoError || 'No crypto data available.'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4.5 text-xs text-slate-600 dark:text-slate-400 space-y-2 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Real-Time Market APIs</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      All currency rates are sourced directly from <code className="text-blue-600 dark:text-blue-400 bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded font-mono">open.er-api.com</code> and crypto quotes from <code className="text-emerald-600 dark:text-emerald-400 bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded font-mono">api.coingecko.com</code>.
                    </p>
                    <Link
                      to="/disclaimer"
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline pt-1 block cursor-pointer font-semibold"
                    >
                      Read Financial Disclaimer →
                    </Link>
                  </div>
                </div>

              </div>

              <AdBanner slotType="in-content-banner" />

              <QuickConversionMatrix
                rates={rates}
                onSelectPair={handleSelectPair}
              />

              <div className="pt-6">
                <BlogSection />
              </div>
            </div>
          } />

          {/* ROUTE 2: CONVERTER ALIAS */}
          <Route path="/converter" element={
            <div className="space-y-8 animate-in fade-in duration-300">
              <CurrencyConverter
                rates={rates}
                lastUpdated={forexMeta.lastUpdated}
                source={forexMeta.source}
                isLoading={isForexLoading}
                error={forexError}
                onRetry={() => loadLiveData(true)}
              />
              <AdBanner slotType="in-content-banner" />
              <QuickConversionMatrix
                rates={rates}
                onSelectPair={handleSelectPair}
              />
            </div>
          } />

          {/* ROUTE 3: LIVE CRYPTO TRACKER */}
          <Route path="/crypto" element={
            <div className="space-y-6 animate-in fade-in duration-300">
              <CryptoTracker
                cryptoList={cryptoList}
                isLoading={isCryptoLoading}
                error={cryptoError}
                onRetry={() => loadLiveData(true)}
                onOpenCryptoConverter={(coin) => setSelectedCryptoForConvert(coin)}
              />
              <AdBanner slotType="in-content-banner" />
              <BlogSection />
            </div>
          } />

          {/* ROUTE 4: FOREX MATRIX */}
          <Route path="/matrix" element={
            <div className="space-y-6 animate-in fade-in duration-300">
              <QuickConversionMatrix
                rates={rates}
                onSelectPair={handleSelectPair}
              />
              <AdBanner slotType="in-content-banner" />
            </div>
          } />

          {/* ROUTE 5: BLOG OVERVIEW */}
          <Route path="/blog" element={
            <div className="space-y-6 animate-in fade-in duration-300">
              <BlogSection />
              <AdBanner slotType="in-content-banner" />
            </div>
          } />

          {/* ROUTE 6: DEDICATED DYNAMIC ARTICLE PAGE (/blog/:id) */}
          <Route path="/blog/:id" element={
            <div className="animate-in fade-in duration-300">
              <ArticleView />
            </div>
          } />

          {/* ROUTE 7: DEDICATED STANDALONE ABOUT US PAGE (/about) */}
          <Route path="/about" element={<AboutPage />} />

          {/* ROUTE 8: DEDICATED STANDALONE CONTACT US PAGE (/contact) */}
          <Route path="/contact" element={<ContactPage />} />

          {/* ROUTE 9: DEDICATED STANDALONE PRIVACY POLICY PAGE (/privacy-policy) */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />

          {/* ROUTE 10: DEDICATED STANDALONE DISCLAIMER PAGE (/disclaimer) */}
          <Route path="/disclaimer" element={<DisclaimerPage />} />

          {/* ROUTE 11: PASSWORD-PROTECTED ADMIN PORTAL (/admin) */}
          <Route path="/admin" element={<AdminPage />} />

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

      </main>

      {/* Quick Crypto-to-Fiat Calculation Modal */}
      {selectedCryptoForConvert && (
        <CryptoConverterModal
          coin={selectedCryptoForConvert}
          rates={rates}
          onClose={() => setSelectedCryptoForConvert(null)}
        />
      )}

      {/* Footer with Standalone Router Links */}
      <Footer onSelectPair={handleSelectPair} />

    </div>
  );
}
