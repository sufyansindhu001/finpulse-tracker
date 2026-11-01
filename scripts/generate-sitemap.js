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
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi' }).format(new Date());

const STATIC_PAGES = [
  { url: `${BASE_URL}/`, changefreq: 'daily', priority: '1.0', lastmod: TODAY },
  { url: `${BASE_URL}/blog`, changefreq: 'daily', priority: '0.9', lastmod: TODAY },
  { url: `${BASE_URL}/about`, changefreq: 'monthly', priority: '0.7', lastmod: TODAY },
  { url: `${BASE_URL}/contact`, changefreq: 'monthly', priority: '0.7', lastmod: TODAY },
  { url: `${BASE_URL}/privacy-policy`, changefreq: 'monthly', priority: '0.5', lastmod: TODAY },
  { url: `${BASE_URL}/terms`, changefreq: 'monthly', priority: '0.5', lastmod: TODAY },
  { url: `${BASE_URL}/disclaimer`, changefreq: 'monthly', priority: '0.5', lastmod: TODAY },
  // Tools, Stocks & News
  { url: `${BASE_URL}/stocks`, changefreq: 'hourly', priority: '0.9', lastmod: TODAY },
  { url: `${BASE_URL}/converter`, changefreq: 'daily', priority: '0.8', lastmod: TODAY },
  { url: `${BASE_URL}/rates`, changefreq: 'hourly', priority: '0.8', lastmod: TODAY },
  { url: `${BASE_URL}/crypto`, changefreq: 'hourly', priority: '0.8', lastmod: TODAY },
  { url: `${BASE_URL}/gold`, changefreq: 'hourly', priority: '0.8', lastmod: TODAY },
  { url: `${BASE_URL}/charts`, changefreq: 'daily', priority: '0.8', lastmod: TODAY },
  { url: `${BASE_URL}/news`, changefreq: 'hourly', priority: '0.8', lastmod: TODAY }
];

async function fetchArticles() {
  let supabaseArticles = [];
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase
      .from('articles')
      .select('slug, created_at, title')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      supabaseArticles = data;
    }
  } catch (err) {
    console.warn('[sitemap-generator] Supabase query failed:', err.message);
  }

  let localArticles = [];
  try {
    const blogPostsModule = await import('../src/data/blogPosts.js');
    localArticles = blogPostsModule.BLOG_POSTS || [];
  } catch (err) {
    console.error('[sitemap-generator] Could not read static fallback:', err.message);
  }

  // Mandatory guaranteed inclusion of flagship guides
  const MANDATORY_FLAGSHIP_ARTICLES = [
    {
      slug: 'buying-gold-in-pakistan-tola-karat-making-charges-guide',
      title: 'Buying Gold in Pakistan: Complete Investor Guide to Tola, Karat Purity, Making Charges, and Sarafa Bazaar Rates',
      created_at: TODAY
    },
    {
      slug: 'freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained',
      title: 'Freelance Remittances & Banking in Pakistan: FBR Tax Regimes, PSEB Registration, and Foreign Currency Exporter Retention Accounts',
      created_at: TODAY
    }
  ];

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

  const seenSlugs = new Set();
  const merged = [];

  [...MANDATORY_FLAGSHIP_ARTICLES, ...supabaseArticles, ...localArticles].forEach(art => {
    const s = art.slug || art.id;
    if (s && !seenSlugs.has(s) && !PURGED_SLUGS.has(s)) {
      seenSlugs.add(s);
      merged.push(art);
    }
  });

  return merged;
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

  // 2. Dynamic Articles (all updated with TODAY's date for immediate Google Search Console re-indexing)
  const PRIORITY_SLUGS = new Set([
    'buying-gold-in-pakistan-tola-karat-making-charges-guide',
    'freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained'
  ]);

  articles.forEach(art => {
    const slug = art.slug || art.id;
    if (!slug) return;
    const isPriority = PRIORITY_SLUGS.has(slug);
    const dateStr = TODAY; // Guaranteed today's date for GSC freshness
    const changefreq = 'daily';
    const priority = isPriority ? '1.0' : '0.9';

    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/blog/${slug}</loc>\n`;
    xml += `    <lastmod>${dateStr}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
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
