import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
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
  BookOpen
} from 'lucide-react';

export default function Header({ onOpenSearch, theme: propTheme, onToggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { siteSettings } = useApp();

  // Theme state: single source of truth from props
  const isDark = propTheme === 'dark';

  const handleToggleTheme = () => {
    if (onToggleTheme) {
      onToggleTheme();
    }
  };

  const currentPath = location.pathname;

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

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

  // Clean navigation links (About removed per policy update)
  const navLinks = [
    { label: 'Home', path: '/', icon: Home, match: (p) => p === '/' },
    { label: 'Rates', path: '/rates', icon: TrendingUp, match: (p) => p === '/rates' || p === '/forex' },
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
            
            {/* Left: Brand Identity with /logo.png */}
            <Link 
              to="/"
              className="flex items-center gap-2.5 sm:gap-3 shrink-0 group cursor-pointer relative z-10"
            >
              <img 
                src={siteSettings?.logoUrl || '/logo.png'} 
                alt={siteSettings?.websiteName || 'FGC Spot'} 
                className="h-8 w-auto md:h-10 object-contain shrink-0 rounded-lg transition-transform group-hover:scale-105 block relative z-10" 
                style={{ filter: 'none' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/logo.png';
                }}
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white font-sans">
                    {siteSettings?.websiteName || 'FGC Spot'}
                  </span>
                  <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
                    Live
                  </span>
                </div>
              </div>
            </Link>

            {/* Center: Desktop Navigation Links (Clean, No "About") */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-[#0A1726]/80 p-1.5 rounded-full border border-slate-200 dark:border-white/10 backdrop-blur-md">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = item.match(currentPath);
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.path)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#00E676] text-[#06111F] shadow-sm shadow-[#00E676]/30 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-[#A8B3C2] dark:hover:text-white dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right: Search, Theme Toggle, Language Indicator & Live Rates CTA */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Functional Search Input Button */}
              <button
                onClick={onOpenSearch}
                className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-[#0A1726] dark:hover:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 text-xs text-slate-600 hover:text-slate-900 dark:text-[#A8B3C2] dark:hover:text-white transition-all cursor-pointer shadow-xs group"
                title="Search currency, crypto, gold... (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-[#00E676] group-hover:scale-110 transition-transform" />
                <span>Search currency, crypto, gold...</span>
                <kbd className="text-[10px] font-mono bg-white dark:bg-[#06111F] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                  ⌘K
                </kbd>
              </button>

              {/* Mobile Search Icon Button */}
              <button
                onClick={onOpenSearch}
                className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-[#A8B3C2] dark:hover:text-white cursor-pointer"
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

              {/* Live Rates Glowing Pulse Button */}
              <button
                onClick={() => navigate('/rates')}
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0A1726] hover:bg-slate-200 dark:hover:bg-[#0D1B2A] border border-slate-200 dark:border-[#00E676]/30 hover:border-[#00E676] text-slate-900 dark:text-white text-xs font-semibold transition-all shadow-xs cursor-pointer group"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]"></span>
                </span>
                <span className="group-hover:text-[#00E676] transition-colors">Live Rates</span>
              </button>

              {/* Mobile Hamburger Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#A8B3C2] hover:text-slate-900 dark:hover:text-white cursor-pointer shrink-0"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer Overlay & Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
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
                    className="h-8 w-auto md:h-10 object-contain shrink-0 block"
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
                    <button
                      key={item.label}
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#00E676] text-[#06111F] font-bold'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-[#A8B3C2] dark:hover:text-white dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
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
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/rates');
                }}
                className="w-full py-3 rounded-xl bg-[#00E676] text-[#06111F] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/25"
              >
                <span className="w-2 h-2 rounded-full bg-[#06111F] animate-pulse"></span>
                <span>Open Live Rates Terminal</span>
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
    </>
  );
}
