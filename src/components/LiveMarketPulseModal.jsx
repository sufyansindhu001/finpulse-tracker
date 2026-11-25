import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Activity, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function LiveMarketPulseModal({ 
  isOpen, 
  onClose, 
  onRefresh, 
  isRefreshing = false,
  rates = {},
  lastUpdated = ''
}) {
  const navigate = useNavigate();
  const [syncedToast, setSyncedToast] = useState(false);
  const [timeString, setTimeString] = useState(() => new Date().toLocaleTimeString());

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Update the local clock without modifying market prices.
  useEffect(() => {
    if (!isOpen) return;
    const clockInterval = setInterval(() => {
      setTimeString(new Date().toLocaleTimeString());
    }, 2000);
    return () => clearInterval(clockInterval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    if (typeof onRefresh === 'function') {
      await onRefresh();
    }
    setSyncedToast(true);
    setTimeout(() => setSyncedToast(false), 3000);
  };

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const valid = value => Number.isFinite(Number(value)) && Number(value) > 0;
  const usdPkr = valid(rates.PKR) ? Number(rates.PKR) : null;
  const eurPkr = usdPkr !== null && valid(rates.EUR) ? usdPkr / Number(rates.EUR) : null;
  const goldOzUsd = valid(rates.XAU) ? 1 / Number(rates.XAU) : null;
  const silverOzUsd = valid(rates.XAG) ? 1 / Number(rates.XAG) : null;
  const goldTola24K = goldOzUsd !== null && usdPkr !== null
    ? Math.round((goldOzUsd / 31.1035) * 11.6638 * usdPkr) : null;

  const pulseAssets = [
    {
      id: 'usd-pkr',
      name: 'USD / PKR',
      category: 'Interbank Forex',
      price: usdPkr !== null ? `₨${usdPkr.toFixed(2)}` : 'N/A',
      change: '24h: N/A',
      path: '/rates'
    },
    {
      id: 'gold-xau',
      name: 'Spot Gold (XAU/USD)',
      category: 'Precious Metals',
      price: goldOzUsd !== null ? `$${goldOzUsd.toFixed(2)}` : 'N/A',
      change: '24h: N/A',
      path: '/gold'
    },
    {
      id: 'gold-tola',
      name: 'Gold 24K (Tola)',
      category: 'Indicative currency parity',
      price: goldTola24K !== null ? `₨${goldTola24K.toLocaleString()}` : 'N/A',
      change: '24h: N/A',
      path: '/gold'
    },
    {
      id: 'silver-xag',
      name: 'Spot Silver (XAG/USD)',
      category: 'Precious Metals',
      price: silverOzUsd !== null ? `$${silverOzUsd.toFixed(2)}` : 'N/A',
      change: '24h: N/A',
      path: '/gold'
    },
    {
      id: 'eur-pkr',
      name: 'EUR / PKR',
      category: 'Euro Currency',
      price: eurPkr !== null ? `₨${eurPkr.toFixed(2)}` : 'N/A',
      change: '24h: N/A',
      path: '/rates'
    },
    {
      id: 'dxy-index',
      name: 'US Dollar Index (DXY)',
      category: 'Macro Benchmark',
      price: 'N/A',
      change: 'No verified DXY feed',
      path: '/charts'
    },
    {
      id: 'btc-usd',
      name: 'Bitcoin (BTC/USD)',
      category: 'Digital Assets',
      price: 'N/A',
      change: 'Open crypto feed for quotes',
      path: '/crypto'
    },
    {
      id: 'kse-100',
      name: 'KSE-100 Index',
      category: 'PSX Equities',
      price: 'N/A',
      change: 'Open stocks for available quotes',
      path: '/stocks'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="pulse-modal-title"
        className="relative w-full max-w-2xl bg-white dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 text-slate-800 dark:text-[#A8B3C2]"
      >
        {/* Top Glow & Header */}
        <div className="relative p-6 sm:p-8 border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#06111F]/70">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] shadow-[0_0_15px_rgba(0,230,118,0.2)]">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E676]" />
                  </span>
                  <h2 id="pulse-modal-title" className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Live Market Telemetry &amp; Data Pipeline
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  High-frequency streaming exchange rates, bullion spot feeds &amp; network health
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close live telemetry dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Connection Telemetry Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 text-[11px] font-mono">
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#0A1726] border border-slate-200/80 dark:border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Status</span>
              <span className="text-[#00E676] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
                    {usdPkr !== null ? 'FX rate available' : 'Quotes pending'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-[#0A1726] border border-slate-200/80 dark:border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Latency</span>
              <span className="text-slate-900 dark:text-white font-bold">Not measured</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-[#0A1726] border border-slate-200/80 dark:border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Sync Interval</span>
              <span className="text-cyan-500 font-bold">On refresh</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-[#0A1726] border border-slate-200/80 dark:border-white/5 space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Local Clock</span>
              <span className="text-slate-900 dark:text-white font-bold">{timeString}</span>
            </div>
          </div>
        </div>

        {/* Live Spot Matrix */}
        <div className="p-6 sm:p-8 space-y-5 max-h-[50vh] overflow-y-auto">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Streaming Spot Benchmarks</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Last synced: {lastUpdated || 'Not yet available'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pulseAssets.map(asset => (
              <div 
                key={asset.id}
                onClick={() => handleNavigate(asset.path)}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-[#06111F]/70 dark:hover:bg-[#0D1B2A] border border-slate-200/80 dark:border-white/5 hover:border-[#00E676]/40 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {asset.category}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#00E676] transition-colors">
                    {asset.name}
                  </span>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-xs text-slate-900 dark:text-white tabular-nums">
                    {asset.price}
                  </div>
                  <div className={`text-[10px] font-mono font-semibold flex items-center justify-end gap-0.5 ${
                    asset.isPositive ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    <span>{asset.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upstream Ingestion Integrity */}
          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-[#06111F]/90 border border-slate-200 dark:border-white/10 text-xs space-y-2">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Multi-Source Ingestion Verification</span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Available values are taken from current rate feeds. Missing DXY, cryptocurrency, and stock data are not estimated or simulated in this panel.
            </p>
          </div>
        </div>

        {/* Modal Footer & Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#06111F]/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleManualSync}
              disabled={isRefreshing}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00E676]' : ''}`} />
              <span>{isRefreshing ? 'Syncing Feeds...' : 'Sync All Feeds'}</span>
            </button>

            {syncedToast && (
              <span className="text-[11px] text-[#00E676] font-semibold flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Synchronized!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleNavigate('/rates')}
              className="px-4 py-2.5 rounded-xl bg-[#00E676] hover:bg-[#00FF88] text-slate-950 text-xs font-bold transition-all shadow-md shadow-[#00E676]/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Full Rates Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
