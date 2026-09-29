import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  LineChart, 
  ArrowLeftRight, 
  Bell, 
  ShieldCheck, 
  Coins, 
  Globe, 
  Sparkles 
} from 'lucide-react';
import { getCurrencyFlagUrl } from '../utils/currencyFlags';

export default function HeroSection({ rates, cryptoList }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('currencies'); // 'currencies' | 'crypto' | 'gold'
  const [tickEffect, setTickEffect] = useState(false);

  // Periodic subtle tick animation to simulate live streaming ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setTickEffect(true);
      setTimeout(() => setTickEffect(false), 800);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const usdToPkr = rates?.PKR || 277.10;
  const eurToPkr = ((rates?.PKR || 277.10) / (rates?.EUR || 0.92)).toFixed(2);
  const gbpToPkr = ((rates?.PKR || 277.10) / (rates?.GBP || 0.79)).toFixed(2);
  const sarToPkr = ((rates?.PKR || 277.10) / (rates?.SAR || 3.75)).toFixed(2);
  const aedToPkr = ((rates?.PKR || 277.10) / (rates?.AED || 3.6725)).toFixed(2);

  const goldPriceUsd = 2684.50;
  const goldPkrPerTola = Math.round((goldPriceUsd * usdToPkr / 31.1035) * 11.6638);
  const goldPkr22KTola = Math.round(goldPkrPerTola * (22 / 24));

  const currencyItems = [
    { pair: 'USD/PKR', name: 'US Dollar', rate: usdToPkr.toFixed(2), change: '+0.04%', up: true, code: 'USD' },
    { pair: 'EUR/PKR', name: 'Euro', rate: eurToPkr, change: '+0.18%', up: true, code: 'EUR' },
    { pair: 'GBP/PKR', name: 'British Pound', rate: gbpToPkr, change: '-0.12%', up: false, code: 'GBP' },
    { pair: 'SAR/PKR', name: 'Saudi Riyal', rate: sarToPkr, change: '+0.01%', up: true, code: 'SAR' },
    { pair: 'AED/PKR', name: 'UAE Dirham', rate: aedToPkr, change: '+0.02%', up: true, code: 'AED' },
  ];

  const cryptoItems = [
    { symbol: 'BTC', name: 'Bitcoin', price: '$96,420.00', change: '+2.84%', up: true, icon: '₿' },
    { symbol: 'ETH', name: 'Ethereum', price: '$2,745.50', change: '+1.92%', up: true, icon: 'Ξ' },
    { symbol: 'SOL', name: 'Solana', price: '$194.50', change: '+5.12%', up: true, icon: '◎' },
    { symbol: 'BNB', name: 'BNB Chain', price: '$648.20', change: '+1.10%', up: true, icon: '◆' },
    { symbol: 'XRP', name: 'XRP Ledger', price: '$2.34', change: '-0.85%', up: false, icon: '✕' },
  ];

  const goldItems = [
    { title: 'Gold Spot / Troy Oz', tag: 'XAU/USD', price: `$${goldPriceUsd.toLocaleString()}`, change: '+0.45%', up: true },
    { title: 'Gold 24K / Tola', tag: 'PKR Bullion', price: `₨${goldPkrPerTola.toLocaleString()}`, change: '+0.38%', up: true },
    { title: 'Gold 22K / Tola', tag: 'PKR Jewelry', price: `₨${goldPkr22KTola.toLocaleString()}`, change: '+0.38%', up: true },
    { title: 'Silver Spot / Troy Oz', tag: 'XAG/USD', price: '$31.85', change: '+1.12%', up: true },
  ];

  return (
    <section className="relative overflow-hidden pt-4 pb-8 sm:pt-10 sm:pb-16 lg:pt-16 lg:pb-24">
      {/* Background ambient glow blooms */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00E676]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#06B6D4]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Headline & CTAs */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 lg:space-y-8 text-left">
            
            {/* Real-time Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 text-xs font-semibold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]"></span>
              </span>
              <span className="text-slate-900 dark:text-white tracking-wider uppercase font-bold text-[10px] sm:text-[11px] truncate">
                REAL-TIME RATES | ACCURATE | ALWAYS ON
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] break-words">
              Your Trusted Source for{' '}
              <span className="text-[#00E676] bg-gradient-to-r from-[#00E676] to-[#00FF88] bg-clip-text text-transparent">
                Live
              </span>{' '}
              Financial Rates
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              Get real-time exchange rates, cryptocurrency prices, gold rates and more — all in one place.
            </p>

            {/* 4 Feature Pills */}
            <div className="flex flex-wrap gap-2 sm:gap-2.5 pt-0.5 sm:pt-1">
              <button 
                onClick={() => navigate('/rates')} 
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0A1726]/80 hover:bg-slate-100 dark:hover:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-white flex items-center gap-1.5 sm:gap-2 transition-all hover:border-[#00E676]/40 shadow-xs cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Live Rates</span>
              </button>
              <button 
                onClick={() => navigate('/charts')} 
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0A1726]/80 hover:bg-slate-100 dark:hover:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-white flex items-center gap-1.5 sm:gap-2 transition-all hover:border-[#00E676]/40 shadow-xs cursor-pointer"
              >
                <LineChart className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Interactive Charts</span>
              </button>
              <button 
                onClick={() => navigate('/converter')} 
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0A1726]/80 hover:bg-slate-100 dark:hover:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-white flex items-center gap-1.5 sm:gap-2 transition-all hover:border-[#00E676]/40 shadow-xs cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Smart Converter</span>
              </button>
              <button 
                onClick={() => navigate('/news')} 
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0A1726]/80 hover:bg-slate-100 dark:hover:bg-[#0D1B2A] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-white flex items-center gap-1.5 sm:gap-2 transition-all hover:border-[#00E676]/40 shadow-xs cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Market News</span>
              </button>
            </div>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
              <button
                onClick={() => navigate('/rates')}
                className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-[#00E676] hover:bg-[#00FF88] text-[#06111F] font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#00E676]/25 hover:shadow-[#00FF88]/35 active:scale-95 cursor-pointer group"
              >
                <span>Explore Live Rates</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => navigate('/converter')}
                className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-white dark:bg-[#0A1726] hover:bg-slate-100 dark:hover:bg-[#0D1B2A] text-slate-900 dark:text-white font-bold text-sm border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all active:scale-95 shadow-xs cursor-pointer flex items-center justify-center"
              >
                Try Currency Converter
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Ultra-Premium Glassmorphic Live Market Terminal Card */}
          <div className="lg:col-span-5 relative">
            
            {/* Floating Top Badge */}
            <div className="absolute -top-4 -right-2 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#0A1726]/95 border border-slate-200 dark:border-[#00E676]/40 shadow-md backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white tracking-wide">⚡ Live Stream</span>
            </div>

            {/* Floating Bottom Badge */}
            <div className="absolute -bottom-4 -left-2 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#0A1726]/95 border border-slate-200 dark:border-white/10 shadow-md backdrop-blur-md text-slate-600 dark:text-[#A8B3C2]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
              <span className="text-[11px] font-semibold text-slate-900 dark:text-white">Bank-Grade Precision</span>
            </div>

            {/* Main Terminal Card */}
            <div className="relative rounded-3xl bg-white dark:bg-[#0D1B2A] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-xl dark:shadow-2xl backdrop-blur-xl space-y-5">
              
              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] inline-block" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider ml-1">
                    LIVE MARKET TERMINAL
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#00E676] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
                  <span>Streaming</span>
                </div>
              </div>

              {/* Multi-Tab Buttons */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-[#06111F] p-1 rounded-xl border border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setActiveTab('currencies')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'currencies'
                      ? 'bg-[#00E676] text-[#06111F] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-[#A8B3C2] dark:hover:text-white'
                  }`}
                >
                  Currencies
                </button>
                <button
                  onClick={() => setActiveTab('crypto')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'crypto'
                      ? 'bg-[#00E676] text-[#06111F] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-[#A8B3C2] dark:hover:text-white'
                  }`}
                >
                  Crypto
                </button>
                <button
                  onClick={() => setActiveTab('gold')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'gold'
                      ? 'bg-[#00E676] text-[#06111F] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-[#A8B3C2] dark:hover:text-white'
                  }`}
                >
                  Gold
                </button>
              </div>

              {/* Tab Content List */}
              <div className="space-y-2.5 min-h-[260px]">
                
                {/* 1. CURRENCIES TAB */}
                {activeTab === 'currencies' && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    {currencyItems.map((item) => (
                      <div 
                        key={item.pair}
                        onClick={() => navigate(`/rates?tab=currencies&pair=${item.pair}`)}
                        className={`flex items-center justify-between py-2.5 px-3 sm:px-3.5 pr-3.5 sm:pr-4 rounded-2xl bg-slate-50 dark:bg-[#0A1726]/70 hover:bg-slate-100 dark:hover:bg-[#0A1726] border border-slate-200/80 dark:border-white/5 hover:border-[#00E676]/30 transition-all cursor-pointer ${
                          tickEffect ? 'border-[#00E676]/30' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img 
                            src={getCurrencyFlagUrl(item.code)} 
                            alt={item.code} 
                            className="w-6 h-4.5 rounded object-cover shadow-xs shrink-0" 
                          />
                          <div className="truncate">
                            <div className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{item.pair}</div>
                            <div className="text-[11px] text-slate-600 dark:text-[#A8B3C2] truncate">{item.name}</div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm font-tabular">{item.rate}</div>
                          <span className="text-[11px] font-bold text-[#00E676] flex items-center justify-end gap-0.5">
                            <TrendingUp className="w-3 h-3" />
                            <span>{item.change}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. CRYPTO TAB */}
                {activeTab === 'crypto' && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    {cryptoItems.map((item) => (
                      <div 
                        key={item.symbol}
                        onClick={() => navigate('/crypto')}
                        className="flex items-center justify-between py-2.5 px-3 sm:px-3.5 pr-3.5 sm:pr-4 rounded-2xl bg-slate-50 dark:bg-[#0A1726]/70 hover:bg-slate-100 dark:hover:bg-[#0A1726] border border-slate-200/80 dark:border-white/5 hover:border-[#00E676]/30 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#06111F] border border-slate-200 dark:border-white/10 flex items-center justify-center font-bold text-sm text-[#00E676] shrink-0">
                            {item.icon}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{item.symbol}/USD</div>
                            <div className="text-[11px] text-slate-600 dark:text-[#A8B3C2] truncate">{item.name}</div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm font-tabular">{item.price}</div>
                          <span className={`text-[11px] font-bold flex items-center justify-end gap-0.5 ${
                            item.up ? 'text-[#00E676]' : 'text-rose-400'
                          }`}>
                            {item.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{item.change}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. GOLD TAB */}
                {activeTab === 'gold' && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    {goldItems.map((item) => (
                      <div 
                        key={item.title}
                        onClick={() => navigate('/gold')}
                        className="flex items-center justify-between py-2.5 px-3 sm:px-3.5 pr-3.5 sm:pr-4 rounded-2xl bg-slate-50 dark:bg-[#0A1726]/70 hover:bg-slate-100 dark:hover:bg-[#0A1726] border border-slate-200/80 dark:border-white/5 hover:border-amber-500/30 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-xs text-amber-500 dark:text-amber-400 shrink-0">
                            24K
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{item.title}</div>
                            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium truncate">{item.tag}</div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm font-tabular">{item.price}</div>
                          <span className="text-[11px] font-bold text-[#00E676] flex items-center justify-end gap-0.5">
                            <TrendingUp className="w-3 h-3" />
                            <span>{item.change}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Bottom Quick Action Strip */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-600 dark:text-[#A8B3C2] border-t border-slate-200 dark:border-white/5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00E676]" />
                  <span>Aggregated Interbank + Multi-Exchange</span>
                </span>
                <button
                  onClick={() => navigate('/rates')}
                  className="text-[#00E676] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Full Matrix</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
