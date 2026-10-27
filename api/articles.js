// api/articles.js - High-Performance Cached Articles Endpoint (Vercel Serverless / Edge)
// Implements aggressive CDN Edge caching headers (s-maxage=900, stale-while-revalidate=86400)
// Serves articles instantaneously from the Vercel Edge network while revalidating in the background.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ydroyycgjnbjcoprrrwk.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cfiOd9efKs6N71KzILP1KQ_lN8bCORq';

function sanitizeArticle(art) {
  if (!art) return art;
  let cleanImage = art.image || art.cover_image || art.coverImage || art.featured_image || art.featuredImage;
  if (!cleanImage || typeof cleanImage !== 'string' || cleanImage.startsWith('data:') || cleanImage.length > 2000) {
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
  return { 
    ...art, 
    image: cleanImage, 
    cover_image: cleanImage, 
    featured_image: cleanImage 
  };
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  const { slug, _t, fresh, purge } = req.query || {};

  // Edge & CDN Caching: Instant browser revalidation (max-age=0), tight CDN cache (s-maxage=60)
  // If cache-busting timestamp or fresh parameter is present, bypass cache entirely
  if (_t || fresh || purge) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=120, must-revalidate');
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    let endpoint = `${SUPABASE_URL}/rest/v1/articles?select=*`;
    if (slug) {
      endpoint += `&slug=eq.${encodeURIComponent(String(slug).trim())}&limit=1`;
    } else {
      endpoint += `&order=created_at.desc`;
    }

    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        if (slug) {
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

        const sanitized = data.map(sanitizeArticle);
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
