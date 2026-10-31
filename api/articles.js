// api/articles.js - High-Performance Cached Articles Endpoint (Vercel Serverless / Edge)
// Implements aggressive CDN Edge caching headers (s-maxage=900, stale-while-revalidate=86400)
// Serves articles instantaneously from the Vercel Edge network while revalidating in the background.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ydroyycgjnbjcoprrrwk.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cfiOd9efKs6N71KzILP1KQ_lN8bCORq';

const PURGED_SLUGS = new Set([
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

function withImageVersion(url, timestamp) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('data:') || url.startsWith('blob:') || url.endsWith('.svg')) {
    return url;
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url;
  }
  try {
    const u = new URL(url);
    const v = timestamp ? new Date(timestamp).getTime() : null;
    if (v && !isNaN(v)) {
      u.searchParams.set('v', String(v));
    } else if (!u.searchParams.has('v')) {
      u.searchParams.set('v', '1');
    }
    return u.toString();
  } catch {
    return url;
  }
}

function sanitizeArticle(art) {
  if (!art) return art;
  let cleanImage = art.image || art.cover_image || art.coverImage || art.featured_image || art.featuredImage || art.img;
  if (cleanImage && typeof cleanImage === 'string' && cleanImage.trim().length > 0) {
    cleanImage = cleanImage.trim();
  } else {
    const cat = (art.category || '').toLowerCase();
    if (cat.includes('crypto')) {
      cleanImage = 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80';
    } else if (cat.includes('gold') || cat.includes('metal')) {
      cleanImage = 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=80';
    } else if (cat.includes('forex') || cat.includes('currency')) {
      cleanImage = 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1200&q=80';
    } else {
      cleanImage = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80';
    }
  }

  const versionedImage = withImageVersion(cleanImage, art.updated_at || art.created_at);

  return { 
    ...art, 
    image: versionedImage, 
    cover_image: versionedImage, 
    featured_image: versionedImage 
  };
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Disable stale caching for instant reflection on page refresh
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const rawSlug = req.query?.slug ? String(req.query.slug).trim() : null;
  let targetSlug = rawSlug;
  if (rawSlug === 'usd-pkr-interbank-vs-open-market-guide') {
    targetSlug = 'usd-to-pkr-interbank-vs-open-market-guide';
  } else if (rawSlug === 'pakistan-stock-exchange-psx-vs-global-equities-kse-100-valuation-dividend-yields-and-s-p-500-allocation-mechanics') {
    targetSlug = 'pakistan-stock-exchange-psx-vs-global-equities-kse-100-valuation-dividend-yields-sp500-guide';
  } else if (rawSlug === 'buying-gold-in-pakistan-tola-vs-gram-24k-vs-22k-and-how-jewelers-calculate-katt' || rawSlug === 'navigating-gold-and-currency-volatility-in-pakistan-why-safe-haven-assets-remain-in-high-demand') {
    targetSlug = 'buying-gold-in-pakistan-tola-karat-making-charges-guide';
  } else if (rawSlug === 'the-inverse-dynamic-between-gold-prices-and-the-us-dollar-index') {
    targetSlug = 'gold-vs-the-us-dollar-how-safe-haven-dynamics-drive-global-liquidity-and-forex-trends';
  } else if (rawSlug === 'the-mechanics-of-carry-trade-how-interest-rate-differentials-drive-fx-volatility') {
    targetSlug = 'understanding-the-carry-trade-how-japanese-yen-differentials-move-global-forex';
  } else if (rawSlug === 'understanding-central-bank-interest-rates-how-the-federal-reserve-impacts-global-currencies') {
    targetSlug = 'the-us-federal-reserve-global-markets-how-interest-rate-cycles-move-stocks-gold-and-emerging-currencies';
  }

  if (targetSlug && PURGED_SLUGS.has(targetSlug)) {
    return res.status(404).json({
      success: false,
      error: 'Article retired or updated',
      source: 'Supabase Edge Filter'
    });
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    let endpoint = `${SUPABASE_URL}/rest/v1/articles?select=*`;
    if (targetSlug) {
      endpoint += `&slug=eq.${encodeURIComponent(targetSlug)}&limit=1`;
    } else {
      endpoint += `&order=created_at.desc`;
    }

    const response = await fetch(endpoint, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        if (targetSlug) {
          if (data.length > 0) {
            return res.status(200).json({
              success: true,
              data: sanitizeArticle(data[0]),
              source: 'Supabase Edge Cache'
            });
          } else {
            return res.status(404).json({
              success: false,
              error: 'Article not found',
              source: 'Supabase Edge Cache'
            });
          }
        }

        const sanitized = data
          .filter(a => a && !PURGED_SLUGS.has(String(a.slug || a.id).toLowerCase().trim()))
          .map(sanitizeArticle);
        return res.status(200).json({
          success: true,
          count: sanitized.length,
          data: sanitized,
          source: 'Supabase Edge Cache'
        });
      }
    }

    // Fallback if Supabase returns non-ok or empty
    return res.status(200).json({
      success: true,
      data: [],
      source: 'Edge Fallback Baseline'
    });
  } catch (err) {
    console.warn('[api/articles] Supabase fetch error:', err?.message);
    return res.status(200).json({
      success: false,
      data: [],
      error: err?.message || 'Failed to fetch articles',
      source: 'Fallback'
    });
  }
}
