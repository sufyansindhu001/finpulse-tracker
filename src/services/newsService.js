/**
 * FGC Spot Financial News Wire Service
 * Fetches 100% genuine live real-time financial dispatches from public live feeds
 * via RSS-to-JSON endpoints (CNBC, MarketWatch, Yahoo Finance, Business Recorder, Profit Pakistan, Cointelegraph, CoinDesk).
 * 
 * Supports full unified categories:
 * - All News
 * - Local Stocks (PSX)
 * - Global Stocks
 * - Cryptocurrency
 * - Markets & Forex
 * - Gold & Commodities
 * - Economy & Central Banks
 */

// Category-Specific High-Resolution Financial Cover Images
export const CATEGORY_FALLBACK_IMAGES = {
  'local-stocks': [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
  ],
  'global-stocks': [
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80'
  ],
  'crypto': [
    'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
  ],
  'forex': [
    'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
  ],
  'commodities': [
    'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
  ],
  'economy': [
    'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
  ],
  'default': [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80'
  ]
};

/**
 * Returns a guaranteed valid high-resolution cover image for any given category
 */
export function getCategoryFallbackImage(category = '', index = 0) {
  const cat = (category || '').toLowerCase();
  let list = CATEGORY_FALLBACK_IMAGES.default;

  if (cat.includes('local') || cat.includes('psx')) {
    list = CATEGORY_FALLBACK_IMAGES['local-stocks'];
  } else if (cat.includes('global') || cat.includes('international') || cat.includes('wall street') || cat.includes('stock')) {
    list = CATEGORY_FALLBACK_IMAGES['global-stocks'];
  } else if (cat.includes('crypto') || cat.includes('bitcoin') || cat.includes('digital asset')) {
    list = CATEGORY_FALLBACK_IMAGES.crypto;
  } else if (cat.includes('forex') || cat.includes('fx') || cat.includes('corridor') || cat.includes('market')) {
    list = CATEGORY_FALLBACK_IMAGES.forex;
  } else if (cat.includes('gold') || cat.includes('commodit') || cat.includes('bullion') || cat.includes('oil')) {
    list = CATEGORY_FALLBACK_IMAGES.commodities;
  } else if (cat.includes('econom') || cat.includes('central bank') || cat.includes('macro')) {
    list = CATEGORY_FALLBACK_IMAGES.economy;
  }

  const i = Math.abs(Number(index) || 0) % list.length;
  return list[i];
}

/**
 * Guaranteed Zero-Network SVG Data URI Cover Generator
 * Produces crisp, beautiful high-contrast institutional graphic covers
 * ensuring 0 broken images or grey placeholder boxes under any network condition.
 */
export function getCategoryFallbackSvg(category = '') {
  const cat = (category || '').toLowerCase();
  
  let label = 'FINANCIAL INTELLIGENCE';
  let sub = 'Global Market Intelligence Wire';
  let gradStart = '#06111F';
  let gradEnd = '#0B1E36';
  let strokeColor = '#00E676';
  let badgeBg = 'rgba(0, 230, 118, 0.15)';
  let badgeBorder = 'rgba(0, 230, 118, 0.4)';
  let badgeText = '#00E676';
  let pathD = 'M 40 280 Q 180 230 300 250 T 500 160 T 700 90 L 760 110';
  let areaD = 'M 40 280 Q 180 230 300 250 T 500 160 T 700 90 L 760 110 L 760 380 L 40 380 Z';

  if (cat.includes('local') || cat.includes('psx')) {
    label = 'LOCAL EQUITIES & PSX';
    sub = 'Pakistan Stock Exchange Terminal';
    gradStart = '#031F14';
    gradEnd = '#063B26';
    strokeColor = '#00E676';
    badgeBg = 'rgba(0, 230, 118, 0.2)';
    badgeBorder = 'rgba(0, 230, 118, 0.5)';
    badgeText = '#00E676';
    pathD = 'M 40 300 Q 160 210 280 230 T 480 140 T 640 160 T 760 80';
    areaD = 'M 40 300 Q 160 210 280 230 T 480 140 T 640 160 T 760 80 L 760 380 L 40 380 Z';
  } else if (cat.includes('global') || cat.includes('international') || cat.includes('wall street') || cat.includes('stock')) {
    label = 'GLOBAL EQUITIES';
    sub = 'Wall Street & International Equities';
    gradStart = '#0A1726';
    gradEnd = '#132A4A';
    strokeColor = '#3B82F6';
    badgeBg = 'rgba(59, 130, 246, 0.2)';
    badgeBorder = 'rgba(59, 130, 246, 0.5)';
    badgeText = '#60A5FA';
    pathD = 'M 40 290 Q 200 260 360 180 T 560 170 T 760 90';
    areaD = 'M 40 290 Q 200 260 360 180 T 560 170 T 760 90 L 760 380 L 40 380 Z';
  } else if (cat.includes('crypto') || cat.includes('bitcoin') || cat.includes('digital asset')) {
    label = 'DIGITAL ASSETS & CRYPTO';
    sub = 'Blockchain Liquidity & Spot Feeds';
    gradStart = '#1A0B2E';
    gradEnd = '#2B134E';
    strokeColor = '#A855F7';
    badgeBg = 'rgba(168, 85, 247, 0.2)';
    badgeBorder = 'rgba(168, 85, 247, 0.5)';
    badgeText = '#C084FC';
    pathD = 'M 40 310 Q 140 200 260 240 T 440 120 T 600 200 T 760 70';
    areaD = 'M 40 310 Q 140 200 260 240 T 440 120 T 600 200 T 760 70 L 760 380 L 40 380 Z';
  } else if (cat.includes('forex') || cat.includes('currency') || cat.includes('fx')) {
    label = 'FOREX & CURRENCIES';
    sub = 'Interbank FX Rates & Corridor Liquidity';
    gradStart = '#041E28';
    gradEnd = '#073646';
    strokeColor = '#06B6D4';
    badgeBg = 'rgba(6, 182, 212, 0.2)';
    badgeBorder = 'rgba(6, 182, 212, 0.5)';
    badgeText = '#22D3EE';
    pathD = 'M 40 270 Q 180 290 320 200 T 520 210 T 760 100';
    areaD = 'M 40 270 Q 180 290 320 200 T 520 210 T 760 100 L 760 380 L 40 380 Z';
  } else if (cat.includes('gold') || cat.includes('commodit') || cat.includes('bullion') || cat.includes('oil')) {
    label = 'GOLD & COMMODITIES';
    sub = 'LBMA Spot Bullion & Crude Benchmarks';
    gradStart = '#241703';
    gradEnd = '#422806';
    strokeColor = '#F59E0B';
    badgeBg = 'rgba(245, 158, 11, 0.2)';
    badgeBorder = 'rgba(245, 158, 11, 0.5)';
    badgeText = '#FBBF24';
    pathD = 'M 40 280 Q 200 220 340 230 T 540 140 T 760 85';
    areaD = 'M 40 280 Q 200 220 340 230 T 540 140 T 760 85 L 760 380 L 40 380 Z';
  } else if (cat.includes('econom') || cat.includes('central bank') || cat.includes('macro')) {
    label = 'MACRO ECONOMY';
    sub = 'Global Central Banks & Policy Decisions';
    gradStart = '#240810';
    gradEnd = '#420F1D';
    strokeColor = '#F43F5E';
    badgeBg = 'rgba(244, 63, 94, 0.2)';
    badgeBorder = 'rgba(244, 63, 94, 0.5)';
    badgeText = '#FB7185';
    pathD = 'M 40 290 Q 220 230 380 240 T 580 150 T 760 110';
    areaD = 'M 40 290 Q 220 230 380 240 T 580 150 T 760 110 L 760 380 L 40 380 Z';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="g_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradStart}"/>
        <stop offset="100%" stop-color="${gradEnd}"/>
      </linearGradient>
      <linearGradient id="g_curve" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.0"/>
      </linearGradient>
      <pattern id="g_grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="800" height="450" fill="url(#g_bg)"/>
    <rect width="800" height="450" fill="url(#g_grid)"/>
    <path d="${areaD}" fill="url(#g_curve)"/>
    <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="760" cy="85" r="8" fill="${strokeColor}" opacity="0.7"/>
    <circle cx="760" cy="85" r="3.5" fill="#FFFFFF"/>
    <rect x="40" y="38" width="110" height="26" rx="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)"/>
    <text x="52" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" letter-spacing="1">FGC SPOT</text>
    <rect x="160" y="38" width="220" height="26" rx="6" fill="${badgeBg}" stroke="${badgeBorder}"/>
    <text x="172" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="700" fill="${badgeText}" letter-spacing="0.5">${label}</text>
    <text x="40" y="385" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#FFFFFF">${label}</text>
    <text x="40" y="410" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="rgba(255,255,255,0.65)">${sub}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Robust HTML-to-Plain-Text Converter
 * Completely strips HTML tags, handles CDATA, unclosed tags, attributes, and decodes HTML entities.
 * Prefers standard browser DOMParser when available, with a bulletproof scanner state machine.
 */
export function cleanHtmlToPlainText(input) {
  if (!input || typeof input !== 'string') return '';

  // 1. Unwrap CDATA wrappers
  let text = input.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1');

  // 2. Remove script and style elements and comments entirely
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
  text = text.replace(/<!--[\s\S]*?-->/g, ' ');

  // 3. Browser DOMParser fast-path if available
  if (typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(text, 'text/html');
      text = doc.body.textContent || text;
    } catch {}
  }

  // 4. Robust tag scanner / state machine (handles multiline tags, attributes, and unclosed tags at EOF)
  let out = '';
  let inTag = false;
  let quoteChar = null;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (!inTag) {
      if (char === '<') {
        inTag = true;
        quoteChar = null;
      } else {
        out += char;
      }
    } else {
      if (quoteChar) {
        if (char === quoteChar) {
          quoteChar = null;
        }
      } else {
        if (char === '"' || char === "'") {
          quoteChar = char;
        } else if (char === '>') {
          inTag = false;
          out += ' ';
        }
      }
    }
  }

  // 5. Decode numeric decimal, hex, and named HTML entities
  let decoded = out
    .replace(/&#(\d+);/g, (m, dec) => {
      try { return String.fromCodePoint(parseInt(dec, 10)); } catch { return m; }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (m, hex) => {
      try { return String.fromCodePoint(parseInt(hex, 16)); } catch { return m; }
    });

  const namedEntities = {
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&#039;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&iexcl;': '¡',
    '&cent;': '¢',
    '&pound;': '£',
    '&curren;': '¤',
    '&yen;': '¥',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&bull;': '•',
    '&hellip;': '…',
    '&prime;': '′',
    '&Prime;': '″',
    '&ndash;': '–',
    '&mdash;': '—',
    '&lsquo;': '‘',
    '&rsquo;': '’',
    '&sbquo;': '‚',
    '&ldquo;': '“',
    '&rdquo;': '”',
    '&bdquo;': '„',
    '&dagger;': '†',
    '&Dagger;': '‡',
    '&permil;': '‰',
    '&lsaquo;': '‹',
    '&rsaquo;': '›',
    '&euro;': '€'
  };

  for (const [entity, char] of Object.entries(namedEntities)) {
    decoded = decoded.replaceAll(entity, char);
  }

  // 6. Catch any residual encoded tags and strip trailing unclosed tags
  if (decoded.includes('<') && decoded.includes('>')) {
    decoded = decoded.replace(/<[^>]*>/g, ' ');
  }
  decoded = decoded.replace(/<[^>]*$/g, '');

  return decoded.replace(/\s+/g, ' ').trim();
}

/**
 * Safely cleans and truncates RSS news descriptions without ever exposing raw HTML tags.
 */
export function cleanNewsDescription(rawHtml, maxLength = 240) {
  const plain = cleanHtmlToPlainText(rawHtml);
  if (!plain) return '';
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).replace(/[,;:\s]+$/, '') + '...';
}

/**
 * Enhanced HTML entity decoder that guarantees complete tag stripping and entity decoding.
 */
export function decodeHtmlEntities(str) {
  return cleanHtmlToPlainText(str);
}

// Backward-compatibility alias
export const decodeHTMLEntities = decodeHtmlEntities;

/**
 * Targeted Editorial Relevance Filter
 * Drops non-financial relationship advice drama, celebrity gossip, crime blotters, and entertainment.
 * NOTE: Preserves legitimate financial stories about retirement policies, 401(k), pensions, Social Security, and taxes.
 */
const IRRELEVANT_PATTERNS = [
  /\b(the moneyist|help me retire|dear penny)\b/i,
  /\b(my husband|my wife|my girlfriend|my boyfriend|my mother-in-law|my father-in-law|my brother-in-law|my sister-in-law|my stepchild|my stepchildren|my stepdaughter|my stepson|my roommate|my fiance|my ex-wife|my ex-husband)\b/i,
  /\b(divorce settlement|cheating spouse|dating app|tinder|bumble)\b/i,
  /\b(kardashian|hollywood|celebrity|oscar nomination|grammy award|box office|movie review|netflix series|reality tv|pop star|red carpet)\b/i,
  /\b(powerball jackpot|mega millions winner|lottery numbers|scratch-off)\b/i,
  /\b(horoscope|zodiac sign|weight loss diet|skincare routine)\b/i,
  /\b(nfl draft|nba playoffs|premier league score|champions league final)\b/i,
  /\b(murder suspect|homicide investigation|armed robbery suspect|hit-and-run driver|deadly shooting at)\b/i
];

export function isEditorialRelevant(headline = '', summary = '') {
  if (!headline || typeof headline !== 'string') return false;
  const combined = `${headline} ${summary}`.toLowerCase();
  for (const regex of IRRELEVANT_PATTERNS) {
    if (regex.test(combined)) return false;
  }
  return true;
}


/**
 * Universal Category Matcher
 * Performs fast, accurate semantic mapping between item categories and target filter tabs.
 */
export function matchesCategory(itemCategory = '', targetCategory = 'all') {
  if (!targetCategory || targetCategory === 'all') return true;
  const ic = (itemCategory || '').toLowerCase();
  const tc = (targetCategory || '').toLowerCase().replace(/[\s_]+/g, '-');

  if (tc === 'local-stocks' || tc === 'psx' || tc === 'local') {
    return ic.includes('local') || ic.includes('psx') || ic.includes('pakistan') || ic.includes('karachi');
  }
  if (tc === 'global-stocks' || tc === 'stocks' || tc === 'international-stocks') {
    return ic.includes('global') || ic.includes('international') || ic.includes('wall street') || (ic.includes('stock') && !ic.includes('local') && !ic.includes('psx')) || ic.includes('equity') || ic.includes('nasdaq') || ic.includes('s&p');
  }
  if (tc === 'crypto' || tc === 'cryptocurrency') {
    return ic.includes('crypto') || ic.includes('bitcoin') || ic.includes('ethereum') || ic.includes('blockchain') || ic.includes('digital asset');
  }
  if (tc === 'forex' || tc === 'markets' || tc === 'markets-forex' || tc === 'currencies') {
    return ic.includes('forex') || ic.includes('currency') || ic.includes('fx') || ic.includes('interbank') || ic.includes('remittance') || ic.includes('market');
  }
  if (tc === 'commodities' || tc === 'gold' || tc === 'gold-commodities') {
    return ic.includes('gold') || ic.includes('commodit') || ic.includes('bullion') || ic.includes('oil') || ic.includes('silver') || ic.includes('metal') || ic.includes('brent');
  }
  if (tc === 'economy' || tc === 'central-banks' || tc === 'economy-central-banks' || tc === 'macro') {
    return ic.includes('econom') || ic.includes('central bank') || ic.includes('fed') || ic.includes('macro') || ic.includes('sbp') || ic.includes('imf') || ic.includes('monetary');
  }
  return ic.includes(tc);
}

// Live Free Public Financial & Equity RSS Feeds
const LIVE_FEEDS = {
  all: [
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', source: 'CNBC', defaultCategory: 'Global Stocks' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch', defaultCategory: 'Global Stocks' },
    { url: 'https://www.brecorder.com/feeds/latest-news/', source: 'Business Recorder', defaultCategory: 'Local Stocks (PSX)' },
    { url: 'https://profit.pakistantoday.com.pk/feed/', source: 'Profit Pakistan', defaultCategory: 'Local Stocks (PSX)' },
    { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph', defaultCategory: 'Cryptocurrency' },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', defaultCategory: 'Cryptocurrency' },
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000846', source: 'CNBC', defaultCategory: 'Gold & Commodities' },
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258', source: 'CNBC', defaultCategory: 'Economy & Central Banks' }
  ],
  'local-stocks': [
    { url: 'https://www.brecorder.com/feeds/latest-news/', source: 'Business Recorder', defaultCategory: 'Local Stocks (PSX)' },
    { url: 'https://profit.pakistantoday.com.pk/feed/', source: 'Profit Pakistan', defaultCategory: 'Local Stocks (PSX)' }
  ],
  'global-stocks': [
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', source: 'CNBC', defaultCategory: 'Global Stocks' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch', defaultCategory: 'Global Stocks' }
  ],
  'crypto': [
    { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph', defaultCategory: 'Cryptocurrency' },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', defaultCategory: 'Cryptocurrency' }
  ],
  'forex': [
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=15839069', source: 'CNBC', defaultCategory: 'Markets & Forex' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch', defaultCategory: 'Markets & Forex' }
  ],
  'commodities': [
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000846', source: 'CNBC', defaultCategory: 'Gold & Commodities' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch', defaultCategory: 'Gold & Commodities' }
  ],
  'economy': [
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258', source: 'CNBC', defaultCategory: 'Economy & Central Banks' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch', defaultCategory: 'Economy & Central Banks' }
  ]
};

// Category aliases for flexible querying
LIVE_FEEDS['international-stocks'] = LIVE_FEEDS['global-stocks'];
LIVE_FEEDS.stocks = LIVE_FEEDS['global-stocks'];
LIVE_FEEDS.local = LIVE_FEEDS['local-stocks'];
LIVE_FEEDS.psx = LIVE_FEEDS['local-stocks'];
LIVE_FEEDS.cryptocurrency = LIVE_FEEDS.crypto;
LIVE_FEEDS.markets = LIVE_FEEDS.forex;
LIVE_FEEDS['markets-forex'] = LIVE_FEEDS.forex;
LIVE_FEEDS.gold = LIVE_FEEDS.commodities;
LIVE_FEEDS['gold-commodities'] = LIVE_FEEDS.commodities;
LIVE_FEEDS['commodities-economy'] = LIVE_FEEDS.commodities;
LIVE_FEEDS['central-banks'] = LIVE_FEEDS.economy;
LIVE_FEEDS['economy-central-banks'] = LIVE_FEEDS.economy;

// In-memory cache to prevent spamming endpoints and ensure instant client-side rendering
let newsCache = {
  data: [],
  timestamp: 0,
  category: ''
};

/**
 * Dynamic Live Time Calculation Helper
 * Evaluates real elapsed time relative to Date.now() on every invocation.
 */
export function getLiveTimeAgo(timestamp) {
  if (!timestamp) return 'Just now';
  const now = Date.now();
  
  // Handle unix seconds vs milliseconds vs ISO string
  const timeMs = typeof timestamp === 'number' 
    ? (timestamp < 1e12 ? timestamp * 1000 : timestamp)
    : new Date(timestamp).getTime();

  if (isNaN(timeMs)) return 'Recently';

  const diffSeconds = Math.max(0, Math.floor((now - timeMs) / 1000));
  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Backward-compatibility alias
export const formatTimeAgo = getLiveTimeAgo;

/**
 * Fetch a single RSS feed via rss2json
 */
async function fetchRssFeed(feedConfig, categoryIndex = 0) {
  try {
    const encodedUrl = encodeURIComponent(feedConfig.url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodedUrl}`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const json = await res.json();
    if (!json || json.status !== 'ok' || !Array.isArray(json.items)) {
      return [];
    }

    return json.items.map((item, idx) => {
      // Clean category
      let category = feedConfig.defaultCategory;
      if (Array.isArray(item.categories) && item.categories.length > 0) {
        const cat = item.categories[0];
        if (typeof cat === 'string' && cat.length > 1 && cat.length < 35) {
          category = cat;
        }
      }

      // Extract thumbnail
      let img = item.thumbnail || (item.enclosure && item.enclosure.link) || null;
      if (!img && item.content) {
        const match = item.content.match(/<img[^>]+src="([^">]+)"/i);
        if (match) img = match[1];
      }
      if (!img && item.description) {
        const match = item.description.match(/<img[^>]+src="([^">]+)"/i);
        if (match) img = match[1];
      }
      // Guaranteed high-resolution category fallback if no image provided by feed
      if (!img) {
        img = getCategoryFallbackImage(category, idx + categoryIndex);
      }

      // Parse timestamp
      const parsedTime = Date.parse(item.pubDate);
      const unixSec = !isNaN(parsedTime) ? Math.floor(parsedTime / 1000) : Math.floor(Date.now() / 1000);

      const headline = cleanHtmlToPlainText(item.title);
      const summary = cleanNewsDescription(item.description || item.content || '', 240);
      const author = item.author ? cleanHtmlToPlainText(item.author) : feedConfig.source;

      // Filter out non-financial drama, celebrity gossip, and crime blotters
      if (!isEditorialRelevant(headline, summary)) {
        return null;
      }

      return {
        id: item.guid || `${feedConfig.source}-${idx}-${unixSec}`,
        headline,
        source: item.author ? `${feedConfig.source} (${author})` : feedConfig.source,
        author,
        category,
        summary: summary || 'Institutional market intelligence update from real-time financial wire.',
        url: item.link,
        image: img,
        datetime: unixSec,
        pubDate: item.pubDate || new Date(unixSec * 1000).toISOString()
      };
    }).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Fetch live real-time financial market news
 * @param {string} category - 'all', 'local-stocks', 'global-stocks', 'crypto', 'forex', 'commodities', 'economy'
 */
export async function fetchLiveMarketNews(category = 'all') {
  const normCat = (category || 'all').toLowerCase().replace(/[\s_]+/g, '-');
  
  // Return cached result if fresh within 30 seconds
  const now = Date.now();
  if (newsCache.data.length > 0 && newsCache.category === normCat && (now - newsCache.timestamp < 30000)) {
    return {
      success: true,
      data: newsCache.data,
      source: 'Global Wire Feeds (Live)',
      lastUpdated: new Date(newsCache.timestamp).toLocaleTimeString(),
      isLive: true
    };
  }

  // 1. Try serverless /api/news route first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const apiRes = await fetch(`/api/news?category=${encodeURIComponent(normCat)}&_t=${Date.now()}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeout);
    if (apiRes.ok) {
      const payload = await apiRes.json();
      if (payload && Array.isArray(payload.data) && payload.data.length > 0) {
        // Guarantee clean decoded entities, editorial relevance, and image fallbacks
        const sanitizedData = payload.data
          .filter(item => item && isEditorialRelevant(item.headline, item.summary))
          .map((item, idx) => ({
            ...item,
            headline: cleanHtmlToPlainText(item.headline),
            summary: cleanNewsDescription(item.summary, 240),
            author: cleanHtmlToPlainText(item.author || item.source),
            image: item.image || getCategoryFallbackImage(item.category, idx)
          }));

        newsCache = {
          data: sanitizedData,
          timestamp: Date.now(),
          category: normCat
        };
        return {
          success: true,
          data: sanitizedData,
          source: payload.source || 'Live Financial News Wire',
          lastUpdated: payload.lastUpdated || new Date().toLocaleTimeString(),
          isLive: Boolean(payload.isLive),
          isCached: Boolean(payload.isCached),
          isOutdated: Boolean(payload.isOutdated)
        };
      }
    }
  } catch {
    // Continue to client-side RSS aggregation
  }

  // 2. Direct client RSS fetch fallback
  const targetFeeds = LIVE_FEEDS[normCat] || LIVE_FEEDS.all;
  try {
    const feedPromises = targetFeeds.map((feed, idx) => fetchRssFeed(feed, idx));
    const results = await Promise.allSettled(feedPromises);

    let aggregated = [];
    results.forEach(res => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        aggregated = aggregated.concat(res.value);
      }
    });

    // Deduplicate by URL or headline
    const seen = new Set();
    const unique = [];
    for (const item of aggregated) {
      const key = (item.url || item.headline || '').trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }

    // Sort newest first by datetime
    unique.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));

    if (unique.length > 0) {
      newsCache = {
        data: unique,
        timestamp: Date.now(),
        category: normCat
      };

      return {
        success: true,
        data: unique,
        source: 'Live Institutional RSS Wire',
        lastUpdated: new Date().toLocaleTimeString(),
        isLive: true,
        isCached: false
      };
    }
  } catch (err) {
    console.warn('Live news aggregation error:', err);
  }

  // 3. Fallback to genuine previously fetched cached items ONLY if available
  if (newsCache.data.length > 0) {
    const isOutdated = (Date.now() - newsCache.timestamp) > 15 * 60 * 1000;
    return {
      success: true,
      data: newsCache.data,
      source: isOutdated ? 'Cached Wire Dispatches (Outdated)' : 'Cached Live Dispatches',
      lastUpdated: new Date(newsCache.timestamp).toLocaleTimeString(),
      isLive: !isOutdated,
      isCached: true,
      isOutdated
    };
  }

  // 4. Honest unavailable response when no genuine articles are reachable
  return {
    success: false,
    data: [],
    message: 'Live financial news is temporarily unavailable.',
    source: 'Financial News Wire',
    lastUpdated: new Date().toLocaleTimeString(),
    isLive: false,
    isUnavailable: true
  };
}
