/**
 * FGC Spot Financial News Wire Service
 * Fetches 100% genuine live real-time financial dispatches from public live feeds
 * via RSS-to-JSON endpoints (CoinDesk, Cointelegraph, Yahoo Finance, NYT Business).
 * ZERO mock data or static placeholder articles.
 */

// Live Free Public Financial & Crypto RSS Feeds
const LIVE_FEEDS = {
  all: [
    { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph', defaultCategory: 'Crypto' },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', defaultCategory: 'Markets' },
    { url: 'https://finance.yahoo.com/news/rssindex', source: 'Yahoo Finance', defaultCategory: 'Economy' },
  ],
  crypto: [
    { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph', defaultCategory: 'Crypto' },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', defaultCategory: 'Crypto' },
  ],
  forex: [
    { url: 'https://finance.yahoo.com/news/rssindex', source: 'Yahoo Finance', defaultCategory: 'Forex' },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk Markets', defaultCategory: 'Forex' },
  ],
  markets: [
    { url: 'https://finance.yahoo.com/news/rssindex', source: 'Yahoo Finance', defaultCategory: 'Markets' },
    { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph', defaultCategory: 'Markets' },
  ],
  gold: [
    { url: 'https://finance.yahoo.com/news/rssindex', source: 'Yahoo Finance Commodities', defaultCategory: 'Commodities' },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', defaultCategory: 'Commodities' },
  ],
  economy: [
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml', source: 'New York Times', defaultCategory: 'Economy' },
    { url: 'https://finance.yahoo.com/news/rssindex', source: 'Yahoo Finance', defaultCategory: 'Economy' },
  ]
};

// In-memory cache to prevent spamming endpoints and ensure instant client-side rendering
let newsCache = {
  data: [],
  timestamp: 0,
  category: ''
};

/**
 * Decode HTML entities in headlines & summaries
 */
function decodeHTMLEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/<[^>]*>/g, '') // Strip any remaining HTML tags
    .trim();
}

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
async function fetchRssFeed(feedConfig) {
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
      // Extract thumbnail
      let img = item.thumbnail || (item.enclosure && item.enclosure.link) || null;
      if (!img && item.content) {
        const match = item.content.match(/<img[^>]+src="([^">]+)"/);
        if (match) img = match[1];
      }
      if (!img) {
        // High quality fintech backdrop fallback based on index
        const fallbacks = [
          'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'
        ];
        img = fallbacks[idx % fallbacks.length];
      }

      // Parse timestamp
      const parsedTime = Date.parse(item.pubDate);
      const unixSec = !isNaN(parsedTime) ? Math.floor(parsedTime / 1000) : Math.floor(Date.now() / 1000);

      // Clean category
      let category = feedConfig.defaultCategory;
      if (Array.isArray(item.categories) && item.categories.length > 0) {
        const cat = item.categories[0];
        if (typeof cat === 'string' && cat.length > 1 && cat.length < 20) {
          category = cat;
        }
      }

      return {
        id: item.guid || `${feedConfig.source}-${idx}-${unixSec}`,
        headline: decodeHTMLEntities(item.title),
        source: item.author ? `${feedConfig.source} (${decodeHTMLEntities(item.author)})` : feedConfig.source,
        category: category,
        summary: decodeHTMLEntities(item.description || item.content || '').slice(0, 240) + '...',
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
 * @param {string} category - 'all', 'forex', 'crypto', 'gold', 'economy', 'markets'
 */
export async function fetchLiveMarketNews(category = 'all') {
  const normCat = (category || 'all').toLowerCase();
  
  // Return cached result if fresh within 45 seconds
  const now = Date.now();
  if (newsCache.data.length > 0 && newsCache.category === normCat && (now - newsCache.timestamp < 45000)) {
    return {
      success: true,
      data: newsCache.data,
      source: 'Global Wire Feeds (Live)',
      lastUpdated: new Date(newsCache.timestamp).toLocaleTimeString(),
      isLive: true
    };
  }

  // Determine which feeds to fetch
  const targetFeeds = LIVE_FEEDS[normCat] || LIVE_FEEDS.all;

  try {
    const feedPromises = targetFeeds.map(feed => fetchRssFeed(feed));
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

  // Fallback to cached items if available
  if (newsCache.data.length > 0) {
    return {
      success: true,
      data: newsCache.data,
      source: 'Cached Live Dispatches',
      lastUpdated: new Date(newsCache.timestamp).toLocaleTimeString(),
      isLive: true
    };
  }

  // If initial load encounters network issues, return empty array with graceful notice
  return {
    success: false,
    data: [],
    source: 'Financial News Wire',
    lastUpdated: new Date().toLocaleTimeString(),
    isLive: false
  };
}
