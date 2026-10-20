import React, { useState, useEffect } from 'react';

// Official Corporate Domain Mapping for High-Resolution Favicons
// Only verified, authentic corporate domains - zero third-party auto-discovery or guessing.
export const COMPANY_DOMAINS = {
  // Pakistan Stock Exchange (PSX) Blue-Chips
  'OGDC': 'ogdc.com',
  'MEBL': 'meezanbank.com',
  'UBL': 'ubldigital.com',
  'MCB': 'mcb.com.pk',
  'HBL': 'hbl.com',
  'BAFL': 'bankalfalah.com',
  'BAHL': 'bankalhabib.com',
  'NBP': 'nbp.com.pk',
  'LUCK': 'lucky-cement.com',
  'ENGRO': 'engro.com',
  'FFC': 'ffc.com.pk',
  'EFERT': 'engrofertilizers.com',
  'FATIMA': 'fatima-group.com',
  'SYS': 'systemsltd.com',
  'HUBC': 'hubpower.com',
  'PPL': 'ppl.com.pk',
  'MARI': 'marienergies.com.pk',
  'PSO': 'psopk.com',
  'DGKC': 'dgkcement.com',
  'POL': 'papk.com',
  'FCCL': 'fauji.org.pk',
  'KAPCO': 'kapco.com.pk',
  'KEL': 'ke.com.pk',
  'TRG': 'trgpakistan.com',
  'CHCC': 'cherat.com',
  'MLCF': 'mapleleaf.com.pk',
  'SEARL': 'searlecompany.com',
  'ILP': 'interloop-pk.com',
  'PIOC': 'pioneercement.com',
  'INIL': 'iil.com.pk',
  'ISL': 'isl.com.pk',
  'ATRL': 'arl.com.pk',
  'PRL': 'prl.com.pk',
  'SNGP': 'sngpl.com.pk',
  'SSGC': 'ssgc.com.pk',
  'PAKT': 'bat.com',
  'PSEL': 'pakistanservices.com',
  'LOTCHEM': 'lottechem.pk',
  'AGP': 'agp.com.pk',
  'ABOT': 'abbott.com.pk',
  'GLAXO': 'gsk.com',
  'NESTLE': 'nestle.pk',
  'FHAM': 'fauji.org.pk',
  'UNITY': 'unityfoods.pk',
  'GTYR': 'gtyre.com.pk',
  'KML': 'kmlg.com',
  'NATF': 'nationalfoods.org',
  'TELE': 'telecard.com.pk',
  'WTL': 'worldcall.net.pk',
  'NETSOL': 'netsol.com',
  'AIRLINK': 'airlinkcommunication.com',
  'OCTOPUS': 'octopusdtx.com',
  'AVN': 'avn.com.pk',

  // Global Equities (US, UK, Saudi, Japan, Europe, Asia)
  'AAPL': 'apple.com',
  'MSFT': 'microsoft.com',
  'NVDA': 'nvidia.com',
  'GOOGL': 'google.com',
  'GOOG': 'google.com',
  'AMZN': 'amazon.com',
  'TSLA': 'tesla.com',
  'META': 'meta.com',
  'BRK.B': 'berkshirehathaway.com',
  'BRKB': 'berkshirehathaway.com',
  'BRK-B': 'berkshirehathaway.com',
  'JPM': 'jpmorganchase.com',
  'V': 'visa.com',
  'WMT': 'walmart.com',
  'XOM': 'exxonmobil.com',
  '2222.SR': 'aramco.com',
  '2222': 'aramco.com',
  '1120.SR': 'alrajhibank.com.sa',
  '1120': 'alrajhibank.com.sa',
  '2010.SR': 'sabic.com',
  '2010': 'sabic.com',
  '7203.T': 'toyota.com',
  '7203': 'toyota.com',
  '6758.T': 'sony.com',
  '6758': 'sony.com',
  '9984.T': 'group.softbank',
  '9984': 'group.softbank',
  'SHEL.L': 'shell.com',
  'SHEL': 'shell.com',
  'AZN.L': 'astrazeneca.com',
  'AZN': 'astrazeneca.com',
  'HSBA.L': 'hsbc.com',
  'HSBA': 'hsbc.com',
  '1398.HK': 'icbc.com.cn',
  '1398': 'icbc.com.cn',
  '0700.HK': 'tencent.com',
  '0700': 'tencent.com',
  '9988.HK': 'alibabagroup.com',
  '9988': 'alibabagroup.com',
  'RELIANCE': 'ril.com',
  'TCS': 'tcs.com',
  'INFY': 'infosys.com',
  'HDFCBANK': 'hdfcbank.com',
  'SAP': 'sap.com',
  'ASML': 'asml.com',
  'MC.PA': 'lvmh.com',
  'MC': 'lvmh.com',
  'OR.PA': 'loreal.com',
  'OR': 'loreal.com',
  'NESN.SW': 'nestle.com',
  'NESN': 'nestle.com',
  'NOVN.SW': 'novartis.com',
  'NOVN': 'novartis.com'
};

// Institutional Corporate Branding Palette for Fallback Badges
const CORPORATE_BRANDING = {
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
  'AAPL': { abbr: 'AAP', bg: 'bg-gradient-to-br from-zinc-700 via-slate-800 to-black', text: 'text-white' },
  'MSFT': { abbr: 'MSF', bg: 'bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700', text: 'text-white' },
  'NVDA': { abbr: 'NVD', bg: 'bg-gradient-to-br from-emerald-600 via-green-600 to-lime-700', text: 'text-white' },
  'GOOGL':{ abbr: 'GOO', bg: 'bg-gradient-to-br from-red-600 via-amber-500 to-blue-600', text: 'text-white' },
  'AMZN': { abbr: 'AMZ', bg: 'bg-gradient-to-br from-amber-600 via-orange-600 to-stone-900', text: 'text-white' },
  'TSLA': { abbr: 'TSL', bg: 'bg-gradient-to-br from-red-600 via-rose-700 to-red-900', text: 'text-white' },
  'META': { abbr: 'MET', bg: 'bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800', text: 'text-white' },
  '2222': { abbr: 'ARM', bg: 'bg-gradient-to-br from-emerald-700 via-green-800 to-teal-900', text: 'text-white' },
  '1120': { abbr: 'RAJ', bg: 'bg-gradient-to-br from-blue-800 via-indigo-900 to-slate-900', text: 'text-white' },
  '2010': { abbr: 'SAB', bg: 'bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800', text: 'text-white' },
  'SHEL': { abbr: 'SHL', bg: 'bg-gradient-to-br from-yellow-500 via-amber-600 to-red-600', text: 'text-white' },
  'BHP':  { abbr: 'BHP', bg: 'bg-gradient-to-br from-orange-600 via-amber-700 to-stone-900', text: 'text-white' }
};

// Sector-based gradient fallback for unmapped equities
const SECTOR_BRANDING = {
  'Financials': { bg: 'bg-gradient-to-br from-blue-600 to-indigo-800', text: 'text-white' },
  'Energy': { bg: 'bg-gradient-to-br from-amber-600 via-orange-600 to-red-700', text: 'text-white' },
  'Technology': { bg: 'bg-gradient-to-br from-violet-600 via-indigo-700 to-purple-800', text: 'text-white' },
  'Materials': { bg: 'bg-gradient-to-br from-slate-600 via-zinc-700 to-stone-800', text: 'text-white' },
  'Basic Materials': { bg: 'bg-gradient-to-br from-slate-600 via-zinc-700 to-stone-800', text: 'text-white' },
  'Utilities': { bg: 'bg-gradient-to-br from-cyan-600 to-teal-800', text: 'text-white' },
  'Healthcare': { bg: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700', text: 'text-white' },
  'Consumer Goods': { bg: 'bg-gradient-to-br from-rose-600 via-red-600 to-pink-700', text: 'text-white' },
  'Consumer Cyclicals': { bg: 'bg-gradient-to-br from-rose-600 via-red-600 to-pink-700', text: 'text-white' },
  'Consumer Non-Cyclicals': { bg: 'bg-gradient-to-br from-lime-600 via-green-600 to-emerald-700', text: 'text-white' },
  'Industrials': { bg: 'bg-gradient-to-br from-sky-700 via-blue-800 to-slate-900', text: 'text-white' },
  'Real Estate': { bg: 'bg-gradient-to-br from-amber-700 via-yellow-800 to-stone-900', text: 'text-white' },
  'Telecommunication': { bg: 'bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700', text: 'text-white' }
};

export default function CompanyLogoBadge({ stock, size = 'sm', className = '' }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [stock?.ticker, stock?.id]);

  if (!stock) return null;

  const ticker = stock.ticker || '';
  const cleanTicker = ticker.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const rawTicker = ticker.toUpperCase();

  // Find verified corporate domain
  const domain = COMPANY_DOMAINS[rawTicker] || COMPANY_DOMAINS[cleanTicker];
  const logoUrl = stock.logo || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null);

  const brand = CORPORATE_BRANDING[rawTicker] || CORPORATE_BRANDING[cleanTicker];
  const sectorBrand = SECTOR_BRANDING[stock.sector] || {
    bg: 'bg-gradient-to-br from-slate-700 via-gray-800 to-neutral-900',
    text: 'text-white'
  };

  const badgeBg = brand?.bg || sectorBrand.bg;
  const badgeText = brand?.text || sectorBrand.text;
  const monogram = brand?.abbr || (cleanTicker.slice(0, 3) || 'STK');

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-full',
    md: 'w-10 h-10 rounded-full',
    lg: 'w-12 h-12 rounded-xl'
  }[size] || 'w-8 h-8 rounded-full';

  const textClasses = {
    sm: 'text-[11px] font-black',
    md: 'text-xs font-black',
    lg: 'text-sm font-black'
  }[size] || 'text-[11px] font-black';

  // Render authentic corporate logo favicon image if verified and healthy
  if (logoUrl && !imgError) {
    return (
      <div 
        className={`relative shrink-0 overflow-hidden ${sizeClasses} bg-white dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${className}`}
        title={`${stock.name} (${stock.ticker})`}
      >
        <img
          key={logoUrl}
          src={logoUrl}
          alt={`${stock.name} official logo`}
          className="w-full h-full object-contain rounded-full"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Graceful fallback to corporate monogram badge
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center font-mono tracking-tight uppercase shadow-xs border border-white/20 dark:border-white/10 ring-1 ring-black/5 ${sizeClasses} ${textClasses} ${badgeBg} ${badgeText} transition-transform duration-200 group-hover:scale-105 ${className}`}
      title={`${stock.name} (${stock.ticker})`}
    >
      <span className="drop-shadow-xs select-none">
        {monogram}
      </span>
    </div>
  );
}

// Universal interoperability export
export { CompanyLogoBadge as CompanyLogo };
