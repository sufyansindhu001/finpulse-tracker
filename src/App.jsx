import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, Navigate, Link } from 'react-router-dom';
import { fetchLiveExchangeRates, DEFAULT_RATES } from './services/forexService';
import { fetchLiveCryptoMarkets } from './services/cryptoService';

import Header from './components/Header';
import CryptoTickerBar from './components/CryptoTickerBar';
import HeroSection from './components/HeroSection';
import MarketDashboard from './components/MarketDashboard';
import MarketIntelligence from './components/MarketIntelligence';
import ForexTerminal from './components/ForexTerminal';
import CryptoHub from './components/CryptoHub';
import ToolsSuite from './components/ToolsSuite';
import ResearchSection from './components/ResearchSection';
import WhyFinPulse from './components/WhyFinPulse';
import SearchModal from './components/SearchModal';

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

import { CheckCircle } from 'lucide-react';

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
      showToast('Live market data synced from Open Exchange & CoinGecko!');
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
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById('forex-terminal');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
    showToast(`Loaded ${base} / ${target}`);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-[#07090E] text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans transition-colors duration-300 selection:bg-blue-600 selection:text-white relative`}>
      
      {/* Subtle Fintech Atmospheric Radial Mesh Glow */}
      <div className="fintech-mesh-glow" aria-hidden="true" />
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom duration-300 border border-blue-400/40 backdrop-blur-md">
          <CheckCircle className="w-4 h-4 text-white" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. Real-time Crypto Marquee Ticker */}
      <CryptoTickerBar 
        cryptoList={cryptoList} 
        onSelectCoin={(coin) => setSelectedCryptoForConvert(coin)} 
      />

      {/* 2. Main Header / Navigation with Dual Ticking Clock */}
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
      <main className="flex-1 w-full mx-auto relative z-10">
        
        <Routes>
          {/* ROUTE 1: BESPOKE INSTITUTIONAL HOMEPAGE */}
          <Route path="/" element={
            <div className="space-y-0 animate-in fade-in duration-300">
              
              {/* Hero Section */}
              <HeroSection 
                onExploreMarkets={() => {
                  const el = document.getElementById('markets');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onViewData={() => navigate('/forex')}
              />

              {/* Summary Overview Matrix */}
              <MarketDashboard 
                rates={rates}
                cryptoList={cryptoList}
                onSelectAsset={handleSelectPair}
                onOpenCryptoConverter={(coin) => setSelectedCryptoForConvert(coin)}
              />

              {/* Market Highlights & Analytical Desk Memo */}
              <MarketIntelligence />

              {/* Latest Research snippet (3 posts) */}
              <ResearchSection limit={3} showViewAll={true} />

              {/* 4 Architectural Pillars & Call to Action */}
              <WhyFinPulse 
                onExploreMarkets={() => {
                  const el = document.getElementById('markets');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onLaunchConverter={() => navigate('/forex')}
              />

            </div>
          } />

          {/* ROUTE 2: DEDICATED FOREX TERMINAL & QUICK CONVERSION MATRIX */}
          <Route path="/forex" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
              <ForexTerminal 
                rates={rates}
                source={forexMeta.source}
                lastUpdated={forexMeta.lastUpdated}
                onRefresh={() => loadLiveData(true)}
              />
              <QuickConversionMatrix
                rates={rates}
                onSelectPair={handleSelectPair}
              />
            </div>
          } />
          {/* Forex Aliases */}
          <Route path="/converter" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
              <ForexTerminal 
                rates={rates}
                source={forexMeta.source}
                lastUpdated={forexMeta.lastUpdated}
                onRefresh={() => loadLiveData(true)}
              />
              <QuickConversionMatrix
                rates={rates}
                onSelectPair={handleSelectPair}
              />
            </div>
          } />
          <Route path="/matrix" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
              <ForexTerminal 
                rates={rates}
                source={forexMeta.source}
                lastUpdated={forexMeta.lastUpdated}
                onRefresh={() => loadLiveData(true)}
              />
              <QuickConversionMatrix
                rates={rates}
                onSelectPair={handleSelectPair}
              />
            </div>
          } />

          {/* ROUTE 3: DEDICATED LIVE CRYPTO TRACKER PAGE */}
          <Route path="/crypto" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
              <CryptoHub 
                cryptoList={cryptoList}
                isLoading={isCryptoLoading}
                error={cryptoError}
                onRetry={() => loadLiveData(true)}
                onOpenCryptoConverter={(coin) => setSelectedCryptoForConvert(coin)}
              />
            </div>
          } />

          {/* ROUTE 4: DEDICATED RESEARCH HUB */}
          <Route path="/research" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
              <ResearchSection />
            </div>
          } />
          {/* Research Alias */}
          <Route path="/blog" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
              <ResearchSection />
            </div>
          } />

          {/* ROUTE 5: DEDICATED ARTICLE DETAIL PAGE */}
          <Route path="/blog/:id" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
              <ArticleView />
            </div>
          } />
          <Route path="/research/:id" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
              <ArticleView />
            </div>
          } />

          {/* ROUTE 6: DEDICATED FINANCIAL TOOLS / CALCULATORS PAGE */}
          <Route path="/tools" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
              <ToolsSuite 
                rates={rates}
                cryptoList={cryptoList}
              />
            </div>
          } />

          {/* ROUTE 7: DEDICATED ABOUT US PAGE (/about) */}
          <Route path="/about" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <AboutPage />
            </div>
          } />

          {/* ROUTE 8: DEDICATED CONTACT US PAGE (/contact) */}
          <Route path="/contact" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <ContactPage />
            </div>
          } />

          {/* ROUTE 9: DEDICATED PRIVACY POLICY PAGE (/privacy-policy) */}
          <Route path="/privacy-policy" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <PrivacyPolicyPage />
            </div>
          } />
          <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />

          {/* ROUTE 10: DEDICATED DISCLAIMER PAGE (/disclaimer) */}
          <Route path="/disclaimer" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <DisclaimerPage />
            </div>
          } />

          {/* ROUTE 11: STEALTH PASSWORD-PROTECTED ADMIN PORTAL (/admin) */}
          <Route path="/admin" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <AdminPage />
            </div>
          } />

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

      {/* Quick Command Palette Search Modal */}
      <SearchModal 
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        cryptoList={cryptoList}
      />

      {/* Footer with Standalone Router Links & Risk Disclaimers */}
      <Footer onSelectPair={handleSelectPair} />

    </div>
  );
}
