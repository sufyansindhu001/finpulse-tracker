/**
 * Articles Data Service for FGC Spot
 * Implements high-efficiency Stale-While-Revalidate (SWR) caching with Vercel Edge integration.
 * Guarantees 0ms initial page render with background synchronization and zero redundant re-renders.
 */

import { BLOG_POSTS } from '../data/blogPosts';
import { supabase, normalizeArticle } from '../lib/supabase';

export const ARTICLES_CACHE_KEY = 'fgc_portal_articles';
export const ARTICLES_LAST_FETCH_KEY = 'fgc_portal_articles_last_fetch';
const SWR_BACKGROUND_THROTTLE_MS = 60 * 1000; // 1 minute background revalidation throttle

let inMemoryArticlesCache = null;
let articlesMap = new Map();
let lastFetchTimestamp = 0;
let inFlightArticlesPromise = null;

function buildArticlesMap(articlesList) {
  articlesMap.clear();
  if (!Array.isArray(articlesList)) return;
  for (const art of articlesList) {
    if (!art) continue;
    if (art.slug) articlesMap.set(art.slug.toLowerCase().trim(), art);
    if (art.id) articlesMap.set(String(art.id).toLowerCase().trim(), art);
  }
}

/**
 * Synchronously retrieves cached articles from memory or localStorage.
 * Automatically upgrades outdated or incomplete local storage to the latest 30 clean bundled articles.
 * Guarantees instant 0ms initial render without waiting for network or showing blank skeletons.
 */
export function getCachedArticles() {
  const bundled = BLOG_POSTS.map(normalizeArticle);

  if (inMemoryArticlesCache && inMemoryArticlesCache.length >= bundled.length) {
    return inMemoryArticlesCache;
  }

  try {
    const saved = localStorage.getItem(ARTICLES_CACHE_KEY);
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
 * Compares two article lists to determine if content has actually changed,
 * preventing unnecessary state updates and hydration re-renders.
 */
function hasArticlesChanged(existingList, newList) {
  if (!Array.isArray(existingList) || !Array.isArray(newList)) return true;
  if (existingList.length !== newList.length) return true;

  // Check top 5 articles for slug and timestamp changes
  for (let i = 0; i < Math.min(existingList.length, 5); i++) {
    const a = existingList[i];
    const b = newList[i];
    if (a?.id !== b?.id || a?.slug !== b?.slug || a?.likes !== b?.likes || a?.updated_at !== b?.updated_at) {
      return true;
    }
  }

  return false;
}

/**
 * Stale-While-Revalidate fetcher:
 * 1. Immediately returns cached articles if available.
 * 2. Deduplicates concurrent in-flight requests.
 * 3. Fetches from /api/articles (Vercel Edge cached) with Supabase direct fallback.
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

    // 1. First attempt: Vercel Edge Serverless Cached Endpoint (/api/articles)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch('/api/articles', {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
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
 * Fast O(1) synchronous lookup for a single article by slug or id from cache
 */
export function getCachedArticleBySlug(target) {
  if (!target) return null;
  const clean = target.toLowerCase().trim();
  
  if (articlesMap.size === 0) {
    getCachedArticles();
  }

  return articlesMap.get(clean) || null;
}
