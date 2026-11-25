// api/news.js - Real-Time Financial News Wire Serverless Endpoint
// Fetches live financial dispatches from high-authority market feeds (CNBC, CoinDesk, Cointelegraph, MarketWatch, Business Recorder, Profit Pakistan).
// Delivers genuine, raw timestamps (Unix seconds and ISO pubDate) for real-time client-side elapsed calculation.

const RSS_FEEDS = {
  general: [
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', source: 'CNBC', category: 'Global Stocks' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch', category: 'Global Stocks' },
    { url: 'https://www.brecorder.com/feeds/latest-news/', source: 'Business Recorder', category: 'Local Stocks (PSX)' },
    { url: 'https://profit.pakistantoday.com.pk/feed/', source: 'Profit Pakistan', category: 'Local Stocks (PSX)' },
    { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph', category: 'Cryptocurrency' },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', category: 'Cryptocurrency' },
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000846', source: 'CNBC', category: 'Gold & Commodities' },
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258', source: 'CNBC', category: 'Economy & Central Banks' }
  ],
  'local-stocks': [
    { url: 'https://www.brecorder.com/feeds/latest-news/', source: 'Business Recorder', category: 'Local Stocks (PSX)' },
    { url: 'https://profit.pakistantoday.com.pk/feed/', source: 'Profit Pakistan', category: 'Local Stocks (PSX)' }
  ],
  'global-stocks': [
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664', source: 'CNBC', category: 'Global Stocks' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch', category: 'Global Stocks' }
  ],
  'crypto': [
    { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph', category: 'Cryptocurrency' },
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', category: 'Cryptocurrency' }
  ],
  'forex': [
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=15839069', source: 'CNBC', category: 'Markets & Forex' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch', category: 'Markets & Forex' }
  ],
  'commodities': [
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000846', source: 'CNBC', category: 'Gold & Commodities' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch', category: 'Gold & Commodities' }
  ],
  'economy': [
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258', source: 'CNBC', category: 'Economy & Central Banks' },
    { url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', source: 'MarketWatch', category: 'Economy & Central Banks' }
  ]
};

// Aliases for incoming category query parameters
RSS_FEEDS['international-stocks'] = RSS_FEEDS['global-stocks'];
RSS_FEEDS.international = RSS_FEEDS['global-stocks'];
RSS_FEEDS.stocks = RSS_FEEDS['global-stocks'];
RSS_FEEDS.local = RSS_FEEDS['local-stocks'];
RSS_FEEDS.psx = RSS_FEEDS['local-stocks'];
RSS_FEEDS.cryptocurrency = RSS_FEEDS.crypto;
RSS_FEEDS.markets = RSS_FEEDS.forex;
RSS_FEEDS['markets-forex'] = RSS_FEEDS.forex;
RSS_FEEDS.gold = RSS_FEEDS.commodities;
RSS_FEEDS['gold-commodities'] = RSS_FEEDS.commodities;
RSS_FEEDS['commodities-economy'] = RSS_FEEDS.commodities;
RSS_FEEDS['central-banks'] = RSS_FEEDS.economy;
RSS_FEEDS['economy-central-banks'] = RSS_FEEDS.economy;

const CATEGORY_COVERS = {
  'local-stocks': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
  'global-stocks': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
  'crypto': 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=800&q=80',
  'forex': 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=800&q=80',
  'commodities': 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80',
  'economy': 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=800&q=80',
  'default': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80'
};

function getCategoryCover(cat = '') {
  const c = cat.toLowerCase();
  if (c.includes('local') || c.includes('psx')) return CATEGORY_COVERS['local-stocks'];
  if (c.includes('global') || c.includes('international') || c.includes('wall street') || c.includes('stock')) return CATEGORY_COVERS['global-stocks'];
  if (c.includes('crypto') || c.includes('bitcoin')) return CATEGORY_COVERS.crypto;
  if (c.includes('forex') || c.includes('fx') || c.includes('market')) return CATEGORY_COVERS.forex;
  if (c.includes('gold') || c.includes('commodit') || c.includes('oil')) return CATEGORY_COVERS.commodities;
  if (c.includes('econom') || c.includes('central bank')) return CATEGORY_COVERS.economy;
  return CATEGORY_COVERS.default;
}

/**
 * Robust HTML-to-Plain-Text Converter
 * Completely strips HTML tags, handles CDATA, unclosed tags, attributes, and decodes HTML entities.
 * Slicing / length truncation must ONLY be performed on the output of this function.
 */
function cleanHtmlToPlainText(input) {
  if (!input || typeof input !== 'string') return '';

  // 1. Unwrap CDATA markers
  let text = input.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1');

  // 2. Remove script and style elements and comments entirely
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
  text = text.replace(/<!--[\s\S]*?-->/g, ' ');

  // 3. Robust tag scanner / state machine (handles multiline tags, attributes, and unclosed tags at EOF)
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

  // 4. Decode numeric decimal, hex, and named HTML entities
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
    '&yen;': '¥',
    '&euro;': '€',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&bull;': '•',
    '&hellip;': '…',
    '&ndash;': '–',
    '&mdash;': '—',
    '&lsquo;': '‘',
    '&rsquo;': '’',
    '&ldquo;': '“',
    '&rdquo;': '”'
  };

  for (const [entity, char] of Object.entries(namedEntities)) {
    decoded = decoded.replaceAll(entity, char);
  }

  // 5. Catch any residual encoded tags and strip trailing unclosed tags
  if (decoded.includes('<') && decoded.includes('>')) {
    decoded = decoded.replace(/<[^>]*>/g, ' ');
  }
  decoded = decoded.replace(/<[^>]*$/g, '');

  return decoded.replace(/\s+/g, ' ').trim();
}

// Safely cleans and truncates RSS news descriptions without ever exposing raw HTML tags
function cleanNewsDescription(rawHtml, maxLength = 240) {
  const plain = cleanHtmlToPlainText(rawHtml);
  if (!plain) return '';
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).replace(/[,;:\s]+$/, '') + '...';
}

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

function isEditorialRelevant(headline = '', summary = '') {
  if (!headline || typeof headline !== 'string') return false;
  const combined = `${headline} ${summary}`.toLowerCase();
  for (const regex of IRRELEVANT_PATTERNS) {
    if (regex.test(combined)) return false;
  }
  return true;
}

// In-memory cache for serverless instance lifetime
// Stores genuine fetched RSS items ONLY, preserving original source, URL, and timestamp
const serverlessNewsCache = {
  dataByCategory: {},
  timestampByCategory: {}
};

function parseRssXml(xml, defaultSource, defaultCategory) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null && items.length < 15) {
    const itemContent = match[1];

    // Title: converted to clean plain text
    const titleMatch = (/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i.exec(itemContent) || [])[1] || '';
    const cleanTitle = cleanHtmlToPlainText(titleMatch);

    // Link
    const linkMatch = (/<link>([\s\S]*?)<\/link>/i.exec(itemContent) || [])[1] || '';
    const cleanLink = linkMatch.replace(/<!\[CDATA\[|\]\]>/g, '').trim();

    // PubDate
    const pubDateMatch = (/<pubDate>([\s\S]*?)<\/pubDate>/i.exec(itemContent) || [])[1] || '';
    const cleanPubDate = pubDateMatch.trim();

    // Description: converted to safe plain text BEFORE length truncation
    const descMatch = (/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i.exec(itemContent) || [])[1] || '';
    const cleanDesc = cleanNewsDescription(descMatch, 240);

    // Editorial relevance filter: drop non-financial drama, celebrity gossip, and crime blotters
    if (!isEditorialRelevant(cleanTitle, cleanDesc)) {
      continue;
    }

    // Image enclosure or media:content
    let imageMatch = (/<(?:enclosure|media:content)[^>]+url=["']([^"']+)["']/i.exec(itemContent) || [])[1] || '';
    if (!imageMatch) {
      const imgInDesc = (/<img[^>]+src=["']([^"']+)["']/i.exec(itemContent) || [])[1] || '';
      if (imgInDesc) imageMatch = imgInDesc;
    }
    // Guaranteed high-resolution image fallback
    const finalImage = imageMatch || getCategoryCover(defaultCategory);

    // Calculate raw unix timestamp in seconds
    let unixSec = Math.floor(Date.now() / 1000);
    if (cleanPubDate) {
      const parsedTime = Date.parse(cleanPubDate);
      if (!isNaN(parsedTime)) {
        unixSec = Math.floor(parsedTime / 1000);
      }
    }

    if (cleanTitle && cleanLink) {
      const id = 'news-' + Buffer.from(cleanLink).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
      items.push({
        id,
        headline: cleanTitle,
        source: defaultSource,
        category: defaultCategory,
        summary: cleanDesc || 'Institutional market intelligence update from real-time financial wire.',
        url: cleanLink,
        image: finalImage,
        datetime: unixSec,
        pubDate: cleanPubDate || new Date(unixSec * 1000).toISOString()
      });
    }
  }

  return items;
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const category = (req.query?.category || 'general').toLowerCase();

  // 1. Fetch live financial RSS feeds
  const feedList = RSS_FEEDS[category] || RSS_FEEDS.general;
  try {
    const fetchPromises = feedList.map(async feed => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const fetchRes = await fetch(feed.url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        clearTimeout(timeout);
        if (!fetchRes.ok) return [];
        const xml = await fetchRes.text();
        return parseRssXml(xml, feed.source, feed.category);
      } catch {
        return [];
      }
    });

    const feedResults = await Promise.all(fetchPromises);
    const combined = feedResults.flat();

    if (combined.length > 0) {
      combined.sort((a, b) => b.datetime - a.datetime);

      const unique = [];
      const seenTitles = new Set();
      for (const item of combined) {
        const normTitle = item.headline.toLowerCase().slice(0, 30);
        if (!seenTitles.has(normTitle)) {
          seenTitles.add(normTitle);
          unique.push(item);
        }
        if (unique.length >= 18) break;
      }

      serverlessNewsCache.dataByCategory[category] = unique;
      serverlessNewsCache.timestampByCategory[category] = Date.now();

      return res.status(200).json({
        success: true,
        data: unique,
        source: 'Live Institutional RSS Wire',
        lastUpdated: new Date().toLocaleTimeString(),
        isLive: true,
        isCached: false
      });
    }
  } catch (err) {
    console.error('RSS wire fetch error:', err.message);
  }

  // 2. Fallback to genuine previously fetched cached items ONLY if available
  const cachedData = serverlessNewsCache.dataByCategory[category] || serverlessNewsCache.dataByCategory.general || [];
  const cachedTimestamp = serverlessNewsCache.timestampByCategory[category] || serverlessNewsCache.timestampByCategory.general || 0;

  if (cachedData.length > 0) {
    const isOutdated = (Date.now() - cachedTimestamp) > 15 * 60 * 1000;
    return res.status(200).json({
      success: true,
      data: cachedData,
      source: isOutdated ? 'Cached Wire Dispatches (Outdated)' : 'Cached Wire Dispatches',
      lastUpdated: new Date(cachedTimestamp).toLocaleTimeString(),
      isLive: false,
      isCached: true,
      isOutdated
    });
  }

  // 3. Honest unavailable response when no genuine articles are reachable
  return res.status(200).json({
    success: false,
    data: [],
    message: 'Live financial news is temporarily unavailable.',
    source: 'Financial News Wire',
    lastUpdated: new Date().toLocaleTimeString(),
    isLive: false,
    isUnavailable: true
  });
}
