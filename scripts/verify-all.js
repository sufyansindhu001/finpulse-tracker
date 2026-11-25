import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

console.log('=== STEP 2: VERIFY ALL ROUTES & ASSETS (scripts/verify-all.js) ===\n');

let passedTests = 0;
let failedTests = 0;

// 1. Check App.jsx routes
const appJsxPath = path.join(rootDir, 'src/App.jsx');
if (!fs.existsSync(appJsxPath)) {
  console.error('[FAIL] src/App.jsx not found!');
  failedTests++;
} else {
  const appJsx = fs.readFileSync(appJsxPath, 'utf8');
  const routes = [...appJsx.matchAll(/path=["']([^"']+)["']/g)].map(m => m[1]);
  console.log(`[PASS] src/App.jsx contains ${routes.length} route definitions.`);
  routes.forEach((r, idx) => console.log(`   ${idx + 1}. ${r}`));
  passedTests++;
}

// 2. Check robots.txt
const robotsPath = path.join(publicDir, 'robots.txt');
if (fs.existsSync(robotsPath)) {
  const robots = fs.readFileSync(robotsPath, 'utf8');
  if (robots.includes('User-agent: *') && robots.includes('Sitemap: https://www.fgcspot.com/sitemap.xml')) {
    console.log('[PASS] public/robots.txt is valid and points to sitemap.');
    passedTests++;
  } else {
    console.error('[FAIL] public/robots.txt is malformed!');
    failedTests++;
  }
} else {
  console.error('[FAIL] public/robots.txt not found!');
  failedTests++;
}

// 3. Check ads.txt
const adsPath = path.join(publicDir, 'ads.txt');
if (fs.existsSync(adsPath)) {
  const ads = fs.readFileSync(adsPath, 'utf8').trim();
  if (ads.includes('pub-1794342776311306')) {
    console.log(`[PASS] public/ads.txt is valid: "${ads}"`);
    passedTests++;
  } else {
    console.error('[FAIL] public/ads.txt is missing publisher ID!');
    failedTests++;
  }
} else {
  console.error('[FAIL] public/ads.txt not found!');
  failedTests++;
}

// 4. Check sitemap.xml
const sitemapPath = path.join(publicDir, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  if (locs.length === 37) {
    console.log(`[PASS] public/sitemap.xml contains exactly 37 canonical URLs.`);
    passedTests++;
  } else {
    console.error(`[FAIL] public/sitemap.xml has ${locs.length} URLs (expected 37)!`);
    failedTests++;
  }
} else {
  console.error('[FAIL] public/sitemap.xml not found!');
  failedTests++;
}

// 5. Check vercel.json configuration
const vercelPath = path.join(rootDir, 'vercel.json');
if (fs.existsSync(vercelPath)) {
  const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  const hasCleanUrls = vercel.cleanUrls === true;
  // Only narrowly scoped article rewrites are permitted. A global SPA
  // catch-all would turn genuinely missing URLs into misleading HTTP 200s.
  const hasSafeArticleRewrite = Array.isArray(vercel.rewrites) &&
    vercel.rewrites.length === 1 &&
    vercel.rewrites[0].source === '/blog/:slug' &&
    vercel.rewrites[0].destination === '/api/article-page';
  const redirectCount = Array.isArray(vercel.redirects) ? vercel.redirects.length : 0;

  if (hasCleanUrls && hasSafeArticleRewrite && redirectCount >= 25) {
    console.log(`[PASS] vercel.json has cleanUrls, targeted new-article fallback, genuine 404s elsewhere, and ${redirectCount} edge redirects.`);
    passedTests++;
  } else {
    console.error('[FAIL] vercel.json configuration check failed!', { hasCleanUrls, hasSafeArticleRewrite, redirectCount });
    failedTests++;
  }
} else {
  console.error('[FAIL] vercel.json not found!');
  failedTests++;
}

console.log(`\nverify-all.js Summary: ${passedTests} passed, ${failedTests} failed.`);
if (failedTests > 0) process.exit(1);
