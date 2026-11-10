import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LiveMarketPulseModal from './LiveMarketPulseModal';
import { 
  Menu, 
  X, 
  Search, 
  Globe, 
  TrendingUp, 
  LineChart, 
  ArrowLeftRight, 
  Newspaper, 
  Home,
  Sun,
  Moon,
  BookOpen,
  Building2,
  Coins
} from 'lucide-react';

export default function Header({ 
  onOpenSearch, 
  theme: propTheme, 
  onToggleTheme,
  isRefreshing = false,
  onRefresh,
  rates = {},
  lastUpdated = '',
  onShowToast
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPulseModalOpen, setIsPulseModalOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [localToast, setLocalToast] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { siteSettings } = useApp();

  const handleLiveToggle = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 900);
    setIsPulseModalOpen(prev => !prev);
    if (onRefresh) {
      onRefresh();
    }
    const msg = '● Live market telemetry active: Sub-40ms stream connected';
    if (onShowToast) {
      onShowToast(msg);
    } else {
      setLocalToast(msg);
      setTimeout(() => setLocalToast(null), 3500);
    }
  };

  // Theme state: single source of truth from props
  const isDark = propTheme === 'dark';

  const handleToggleTheme = () => {
    if (onToggleTheme) {
      onToggleTheme();
    }
  };

  const currentPath = location.pathname;

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Fast route chunk preloader for instant navigation (<0.1s)
  const preloadRoute = (path) => {
    switch (path) {
      case '/stocks': import('../pages/StocksPage').catch(() => {}); break;
      case '/rates': import('../pages/RatesPage').catch(() => {}); break;
      case '/crypto': import('../pages/CryptoPage').catch(() => {}); break;
      case '/gold': import('../pages/GoldPage').catch(() => {}); break;
      case '/charts': import('../pages/ChartsPage').catch(() => {}); break;
      case '/converter': import('../pages/ConverterPage').catch(() => {}); break;
      case '/news': import('../pages/NewsPage').catch(() => {}); break;
      case '/blog': import('../pages/BlogPage').catch(() => {}); break;
      default: break;
    }
  };

  // Clean navigation links with Stocks, PSX & Gold
  const navLinks = [
    { label: 'Home', path: '/', icon: Home, match: (p) => p === '/' },
    { label: 'Stocks & PSX', path: '/stocks', icon: Building2, match: (p) => p.startsWith('/stocks') || p === '/psx' || p === '/equities' },
    { label: 'Rates', path: '/rates', icon: TrendingUp, match: (p) => p === '/rates' || p === '/forex' },
    { label: 'Gold', path: '/gold', icon: Coins, match: (p) => p.startsWith('/gold') },
    { label: 'Charts', path: '/charts', icon: LineChart, match: (p) => p === '/charts' },
    { label: 'Converter', path: '/converter', icon: ArrowLeftRight, match: (p) => p === '/converter' || p === '/tools' },
    { label: 'News', path: '/news', icon: Newspaper, match: (p) => p.startsWith('/news') },
    { label: 'Blog', path: '/blog', icon: BookOpen, match: (p) => p.startsWith('/blog') || p.startsWith('/research') },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#06111F]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Left: Brand Identity with Logo and Distinct Interactive Live Button */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative z-10">
              <Link 
                to="/"
                className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer"
                title="Go to FGC Spot Homepage"
              >
                <img 
                  src={siteSettings?.logoUrl || '/logo.png'} 
                  alt={siteSettings?.websiteName || 'FGC Spot'} 
                  width="40"
                  height="40"
                  decoding="async"
                  className="w-9 h-9 md:w-10 md:h-10 aspect-square object-contain shrink-0 rounded-xl transition-transform group-hover:scale-105 block" 
                  style={{ filter: 'none' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo.png';
                  }}
                />
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white font-sans">
                  {siteSettings?.websiteName || 'FGC Spot'}
                </span>
              </Link>

              {/* Distinct Interactive Live Status Button (Available on Mobile & Desktop) */}
              <button
                type="button"
                onClick={handleLiveToggle}
                title="Live Market Stream Active — Click to toggle telemetry pulse"
                aria-label="Toggle Live Market Telemetry Feed"
                className={`inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full cursor-pointer select-none transition-all duration-200 active:scale-95 touch-manipulation ${
                  isPulsing
                    ? 'bg-[#00E676]/30 text-[#00E676] border border-[#00E676] ring-2 ring-[#00E676]/40 shadow-md shadow-[#00E676]/30'
                    : 'bg-[#00E676]/10 hover:bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30 hover:border-[#00E676]/60 shadow-xs'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]"></span>
                </span>
                <span>Live</span>
              </button>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1 bg-slate-100/90 dark:bg-[#0A1726]/80 p-1.5 rounded-full border border-slate-200 dark:border-white/10 backdrop-blur-md">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = item.match(currentPath);
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onMouseEnter={() => preloadRoute(item.path)}
                    onTouchStart={() => preloadRoute(item.path)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#00E676] text-[#06111F] shadow-sm shadow-[#00E676]/30 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-[#A8B3C2] dark:hover:text-white dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Search, Theme Toggle, Language Indicator & Live Rates CTA */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              
              {/* Functional Search Input Button (Wide desktop) */}
              <button
                onClick={onOpenSearch}
                className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-[#0A1726] dark:hover:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 text-xs text-slate-600 hover:text-slate-900 dark:text-[#A8B3C2] dark:hover:text-white transition-all cursor-pointer shadow-xs group"
                title="Search currency, crypto, gold... (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-[#00E676] group-hover:scale-110 transition-transform" />
                <span>Search currency, crypto, gold...</span>
                <kbd className="text-[10px] font-mono bg-white dark:bg-[#06111F] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                  ⌘K
                </kbd>
              </button>

              {/* Mobile/Tablet Search Icon Button */}
              <button
                onClick={onOpenSearch}
                className="xl:hidden p-2 rounded-xl bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-[#A8B3C2] dark:hover:text-white cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-[#00E676]" />
              </button>

              {/* Theme Toggle Button (Moon/Sun) */}
              <button
                onClick={handleToggleTheme}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-[#0A1726] dark:hover:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#A8B3C2] hover:text-[#00E676] dark:hover:text-[#00E676] transition-all cursor-pointer shadow-xs"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle visual theme"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-[#00E676] transition-transform hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 text-amber-500 transition-transform hover:-rotate-12" />
                )}
              </button>

              {/* Language Indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-[#A8B3C2]">
                <Globe className="w-3.5 h-3.5 text-[#00E676]" />
                <span>EN</span>
              </div>

              {/* Live Rates / Market Pulse Button */}
              <button
                type="button"
                onClick={handleLiveToggle}
                title="View Live Market Telemetry & Spot Rates"
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shadow-xs cursor-pointer select-none active:scale-95 ${
                  isPulsing
                    ? 'bg-[#00E676]/25 border-[#00E676] text-[#00E676] ring-2 ring-[#00E676]/40 shadow-md'
                    : 'bg-slate-100 dark:bg-[#0A1726] hover:bg-slate-200 dark:hover:bg-[#0D1B2A] border-slate-200 dark:border-[#00E676]/30 hover:border-[#00E676] text-slate-900 dark:text-white'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]"></span>
                </span>
                <span className="group-hover:text-[#00E676] transition-colors">Live Pulse</span>
              </button>

              {/* Mobile/Tablet Hamburger Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white cursor-pointer shrink-0 touch-manipulation select-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile/Tablet Slide-Out Drawer Overlay & Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden flex justify-end">
          {/* Backdrop blur overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide Drawer content */}
          <div className="relative w-4/5 max-w-sm h-full bg-white dark:bg-[#0A1726] border-l border-slate-200 dark:border-white/10 p-6 flex flex-col justify-between z-10 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <img 
                    src={siteSettings?.logoUrl || '/logo.png'} 
                    alt={siteSettings?.websiteName || 'FGC Spot'} 
                    width="36"
                    height="36"
                    decoding="async"
                    className="w-9 h-9 aspect-square object-contain shrink-0 rounded-xl block"
                    style={{ filter: 'none' }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/logo.png';
                    }}
                  />
                  <span className="font-extrabold text-slate-900 dark:text-white text-lg">
                    {siteSettings?.websiteName || 'FGC Spot'}
                  </span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#06111F] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search input in drawer */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSearch();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-[#A8B3C2] text-left"
              >
                <Search className="w-4 h-4 text-[#00E676]" />
                <span>Search currency, crypto, gold...</span>
              </button>

              {/* Nav items list (No About link) */}
              <div className="space-y-1.5">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.match(currentPath);
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      onTouchStart={() => preloadRoute(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer touch-manipulation select-none ${
                        isActive
                          ? 'bg-[#00E676] text-[#06111F] font-bold'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-[#A8B3C2] dark:hover:text-white dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer with Theme Toggle, Language & Live Rates */}
            <div className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-[#06111F] border border-slate-200 dark:border-white/10">
                <span className="text-xs font-semibold text-slate-700 dark:text-[#A8B3C2]">Interface Theme</span>
                <button
                  onClick={handleToggleTheme}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white hover:text-[#00E676]"
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-[#00E676]" /> : <Moon className="w-3.5 h-3.5 text-amber-500" />}
                  <span>{isDark ? 'Dark' : 'Light'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLiveToggle();
                }}
                className="w-full py-3 rounded-xl bg-[#00E676] hover:bg-[#00FF88] text-[#06111F] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/25 cursor-pointer active:scale-95 transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-[#06111F] animate-pulse"></span>
                <span>Open Live Market Pulse</span>
              </button>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#A8B3C2] px-1">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#00E676]" />
                  <span>Language: English (EN)</span>
                </span>
                <span className="text-[#00E676] font-semibold">24/7 Always On</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Local Toast Fallback Notification */}
      {localToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-[#0A1726] text-slate-900 dark:text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom duration-300 border border-slate-200 dark:border-[#00E676]/40 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
          <span>{localToast}</span>
        </div>
      )}

      {/* Interactive Live Market Pulse Modal */}
      <LiveMarketPulseModal
        isOpen={isPulseModalOpen}
        onClose={() => setIsPulseModalOpen(false)}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        rates={rates}
        lastUpdated={lastUpdated}
      />
    </>
  );
}
