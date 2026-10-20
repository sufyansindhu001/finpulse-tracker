import React, { useState } from 'react';

/**
 * Sovereign Direct Vector SVG Registry
 * Embedded high-resolution vector brandmarks for premier sovereign and global giants.
 * 100% immune to network latency, adblockers, CORS blocks, and CDN failures.
 */
const SOVEREIGN_SVG_REGISTRY = {
  // Apple Inc.
  'AAPL': (
    <svg viewBox="0 0 170 170" className="w-full h-full fill-slate-800 dark:fill-white">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.85-11.7-14.42-6.19-9.84-11.02-21.2-14.5-34.09-3.48-12.89-5.22-25.04-5.22-36.46 0-14.92 3.86-27.27 11.58-37.05 7.72-9.78 17.52-14.78 29.41-15 4.89 0 10.23 1.25 16.02 3.75 5.79 2.5 9.77 3.86 11.94 4.09 1.74-.23 5.92-1.63 12.54-4.22 6.63-2.58 12.35-3.76 17.17-3.53 13.43.68 24.16 5.56 32.18 14.65-11.74 7.17-17.47 16.89-17.18 29.17.29 9.78 4.16 17.84 11.61 24.17 7.45 6.33 16.29 9.87 26.52 10.61-2.4 7.39-5.46 14.98-9.19 22.77zM119.22 33.02c0-7.39 2.66-14.44 7.99-21.14 5.33-6.7 11.83-10.97 19.5-12.82.22 1.3.33 2.45.33 3.44 0 7.39-2.77 14.56-8.31 21.5-5.54 6.95-12.18 11.23-19.92 12.84-.11-1.3-.2-2.57-.2-3.82z"/>
    </svg>
  ),

  // Microsoft Corporation
  'MSFT': (
    <svg viewBox="0 0 23 23" className="w-full h-full">
      <path fill="#f35325" d="M1 1h10v10H1z"/>
      <path fill="#81bc06" d="M12 1h10v10H12z"/>
      <path fill="#05a6f0" d="M1 12h10v10H1z"/>
      <path fill="#ffba08" d="M12 12h10v10H12z"/>
    </svg>
  ),

  // Google / Alphabet
  'GOOGL': (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
  ),
  'GOOG': (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
  ),

  // Tesla, Inc.
  'TSLA': (
    <svg viewBox="0 0 340 340" className="w-full h-full fill-[#E82127]">
      <path d="M170 82c-35 0-66 11-92 30l19 24c21-15 46-24 73-24s52 9 73 24l19-24c-26-19-57-30-92-30zm0 46c-18 0-33 7-45 18l14 18c8-7 19-11 31-11s23 4 31 11l14-18c-12-11-27-18-45-18zm-17 48h34v82h-34z"/>
    </svg>
  ),

  // NVIDIA Corporation
  'NVDA': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#76B900"/>
      <path d="M30 68 C22 58 24 42 36 32 C48 22 66 24 76 36 L66 44 C60 36 48 34 40 40 C32 46 32 56 38 62 Z" fill="#FFFFFF"/>
      <path d="M42 62 C38 56 40 48 46 44 C52 40 60 42 64 48 L56 52 C54 48 50 48 48 50 C46 52 46 56 48 58 Z" fill="#FFFFFF"/>
    </svg>
  ),

  // Amazon.com
  'AMZN': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#131921"/>
      <path d="M50 26 C36 26 28 36 28 46 C28 54 34 60 42 60 C46 60 52 56 55 52 V58 H64 V38 C64 30 58 26 50 26 Z M48 52 C42 52 38 48 38 44 C38 38 42 34 48 34 C54 34 56 38 56 44 C56 48 54 52 48 52 Z" fill="#FFFFFF"/>
      <path d="M24 72 C42 82 62 82 78 70 C79 69 78 68 77 69 C63 80 44 80 25 71 C24 70 23 71 24 72 Z" fill="#FF9900"/>
      <path d="M74 65 L80 69 L77 74 Z" fill="#FF9900"/>
    </svg>
  ),

  // Meta Platforms
  'META': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#0668E1"/>
      <path d="M50 48 C42 34 32 32 24 38 C14 46 16 66 26 66 C36 66 44 54 50 48 C56 54 64 66 74 66 C84 66 86 46 76 38 C68 32 58 34 50 48 Z M32 56 C26 56 24 48 28 44 C32 40 38 44 42 50 C38 54 36 56 32 56 Z M68 56 C64 56 62 54 58 50 C62 44 68 40 72 44 C76 48 74 56 68 56 Z" fill="#FFFFFF"/>
    </svg>
  ),

  // Habib Bank Limited (HBL)
  'HBL': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#007A53"/>
      <path d="M50 16 L84 50 L50 84 L16 50 Z" fill="#FFFFFF"/>
      <path d="M50 28 L72 50 L50 72 L28 50 Z" fill="#007A53"/>
      <circle cx="50" cy="50" r="10" fill="#FFFFFF"/>
    </svg>
  ),

  // Meezan Bank Limited
  'MEBL': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#0B5D3D"/>
      <circle cx="50" cy="50" r="32" fill="none" stroke="#E5A93C" strokeWidth="6"/>
      <path d="M50 24 C64 24 76 36 76 50 C76 64 64 76 50 76 C58 70 62 60 62 50 C62 40 58 30 50 24 Z" fill="#E5A93C"/>
      <circle cx="42" cy="42" r="5" fill="#FFFFFF"/>
    </svg>
  ),

  // United Bank Limited (UBL)
  'UBL': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#004B87"/>
      <path d="M22 28 H38 V60 C38 68 44 72 50 72 C56 72 62 68 62 60 V28 H78 V60 C78 78 66 88 50 88 C34 88 22 78 22 60 Z" fill="#FFFFFF"/>
      <circle cx="50" cy="40" r="10" fill="#FFCC00"/>
    </svg>
  ),

  // MCB Bank Limited
  'MCB': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#FF6600"/>
      <circle cx="50" cy="50" r="30" fill="#FFFFFF"/>
      <path d="M32 64 L42 36 L50 52 L58 36 L68 64 H58 L54 52 L50 60 L46 52 L42 64 Z" fill="#FF6600"/>
    </svg>
  ),

  // Engro Corporation
  'ENGRO': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#005A9C"/>
      <path d="M30 65 C30 35 60 25 70 25 C70 55 40 65 30 65 Z" fill="#84BD00"/>
      <path d="M38 75 C38 52 65 42 75 42 C75 65 48 75 38 75 Z" fill="#FFFFFF"/>
    </svg>
  ),
  'EFERT': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#008037"/>
      <path d="M30 65 C30 35 60 25 70 25 C70 55 40 65 30 65 Z" fill="#FFFFFF"/>
      <path d="M38 75 C38 52 65 42 75 42 C75 65 48 75 38 75 Z" fill="#F4C430"/>
    </svg>
  ),

  // Lucky Cement Limited
  'LUCK': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#E31B23"/>
      <path d="M25 25 H45 V60 H75 V75 H25 Z" fill="#FFFFFF"/>
      <circle cx="65" cy="40" r="12" fill="#FFFFFF"/>
    </svg>
  ),

  // Systems Limited
  'SYS': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#0B132B"/>
      <path d="M25 35 C25 25 35 25 45 25 H75 V40 H45 C40 40 40 45 45 45 H65 C75 45 75 55 75 65 C75 75 65 75 55 75 H25 V60 H55 C60 60 60 55 55 55 H35 C25 55 25 45 25 35 Z" fill="#00EB88"/>
    </svg>
  ),

  // Oil & Gas Development Company Limited (OGDCL)
  'OGDC': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#0A3622"/>
      <circle cx="50" cy="50" r="32" fill="none" stroke="#F1B82D" strokeWidth="5"/>
      <path d="M50 24 C56 36 65 44 65 54 C65 62 58 68 50 68 C42 68 35 62 35 54 C35 44 44 36 50 24 Z" fill="#F1B82D"/>
      <path d="M50 38 C53 44 58 48 58 54 C58 58 54 62 50 62 C46 62 42 58 42 54 C42 48 47 44 50 38 Z" fill="#E63946"/>
    </svg>
  ),

  // Pakistan Petroleum Limited (PPL)
  'PPL': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#003366"/>
      <path d="M50 20 C62 35 72 48 72 60 C72 72 62 80 50 80 C38 80 28 72 28 60 C28 48 38 35 50 20 Z" fill="#FF9900"/>
      <path d="M50 36 C58 46 64 54 64 62 C64 70 58 74 50 74 C42 74 36 70 36 62 C36 54 42 46 50 36 Z" fill="#FFCC00"/>
      <circle cx="50" cy="58" r="8" fill="#003366"/>
    </svg>
  ),

  // The Hub Power Company Limited (HUBC)
  'HUBC': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#0D2C54"/>
      <path d="M54 18 L28 52 H48 L44 82 L72 46 H52 Z" fill="#00D2D3"/>
    </svg>
  ),

  // Pakistan State Oil (PSO)
  'PSO': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#006633"/>
      <circle cx="50" cy="50" r="32" fill="#FFFFFF"/>
      <path d="M50 22 A28 28 0 0 0 50 78 Z" fill="#006633"/>
      <path d="M50 22 A28 28 0 0 1 50 78 Z" fill="#FF6600"/>
      <circle cx="50" cy="50" r="10" fill="#FFFFFF"/>
    </svg>
  ),

  // Fauji Fertilizer Company (FFC)
  'FFC': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#134E27"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="#F4C430" strokeWidth="5"/>
      <path d="M50 26 L56 42 L72 42 L58 52 L64 68 L50 58 L36 68 L42 52 L28 42 L44 42 Z" fill="#F4C430"/>
    </svg>
  ),

  // Saudi Aramco
  '2222': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#003865"/>
      <circle cx="50" cy="50" r="28" fill="none" stroke="#00A3E0" strokeWidth="5"/>
      <circle cx="50" cy="50" r="14" fill="#84BD00"/>
      <circle cx="50" cy="22" r="5" fill="#00A3E0"/>
      <circle cx="78" cy="50" r="5" fill="#00A3E0"/>
      <circle cx="50" cy="78" r="5" fill="#00A3E0"/>
      <circle cx="22" cy="50" r="5" fill="#00A3E0"/>
    </svg>
  ),

  // Shell plc
  'SHEL': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#FFFFFF"/>
      <path d="M50 18 C30 18 20 35 22 58 C24 75 36 82 50 82 C64 82 76 75 78 58 C80 35 70 18 50 18 Z" fill="#FFD100" stroke="#DD1D21" strokeWidth="4"/>
      <path d="M50 24 V78 M38 30 L42 76 M62 30 L58 76 M28 42 L36 72 M72 42 L64 72" stroke="#DD1D21" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),

  // Bank Alfalah
  'BAFL': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#004B8D"/>
      <path d="M50 20 L78 65 H22 Z" fill="#D71920"/>
      <circle cx="50" cy="48" r="8" fill="#FFFFFF"/>
    </svg>
  ),

  // Bank AL Habib
  'BAHL': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#0A5C36"/>
      <circle cx="50" cy="50" r="28" fill="#FFFFFF"/>
      <path d="M50 28 L66 50 L50 72 L34 50 Z" fill="#0A5C36"/>
    </svg>
  ),

  // National Bank of Pakistan (NBP)
  'NBP': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#005B38"/>
      <circle cx="50" cy="50" r="28" fill="#C5A059"/>
      <circle cx="50" cy="50" r="22" fill="#005B38"/>
      <circle cx="50" cy="50" r="8" fill="#C5A059"/>
    </svg>
  ),

  // Toyota Motor Corporation
  '7203': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#EB0A1E"/>
      <ellipse cx="50" cy="50" rx="36" ry="24" fill="none" stroke="#FFFFFF" strokeWidth="5"/>
      <ellipse cx="50" cy="46" rx="20" ry="14" fill="none" stroke="#FFFFFF" strokeWidth="5"/>
      <ellipse cx="50" cy="52" rx="10" ry="22" fill="none" stroke="#FFFFFF" strokeWidth="5"/>
    </svg>
  ),

  // Emaar Properties
  'EMAAR': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#0E243A"/>
      <path d="M50 16 L65 55 H35 Z" fill="#C5A059"/>
      <path d="M50 40 L76 78 H24 Z" fill="none" stroke="#C5A059" strokeWidth="5"/>
    </svg>
  ),

  // Reliance Industries
  'RELIANCE': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#0B2B64"/>
      <path d="M30 75 V25 H55 C68 25 74 32 74 42 C74 50 68 56 58 58 L76 75 H60 L46 60 H44 V75 Z M44 48 H54 C60 48 62 45 62 42 C62 38 60 36 54 36 H44 Z" fill="#E6252E"/>
    </svg>
  ),

  // Tata Consultancy Services
  'TCS': (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" rx="16" fill="#003B70"/>
      <path d="M22 36 H78 V48 H56 V76 H44 V48 H22 Z" fill="#E41E26"/>
      <circle cx="74" cy="74" r="6" fill="#00A3E0"/>
    </svg>
  )
};

/**
 * Hardcoded Sovereign Domain & Logo Dictionary
 * Bulletproof mapping for all premier companies to official domains & reliable CDN icons.
 */
export const SOVEREIGN_DOMAIN_MAP = {
  // Pakistan PSX Equities
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

  // United States (NYSE / NASDAQ)
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
  'LLY': 'lilly.com',
  'AVGO': 'broadcom.com',
  'COST': 'costco.com',
  'PG': 'pg.com',
  'HD': 'homedepot.com',
  'MA': 'mastercard.com',
  'UNH': 'unitedhealthgroup.com',
  'JNJ': 'jnj.com',
  'BAC': 'bankofamerica.com',
  'KO': 'coca-colacompany.com',
  'PEP': 'pepsico.com',
  'ADBE': 'adobe.com',
  'NFLX': 'netflix.com',
  'AMD': 'amd.com',
  'CRM': 'salesforce.com',
  'INTC': 'intel.com',
  'QCOM': 'qualcomm.com',
  'CSCO': 'cisco.com',
  'DIS': 'thewaltdisneycompany.com',
  'NKE': 'nike.com',

  // United Kingdom (LSE)
  'SHEL': 'shell.com',
  'AZN': 'astrazeneca.com',
  'HSBA': 'hsbc.com',
  'ULVR': 'unilever.com',
  'BP': 'bp.com',
  'GSK': 'gsk.com',
  'BATS': 'bat.com',
  'RIO': 'rio-tinto.com',
  'REL': 'relx.com',

  // Saudi Arabia (Tadawul)
  '2222': 'aramco.com',
  '1120': 'alrajhibank.com.sa',
  '2010': 'sabic.com',
  '1180': 'alahli.com',
  '7010': 'stc.com.sa',
  '2020': 'sabic-an.com',
  '1010': 'riyadbank.com',

  // United Arab Emirates (DFM / ADX)
  'EMAAR': 'emaar.com',
  'ENBD': 'emiratesnbd.com',
  'FAB': 'bankfab.com',
  'DEWA': 'dewa.gov.ae',
  'ALDAR': 'aldar.com',
  'AIRARABIA': 'airarabia.com',
  'DIB': 'dib.ae',

  // India (NSE)
  'RELIANCE': 'ril.com',
  'TCS': 'tcs.com',
  'HDFCBANK': 'hdfcbank.com',
  'INFY': 'infosys.com',
  'ICICIBANK': 'icicibank.com',
  'SBIN': 'sbi.co.in',
  'BHARTIARTL': 'airtel.in',

  // Japan (TSE)
  '7203': 'toyota.com',
  '6758': 'sony.com',
  '9984': 'group.softbank',
  '6861': 'keyence.com',
  '8306': 'mufg.jp',
  '6501': 'hitachi.com',

  // Germany (DAX)
  'SAP': 'sap.com',
  'SIE': 'siemens.com',
  'ALV': 'allianz.com',
  'DTE': 'telekom.com',
  'AIR': 'airbus.com',
  'MBG': 'mercedes-benz.com',
  'BMW': 'bmwgroup.com',

  // France (CAC 40)
  'MC': 'lvmh.com',
  'OR': 'loreal.com',
  'TTE': 'totalenergies.com',
  'RMS': 'hermes.com',
  'SAN': 'sanofi.com',
  'SU': 'se.com',

  // Canada (TSX)
  'RY': 'rbc.com',
  'TD': 'td.com',
  'ENB': 'enbridge.com',
  'CNR': 'cn.ca',
  'SHOP': 'shopify.com',

  // Australia (ASX)
  'BHP': 'bhp.com',
  'CBA': 'commbank.com.au',
  'CSL': 'csl.com',
  'NAB': 'nab.com.au',
  'WES': 'wesfarmers.com.au',

  // China & Hong Kong
  '0700': 'tencent.com',
  '9988': 'alibabagroup.com',
  '1398': 'icbc.com.cn',
  '1211': 'bydglobal.com',
  '3690': 'meituan.com'
};

/**
 * Curated 2-letter monogram abbreviations for clean institutional typography
 */
const SOVEREIGN_MONOGRAMS = {
  'OGDC': 'OG',
  'PPL': 'PP',
  'HBL': 'HB',
  'UBL': 'UB',
  'MCB': 'MC',
  'MEBL': 'ME',
  'ENGRO': 'EN',
  'LUCK': 'LU',
  'SYS': 'SY',
  'HUBC': 'HU',
  'PSO': 'PS',
  'MARI': 'MA',
  'FFC': 'FF',
  'EFERT': 'EF',
  'AAPL': 'AP',
  'MSFT': 'MS',
  'TSLA': 'TS',
  'NVDA': 'NV',
  'AMZN': 'AM',
  'GOOGL': 'GO',
  'GOOG': 'GO',
  'META': 'ME',
  '2222': 'SA',
  'SHEL': 'SH',
  'BHP': 'BH'
};

/**
 * Deterministic color palette generator using string hash of company name
 * Guarantees a vibrant, professional brand accent background (emerald, blue, indigo, amber, violet, rose, cyan, teal)
 */
function getBrandColor(nameOrTicker) {
  const str = nameOrTicker || 'STK';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const palettes = [
    { bg: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700', border: 'border-emerald-400/40' },
    { bg: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800', border: 'border-blue-400/40' },
    { bg: 'bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800', border: 'border-indigo-400/40' },
    { bg: 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700', border: 'border-amber-400/40' },
    { bg: 'bg-gradient-to-br from-violet-600 via-fuchsia-600 to-purple-800', border: 'border-violet-400/40' },
    { bg: 'bg-gradient-to-br from-rose-500 via-red-600 to-rose-700', border: 'border-rose-400/40' },
    { bg: 'bg-gradient-to-br from-cyan-500 via-blue-600 to-cyan-700', border: 'border-cyan-400/40' },
    { bg: 'bg-gradient-to-br from-teal-500 via-emerald-600 to-teal-800', border: 'border-teal-400/40' }
  ];
  return palettes[Math.abs(hash) % palettes.length];
}

/**
 * Extracts clean, punchy 2-character monogram letters from ticker or company name
 */
function getMonogramLetters(stock) {
  if (!stock) return 'ST';
  const rawTicker = (stock.ticker || '').toUpperCase();
  const cleanTicker = rawTicker.replace(/[^A-Za-z0-9]/g, '');

  if (SOVEREIGN_MONOGRAMS[rawTicker] || SOVEREIGN_MONOGRAMS[cleanTicker]) {
    return SOVEREIGN_MONOGRAMS[rawTicker] || SOVEREIGN_MONOGRAMS[cleanTicker];
  }

  // If ticker has alphabetical characters, use first 2 letters
  if (cleanTicker && !/^\d+$/.test(cleanTicker)) {
    return cleanTicker.slice(0, 2);
  }

  // If numeric ticker (e.g. Tadawul, TSE), extract initials from company name
  const name = (stock.name || '').replace(/[^A-Za-z0-9\s]/g, '').trim();
  const words = name.split(/\s+/).filter((w) => w.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return cleanTicker.slice(0, 2) || 'ST';
}

/**
 * Bulletproof Institutional Company Logo Component
 * 1. Checks Sovereign Vector SVG Registry for immediate, flawless vector rendering.
 * 2. Uses Hardcoded Sovereign Domain Map for Google 128px high-res favicon.
 * 3. Gracefully and instantly renders high-contrast institutional monogram badge on any error.
 */
export default function CompanyLogoBadge({ stock, size = 'sm', className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!stock) return null;

  const rawTicker = (stock.ticker || '').toUpperCase();
  const cleanTicker = rawTicker.replace(/[^A-Za-z0-9]/g, '');

  // 1. Direct Vector SVG Match (Zero network dependency, 100% reliable)
  const vectorSvg = SOVEREIGN_SVG_REGISTRY[rawTicker] || SOVEREIGN_SVG_REGISTRY[cleanTicker];

  // Container sizing
  const frameClasses = {
    sm: 'w-9 h-9 rounded-lg p-1',
    md: 'w-10 h-10 rounded-lg p-1',
    lg: 'w-12 h-12 rounded-xl p-1.5'
  }[size] || 'w-9 h-9 rounded-lg p-1';

  const textClasses = {
    sm: 'text-xs font-black tracking-wider',
    md: 'text-sm font-black tracking-wider',
    lg: 'text-base font-black tracking-wider'
  }[size] || 'text-xs font-black tracking-wider';

  // Render direct vector SVG if available
  if (vectorSvg) {
    return (
      <div 
        className={`relative shrink-0 overflow-hidden ${frameClasses} bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${className}`}
        title={`${stock.name} (${stock.ticker})`}
      >
        <div className="w-full h-full flex items-center justify-center select-none pointer-events-none">
          {vectorSvg}
        </div>
      </div>
    );
  }

  // 2. Sovereign Domain Map for High-Res Google Favicon
  const domain = SOVEREIGN_DOMAIN_MAP[rawTicker] || SOVEREIGN_DOMAIN_MAP[cleanTicker] || stock.domain;
  const logoUrl = stock.logo || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null);

  // Render official logo if present and has not errored
  if (logoUrl && !imgFailed) {
    return (
      <div 
        className={`relative shrink-0 overflow-hidden ${frameClasses} bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${className}`}
        title={`${stock.name} (${stock.ticker})`}
      >
        <img
          src={logoUrl}
          alt={`${stock.name} official logo`}
          className="w-full h-full object-contain rounded-md select-none pointer-events-none"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // 3. Guaranteed Clean Institutional Monogram Fallback
  // Dynamic brand accent palette hashed from name + bold white 2-letter typography with subtle drop shadow
  const palette = getBrandColor(stock.name || stock.ticker);
  const monogram = getMonogramLetters(stock);

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center font-sans ${textClasses} ${palette.bg} ${palette.border} border shadow-md ${frameClasses} text-white transition-transform duration-200 group-hover:scale-105 select-none ${className}`}
      title={`${stock.name} (${stock.ticker})`}
    >
      <span className="drop-shadow-md text-white font-black leading-none">
        {monogram}
      </span>
    </div>
  );
}

// Universal interoperability alias
export { CompanyLogoBadge as CompanyLogo };
