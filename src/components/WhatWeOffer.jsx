import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, 
  Coins, 
  Sparkles, 
  LineChart, 
  ArrowLeftRight, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function WhatWeOffer() {
  const navigate = useNavigate();

  const services = [
    {
      title: 'Currency Rates',
      route: '/rates',
      tag: '160+ FIAT PAIRS',
      desc: 'Real-time central bank and interbank foreign exchange rates with live mid-market corridor benchmarks and transparent zero-spread quotes.',
      icon: Globe,
      accent: '#00E676',
      badge: 'Real-Time FX'
    },
    {
      title: 'Crypto Rates',
      route: '/crypto',
      tag: 'DIGITAL ASSETS',
      desc: 'High-frequency streaming prices for Bitcoin, Ethereum, Solana, and top crypto assets with 24h volume, market cap, and liquidity metrics.',
      icon: Coins,
      accent: '#00FF88',
      badge: 'Multi-Exchange'
    },
    {
      title: 'Gold Rates',
      route: '/gold',
      tag: 'BULLION & COMMODITIES',
      desc: 'Certified precious metals pricing across 24K, 22K, 21K, and 18K purity grades with dynamic Tola, 10-Gram, Gram, and Troy Ounce conversions.',
      icon: Sparkles,
      accent: '#F59E0B',
      badge: 'Official Karats'
    },
    {
      title: 'Interactive Charts',
      route: '/charts',
      tag: 'DEEP MARKET VISUALS',
      desc: 'Multi-timeframe technical charts (1D, 7D, 1M, 1Y) featuring crosshair hover analytics, historical corridor high/lows, and volume depth.',
      icon: LineChart,
      accent: '#06B6D4',
      badge: 'Multi-Timeframe'
    },
    {
      title: 'Currency Converter',
      route: '/converter',
      tag: 'INSTANT MATH',
      desc: 'High-speed currency calculation terminal with instant cross-parity, reverse conversion rates, and quick shortcut pair matrix.',
      icon: ArrowLeftRight,
      accent: '#818CF8',
      badge: 'Zero-Spread'
    }
  ];

  return (
    <section className="relative py-10 sm:py-16 lg:py-24 border-b border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-7 sm:mb-14 space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-[#00E676]/10 border border-[#00E676]/20 text-[#00E676] text-[10px] sm:text-xs font-bold uppercase tracking-widest">
            WHAT WE OFFER
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Everything You Need, in One Place
          </h2>
          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
            Institutional-grade financial intelligence tools engineered for speed, accuracy, and unmatched clarity.
          </p>
        </div>

        {/* 5 Cards Grid: 2-Column on Mobile, 3-Column on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {services.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                onClick={() => navigate(item.route)}
                className={`group relative rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D1B2A] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:border-[#00E676]/40 p-3.5 sm:p-5 md:p-7 transition-all duration-300 shadow-sm dark:shadow-xl backdrop-blur-md cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-2xl hover:shadow-[#00E676]/10 ${
                  index === 3 ? 'col-span-1 lg:col-span-1' : index === 4 ? 'col-span-2 md:col-span-2 lg:col-span-2' : 'col-span-1'
                }`}
              >
                {/* Top Badge & Icon */}
                <div className="space-y-2.5 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-[#0A1726] border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#00E676]" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#A8B3C2] border border-slate-200 dark:border-white/10 group-hover:border-[#00E676]/30 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {item.badge}
                    </span>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <span className="text-[9px] sm:text-[11px] font-bold tracking-widest text-[#00E676] uppercase block">
                      {item.tag}
                    </span>
                    <h3 className="text-sm sm:text-lg md:text-2xl font-black text-slate-900 dark:text-white group-hover:text-[#00E676] transition-colors leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 sm:line-clamp-none">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Link */}
                <div className="pt-3 sm:pt-4 md:pt-6 mt-2 sm:mt-3 md:mt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#00E676] transition-colors">
                  <span className="truncate">Open {item.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1 shrink-0 ml-1" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
