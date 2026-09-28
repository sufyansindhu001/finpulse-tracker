import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, Navigate, Link, useLocation } from 'react-router-dom';
import { fetchLiveExchangeRates, DEFAULT_RATES } from './services/forexService';
import { fetchLiveCryptoMarkets } from './services/cryptoService';

import BackgroundFX from './components/BackgroundFX';
import Header from './components/Header';
import CryptoTickerBar from './components/CryptoTickerBar';
import HeroSection from './components/HeroSection';
import WhatWeOffer from './components/WhatWeOffer';
import MarketDashboard from './components/MarketDashboard';
import QuickConversionMatrix from './components/QuickConversionMatrix';
import MarketNewsWire from './components/MarketNewsWire';
import WhyFGCSpot from './components/WhyFGCSpot';
import SearchModal from './components/SearchModal';
import CryptoConverterModal from './components/CryptoConverterModal';
import Footer from './components/Footer';

// Standalone dedicated pages & terminal views
const RatesPage = lazy(() => import('./pages/RatesPage'));
const CryptoPage = lazy(() => import('./pages/CryptoPage'));
const GoldPage = lazy(() => import('./pages/GoldPage'));
const ChartsPage = lazy(() => import('./pages/ChartsPage'));
const ConverterPage = lazy(() => import('./pages/ConverterPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

import { CheckCircle } from 'lucide-react';
import { recordPageView } from './utils/telemetry';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top and record telemetry page view on every navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      recordPageView(location.pathname);
    } catch (e) {
      console.warn('Telemetry error:', e);
    }
  }, [location.pathname]);

  // Theme state: default dark for institutional FGC Spot theme
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('fgc_spot_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  // Apply dark theme class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    try {
      localStorage.setItem('fgc_spot_theme', theme);
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
    source: 'Interbank FX Feeds'
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

    // 1. Fetch Live Fiat Rates (https://open.er-api.com/v6/latest/USD)
    const forexPromise = fetchLiveExchangeRates()
      .then((res) => {
        if (res && res.rates) {
          setRates(res.rates);
          setForexMeta({
            lastUpdated: res.lastUpdated || new Date().toLocaleTimeString(),
            source: res.source || 'Interbank FX Feeds'
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
    const cryptoPromise = fetchLiveCryptoMarkets()
      .then((res) => {
        setCryptoList(res.data);
        setCryptoMeta({
          lastUpdated: res.lastUpdated,
          source: res.source || 'Multi-Exchange Feeds'
        });
        setCryptoError(null);
        setIsCryptoLoading(false);
      })
      .catch((err) => {
        console.error('Crypto fetch error:', err);
        setCryptoError(err.message || 'Failed to fetch live digital asset prices');
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
    <div className="min-h-screen bg-[#06111F] text-[#A8B3C2] flex flex-col font-sans selection:bg-[#00E676] selection:text-[#06111F] relative w-full max-w-full overflow-x-hidden">
      
      {/* 0. Optimized Canvas Financial Glowing Grid & Wave Background (Responds to Scroll) */}
      <BackgroundFX />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A1726] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom duration-300 border border-[#00E676]/40 backdrop-blur-md">
          <CheckCircle className="w-4 h-4 text-[#00E676]" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. Real-time Crypto Marquee Ticker */}
      <div className="relative z-20">
        <CryptoTickerBar 
          cryptoList={cryptoList} 
          onSelectCoin={(coin) => setSelectedCryptoForConvert(coin)} 
        />
      </div>

      {/* 2. Glassmorphic Fixed/Sticky Header with Logo & Navigation */}
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
      <main className="flex-1 w-full max-w-full mx-auto relative z-10 overflow-x-hidden pt-4">
        <Suspense fallback={
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 animate-pulse">
            <div className="w-8 h-8 border-2 border-[#00E676] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-mono text-[#A8B3C2]">Loading FGC Spot Terminal...</span>
          </div>
        }>
          <Routes>
            {/* ROUTE 1: BESPOKE INSTITUTIONAL HOMEPAGE */}
            <Route path="/" element={
              <div className="space-y-0 animate-in fade-in duration-300">
                
                {/* Hero Section (No phone mockup, Glassmorphic Live Market Terminal Card) */}
                <HeroSection 
                  rates={rates}
                  cryptoList={cryptoList}
                  onExploreMarkets={() => navigate('/rates')}
                  onViewData={() => navigate('/converter')}
                />

                {/* What We Offer Section with 5 hover glowing cards */}
                <WhatWeOffer />

                {/* Summary Overview Matrix (Live Market Dashboard) */}
                <MarketDashboard 
                  rates={rates}
                  cryptoList={cryptoList}
                  onSelectAsset={handleSelectPair}
                  onOpenCryptoConverter={(coin) => setSelectedCryptoForConvert(coin)}
                />

                {/* Quick Currency Conversion Matrix */}
                <section id="forex-corridors" className="py-12 border-b border-white/10 w-full max-w-full overflow-hidden">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <QuickConversionMatrix
                      rates={rates}
                      onSelectPair={handleSelectPair}
                    />
                  </div>
                </section>

                {/* Automated Real-Time Financial News Wire */}
                <MarketNewsWire limit={6} />

                {/* Architectural Pillars & Platform Trust */}
                <WhyFGCSpot 
                  onExploreMarkets={() => navigate('/rates')}
                  onLaunchConverter={() => navigate('/converter')}
                />

              </div>
            } />

            {/* ROUTE 2: DEDICATED LIVE RATES PAGE (/rates) */}
            <Route path="/rates" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
                <RatesPage 
                  rates={rates}
                  cryptoList={cryptoList}
                  onRefresh={() => loadLiveData(true)}
                />
              </div>
            } />
            {/* Route Aliases */}
            <Route path="/forex" element={<Navigate to="/rates" replace />} />
            <Route path="/matrix" element={<Navigate to="/converter" replace />} />

            {/* ROUTE 3: DEDICATED CRYPTO TERMINAL PAGE (/crypto) */}
            <Route path="/crypto" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
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
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
                <GoldPage rates={rates} />
              </div>
            } />

            {/* ROUTE 5: INTERACTIVE FINANCIAL CHARTS PAGE (/charts) */}
            <Route path="/charts" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
                <ChartsPage rates={rates} cryptoList={cryptoList} />
              </div>
            } />

            {/* ROUTE 6: STANDALONE CURRENCY CONVERTER PAGE (/converter) */}
            <Route path="/converter" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
                <ConverterPage rates={rates} />
              </div>
            } />
            <Route path="/tools" element={<Navigate to="/converter" replace />} />

            {/* ROUTE 7: DEDICATED REAL-TIME FINANCIAL NEWS WIRE (/news) */}
            <Route path="/news" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
                <NewsPage />
              </div>
            } />
            <Route path="/research" element={<Navigate to="/news" replace />} />
            <Route path="/blog" element={<Navigate to="/news" replace />} />

            {/* ROUTE 8: ABOUT US PAGE (/about) */}
            <Route path="/about" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
                <AboutPage />
              </div>
            } />

            {/* ROUTE 9: CONTACT US PAGE (/contact) */}
            <Route path="/contact" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
                <ContactPage />
              </div>
            } />

            {/* ROUTE 10: PRIVACY POLICY PAGE (/privacy-policy) */}
            <Route path="/privacy-policy" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
                <PrivacyPolicyPage />
              </div>
            } />
            <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />

            {/* ROUTE 11: FINANCIAL DISCLAIMER PAGE (/disclaimer) */}
            <Route path="/disclaimer" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
                <DisclaimerPage />
              </div>
            } />

            {/* ROUTE 12: ADMIN CONTROL PORTAL (/admin) */}
            <Route path="/admin" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
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
        <CryptoConverterModal
          coin={selectedCryptoForConvert}
          rates={rates}
          onClose={() => setSelectedCryptoForConvert(null)}
        />
      )}

      {/* Quick Command Palette Search Modal */}
      <SearchModal 
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        cryptoList={cryptoList}
      />

      {/* Footer with Unified FGC Spot Theme & Standalone Router Links */}
      <Footer onSelectPair={handleSelectPair} />

      {/* Official Vercel Real-Traffic Analytics & Web Vitals Speed Insights */}
      <Analytics />
      <SpeedInsights />

    </div>
  );
}
