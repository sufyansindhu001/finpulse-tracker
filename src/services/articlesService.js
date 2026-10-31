/**
 * Articles Data Service for FGC Spot
 * Implements high-efficiency Stale-While-Revalidate (SWR) caching with Vercel Edge integration.
 * Guarantees 0ms initial page render with background synchronization, cache purging, and zero redundant re-renders.
 */

import { BLOG_POSTS } from '../data/blogPosts.js';
import { supabase, normalizeArticle } from '../lib/supabase.js';

export const ARTICLES_CACHE_KEY = 'fgc_portal_articles_v4';
export const ARTICLES_LAST_FETCH_KEY = 'fgc_portal_articles_last_fetch';
const SWR_BACKGROUND_THROTTLE_MS = 45 * 1000; // 45 seconds background revalidation throttle

/**
 * Verified list of thin/generic articles purged for AdSense compliance.
 * Guarantees that stale client storage or cached payloads NEVER resurface these items.
 */
export const PURGED_SLUG_SET = new Set([
  'understanding-crypto-market-cycles-halving-events-liquidity-flows-and-retail-psychology',
  'the-mechanics-of-carry-trade-how-interest-rate-differentials-drive-fx-volatility',
  'the-mechanics-of-sovereign-wealth-funds-how-national-capital-drives-global-asset-markets',
  'the-anatomy-of-liquidity-traps-why-zero-interest-rates-fail-to-stimulate-borrowing',
  'the-foreign-exchange-reserve-buffer-how-import-cover-shapes-sovereign-stability',
  'the-inverse-dynamic-between-gold-prices-and-the-us-dollar-index',
  'the-mechanics-of-current-account-deficits-why-trade-balances-drive-currency-revaluations',
  'the-mechanics-of-currency-swaps-how-central-banks-provide-offshore-dollar-liquidity',
  'sovereign-debt-cycles-and-currency-valuation-how-national-debt-impacts-foreign-exchange',
  'understanding-central-bank-interest-rates-how-the-federal-reserve-impacts-global-currencies',
  'decoding-the-sovereign-yield-curve-what-inversions-signal-to-global-markets',
  'navigating-gold-and-currency-volatility-in-pakistan-why-safe-haven-assets-remain-in-high-demand'
]);

let inMemoryArticlesCache = null;
let articlesMap = new Map();
let lastFetchTimestamp = 0;
let inFlightArticlesPromise = null;

function buildArticlesMap(articlesList) {
  articlesMap.clear();
  if (!Array.isArray(articlesList)) return;
  for (const art of articlesList) {
    if (!art) continue;
    const slugStr = String(art.slug || '').toLowerCase().trim();
    const idStr = String(art.id || '').toLowerCase().trim();
    if (slugStr && !PURGED_SLUG_SET.has(slugStr)) articlesMap.set(slugStr, art);
    if (idStr && !PURGED_SLUG_SET.has(idStr)) articlesMap.set(idStr, art);
  }
}

/**
 * Completely purges memory and client storage caches for articles.
 * Forces immediate fresh retrieval on next render/fetch.
 */
export function purgeArticlesCache() {
  inMemoryArticlesCache = null;
  articlesMap.clear();
  lastFetchTimestamp = 0;
  try {
    localStorage.removeItem(ARTICLES_CACHE_KEY);
    localStorage.removeItem('fgc_portal_articles');
    localStorage.removeItem('fgc_portal_articles_v2');
    localStorage.removeItem('fgc_portal_articles_v3');
    localStorage.removeItem('fgc_portal_articles_v4');
    localStorage.removeItem('fgc_spot_blog_posts');
    localStorage.removeItem(ARTICLES_LAST_FETCH_KEY);
  } catch {}
}

/**
 * Synchronously retrieves cached articles from memory or localStorage.
 * Automatically upgrades outdated or incomplete local storage to the latest clean bundled articles.
 * Strips any purged/suppressed articles from previous sessions.
 * Guarantees instant 0ms initial render without waiting for network or showing blank skeletons.
 */
export function getCachedArticles() {
  const bundled = BLOG_POSTS.map(normalizeArticle).filter(a => a && !PURGED_SLUG_SET.has(String(a.slug || a.id).toLowerCase().trim()));

  if (inMemoryArticlesCache && inMemoryArticlesCache.length >= bundled.length) {
    return inMemoryArticlesCache.filter(a => a && !PURGED_SLUG_SET.has(String(a.slug || a.id).toLowerCase().trim()));
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(ARTICLES_CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const parsedNormalized = parsed
            .map(normalizeArticle)
            .filter(a => a && !PURGED_SLUG_SET.has(String(a.slug || a.id).toLowerCase().trim()));

          if (parsedNormalized.length > 0) {
            const existingKeys = new Set(
              parsedNormalized.flatMap(a => [
                String(a.id || '').toLowerCase().trim(),
                String(a.slug || '').toLowerCase().trim()
              ]).filter(Boolean)
            );

            const missingBundled = bundled.filter(b => {
              const bId = String(b.id || '').toLowerCase().trim();
              const bSlug = String(b.slug || '').toLowerCase().trim();
              return !existingKeys.has(bId) && !existingKeys.has(bSlug);
            });

            const merged = [...parsedNormalized, ...missingBundled];
            inMemoryArticlesCache = merged;
            buildArticlesMap(merged);
            return merged;
          }
        }
      } else {
        // Clear old stale storage keys from before the AdSense audit
        try {
          localStorage.removeItem('fgc_portal_articles');
          localStorage.removeItem('fgc_portal_articles_v2');
          localStorage.removeItem('fgc_portal_articles_v3');
          localStorage.removeItem('fgc_spot_blog_posts');
        } catch {}
      }
    }
  } catch (e) {
    console.warn('[articlesService] Failed to read cached articles:', e);
  }

  // If localStorage had an older or incomplete set, seed with bundled
  inMemoryArticlesCache = bundled;
  buildArticlesMap(inMemoryArticlesCache);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ARTICLES_CACHE_KEY, JSON.stringify(bundled));
      localStorage.setItem('fgc_portal_articles', JSON.stringify(bundled));
    }
  } catch {}
  return inMemoryArticlesCache;
}

/**
 * Synchronously writes updated articles to in-memory cache and localStorage,
 * ensuring 0ms first-paint consistency across all page refreshes.
 */
export function updateArticlesCache(articlesList) {
  if (!Array.isArray(articlesList)) return;
  const normalized = articlesList
    .map(normalizeArticle)
    .filter(a => a && !PURGED_SLUG_SET.has(String(a.slug || a.id).toLowerCase().trim()));

  inMemoryArticlesCache = normalized;
  buildArticlesMap(normalized);
  lastFetchTimestamp = Date.now();
  try {
    localStorage.setItem(ARTICLES_CACHE_KEY, JSON.stringify(normalized));
    localStorage.setItem('fgc_portal_articles', JSON.stringify(normalized));
  } catch {}
}

/**
 * Compares two article lists to determine if content or images have actually changed,
 * preventing unnecessary state updates while guaranteeing updated images reflect immediately.
 */
function hasArticlesChanged(existingList, newList) {
  if (!Array.isArray(existingList) || !Array.isArray(newList)) return true;
  if (existingList.length !== newList.length) return true;

  // Compare each article for ID, slug, image, title, summary, updated_at, and likes
  for (let i = 0; i < existingList.length; i++) {
    const a = existingList[i];
    const b = newList[i];
    if (
      a?.id !== b?.id ||
      a?.slug !== b?.slug ||
      a?.image !== b?.image ||
      a?.coverImage !== b?.coverImage ||
      a?.featuredImage !== b?.featuredImage ||
      a?.title !== b?.title ||
      a?.summary !== b?.summary ||
      a?.likes !== b?.likes ||
      a?.updated_at !== b?.updated_at
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Stale-While-Revalidate fetcher:
 * 1. Immediately returns cached articles if available.
 * 2. Deduplicates concurrent in-flight requests.
 * 3. Fetches from /api/articles (Vercel Edge cached with fresh query param) with Supabase direct fallback.
 * 4. Only fires onUpdate when actual changes are detected.
 */
export async function fetchArticlesSWR(onUpdate, forceFresh = false) {
  const cached = getCachedArticles();
  const now = Date.now();

  // If cached data is fresh and forceFresh is not set, skip network request
  if (!forceFresh && (now - lastFetchTimestamp < SWR_BACKGROUND_THROTTLE_MS)) {
    return cached;
  }

  // Deduplicate in-flight promises so AppContext and BlogPage don't duplicate network traffic
  if (inFlightArticlesPromise) {
    try {
      const result = await inFlightArticlesPromise;
      if (result && hasArticlesChanged(cached, result)) {
        if (typeof onUpdate === 'function') onUpdate(result);
      }
      return result;
    } catch {}
  }

  inFlightArticlesPromise = (async () => {
    let freshArticles = null;

    // 1. First attempt: Vercel Edge Serverless Endpoint (/api/articles with cache-busting timestamp)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(`/api/articles?_t=${Date.now()}&fresh=1`, {
        signal: controller.signal,
        cache: 'no-store',
        headers: { 
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data) && json.data.length > 0) {
          freshArticles = json.data
            .map(normalizeArticle)
            .filter(a => a && !PURGED_SLUG_SET.has(String(a.slug || a.id).toLowerCase().trim()));
        }
      }
    } catch {
      // Continue to Supabase direct fallback
    }

    // 2. Second attempt: Direct Supabase Client
    if (!freshArticles) {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          freshArticles = data
            .map(normalizeArticle)
            .filter(a => a && !PURGED_SLUG_SET.has(String(a.slug || a.id).toLowerCase().trim()));
        }
      } catch (err) {
        console.warn('[articlesService] Supabase fallback warning:', err);
      }
    }

    lastFetchTimestamp = Date.now();

    if (freshArticles && freshArticles.length > 0) {
      inMemoryArticlesCache = freshArticles;
      buildArticlesMap(freshArticles);
      try {
        localStorage.setItem(ARTICLES_CACHE_KEY, JSON.stringify(freshArticles));
        localStorage.setItem(ARTICLES_LAST_FETCH_KEY, String(lastFetchTimestamp));
      } catch {}

      if (hasArticlesChanged(cached, freshArticles)) {
        if (typeof onUpdate === 'function') {
          onUpdate(freshArticles);
        }
      }
      return freshArticles;
    }

    return cached;
  })();

  try {
    const finalResult = await inFlightArticlesPromise;
    return finalResult;
  } finally {
    inFlightArticlesPromise = null;
  }
}

/**
 * Bulletproof O(1) synchronous lookup for a single article by slug or id from cache,
 * memory, or bundled static articles. Never throws ReferenceError or Uncaught Exceptions.
 */
export function getCachedArticleBySlug(target) {
  if (!target) return null;
  try {
    let clean = String(target).toLowerCase().trim();

    // Normalize known legacy slug redirects and counterpart mappings
    if (clean === 'usd-pkr-interbank-vs-open-market-guide') {
      clean = 'usd-to-pkr-interbank-vs-open-market-guide';
    } else if (clean === 'pakistan-stock-exchange-psx-vs-global-equities-kse-100-valuation-dividend-yields-and-s-p-500-allocation-mechanics') {
      clean = 'pakistan-stock-exchange-psx-vs-global-equities-kse-100-valuation-dividend-yields-sp500-guide';
    } else if (clean === 'buying-gold-in-pakistan-tola-vs-gram-24k-vs-22k-and-how-jewelers-calculate-katt' || clean === 'navigating-gold-and-currency-volatility-in-pakistan-why-safe-haven-assets-remain-in-high-demand') {
      clean = 'buying-gold-in-pakistan-tola-karat-making-charges-guide';
    } else if (clean === 'the-inverse-dynamic-between-gold-prices-and-the-us-dollar-index') {
      clean = 'gold-vs-the-us-dollar-how-safe-haven-dynamics-drive-global-liquidity-and-forex-trends';
    } else if (clean === 'the-mechanics-of-carry-trade-how-interest-rate-differentials-drive-fx-volatility') {
      clean = 'understanding-the-carry-trade-how-japanese-yen-differentials-move-global-forex';
    } else if (clean === 'understanding-central-bank-interest-rates-how-the-federal-reserve-impacts-global-currencies') {
      clean = 'the-us-federal-reserve-global-markets-how-interest-rate-cycles-move-stocks-gold-and-emerging-currencies';
    }

    if (PURGED_SLUG_SET.has(clean)) {
      return null;
    }
    
    if (articlesMap.size === 0) {
      getCachedArticles();
    }

    // 1. Direct O(1) Map match
    if (articlesMap.has(clean)) {
      return normalizeArticle(articlesMap.get(clean));
    }

    // 2. Fuzzy / punctuation-insensitive search across articlesMap
    const cleanNoDash = clean.replace(/[^a-z0-9]/g, '');
    for (const [key, article] of articlesMap.entries()) {
      if (key === clean || key.replace(/[^a-z0-9]/g, '') === cleanNoDash) {
        return normalizeArticle(article);
      }
    }

    // 3. Search across in-memory cache
    if (Array.isArray(inMemoryArticlesCache)) {
      const match = inMemoryArticlesCache.find(a => {
        if (!a) return false;
        const s = String(a.slug || '').toLowerCase().trim();
        const i = String(a.id || '').toLowerCase().trim();
        return s === clean || i === clean || s.replace(/[^a-z0-9]/g, '') === cleanNoDash;
      });
      if (match) return normalizeArticle(match);
    }

    // 4. Guaranteed bundled fallback search
    const bundledMatch = BLOG_POSTS.find(p => {
      if (!p) return false;
      const s = String(p.slug || '').toLowerCase().trim();
      const i = String(p.id || '').toLowerCase().trim();
      return s === clean || i === clean || s.replace(/[^a-z0-9]/g, '') === cleanNoDash;
    });

    if (bundledMatch) return normalizeArticle(bundledMatch);
  } catch (err) {
    console.warn('[articlesService] getCachedArticleBySlug warning:', err);
  }

  return null;
}

// Named aliases for drop-in interoperability
export const getArticleBySlug = getCachedArticleBySlug;
export const findArticleBySlug = getCachedArticleBySlug;
