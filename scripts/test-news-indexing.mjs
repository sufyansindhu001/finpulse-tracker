/** Regression: syndicated RSS may be browsed, but original research is indexable. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const newsComponent = read('src/pages/NewsPage.jsx');
const prerenderScript = read('scripts/prerender.js');
const sitemapScript = read('scripts/generate-sitemap.js');
const newsHtml = read('dist/news/index.html');
const blogHtml = read('dist/blog/index.html');
const sitemap = read('dist/sitemap.xml');

assert.match(newsComponent, /robots:\s*['"]noindex, follow['"]/);
assert.match(prerenderScript, /route:\s*['"]\/news['"][\s\S]*?robots:\s*['"]noindex, follow['"]/);
assert.match(prerenderScript, /if \(item\.robots\)/);
assert.match(newsHtml, /<meta name="robots" content="noindex, follow"\s*\/>/i);
assert.match(blogHtml, /<meta name="robots" content="index, follow"\s*\/>/i);

// Sitemap URLs should enumerate pages intended for indexing only.
assert.doesNotMatch(sitemapScript, /url:\s*`\$\{BASE_URL\}\/news`/);
assert.doesNotMatch(sitemap, /<loc>https:\/\/www\.fgcspot\.com\/news<\/loc>/);
assert.match(sitemap, /<loc>https:\/\/www\.fgcspot\.com\/blog<\/loc>/);
assert.doesNotMatch(sitemapScript, /const dateStr = TODAY|Guaranteed today's date for GSC freshness/);
assert.match(sitemapScript, /validDate\(art\.updated_at \|\| art\.created_at\)/);
// Static routes should not pretend they changed on every deployment.
assert.doesNotMatch(sitemap, /<loc>https:\/\/www\.fgcspot\.com\/about<\/loc>\s*<lastmod>/);
// A guide with an older, unchanged editorial timestamp should keep that date.
assert.match(sitemap, /<loc>https:\/\/www\.fgcspot\.com\/blog\/buying-gold-in-pakistan-tola-karat-making-charges-guide<\/loc>\s*<lastmod>2026-11-22<\/lastmod>/);

console.log('[PASS] Syndicated /news is noindex/follow in HTML and client SEO.');
console.log('[PASS] Original /blog stays indexable and /news is omitted from sitemap.');
