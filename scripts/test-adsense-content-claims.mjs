/** Offline checks for transparent financial copy on pages reviewed by AdSense. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BLOG_POSTS } from '../src/data/blogPosts.js';
import { getArticleReferences } from '../src/data/articleReferences.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const converter = read('src/pages/ConverterPage.jsx');
const rates = read('src/pages/RatesPage.jsx');
const footer = read('src/components/Footer.jsx');
const offerings = read('src/components/WhatWeOffer.jsx');
const methodology = read('src/components/WhyFGCSpot.jsx');
const staticHtml = read('scripts/prerender.js');
const forexService = read('src/services/forexService.js');
const disclosurePage = read('src/pages/DataSourcesPage.jsx');
const homeMethodology = read('src/components/MarketIntelligenceMethodology.jsx');
const editorialPolicy = read('src/pages/EditorialPolicyPage.jsx');
const ticker = read('src/components/CryptoTickerBar.jsx');

assert.doesNotMatch(converter, /100% tax-free|100% tax-exempt|Automatic e-PRC tax shield|No official e-PRC tax exemption|authentic institutional mid-market rates without hidden bank markups/i);
assert.doesNotMatch(converter, /SBP Benchmark Parity|pure mid-market interbank exchange rates|Updates every 45 to 60 seconds|Commercial banks add 1\.5% to 3\.5%/i);
assert.match(converter, /e-PRC proves receipt|e-PRC\)\.?.*not automatically exempt|does not by itself establish an income-tax exemption/i);
assert.match(converter, /Hypothetical comparison only/i);
assert.match(converter, /www\.sbp\.org\.pk\/circulars\/fe-circular-no-05-of-2022/);
assert.match(converter, /www\.fbr\.gov\.pk\/Budget2026-27/);
assert.doesNotMatch(rates, /guarantees receipt of an|statutory proof of untaxed|certified precious metals/i);
assert.doesNotMatch(rates, /shielding the funds from income tax scrutiny|refreshed automatically every 60 seconds|0\.02%–0\.08%|View All 30\+ Guides/i);
assert.match(rates, /not a guarantee that the underlying income is tax-free/i);
assert.doesNotMatch(footer, /Sub-Second Live Feeds/i);
assert.doesNotMatch(offerings, /Certified precious metals pricing|zero-spread quotes/i);
assert.doesNotMatch(methodology, /Direct socket aggregation|sub-second delta updates/i);
assert.doesNotMatch(footer, /interbank institutional benchmarks|0\.25% PSEB tax exemptions/i);
assert.doesNotMatch(disclosurePage, /Open Exchange Rates, FloatRates & State Bank of Pakistan|Volume-Weighted Average Price \(VWAP\) across global exchanges|Polled every 30 seconds during active market trading sessions/);
assert.doesNotMatch(homeMethodology, /tier-one institutional interbank liquidity feeds|high-frequency WebSockets and REST APIs|official Karachi Sarafa Association import customs duties/);
assert.doesNotMatch(editorialPolicy, /cross-checked against live SBP weighted closing benchmarks/i);
assert.match(forexService, /source: 'Public FX Reference Feeds'/);
assert.match(footer, /https:\/\/www\.exchangerate-api\.com[^]*Rates By Exchange Rate API/);
assert.match(footer, /https:\/\/www\.floatrates\.com\/json-feeds\.html/);
assert.match(disclosurePage, /ExchangeRate-API open feed: once per day/);
assert.match(disclosurePage, /FloatRates JSON feed: approximately every 12 hours/);
assert.match(rates, /24-hour change[^]*stays N\/A until comparable historical observations/);
assert.doesNotMatch(rates, /lastUpdated: 'Live Feed'/);
assert.match(ticker, /verified 24h change unavailable/);
console.log('[PASS] Public rate and tax copy identifies reference quotes, assumptions and tax limitations.');

assert.doesNotMatch(staticHtml, /value: 'Rs\. 277\.10'|priceUSD: '\$96,420'|perTola: 'Rs\. 284,500'|interbankBuy: '277\.05'|Sub-40ms Interbank|PSEB tax exemptions \(0\.25% final tax\)/i);
assert.doesNotMatch(staticHtml, /Polled every 60s during banking hours; SBP weighted closing|all conversion equations.*cross-checked against live SBP weighted closing/i);
assert.match(staticHtml, /Fetching reference quote/);
assert.match(staticHtml, /Awaiting verified FX reference feed/);
assert.match(staticHtml, /certificate documents the receipt; it is not itself an automatic tax exemption/i);
console.log('[PASS] Search-crawler pre-render templates contain no fabricated market quotes or guaranteed tax exemptions.');

assert.equal(BLOG_POSTS.length, 20, 'Original research library must stay unchanged in size.');
for (const article of BLOG_POSTS) {
  assert.equal(article.author, 'Sufyan Sindhu', `${article.slug} has inconsistent author`);
  assert.ok(getArticleReferences(article).length >= 2, `${article.slug} needs topic-specific references`);
  assert.ok(article.content.split(/\s+/).filter(Boolean).length > 1000, `${article.slug} is incomplete`);
}
console.log('[PASS] All 20 existing research guides retain author identity, substantial text and topical references.');

for (const route of ['/about', '/contact', '/editorial-policy', '/data-sources', '/privacy-policy', '/terms']) {
  assert.match(read('src/App.jsx'), new RegExp(`path=["']${route}["']`), `Missing trust/support route ${route}`);
}
assert.match(read('public/ads.txt'), /google\.com, pub-1794342776311306, DIRECT/);
console.log('[PASS] Trust, disclosure, privacy and AdSense ownership paths are present.');

console.log('All 4 AdSense content-claims regression groups passed.');
