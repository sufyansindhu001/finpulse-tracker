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

function validDate(value) {
  const timestamp = Date.parse(value || '');
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : '';
}

const STATIC_PAGES = [
  { url: `${BASE_URL}/`, changefreq: 'daily', priority: '1.0' },
  { url: `${BASE_URL}/blog`, changefreq: 'daily', priority: '0.9' },
  { url: `${BASE_URL}/about`, changefreq: 'monthly', priority: '0.7' },
  { url: `${BASE_URL}/contact`, changefreq: 'monthly', priority: '0.7' },
  { url: `${BASE_URL}/privacy-policy`, changefreq: 'monthly', priority: '0.5' },
  { url: `${BASE_URL}/terms`, changefreq: 'monthly', priority: '0.5' },
  { url: `${BASE_URL}/disclaimer`, changefreq: 'monthly', priority: '0.5' },
  { url: `${BASE_URL}/author/sufyan-sindhu`, changefreq: 'daily', priority: '0.8' },
  { url: `${BASE_URL}/editorial-policy`, changefreq: 'monthly', priority: '0.7' },
  { url: `${BASE_URL}/data-sources`, changefreq: 'monthly', priority: '0.7' },
  // Indexable tools. The syndicated /news wire is intentionally noindex.
  { url: `${BASE_URL}/stocks`, changefreq: 'hourly', priority: '0.9' },
  { url: `${BASE_URL}/converter`, changefreq: 'daily', priority: '0.8' },
  { url: `${BASE_URL}/rates`, changefreq: 'hourly', priority: '0.8' },
  { url: `${BASE_URL}/crypto`, changefreq: 'hourly', priority: '0.8' },
  { url: `${BASE_URL}/gold`, changefreq: 'hourly', priority: '0.8' },
  { url: `${BASE_URL}/charts`, changefreq: 'daily', priority: '0.8' }
];

async function fetchArticles() {
  let supabaseArticles = [];
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase
      .from('articles')
      .select('slug, created_at, updated_at, title')
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
    },
    {
      slug: 'freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained',
      title: 'Freelance Remittances & Banking in Pakistan: FBR Tax Regimes, PSEB Registration, and Foreign Currency Exporter Retention Accounts',
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
    'navigating-gold-and-currency-volatility-in-pakistan-why-safe-haven-assets-remain-in-high-demand',
    'navigating-central-bank-rate-decisions-and-currency-volatility-in-modern-markets',
    'gold-prices-hold-near-record-highs-as-investors-flock-to-safe-haven-assets-amid-global-economic-shifts',
    'understanding-the-u-s-dollar-index-dxy-currency-trends-and-global-market-impact',
    'us-gold-investment-safe-haven-assets-navigating-inflation-and-economic-uncertainty'
  ]);

  const bySlug = new Map();
  [...MANDATORY_FLAGSHIP_ARTICLES, ...supabaseArticles, ...localArticles].forEach(art => {
    const s = art.slug || art.id;
    if (!s || PURGED_SLUGS.has(s)) return;
    const previous = bySlug.get(s);
    const priorTime = Date.parse(previous?.updated_at || previous?.created_at || '') || 0;
    const nextTime = Date.parse(art.updated_at || art.created_at || '') || 0;
    if (!previous || nextTime >= priorTime) bySlug.set(s, art);
  });
  return [...bySlug.values()];
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
    if (page.lastmod) xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  // 2. Articles: only declare the actual date of a meaningful publication/edit.
  const PRIORITY_SLUGS = new Set([
    'buying-gold-in-pakistan-tola-karat-making-charges-guide',
    'freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained'
  ]);

  articles.forEach(art => {
    const slug = art.slug || art.id;
    if (!slug) return;
    const isPriority = PRIORITY_SLUGS.has(slug);
    const dateStr = validDate(art.updated_at || art.created_at);
    const changefreq = 'daily';
    const priority = isPriority ? '1.0' : '0.9';

    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/blog/${slug}</loc>\n`;
    if (dateStr) xml += `    <lastmod>${dateStr}</lastmod>\n`;
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
