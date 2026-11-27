/** Dynamic companion sitemap: newly published Supabase articles appear without a build. */
import { BLOG_POSTS } from '../src/data/blogPosts.js';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ydroyycgjnbjcoprrrwk.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cfiOd9efKs6N71KzILP1KQ_lN8bCORq';
const BASE_URL = 'https://www.fgcspot.com';

function validDate(date) {
  if (!date || Number.isNaN(Date.parse(date))) return '';
  return new Date(date).toISOString().slice(0, 10);
}

export function renderLiveSitemap(articles) {
  const seen = new Set();
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  for (const article of articles) {
    const slug = article?.slug;
    if (!slug || !/^[a-z0-9][a-z0-9-]{0,198}[a-z0-9]$/.test(slug) || seen.has(slug)) continue;
    seen.add(slug);
    const lastmod = validDate(article.updated_at || article.created_at);
    lines.push(`  <url><loc>${BASE_URL}/blog/${encodeURIComponent(slug)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`);
  }
  lines.push('</urlset>');
  return lines.join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).end();
  // Fresh for Google and other bots, while allowing a brief shared cache.
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/articles?select=slug,created_at,updated_at&order=created_at.desc&limit=1000`, {
      signal: AbortSignal.timeout(7000),
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`Sitemap article source responded ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Invalid article list from source');
    return res.status(200).send(req.method === 'HEAD' ? '' : renderLiveSitemap(data));
  } catch (error) {
    console.error('[live-sitemap] Could not fetch public article list:', error?.message);
    res.setHeader('Cache-Control', 'no-store');
    // A listed sitemap must remain valid XML even during a temporary upstream
    // outage. The static, reviewed article URLs are safe fallback entries; new
    // owner-published slugs resume appearing once Supabase is reachable again.
    res.setHeader('X-Sitemap-Source', 'bundled-fallback');
    return res.status(200).send(req.method === 'HEAD' ? '' : renderLiveSitemap(BLOG_POSTS));
  }
}
