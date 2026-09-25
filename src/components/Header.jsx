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
  Moon
} from 'lucide-react';


export default function Header({ 
  isRefreshing, 
  onRefresh, 
  forexSource, 
  lastUpdated,
  theme,
  onToggleTheme
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { siteSettings } = useApp();

  // Dynamic ticking live clock in local time (HH:mm:ss)
  const [liveTime, setLiveTime] = useState(() => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setLiveTime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUpdatedTime = (raw) => {
    if (!raw) return 'Live API Connected';
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        return `Updated: ${h}:${m}`;
      }
    } catch (e) {}
    return raw.toLowerCase().startsWith('updated') ? raw : `Updated: ${raw}`;
  };

  const currentPath = location.pathname;

  const navItems = [
    { path: '/', label: 'Currency Converter', icon: ArrowLeftRight, match: (p) => p === '/' || p === '/converter' },
    { path: '/crypto', label: 'Crypto Tracker', icon: Coins, match: (p) => p === '/crypto' },
    { path: '/matrix', label: 'Forex Matrix', icon: Layers, match: (p) => p === '/matrix' },
    { path: '/blog', label: 'Market & Blog', icon: BookOpen, match: (p) => p.startsWith('/blog') },
  ];

  return (
    <header className="w-full bg-white/95 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md sticky top-[33px] z-30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand with Router Link to Home */}
          <Link 
            to="/"
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            {siteSettings?.logoUrl ? (
              <img 
                src={siteSettings.logoUrl} 
                alt={siteSettings.websiteName || 'FinPulse'} 
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-md"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-[1px] shadow-lg shadow-blue-500/10">
                <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                  <span className="text-lg font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent uppercase">
                    {siteSettings?.logoText || 'FX'}
                  </span>
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                  {siteSettings?.websiteName || 'FinPulse'}
                </span>
                <span className="text-[10px] font-mono uppercase bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-500/20 font-semibold">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                {siteSettings?.tagline || 'Real-Time Forex & Crypto Terminal'}
              </p>
            </div>
          </Link>


          {/* Desktop Navigation with dynamic Router paths */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-950/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.match(currentPath);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status, Theme Toggle & Refresh Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Indicator Badge & Dynamic Local Clock */}
            <div className="hidden lg:flex flex-col items-end text-right">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide">
                    FEED ACTIVE
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 tabular-nums">
                  {liveTime}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {formatUpdatedTime(lastUpdated)}
              </span>
            </div>

            {/* Dark / Light Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all cursor-pointer shadow-sm"
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
              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 active:scale-95 transition-all disabled:opacity-60 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.match(currentPath);
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between px-2">
            <span>Rates: {forexSource || 'Live API'}</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">● {liveTime} Live</span>
          </div>
        </div>
      )}
    </header>
  );
}
