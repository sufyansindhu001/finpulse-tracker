import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, Navigate, Link, useLocation } from 'react-router-dom';
import { fetchLiveExchangeRates, DEFAULT_RATES, getCachedRates } from './services/forexService';
import { fetchLiveCryptoMarkets, DEFAULT_CRYPTO_BENCHMARKS } from './services/cryptoService';

import BackgroundFX from './components/BackgroundFX';
import Header from './components/Header';
import CryptoTickerBar from './components/CryptoTickerBar';
import HeroSection from './components/HeroSection';
import WhatWeOffer from './components/WhatWeOffer';
import MarketDashboard from './components/MarketDashboard';
import QuickConversionMatrix from './components/QuickConversionMatrix';
import MarketNewsWire from './components/MarketNewsWire';
import WhyFGCSpot from './components/WhyFGCSpot';
import MarketIntelligenceMethodology from './components/MarketIntelligenceMethodology';
import FeaturedResearchSection from './components/FeaturedResearchSection';
import Footer from './components/Footer';

import { lazyWithRetry } from './utils/lazyWithRetry';

// Modals lazy-loaded on user action with deployment retry protection
const SearchModal = lazyWithRetry(() => import('./components/SearchModal'));
const CryptoConverterModal = lazyWithRetry(() => import('./components/CryptoConverterModal'));

// Standalone dedicated pages & terminal views with deployment retry protection
const StocksPage = lazyWithRetry(() => import('./pages/StocksPage'));
const RatesPage = lazyWithRetry(() => import('./pages/RatesPage'));
const CryptoPage = lazyWithRetry(() => import('./pages/CryptoPage'));
const GoldPage = lazyWithRetry(() => import('./pages/GoldPage'));
const ChartsPage = lazyWithRetry(() => import('./pages/ChartsPage'));
const ConverterPage = lazyWithRetry(() => import('./pages/ConverterPage'));
const NewsPage = lazyWithRetry(() => import('./pages/NewsPage'));
const BlogPage = lazyWithRetry(() => import('./pages/BlogPage'));
const BlogDetailPage = lazyWithRetry(() => import('./pages/BlogDetailPage'));
const ArticleView = lazyWithRetry(() => import('./components/ArticleView'));
const AboutPage = lazyWithRetry(() => import('./pages/AboutPage'));
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazyWithRetry(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazyWithRetry(() => import('./pages/TermsPage'));
const DisclaimerPage = lazyWithRetry(() => import('./pages/DisclaimerPage'));
const AdminPage = lazyWithRetry(() => import('./pages/AdminPage'));

import { CheckCircle } from 'lucide-react';
import { recordPageView } from './utils/telemetry';
import { updateCanonical, updateSEO } from './utils/seo';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

export default function App() {

  const navigate = useNavigate();
  const location = useLocation();

  // Instant scroll to top, sync canonical URL, and non-blocking telemetry on route navigation
  useEffect(() => {
    // Instant zero-cost scroll without smooth-scroll layout locking
    window.scrollTo(0, 0);

    // Non-blocking telemetry: queued during idle periods so route transitions happen in <0.05s
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          try { recordPageView(location.pathname); } catch {}
        });
      } else {
        setTimeout(() => {
          try { recordPageView(location.pathname); } catch {}
        }, 80);
      }
    }

    try {
      updateCanonical(location.pathname);
      if (location.pathname === '/') {
        updateSEO({
          title: 'FGC Spot — Live Forex, Gold & Crypto Terminals',
          description: 'Institutional-grade real-time market rates, live analytics, and financial terminal tracking for Forex, Gold, and Digital Assets.',
          canonical: '/',
          ogType: 'website'
        });
      }
    } catch (e) {
      console.warn('SEO synchronization warning:', e);
    }
  }, [location.pathname]);

  // Idle route prefetching: pre-caches key page chunks for instant (<0.1s) transitions
  useEffect(() => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        import('./pages/StocksPage').catch(() => {});
        import('./pages/BlogPage').catch(() => {});
        import('./pages/RatesPage').catch(() => {});
        import('./pages/ConverterPage').catch(() => {});
        import('./pages/NewsPage').catch(() => {});
        import('./pages/ChartsPage').catch(() => {});
      });
    }
  }, []);


  // Theme state: initialized from localStorage (default 'dark')
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('fgc_spot_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  // Apply or remove 'dark' class on documentElement and sync localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('fgc_spot_theme', theme);
    } catch (e) {
      console.warn('LocalStorage unavailable:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };
  
  // Market data states initialized with valid cached rates or reliable DEFAULT_RATES (~277.10 PKR)
  const [rates, setRates] = useState(() => {
    const cached = getCachedRates();
    return cached?.rates || DEFAULT_RATES;
  });
  const [cryptoList, setCryptoList] = useState(DEFAULT_CRYPTO_BENCHMARKS);
  
  // Loading & Error states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isForexLoading, setIsForexLoading] = useState(false);
  const [isCryptoLoading, setIsCryptoLoading] = useState(true);
  const [forexError, setForexError] = useState(null);
  const [cryptoError, setCryptoError] = useState(null);

  // Metadata
  const [forexMeta, setForexMeta] = useState(() => {
    const cached = getCachedRates();
    return {
      lastUpdated: cached?.lastUpdated || '',
      source: cached?.source || 'Interbank FX Feeds'
    };
  });
  const [cryptoMeta, setCryptoMeta] = useState({
    lastUpdated: '',
    source: 'Multi-Exchange Feeds'
  });

  // Quick crypto conversion modal state
  const [selectedCryptoForConvert, setSelectedCryptoForConvert] = useState(null);

  // Search modal state
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live Data Fetcher: Calls Open Exchange Rates and CoinGecko concurrently
  const loadLiveData = useCallback(async (isManual = false) => {
    setIsRefreshing(true);

    // 1. Fetch Live Fiat Rates (low-latency interbank mid-market feeds)
    const forexPromise = fetchLiveExchangeRates(isManual)
      .then((res) => {
        if (res && res.rates && typeof res.rates === 'object' && Object.keys(res.rates).length > 0) {
          setRates(res.rates);
          setForexMeta({
            lastUpdated: res.lastUpdated || new Date().toLocaleTimeString(),
            source: res.source || 'Live Interbank Feeds'
          });
        }
        setForexError(null);
        setIsForexLoading(false);
      })
      .catch((err) => {
        console.warn('Forex fetch warning:', err);
        setIsForexLoading(false);
      });

    // 2. Fetch Live Crypto Markets
    const cryptoPromise = fetchLiveCryptoMarkets(isManual)
      .then((res) => {
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          setCryptoList(res.data);
          setCryptoMeta({
            lastUpdated: res.lastUpdated || new Date().toLocaleTimeString(),
            source: res.source || 'Multi-Exchange Feeds'
          });
        }
        setCryptoError(null);
        setIsCryptoLoading(false);
      })
      .catch((err) => {
        console.warn('Crypto fetch warning:', err);
        setCryptoList(DEFAULT_CRYPTO_BENCHMARKS);
        setIsCryptoLoading(false);
      });

    await Promise.allSettled([forexPromise, cryptoPromise]);
    setIsRefreshing(false);

    if (isManual) {
      showToast('Live market data synced from Interbank FX & Multi-Exchange Feeds!');
    }
  }, []);

  // Initial fetch on mount & automatic refresh every 45 seconds
  useEffect(() => {
    loadLiveData(false);

    const interval = setInterval(() => {
      loadLiveData(false);
    }, 45000);

    return () => clearInterval(interval);
  }, [loadLiveData]);


  // Quick pair select handler
  const handleSelectPair = (base, target) => {
    navigate(`/converter?from=${base}&to=${target}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Loaded ${base} / ${target}`);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#06111F] text-[#A8B3C2]' : 'bg-slate-50 text-slate-800'} flex flex-col font-sans selection:bg-[#00E676] selection:text-[#06111F] relative w-full max-w-full overflow-x-hidden transition-colors duration-200`}>
      
      {/* 0. Optimized Canvas Financial Glowing Grid & Wave Background (Responds to Scroll) */}
      <BackgroundFX />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-[#0A1726] text-slate-900 dark:text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom duration-300 border border-slate-200 dark:border-[#00E676]/40 backdrop-blur-md">
          <CheckCircle className="w-4 h-4 text-[#00E676]" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. Real-time Multi-Asset Marquee Ticker (Gold, Forex & Crypto) */}
      <div className="relative z-20">
        <CryptoTickerBar 
          cryptoList={cryptoList}
          rates={rates || DEFAULT_RATES}
          onSelectCoin={(coin) => setSelectedCryptoForConvert(coin)} 
        />
      </div>

      {/* 2. Glassmorphic Fixed/Sticky Header with Logo, Navigation & Theme Toggle */}
      <Header
        isRefreshing={isRefreshing}
        onRefresh={() => loadLiveData(true)}
        forexSource={forexMeta.source}
        cryptoSource={cryptoMeta.source}
        lastUpdated={forexMeta.lastUpdated || cryptoMeta.lastUpdated}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Main Page Content Container with React Router Standalone Routes */}
      <main className="flex-1 w-full max-w-full mx-auto relative z-10 overflow-x-hidden pt-2 sm:pt-4">
        <Suspense fallback={
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 animate-pulse">
            <div className="w-8 h-8 border-2 border-[#00E676] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-mono text-slate-500 dark:text-[#A8B3C2]">Loading FGC Spot Terminal...</span>
          </div>
        }>
          <Routes>
            {/* ROUTE 1: BESPOKE INSTITUTIONAL HOMEPAGE */}
            <Route path="/" element={
              <GlobalErrorBoundary>
                <div className="space-y-0 animate-in fade-in duration-300">
                  
                  {/* Hero Section (No phone mockup, Glassmorphic Live Market Terminal Card) */}
                  <HeroSection 
                    rates={rates || DEFAULT_RATES}
                    cryptoList={Array.isArray(cryptoList) && cryptoList.length > 0 ? cryptoList : DEFAULT_CRYPTO_BENCHMARKS}
                    onExploreMarkets={() => navigate('/rates')}
                    onViewData={() => navigate('/converter')}
                  />

                  {/* What We Offer Section with 5 hover glowing cards */}
                  <WhatWeOffer />

                  {/* Summary Overview Matrix (Live Market Dashboard) */}
                  <MarketDashboard 
                    rates={rates || DEFAULT_RATES}
                    cryptoList={Array.isArray(cryptoList) && cryptoList.length > 0 ? cryptoList : DEFAULT_CRYPTO_BENCHMARKS}
                    onSelectAsset={handleSelectPair}
                    onOpenCryptoConverter={(coin) => setSelectedCryptoForConvert(coin)}
                  />

                  {/* Quick Currency Conversion Matrix */}
                  <section id="forex-corridors" className="py-12 border-b border-slate-200 dark:border-white/10 w-full max-w-full overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <QuickConversionMatrix
                        rates={rates || DEFAULT_RATES}
                        onSelectPair={handleSelectPair}
                      />
                    </div>
                  </section>

                  {/* Institutional Market Intelligence & Multi-Asset Research Methodology (600+ Words for AdSense Quality) */}
                  <MarketIntelligenceMethodology />

                  {/* Featured Institutional Research Block (Direct crawlable <a href="..."> links for Googlebot) */}
                  <FeaturedResearchSection />

                  {/* Automated Real-Time Financial News Wire */}
                  <MarketNewsWire limit={6} />

                  {/* Architectural Pillars & Platform Trust */}
                  <WhyFGCSpot 
                    onExploreMarkets={() => navigate('/rates')}
                    onLaunchConverter={() => navigate('/converter')}
                  />

                </div>
              </GlobalErrorBoundary>
            } />

            {/* ROUTE 1B: DEDICATED GLOBAL & PSX STOCKS TERMINAL (/stocks) */}
            <Route path="/stocks" element={
              <GlobalErrorBoundary>
                <div className="animate-in fade-in duration-300">
                  <StocksPage />
                </div>
              </GlobalErrorBoundary>
            } />
            <Route path="/psx" element={<Navigate to="/stocks" replace />} />
            <Route path="/equities" element={<Navigate to="/stocks" replace />} />

            {/* ROUTE 2: DEDICATED LIVE RATES PAGE (/rates) */}
            <Route path="/rates" element={
              <GlobalErrorBoundary>
                <div className="w-full animate-in fade-in duration-300">
                  <RatesPage 
                    rates={rates || DEFAULT_RATES}
                    cryptoList={Array.isArray(cryptoList) && cryptoList.length > 0 ? cryptoList : DEFAULT_CRYPTO_BENCHMARKS}
                    onRefresh={() => loadLiveData(true)}
                  />
                </div>
              </GlobalErrorBoundary>
            } />
            {/* Route Aliases */}
            <Route path="/forex" element={<Navigate to="/rates" replace />} />
            <Route path="/matrix" element={<Navigate to="/converter" replace />} />

            {/* ROUTE 3: DEDICATED CRYPTO TERMINAL PAGE (/crypto) */}
            <Route path="/crypto" element={
              <div className="w-full animate-in fade-in duration-300">
                <CryptoPage 
                  cryptoList={cryptoList}
                  isLoading={isCryptoLoading}
                  error={cryptoError}
                  onRefresh={() => loadLiveData(true)}
                  onOpenConvert={(coin) => setSelectedCryptoForConvert(coin)}
                />
              </div>
            } />

            {/* ROUTE 4: DEDICATED GOLD & PRECIOUS METALS PAGE (/gold) */}
            <Route path="/gold" element={
              <div className="w-full animate-in fade-in duration-300">
                <GoldPage rates={rates} />
              </div>
            } />

            {/* ROUTE 5: INTERACTIVE FINANCIAL CHARTS PAGE (/charts) */}
            <Route path="/charts" element={
              <div className="w-full animate-in fade-in duration-300">
                <ChartsPage rates={rates} cryptoList={cryptoList} />
              </div>
            } />

            {/* ROUTE 6: STANDALONE CURRENCY CONVERTER PAGE (/converter) */}
            <Route path="/converter" element={
              <div className="w-full animate-in fade-in duration-300">
                <ConverterPage rates={rates} />
              </div>
            } />
            <Route path="/tools" element={<Navigate to="/converter" replace />} />

            {/* ROUTE 7: DEDICATED REAL-TIME FINANCIAL NEWS WIRE (/news) */}
            <Route path="/news" element={
              <div className="w-full animate-in fade-in duration-300">
                <NewsPage />
              </div>
            } />

            {/* ROUTE 7B: DEDICATED BLOG & FINANCIAL ANALYSIS (/blog) */}
            <Route path="/blog" element={
              <div className="w-full animate-in fade-in duration-300">
                <BlogPage />
              </div>
            } />
            <Route path="/blog/:slug" element={
              <div className="w-full animate-in fade-in duration-300">
                <BlogDetailPage />
              </div>
            } />
            <Route path="/blog/id/:id" element={
              <div className="w-full animate-in fade-in duration-300">
                <BlogDetailPage />
              </div>
            } />
            <Route path="/research" element={<Navigate to="/blog" replace />} />
            <Route path="/research/:id" element={
              <div className="w-full animate-in fade-in duration-300">
                <BlogDetailPage />
              </div>
            } />

            {/* ROUTE 8: ABOUT US PAGE (/about) */}
            <Route path="/about" element={
              <div className="w-full animate-in fade-in duration-300">
                <AboutPage />
              </div>
            } />

            {/* ROUTE 9: CONTACT US PAGE (/contact) */}
            <Route path="/contact" element={
              <div className="w-full animate-in fade-in duration-300">
                <ContactPage />
              </div>
            } />

            {/* ROUTE 10: PRIVACY POLICY PAGE (/privacy-policy) */}
            <Route path="/privacy-policy" element={
              <div className="w-full animate-in fade-in duration-300">
                <PrivacyPolicyPage />
              </div>
            } />
            <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />

            {/* ROUTE 11: TERMS OF SERVICE PAGE (/terms) */}
            <Route path="/terms" element={
              <div className="w-full animate-in fade-in duration-300">
                <TermsPage />
              </div>
            } />
            <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />

            {/* ROUTE 12: FINANCIAL DISCLAIMER PAGE (/disclaimer) */}
            <Route path="/disclaimer" element={
              <div className="w-full animate-in fade-in duration-300">
                <DisclaimerPage />
              </div>
            } />

            {/* ROUTE 13: ADMIN CONTROL PORTAL (/admin) */}
            <Route path="/admin" element={
              <div className="w-full animate-in fade-in duration-300">
                <AdminPage />
              </div>
            } />

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Suspense>
      </main>

      {/* Quick Crypto-to-Fiat Calculation Modal */}
      {selectedCryptoForConvert && (
        <Suspense fallback={null}>
          <CryptoConverterModal
            coin={selectedCryptoForConvert}
            rates={rates}
            onClose={() => setSelectedCryptoForConvert(null)}
          />
        </Suspense>
      )}

      {/* Quick Command Palette Search Modal */}
      {searchModalOpen && (
        <Suspense fallback={null}>
          <SearchModal 
            isOpen={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
            cryptoList={cryptoList}
          />
        </Suspense>
      )}

      {/* Footer with Unified FGC Spot Theme & Standalone Router Links */}
      <Footer onSelectPair={handleSelectPair} />

      {/* Official Vercel Real-Traffic Analytics & Web Vitals Speed Insights */}
      <Analytics />
      <SpeedInsights />

    </div>
  );
}
