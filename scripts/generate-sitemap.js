import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const sitemapPath = path.join(publicDir, 'sitemap.xml');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ydroyycgjnbjcoprrrwk.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cfiOd9efKs6N71KzILP1KQ_lN8bCORq';
const BASE_URL = 'https://www.fgcspot.com';
const TODAY = new Date().toISOString().split('T')[0];

const STATIC_PAGES = [
  { url: `${BASE_URL}/`, changefreq: 'daily', priority: '1.0', lastmod: TODAY },
  { url: `${BASE_URL}/blog`, changefreq: 'daily', priority: '0.9', lastmod: TODAY },
  { url: `${BASE_URL}/about`, changefreq: 'monthly', priority: '0.7', lastmod: TODAY },
  { url: `${BASE_URL}/contact`, changefreq: 'monthly', priority: '0.7', lastmod: TODAY },
  { url: `${BASE_URL}/privacy-policy`, changefreq: 'monthly', priority: '0.5', lastmod: TODAY },
  { url: `${BASE_URL}/terms`, changefreq: 'monthly', priority: '0.5', lastmod: TODAY },
  { url: `${BASE_URL}/disclaimer`, changefreq: 'monthly', priority: '0.5', lastmod: TODAY },
  // Tools
  { url: `${BASE_URL}/converter`, changefreq: 'daily', priority: '0.8', lastmod: TODAY },
  { url: `${BASE_URL}/rates`, changefreq: 'hourly', priority: '0.8', lastmod: TODAY },
  { url: `${BASE_URL}/crypto`, changefreq: 'hourly', priority: '0.8', lastmod: TODAY },
  { url: `${BASE_URL}/gold`, changefreq: 'hourly', priority: '0.8', lastmod: TODAY },
  { url: `${BASE_URL}/charts`, changefreq: 'daily', priority: '0.8', lastmod: TODAY }
];

async function fetchArticles() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase
      .from('articles')
      .select('slug, created_at, title')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('[sitemap-generator] Supabase query failed, using static fallback:', err.message);
  }

  // Fallback to local blogPosts.js
  try {
    const blogPostsModule = await import('../src/data/blogPosts.js');
    return blogPostsModule.BLOG_POSTS || [];
  } catch (err) {
    console.error('[sitemap-generator] Could not read static fallback:', err.message);
    return [];
  }
}

async function generateSitemap() {
  console.log('[sitemap-generator] Generating sitemap for', BASE_URL);
  const articles = await fetchArticles();
  console.log(`[sitemap-generator] Found ${articles.length} articles for sitemap.`);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Static Pages
  STATIC_PAGES.forEach(page => {
    xml += `  <url>\n`;
    xml += `    <loc>${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  // 2. Dynamic Articles
  articles.forEach(art => {
    const slug = art.slug || art.id;
    if (!slug) return;
    const dateStr = art.created_at ? new Date(art.created_at).toISOString().split('T')[0] : TODAY;
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/blog/${slug}</loc>\n`;
    xml += `    <lastmod>${dateStr}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(sitemapPath, xml, 'utf8');
  console.log(`[sitemap-generator] Successfully wrote sitemap to ${sitemapPath} (${STATIC_PAGES.length + articles.length} URLs).`);
}

generateSitemap().catch(err => {
  console.error('[sitemap-generator] Error generating sitemap:', err);
  process.exit(1);
});
