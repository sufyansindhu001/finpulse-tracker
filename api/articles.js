// api/articles.js - High-Performance Cached Articles Endpoint (Vercel Serverless / Edge)
// Implements aggressive CDN Edge caching headers (s-maxage=900, stale-while-revalidate=86400)
// Serves articles instantaneously from the Vercel Edge network while revalidating in the background.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ydroyycgjnbjcoprrrwk.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cfiOd9efKs6N71KzILP1KQ_lN8bCORq';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Edge Caching: Browser 3 mins (max-age=180), Vercel CDN 15 mins (s-maxage=900), SWR 24 hrs
  res.setHeader('Cache-Control', 'public, max-age=180, s-maxage=900, stale-while-revalidate=86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { slug } = req.query || {};

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
              data: data[0],
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

        return res.status(200).json({
          success: true,
          count: data.length,
          data,
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
