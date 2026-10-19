import React, { useState } from 'react';

// Institutional Corporate Branding Palette for Global & PSX Equities
const CORPORATE_BRANDING = {
  // Pakistan PSX Flagship Equities
  'OGDC': { abbr: 'OGD', bg: 'bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700', text: 'text-white' },
  'MEBL': { abbr: 'MEB', bg: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800', text: 'text-white' },
  'UBL':  { abbr: 'UBL', bg: 'bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900', text: 'text-white' },
  'MCB':  { abbr: 'MCB', bg: 'bg-gradient-to-br from-orange-600 via-amber-600 to-red-600', text: 'text-white' },
  'HBL':  { abbr: 'HBL', bg: 'bg-gradient-to-br from-emerald-700 via-green-800 to-emerald-950', text: 'text-white' },
  'LUCK': { abbr: 'LUC', bg: 'bg-gradient-to-br from-red-600 via-rose-700 to-red-800', text: 'text-white' },
  'ENGRO':{ abbr: 'ENG', bg: 'bg-gradient-to-br from-sky-600 via-blue-700 to-blue-900', text: 'text-white' },
  'FFC':  { abbr: 'FFC', bg: 'bg-gradient-to-br from-green-600 via-emerald-700 to-green-900', text: 'text-white' },
  'EFERT':{ abbr: 'EFE', bg: 'bg-gradient-to-br from-lime-600 via-green-600 to-emerald-700', text: 'text-white' },
  'SYS':  { abbr: 'SYS', bg: 'bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-800', text: 'text-white' },
  'HUBC': { abbr: 'HUB', bg: 'bg-gradient-to-br from-cyan-600 via-teal-700 to-blue-800', text: 'text-white' },
  'PPL':  { abbr: 'PPL', bg: 'bg-gradient-to-br from-amber-600 via-orange-600 to-red-600', text: 'text-white' },
  'MARI': { abbr: 'MAR', bg: 'bg-gradient-to-br from-orange-500 via-red-600 to-orange-700', text: 'text-white' },
  'PSO':  { abbr: 'PSO', bg: 'bg-gradient-to-br from-emerald-600 via-green-600 to-amber-600', text: 'text-white' },
  'DGKC': { abbr: 'DGK', bg: 'bg-gradient-to-br from-slate-600 via-zinc-700 to-slate-800', text: 'text-white' },
  'POL':  { abbr: 'POL', bg: 'bg-gradient-to-br from-rose-600 via-red-700 to-rose-900', text: 'text-white' },
  'BAFL': { abbr: 'BAF', bg: 'bg-gradient-to-br from-blue-600 via-cyan-700 to-blue-800', text: 'text-white' },
  'BAHL': { abbr: 'BAH', bg: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-blue-800', text: 'text-white' },
  'FCCL': { abbr: 'FCC', bg: 'bg-gradient-to-br from-stone-600 via-neutral-700 to-stone-800', text: 'text-white' },
  'KAPCO':{ abbr: 'KAP', bg: 'bg-gradient-to-br from-yellow-600 via-amber-700 to-orange-800', text: 'text-white' },
  'TRG':  { abbr: 'TRG', bg: 'bg-gradient-to-br from-purple-600 via-fuchsia-700 to-indigo-800', text: 'text-white' },
  'NBP':  { abbr: 'NBP', bg: 'bg-gradient-to-br from-green-800 via-emerald-900 to-green-950', text: 'text-white' },
  'CHCC': { abbr: 'CHC', bg: 'bg-gradient-to-br from-zinc-600 via-stone-700 to-zinc-800', text: 'text-white' },
  'MLCF': { abbr: 'MLC', bg: 'bg-gradient-to-br from-amber-700 via-yellow-800 to-amber-900', text: 'text-white' },
  'SEARL':{ abbr: 'SRL', bg: 'bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700', text: 'text-white' },
  'ILP':  { abbr: 'ILP', bg: 'bg-gradient-to-br from-violet-600 via-indigo-700 to-blue-800', text: 'text-white' },
  'PIOC': { abbr: 'PIO', bg: 'bg-gradient-to-br from-slate-700 via-zinc-800 to-neutral-900', text: 'text-white' },
  'INIL': { abbr: 'INI', bg: 'bg-gradient-to-br from-blue-800 via-indigo-900 to-slate-900', text: 'text-white' },
  'ISL':  { abbr: 'ISL', bg: 'bg-gradient-to-br from-sky-700 via-blue-800 to-slate-900', text: 'text-white' },
  'ATRL': { abbr: 'ATR', bg: 'bg-gradient-to-br from-red-600 via-orange-700 to-amber-800', text: 'text-white' },
  'PRL':  { abbr: 'PRL', bg: 'bg-gradient-to-br from-orange-600 via-amber-700 to-yellow-800', text: 'text-white' },
  'SNGP': { abbr: 'SNG', bg: 'bg-gradient-to-br from-blue-600 via-teal-700 to-emerald-800', text: 'text-white' },
  'SSGC': { abbr: 'SSG', bg: 'bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800', text: 'text-white' },
  'PAKT': { abbr: 'PAK', bg: 'bg-gradient-to-br from-red-700 via-rose-800 to-red-950', text: 'text-white' },
  'PSEL': { abbr: 'PSE', bg: 'bg-gradient-to-br from-green-700 via-emerald-800 to-teal-900', text: 'text-white' },
  'LOTCHEM':{ abbr: 'LOT', bg: 'bg-gradient-to-br from-rose-600 via-pink-700 to-purple-800', text: 'text-white' },
  'AGP':  { abbr: 'AGP', bg: 'bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800', text: 'text-white' },
  'ABOT': { abbr: 'ABT', bg: 'bg-gradient-to-br from-blue-600 via-sky-600 to-indigo-700', text: 'text-white' },
  'GLAXO':{ abbr: 'GSK', bg: 'bg-gradient-to-br from-orange-600 via-amber-700 to-red-700', text: 'text-white' },
  'NESTLE':{ abbr: 'NES', bg: 'bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900', text: 'text-white' },
  'FHAM': { abbr: 'HAM', bg: 'bg-gradient-to-br from-green-600 via-teal-700 to-emerald-800', text: 'text-white' },
  'UNITY':{ abbr: 'UNI', bg: 'bg-gradient-to-br from-yellow-600 via-amber-700 to-orange-700', text: 'text-white' },
  'GTYR': { abbr: 'GTY', bg: 'bg-gradient-to-br from-stone-700 via-zinc-800 to-neutral-900', text: 'text-white' },
  'KML':  { abbr: 'KML', bg: 'bg-gradient-to-br from-indigo-700 via-purple-800 to-slate-900', text: 'text-white' },
  'NATF': { abbr: 'NAT', bg: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800', text: 'text-white' },
  'TELE': { abbr: 'TEL', bg: 'bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800', text: 'text-white' },
  'WTL':  { abbr: 'WTL', bg: 'bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800', text: 'text-white' },
  'NETSOL':{ abbr: 'NET', bg: 'bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800', text: 'text-white' },
  'AIRLINK':{ abbr: 'AIR', bg: 'bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800', text: 'text-white' },
  'OCTOPUS':{ abbr: 'OCT', bg: 'bg-gradient-to-br from-teal-600 via-cyan-700 to-blue-800', text: 'text-white' },
  'AVN':  { abbr: 'AVN', bg: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800', text: 'text-white' },

  // Global Equities
  'AAPL': { abbr: 'AAP', bg: 'bg-gradient-to-br from-zinc-700 via-slate-800 to-black', text: 'text-white' },
  'MSFT': { abbr: 'MSF', bg: 'bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700', text: 'text-white' },
  'NVDA': { abbr: 'NVD', bg: 'bg-gradient-to-br from-emerald-600 via-green-600 to-lime-700', text: 'text-white' },
  'GOOGL':{ abbr: 'GOO', bg: 'bg-gradient-to-br from-red-600 via-amber-500 to-blue-600', text: 'text-white' },
  'AMZN': { abbr: 'AMZ', bg: 'bg-gradient-to-br from-amber-600 via-orange-600 to-stone-900', text: 'text-white' },
  'TSLA': { abbr: 'TSL', bg: 'bg-gradient-to-br from-red-600 via-rose-700 to-red-900', text: 'text-white' },
  'META': { abbr: 'MET', bg: 'bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800', text: 'text-white' },
  'BRK.B':{ abbr: 'BRK', bg: 'bg-gradient-to-br from-blue-900 via-slate-900 to-black', text: 'text-white' },
  'JPM':  { abbr: 'JPM', bg: 'bg-gradient-to-br from-blue-800 via-slate-800 to-blue-950', text: 'text-white' },
  'V':    { abbr: 'VIS', bg: 'bg-gradient-to-br from-blue-600 via-indigo-700 to-amber-600', text: 'text-white' },
  'WMT':  { abbr: 'WMT', bg: 'bg-gradient-to-br from-blue-600 via-yellow-500 to-blue-700', text: 'text-white' },
  'XOM':  { abbr: 'XOM', bg: 'bg-gradient-to-br from-red-600 via-rose-700 to-red-900', text: 'text-white' },
  '2222.SR': { abbr: 'ARM', bg: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800', text: 'text-white' },
  '7203.T':  { abbr: 'TYO', bg: 'bg-gradient-to-br from-red-600 via-rose-700 to-red-900', text: 'text-white' },
  '6758.T':  { abbr: 'SNY', bg: 'bg-gradient-to-br from-neutral-800 via-zinc-900 to-black', text: 'text-white' },
  'SHEL.L':  { abbr: 'SHL', bg: 'bg-gradient-to-br from-yellow-500 via-amber-600 to-red-600', text: 'text-white' },
  'AZN.L':   { abbr: 'AZN', bg: 'bg-gradient-to-br from-purple-700 via-indigo-800 to-blue-900', text: 'text-white' },
  'HSBA.L':  { abbr: 'HSB', bg: 'bg-gradient-to-br from-red-600 via-slate-800 to-neutral-900', text: 'text-white' },
  '1398.HK': { abbr: 'ICB', bg: 'bg-gradient-to-br from-red-700 via-rose-800 to-red-950', text: 'text-white' },
  'RELIANCE':{ abbr: 'REL', bg: 'bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-950', text: 'text-white' },
  'TCS':     { abbr: 'TCS', bg: 'bg-gradient-to-br from-purple-700 via-indigo-800 to-purple-950', text: 'text-white' },
  'SAP':     { abbr: 'SAP', bg: 'bg-gradient-to-br from-blue-600 via-sky-700 to-blue-900', text: 'text-white' },
  'ASML':    { abbr: 'ASM', bg: 'bg-gradient-to-br from-blue-700 via-cyan-800 to-blue-950', text: 'text-white' },
  'MC.PA':   { abbr: 'LVM', bg: 'bg-gradient-to-br from-neutral-900 via-stone-900 to-black', text: 'text-white' }
};

// Sector-based gradient fallback for unmapped equities
const SECTOR_BRANDING = {
  'Financials': { bg: 'bg-gradient-to-br from-blue-600 to-indigo-800', text: 'text-white' },
  'Energy': { bg: 'bg-gradient-to-br from-amber-600 via-orange-600 to-red-700', text: 'text-white' },
  'Technology': { bg: 'bg-gradient-to-br from-violet-600 via-indigo-700 to-purple-800', text: 'text-white' },
  'Materials': { bg: 'bg-gradient-to-br from-slate-600 via-zinc-700 to-stone-800', text: 'text-white' },
  'Utilities': { bg: 'bg-gradient-to-br from-cyan-600 to-teal-800', text: 'text-white' },
  'Healthcare': { bg: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700', text: 'text-white' },
  'Consumer Goods': { bg: 'bg-gradient-to-br from-rose-600 via-red-600 to-pink-700', text: 'text-white' },
  'Industrials': { bg: 'bg-gradient-to-br from-sky-700 via-blue-800 to-slate-900', text: 'text-white' },
  'Telecommunication': { bg: 'bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700', text: 'text-white' }
};

export default function CompanyLogoBadge({ stock, size = 'sm', className = '' }) {
  const [imgError, setImgError] = useState(false);

  if (!stock) return null;

  const ticker = stock.ticker || '';
  const cleanTicker = ticker.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const brand = CORPORATE_BRANDING[ticker] || CORPORATE_BRANDING[cleanTicker];
  const sectorBrand = SECTOR_BRANDING[stock.sector] || {
    bg: 'bg-gradient-to-br from-slate-700 via-gray-800 to-neutral-900',
    text: 'text-white'
  };

  const badgeBg = brand?.bg || sectorBrand.bg;
  const badgeText = brand?.text || sectorBrand.text;
  const monogram = brand?.abbr || (cleanTicker.slice(0, 3) || 'STK');

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-full text-[11px] font-black',
    md: 'w-10 h-10 rounded-full text-xs font-black',
    lg: 'w-12 h-12 rounded-xl text-sm font-black'
  }[size] || 'w-8 h-8 rounded-full text-[11px] font-black';

  // If an explicit corporate logo image exists and hasn't errored
  if (stock.logo && !imgError) {
    return (
      <div className={`relative shrink-0 overflow-hidden ${sizeClasses} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-center ${className}`}>
        <img
          src={stock.logo}
          alt={`${stock.name} logo`}
          className="w-full h-full object-contain p-1"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center font-mono tracking-tight uppercase shadow-xs border border-white/20 dark:border-white/10 ring-1 ring-black/5 ${sizeClasses} ${badgeBg} ${badgeText} transition-transform duration-200 group-hover:scale-105 ${className}`}
      title={`${stock.name} (${stock.ticker})`}
    >
      <span className="drop-shadow-xs select-none">
        {monogram}
      </span>
    </div>
  );
}
