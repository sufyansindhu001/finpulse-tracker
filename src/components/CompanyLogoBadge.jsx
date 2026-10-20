import React, { useState, useEffect } from 'react';

// Official Corporate Domain Mapping for High-Resolution Favicons & Clearbit Brand Logos
// Covers major global blue chips across Pakistan, US, UK, Saudi Arabia, UAE, India, Europe, Japan, China, Canada, Australia
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
  'FABL': 'faysalbank.com',
  'BIPL': 'bankislami.com.pk',
  'BOP': 'bop.com.pk',
  'JSBL': 'jsbl.com',
  'AKBL': 'askarabank.com.pk',

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

  // United Kingdom (London - LSE)
  'SHEL': 'shell.com',
  'SHEL.L': 'shell.com',
  'AZN': 'astrazeneca.com',
  'AZN.L': 'astrazeneca.com',
  'HSBA': 'hsbc.com',
  'HSBA.L': 'hsbc.com',
  'ULVR': 'unilever.com',
  'ULVR.L': 'unilever.com',
  'BP': 'bp.com',
  'BP.L': 'bp.com',
  'GSK': 'gsk.com',
  'GSK.L': 'gsk.com',
  'BATS': 'bat.com',
  'BATS.L': 'bat.com',
  'RIO': 'rio-tinto.com',
  'RIO.L': 'rio-tinto.com',
  'DGE': 'diageo.com',
  'DGE.L': 'diageo.com',
  'REL': 'relx.com',
  'REL.L': 'relx.com',
  'BARC': 'barclays.com',
  'BARC.L': 'barclays.com',
  'LLOY': 'lloydsbankinggroup.com',
  'LLOY.L': 'lloydsbankinggroup.com',
  'VOD': 'vodafone.com',
  'VOD.L': 'vodafone.com',

  // Saudi Arabia (Tadawul)
  '2222': 'aramco.com',
  '2222.SR': 'aramco.com',
  '1120': 'alrajhibank.com.sa',
  '1120.SR': 'alrajhibank.com.sa',
  '2010': 'sabic.com',
  '2010.SR': 'sabic.com',
  '1180': 'alahli.com',
  '1180.SR': 'alahli.com',
  '7010': 'stc.com.sa',
  '7010.SR': 'stc.com.sa',
  '2020': 'sabic-an.com',
  '2020.SR': 'sabic-an.com',
  '1010': 'riyadbank.com',
  '1010.SR': 'riyadbank.com',
  '1150': 'alinma.com',
  '1150.SR': 'alinma.com',
  '1211': 'maaden.com.sa',
  '1211.SR': 'maaden.com.sa',
  '2280': 'almarai.com',
  '2280.SR': 'almarai.com',
  '5110': 'saudicement.com.sa',
  '5110.SR': 'saudicement.com.sa',

  // United Arab Emirates (DFM / ADX)
  'EMAAR': 'emaar.com',
  'EMAAR.AE': 'emaar.com',
  'EMAARDEV': 'emaar.com',
  'ENBD': 'emiratesnbd.com',
  'ENBD.AE': 'emiratesnbd.com',
  'FAB': 'bankfab.com',
  'FAB.AE': 'bankfab.com',
  'DEWA': 'dewa.gov.ae',
  'DEWA.AE': 'dewa.gov.ae',
  'ALDAR': 'aldar.com',
  'ALDAR.AE': 'aldar.com',
  'AIRARABIA': 'airarabia.com',
  'AIRARABIA.AE': 'airarabia.com',
  'DIB': 'dib.ae',
  'DIB.AE': 'dib.ae',
  'ADCB': 'adcb.com',
  'ADCB.AE': 'adcb.com',
  'IHC': 'ihcuae.com',
  'IHC.AE': 'ihcuae.com',
  'TAQA': 'taqaglobal.com',
  'TAQA.AE': 'taqaglobal.com',
  'ADNOCDIST': 'adnocdistribution.ae',
  'ADNOCGAS': 'adnoc.ae',
  'MULTIPLY': 'multiply.ae',
  'ETISALAT': 'eand.com',
  'EAND': 'eand.com',

  // India (NSE / BSE)
  'RELIANCE': 'ril.com',
  'RELIANCE.NS': 'ril.com',
  'TCS': 'tcs.com',
  'TCS.NS': 'tcs.com',
  'HDFCBANK': 'hdfcbank.com',
  'HDFCBANK.NS': 'hdfcbank.com',
  'INFY': 'infosys.com',
  'INFY.NS': 'infosys.com',
  'ICICIBANK': 'icicibank.com',
  'ICICIBANK.NS': 'icicibank.com',
  'HINDUNILVR': 'hul.co.in',
  'HINDUNILVR.NS': 'hul.co.in',
  'SBIN': 'sbi.co.in',
  'SBIN.NS': 'sbi.co.in',
  'BHARTIARTL': 'airtel.in',
  'BHARTIARTL.NS': 'airtel.in',
  'ITC': 'itcportal.com',
  'ITC.NS': 'itcportal.com',
  'KOTAKBANK': 'kotak.com',
  'KOTAKBANK.NS': 'kotak.com',
  'LT': 'larsentoubro.com',
  'LT.NS': 'larsentoubro.com',
  'WIPRO': 'wipro.com',
  'WIPRO.NS': 'wipro.com',
  'TATAMOTORS': 'tatamotors.com',
  'TATAMOTORS.NS': 'tatamotors.com',
  'BAJFINANCE': 'bajajfinserv.in',
  'BAJFINANCE.NS': 'bajajfinserv.in',

  // Germany (DAX 40)
  'SAP': 'sap.com',
  'SAP.DE': 'sap.com',
  'SIE': 'siemens.com',
  'SIE.DE': 'siemens.com',
  'ALV': 'allianz.com',
  'ALV.DE': 'allianz.com',
  'DTE': 'telekom.com',
  'DTE.DE': 'telekom.com',
  'AIR': 'airbus.com',
  'AIR.DE': 'airbus.com',
  'MBG': 'mercedes-benz.com',
  'MBG.DE': 'mercedes-benz.com',
  'BMW': 'bmwgroup.com',
  'BMW.DE': 'bmwgroup.com',
  'BAS': 'basf.com',
  'BAS.DE': 'basf.com',
  'BAYN': 'bayer.com',
  'BAYN.DE': 'bayer.com',
  'VOW3': 'volkswagen-group.com',
  'VOW3.DE': 'volkswagen-group.com',
  'DHL': 'group.dhl.com',
  'DHL.DE': 'group.dhl.com',
  'IFX': 'infineon.com',
  'IFX.DE': 'infineon.com',

  // France (CAC 40)
  'MC': 'lvmh.com',
  'MC.PA': 'lvmh.com',
  'OR': 'loreal.com',
  'OR.PA': 'loreal.com',
  'TTE': 'totalenergies.com',
  'TTE.PA': 'totalenergies.com',
  'RMS': 'hermes.com',
  'RMS.PA': 'hermes.com',
  'SAN': 'sanofi.com',
  'SAN.PA': 'sanofi.com',
  'SU': 'se.com',
  'SU.PA': 'se.com',
  'BNP': 'group.bnpparibas',
  'BNP.PA': 'group.bnpparibas',
  'CS': 'axa.com',
  'CS.PA': 'axa.com',
  'KER': 'kering.com',
  'KER.PA': 'kering.com',
  'SAF': 'safran-group.com',
  'SAF.PA': 'safran-group.com',

  // Japan (Tokyo - TSE)
  '7203': 'toyota.com',
  '7203.T': 'toyota.com',
  '6758': 'sony.com',
  '6758.T': 'sony.com',
  '9984': 'group.softbank',
  '9984.T': 'group.softbank',
  '6861': 'keyence.com',
  '6861.T': 'keyence.com',
  '8306': 'mufg.jp',
  '8306.T': 'mufg.jp',
  '6501': 'hitachi.com',
  '6501.T': 'hitachi.com',
  '7974': 'nintendo.com',
  '7974.T': 'nintendo.com',
  '9432': 'group.ntt',
  '8035': 'tel.com',
  '7267': 'honda.com',

  // Canada (Toronto - TSX)
  'RY': 'rbc.com',
  'RY.TO': 'rbc.com',
  'TD': 'td.com',
  'TD.TO': 'td.com',
  'ENB': 'enbridge.com',
  'ENB.TO': 'enbridge.com',
  'CNR': 'cn.ca',
  'CNR.TO': 'cn.ca',
  'CP': 'cpr.ca',
  'CP.TO': 'cpr.ca',
  'BMO': 'bmo.com',
  'BMO.TO': 'bmo.com',
  'BNS': 'scotiabank.com',
  'BNS.TO': 'scotiabank.com',
  'SHOP': 'shopify.com',
  'SHOP.TO': 'shopify.com',
  'TRP': 'tcenergy.com',
  'TRP.TO': 'tcenergy.com',

  // Australia (Sydney - ASX)
  'BHP': 'bhp.com',
  'BHP.AX': 'bhp.com',
  'CBA': 'commbank.com.au',
  'CBA.AX': 'commbank.com.au',
  'CSL': 'csl.com',
  'CSL.AX': 'csl.com',
  'NAB': 'nab.com.au',
  'NAB.AX': 'nab.com.au',
  'WBC': 'westpac.com.au',
  'WBC.AX': 'westpac.com.au',
  'ANZ': 'anz.com.au',
  'ANZ.AX': 'anz.com.au',
  'WES': 'wesfarmers.com.au',
  'WES.AX': 'wesfarmers.com.au',
  'MQG': 'macquarie.com',
  'MQG.AX': 'macquarie.com',
  'FMG': 'fortescue.com',
  'FMG.AX': 'fortescue.com',
  'WDS': 'woodside.com',
  'TLS': 'telstra.com.au',

  // China & Hong Kong (HKEX / CSI)
  '0700': 'tencent.com',
  '0700.HK': 'tencent.com',
  'TENCENT': 'tencent.com',
  '9988': 'alibabagroup.com',
  '9988.HK': 'alibabagroup.com',
  'BABA': 'alibabagroup.com',
  '1398': 'icbc.com.cn',
  '1398.HK': 'icbc.com.cn',
  'ICBC': 'icbc.com.cn',
  '1211': 'bydglobal.com',
  '1211.HK': 'bydglobal.com',
  'BYD': 'bydglobal.com',
  '3690': 'meituan.com',
  '3690.HK': 'meituan.com',
  'MEITUAN': 'meituan.com',
  '0941': 'chinamobileltd.com',
  '0941.HK': 'chinamobileltd.com',
  '1810': 'mi.com',
  '1810.HK': 'mi.com',
  '0939': 'ccb.com',
  '0939.HK': 'ccb.com',
  '2318': 'pingan.com',
  '2318.HK': 'pingan.com',
  'JD': 'jd.com',
  '9618.HK': 'jd.com',
  'BIDU': 'baidu.com',
  '9888.HK': 'baidu.com',

  // Switzerland & Netherlands
  'ASML': 'asml.com',
  'ASML.AS': 'asml.com',
  'NESN': 'nestle.com',
  'NESN.SW': 'nestle.com',
  'NOVN': 'novartis.com',
  'NOVN.SW': 'novartis.com',
  'ROG': 'roche.com',
  'ROG.SW': 'roche.com',
  'UBSG': 'ubs.com',
  'UNA': 'unilever.com',
  'INGA': 'ing.com',
  'HEIA': 'theheinekencompany.com'
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

// Legal suffixes regex for dynamic company name cleaning
const LEGAL_SUFFIXES_REGEX = /\b(Ltd|Limited|Corp|Corporation|Inc|Incorporated|PLC|PJSC|SAOG|Co|Company|Group|Holdings|Holdings\s+PLC|SE|SA|NV|AG|GmbH|Bhd|Pvt|Pte)\b\.?/gi;

/**
 * Strips corporate legal suffixes and punctuation from company names
 * to maximize match accuracy in global domain lookup services.
 */
export function cleanCompanyName(name = '') {
  if (!name || typeof name !== 'string') return '';
  return name
    .replace(LEGAL_SUFFIXES_REGEX, '')
    .replace(/[,\-–—()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// In-Memory Caches & In-Flight Request Deduplication
const DOMAIN_CACHE = new Map();
const PENDING_REQUESTS = new Map();
const STORAGE_KEY_PREFIX = 'fgc_stock_dom_';

/**
 * Retrieves cached domain/logo metadata from memory or localStorage.
 */
function getCachedDomain(cleanTicker) {
  if (!cleanTicker) return null;
  if (DOMAIN_CACHE.has(cleanTicker)) {
    return DOMAIN_CACHE.get(cleanTicker);
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${cleanTicker}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          DOMAIN_CACHE.set(cleanTicker, parsed);
          return parsed;
        }
      }
    } catch {
      // LocalStorage unavailable or blocked
    }
  }
  return null;
}

/**
 * Saves discovered domain/logo metadata into memory and localStorage.
 */
function setCachedDomain(cleanTicker, data) {
  if (!cleanTicker || !data) return;
  DOMAIN_CACHE.set(cleanTicker, data);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${cleanTicker}`, JSON.stringify(data));
    } catch {
      // Storage quota or privacy restriction
    }
  }
}

/**
 * Asynchronously resolves official website domain & logo using Clearbit's Company Autocomplete endpoint.
 * Features in-flight deduplication and dual-tier caching.
 */
export async function resolveCompanyDomain(companyName, ticker) {
  const cleanTicker = (ticker || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (!cleanTicker) return null;

  const cached = getCachedDomain(cleanTicker);
  if (cached) return cached;

  if (PENDING_REQUESTS.has(cleanTicker)) {
    return PENDING_REQUESTS.get(cleanTicker);
  }

  const cleaned = cleanCompanyName(companyName);
  if (!cleaned || cleaned.length < 2) return null;

  const promise = (async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const url = `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(cleaned)}`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeout);

      if (!res.ok) return null;
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        const top = list[0];
        const result = {
          domain: top.domain || null,
          logo: top.logo || null
        };
        if (result.domain || result.logo) {
          setCachedDomain(cleanTicker, result);
          return result;
        }
      }
    } catch {
      // Network failure or timeout
    }
    return null;
  })();

  PENDING_REQUESTS.set(cleanTicker, promise);
  try {
    const res = await promise;
    return res;
  } finally {
    PENDING_REQUESTS.delete(cleanTicker);
  }
}

/**
 * Institutional Global Corporate Logo Component
 * Implements a 5-Stage Fallback Cascade with Crisp Institutional Framing:
 * Stage 1: Explicit Domain / Logo Map (dictionary for PSX, Tadawul, DFM/ADX, NYSE/NASDAQ, LSE, NSE, etc.)
 * Stage 2: Global Financial Ticker CDN (Financial Modeling Prep & Parqet)
 * Stage 3: Clearbit Live Company Name Discovery (auto-fetched logo & domain)
 * Stage 4: Google 128px High-Res Global Domain Icon
 * Stage 5: DuckDuckGo Domain Icon Service
 * Final Fallback: Institutional Monogram Badge with clean gradient & ticker initials
 */
export default function CompanyLogoBadge({ stock, size = 'sm', className = '' }) {
  const [stageIndex, setStageIndex] = useState(0);

  const rawTicker = stock?.ticker ? stock.ticker.toUpperCase() : '';
  const cleanTicker = (stock?.ticker || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  // Initialize discovered info from cache if already resolved
  const [discoveredInfo, setDiscoveredInfo] = useState(() => {
    if (!cleanTicker) return null;
    return getCachedDomain(cleanTicker);
  });

  // Reset stage index when stock changes
  useEffect(() => {
    setStageIndex(0);
  }, [stock?.ticker, stock?.id]);

  // Dynamically resolve domain via Clearbit Autocomplete if unmapped
  useEffect(() => {
    if (!stock || !stock.name) return;
    const clean = (stock.ticker || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (!clean) return;

    // Check if already covered by explicit dictionary
    if (COMPANY_DOMAINS[rawTicker] || COMPANY_DOMAINS[clean]) {
      return;
    }

    // Check if already in cache
    const cached = getCachedDomain(clean);
    if (cached) {
      setDiscoveredInfo(cached);
      return;
    }

    let isMounted = true;
    resolveCompanyDomain(stock.name, clean).then((res) => {
      if (isMounted && res) {
        setDiscoveredInfo(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [stock?.ticker, stock?.name, rawTicker]);

  if (!stock) return null;

  const explicitDomain = COMPANY_DOMAINS[rawTicker] || COMPANY_DOMAINS[cleanTicker] || stock.domain;
  const resolvedDomain = explicitDomain || discoveredInfo?.domain;
  const discoveredLogo = discoveredInfo?.logo;

  // Build 5-Stage Cascade Candidate URLs
  const rawCandidates = [];

  // Stage 1: Explicit Domain / Logo Map
  if (stock.logo) {
    rawCandidates.push(stock.logo);
  }
  if (explicitDomain) {
    rawCandidates.push(`https://www.google.com/s2/favicons?domain=${explicitDomain}&sz=128`);
  }

  // Stage 2: Global Financial Ticker CDN
  if (cleanTicker && cleanTicker.length >= 2) {
    rawCandidates.push(`https://financialmodelingprep.com/image-stock/${cleanTicker}.png`);
    rawCandidates.push(`https://assets.parqet.com/logos/symbol/${cleanTicker}?format=png`);
  }

  // Stage 3: Clearbit Live Company Name Discovery
  if (discoveredLogo) {
    rawCandidates.push(discoveredLogo);
  }

  // Stage 4: Google 128px High-Res Global Domain Icon
  if (resolvedDomain) {
    rawCandidates.push(`https://www.google.com/s2/favicons?domain=${resolvedDomain}&sz=128`);
  }

  // Stage 5: DuckDuckGo Domain Icon Service
  if (resolvedDomain) {
    rawCandidates.push(`https://icons.duckduckgo.com/ip3/${resolvedDomain}.ico`);
  }

  // Deduplicate while preserving stage priority order
  const candidateUrls = [...new Set(rawCandidates.filter(Boolean))];

  // Container sizing based on official institutional specs
  // Default 'sm' (table): w-9 h-9 rounded-lg bg-white p-1 border border-slate-200/80 shadow-xs
  // 'lg' (modal): w-12 h-12 rounded-xl p-1.5
  const frameClasses = {
    sm: 'w-9 h-9 rounded-lg p-1',
    md: 'w-10 h-10 rounded-lg p-1',
    lg: 'w-12 h-12 rounded-xl p-1.5'
  }[size] || 'w-9 h-9 rounded-lg p-1';

  const textClasses = {
    sm: 'text-[11px] font-black',
    md: 'text-xs font-black',
    lg: 'text-sm font-black'
  }[size] || 'text-[11px] font-black';

  const brand = CORPORATE_BRANDING[rawTicker] || CORPORATE_BRANDING[cleanTicker];
  const sectorBrand = SECTOR_BRANDING[stock.sector] || {
    bg: 'bg-gradient-to-br from-slate-700 via-gray-800 to-neutral-900',
    text: 'text-white'
  };

  const badgeBg = brand?.bg || sectorBrand.bg;
  const badgeText = brand?.text || sectorBrand.text;
  const monogram = brand?.abbr || (cleanTicker.slice(0, 3) || 'STK');

  const hasCandidate = stageIndex < candidateUrls.length;
  const currentUrl = hasCandidate ? candidateUrls[stageIndex] : null;

  // Render real corporate logo image inside institutional frame
  if (currentUrl) {
    return (
      <div 
        className={`relative shrink-0 overflow-hidden ${frameClasses} bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${className}`}
        title={`${stock.name} (${stock.ticker})`}
      >
        <img
          key={currentUrl}
          src={currentUrl}
          alt={`${stock.name} official corporate logo`}
          className="w-full h-full object-contain rounded-md select-none pointer-events-none"
          onError={() => setStageIndex((prev) => prev + 1)}
          loading="lazy"
        />
      </div>
    );
  }

  // Graceful fallback to corporate monogram badge
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center font-mono tracking-tight uppercase shadow-xs border border-white/20 dark:border-white/10 ring-1 ring-black/5 ${frameClasses} ${textClasses} ${badgeBg} ${badgeText} transition-transform duration-200 group-hover:scale-105 ${className}`}
      title={`${stock.name} (${stock.ticker})`}
    >
      <span className="drop-shadow-xs select-none">
        {monogram}
      </span>
    </div>
  );
}

// Export CompanyLogo alias for universal interoperability
export { CompanyLogoBadge as CompanyLogo };
