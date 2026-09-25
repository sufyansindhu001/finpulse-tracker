import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeftRight, 
  Coins, 
  BookOpen, 
  RefreshCw, 
  Menu, 
  X, 
  Layers,
  Sun,
  Moon,
  Search,
  Calculator,
  Compass,
  Zap,
  Globe
} from 'lucide-react';

export default function Header({ 
  isRefreshing, 
  onRefresh, 
  forexSource, 
  lastUpdated,
  theme,
  onToggleTheme,
  onOpenSearch
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { siteSettings } = useApp();

  // Clean ticking live UTC clock (HH:mm:ss)
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
  });

  useEffect(() => {
    const pad = (n) => String(n).padStart(2, '0');
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(`${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentPath = location.pathname;

  const handleNavClick = (item) => {
    navigate(item.path);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Markets', path: '/', icon: Compass, match: (p) => p === '/' },
    { label: 'Forex', path: '/forex', icon: Globe, match: (p) => p === '/forex' || p === '/converter' || p === '/matrix' },
    { label: 'Crypto', path: '/crypto', icon: Coins, match: (p) => p === '/crypto' },
    { label: 'Research', path: '/research', icon: BookOpen, match: (p) => p.startsWith('/research') || p.startsWith('/blog') },
    { label: 'Tools', path: '/tools', icon: Calculator, match: (p) => p === '/tools' },
  ];

  return (
    <header className="w-full bg-white/95 dark:bg-[#07090E]/95 border-b border-slate-200 dark:border-white/[0.08] backdrop-blur-xl sticky top-[31px] z-30 transition-colors duration-200 shadow-xs dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Identity (FinPulse Strictly Preserved) */}
          <Link 
            to="/"
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            {siteSettings?.logoUrl ? (
              <img 
                src={siteSettings.logoUrl} 
                alt={siteSettings.websiteName || 'FinPulse'} 
                className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-white/10 shadow-sm"
                width="36"
                height="36"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-[1px] shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
                <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                  <span className="text-xs font-black tracking-wider bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent uppercase font-mono">
                    FP
                  </span>
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white font-sans">
                  {siteSettings?.websiteName || 'FinPulse'}
                </span>
                <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-bold tracking-wider">
                  TERMINAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block tracking-tight">
                {siteSettings?.tagline || 'Institutional Market Data & Intelligence'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links (Markets, Forex, Crypto, Research, Tools) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-[#0C1017] p-1.5 rounded-full border border-slate-200/80 dark:border-white/[0.06] backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.match(currentPath);
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status, Search, Clock, Theme Toggle & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0C1017] dark:hover:bg-[#111622] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.08] text-xs font-mono transition-all cursor-pointer active:scale-95 shadow-xs"
              title="Search currencies, crypto, and research (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden lg:inline text-slate-600 dark:text-slate-400">Search</span>
              <kbd className="hidden lg:inline text-[9px] bg-white dark:bg-[#07090E] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/[0.08] text-slate-500 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Clean Live Ticking Clock & Feed Indicator */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#0C1017] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] tabular-nums shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{currentTime} UTC</span>
              <span className="text-slate-400 dark:text-slate-600">|</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Live Feed</span>
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0C1017] dark:hover:bg-[#111622] text-amber-500 dark:text-amber-400 border border-slate-200 dark:border-white/[0.08] active:scale-95 transition-all cursor-pointer shadow-xs"
              aria-label="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-180 duration-300" />
              )}
            </button>

            {/* Refresh Rates Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Force Refresh Latest Exchange Rates & Crypto Prices"
              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#0C1017] dark:hover:bg-[#111622] text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] active:scale-95 transition-all disabled:opacity-60 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="hidden sm:inline font-mono">Sync</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#0C1017] dark:text-slate-300 dark:hover:bg-[#111622] border border-slate-200 dark:border-white/[0.08] cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#07090E]/95 border-b border-slate-200 dark:border-white/[0.08] px-4 pt-3 pb-5 space-y-1 shadow-2xl backdrop-blur-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.match(currentPath);
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 mt-3 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 px-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{currentTime} UTC</span>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Live Feed</span>
          </div>
        </div>
      )}
    </header>
  );
}
