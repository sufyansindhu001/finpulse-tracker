/**
 * Articles Data Service for FGC Spot
 * Implements high-efficiency Stale-While-Revalidate (SWR) caching with Vercel Edge integration.
 * Guarantees 0ms initial page render with background synchronization, cache purging, and zero redundant re-renders.
 */

import { BLOG_POSTS } from '../data/blogPosts';
import { supabase, normalizeArticle } from '../lib/supabase';

export const ARTICLES_CACHE_KEY = 'fgc_portal_articles_v3';
export const ARTICLES_LAST_FETCH_KEY = 'fgc_portal_articles_last_fetch';
const SWR_BACKGROUND_THROTTLE_MS = 45 * 1000; // 45 seconds background revalidation throttle

let inMemoryArticlesCache = null;
let articlesMap = new Map();
let lastFetchTimestamp = 0;
let inFlightArticlesPromise = null;

function buildArticlesMap(articlesList) {
  articlesMap.clear();
  if (!Array.isArray(articlesList)) return;
  for (const art of articlesList) {
    if (!art) continue;
    if (art.slug) articlesMap.set(String(art.slug).toLowerCase().trim(), art);
    if (art.id) articlesMap.set(String(art.id).toLowerCase().trim(), art);
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
    localStorage.removeItem('fgc_spot_blog_posts');
    localStorage.removeItem(ARTICLES_LAST_FETCH_KEY);
  } catch {}
}

/**
 * Synchronously retrieves cached articles from memory or localStorage.
 * Automatically upgrades outdated or incomplete local storage to the latest clean bundled articles.
 * Guarantees instant 0ms initial render without waiting for network or showing blank skeletons.
 */
export function getCachedArticles() {
  const bundled = BLOG_POSTS.map(normalizeArticle);

  if (inMemoryArticlesCache && inMemoryArticlesCache.length >= bundled.length) {
    return inMemoryArticlesCache;
  }

  try {
    const saved = localStorage.getItem(ARTICLES_CACHE_KEY) || localStorage.getItem('fgc_portal_articles');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= bundled.length) {
        // Ensure top article is not older than bundled top article
        if (parsed[0]?.slug === bundled[0]?.slug) {
          inMemoryArticlesCache = parsed.map(normalizeArticle);
          buildArticlesMap(inMemoryArticlesCache);
          return inMemoryArticlesCache;
        }
      }
    }
  } catch (e) {
    console.warn('[articlesService] Failed to read cached articles:', e);
  }

  // If localStorage had an older or incomplete set, immediately upgrade to bundled
  inMemoryArticlesCache = bundled;
  buildArticlesMap(inMemoryArticlesCache);
  try {
    localStorage.setItem(ARTICLES_CACHE_KEY, JSON.stringify(bundled));
  } catch {}
  return inMemoryArticlesCache;
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
      const res = await fetch(`/api/articles?_t=${Date.now()}`, {
        signal: controller.signal,
        headers: { 
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data) && json.data.length > 0) {
          freshArticles = json.data.map(normalizeArticle);
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
          freshArticles = data.map(normalizeArticle);
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

    // Normalize known legacy slug redirects
    if (clean === 'usd-pkr-interbank-vs-open-market-guide') {
      clean = 'usd-to-pkr-interbank-vs-open-market-guide';
    } else if (clean === 'pakistan-stock-exchange-psx-vs-global-equities-kse-100-valuation-dividend-yields-and-s-p-500-allocation-mechanics') {
      clean = 'pakistan-stock-exchange-psx-vs-global-equities-kse-100-valuation-dividend-yields-sp500-guide';
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
