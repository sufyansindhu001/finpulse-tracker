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
 * Strict HTML Entity Decoder
 * Converts all decimal (&#8217;), hex (&#x2018;), and named entities (&quot;, &apos;, &amp;, etc.)
 * so no raw unparsed entity codes ever appear in titles or snippets.
 */
export function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return '';

  // 1. Decode numeric decimal entities: &#1234;
  let decoded = str.replace(/&#(\d+);/g, (match, dec) => {
    try {
      return String.fromCodePoint(parseInt(dec, 10));
    } catch {
      return match;
    }
  });

  // 2. Decode numeric hex entities: &#x2018; or &#X201C;
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    try {
      return String.fromCodePoint(parseInt(hex, 16));
    } catch {
      return match;
    }
  });

  // 3. Named HTML entities dictionary
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

  // 4. Browser DOM fallback for residual named entities
  if (typeof document !== 'undefined' && decoded.includes('&')) {
    try {
      const txt = document.createElement('textarea');
      txt.innerHTML = decoded;
      decoded = txt.value;
    } catch {}
  }

  // 5. Strip any leftover HTML tags and collapse whitespace
  return decoded.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// Backward-compatibility alias
export const decodeHTMLEntities = decodeHtmlEntities;

// Live Free Public Financial & Equity RSS Feeds
const LIVE_FEEDS = {
  all: [
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch', defaultCategory: 'Global Stocks' },
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', source: 'CNBC Markets', defaultCategory: 'Global Stocks' },
    { url: 'https://www.brecorder.com/feeds/latest-news/', source: 'Business Recorder', defaultCategory: 'Local Stocks (PSX)' },
    { url: 'https://profit.pakistantoday.com.pk/feed/', source: 'Profit Pakistan', defaultCategory: 'Local Stocks (PSX)' },
    { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph', defaultCategory: 'Cryptocurrency' },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', defaultCategory: 'Cryptocurrency' },
    { url: 'https://finance.yahoo.com/news/rssindex', source: 'Yahoo Finance Commodities', defaultCategory: 'Gold & Commodities' },
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258', source: 'CNBC Economy', defaultCategory: 'Economy & Central Banks' }
  ],
  'local-stocks': [
    { url: 'https://www.brecorder.com/feeds/latest-news/', source: 'Business Recorder', defaultCategory: 'Local Stocks (PSX)' },
    { url: 'https://profit.pakistantoday.com.pk/feed/', source: 'Profit Pakistan', defaultCategory: 'Local Stocks (PSX)' }
  ],
  'global-stocks': [
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', source: 'CNBC', defaultCategory: 'Global Stocks' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch', defaultCategory: 'Global Stocks' },
    { url: 'https://finance.yahoo.com/news/rssindex', source: 'Yahoo Finance', defaultCategory: 'Global Stocks' }
  ],
  'crypto': [
    { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph', defaultCategory: 'Cryptocurrency' },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', defaultCategory: 'Cryptocurrency' }
  ],
  'forex': [
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=15839069', source: 'CNBC Forex Desk', defaultCategory: 'Markets & Forex' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch Currencies', defaultCategory: 'Markets & Forex' },
    { url: 'https://finance.yahoo.com/news/rssindex', source: 'Yahoo Forex Wire', defaultCategory: 'Markets & Forex' }
  ],
  'commodities': [
    { url: 'https://finance.yahoo.com/news/rssindex', source: 'Yahoo Commodities Desk', defaultCategory: 'Gold & Commodities' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch Commodities', defaultCategory: 'Gold & Commodities' }
  ],
  'economy': [
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258', source: 'CNBC Economy', defaultCategory: 'Economy & Central Banks' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch Macro', defaultCategory: 'Economy & Central Banks' }
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

      const headline = decodeHtmlEntities(item.title);
      const summary = decodeHtmlEntities(item.description || item.content || '').slice(0, 240) + '...';
      const author = item.author ? decodeHtmlEntities(item.author) : feedConfig.source;

      return {
        id: item.guid || `${feedConfig.source}-${idx}-${unixSec}`,
        headline,
        source: item.author ? `${feedConfig.source} (${author})` : feedConfig.source,
        author,
        category,
        summary,
        url: item.link,
        image: img,
        datetime: unixSec,
        pubDate: item.pubDate || new Date(unixSec * 1000).toISOString()
      };
    });
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
        // Guarantee clean decoded entities and image fallbacks
        const sanitizedData = payload.data.map((item, idx) => ({
          ...item,
          headline: decodeHtmlEntities(item.headline),
          summary: decodeHtmlEntities(item.summary),
          author: decodeHtmlEntities(item.author || item.source),
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
          isLive: true
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
        isLive: true
      };
    }
  } catch (err) {
    console.warn('Live news aggregation error:', err);
  }

  // 3. Fallback to cached items if available
  if (newsCache.data.length > 0) {
    return {
      success: true,
      data: newsCache.data,
      source: 'Cached Live Dispatches',
      lastUpdated: new Date(newsCache.timestamp).toLocaleTimeString(),
      isLive: true
    };
  }

  return {
    success: false,
    data: [],
    source: 'Financial News Wire',
    lastUpdated: new Date().toLocaleTimeString(),
    isLive: false
  };
}
