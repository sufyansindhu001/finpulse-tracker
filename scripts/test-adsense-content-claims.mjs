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

assert.doesNotMatch(converter, /100% tax-free|100% tax-exempt|Automatic e-PRC tax shield|No official e-PRC tax exemption|authentic institutional mid-market rates without hidden bank markups/i);
assert.match(converter, /e-PRC proves receipt|e-PRC\)\.?.*not automatically exempt|does not by itself establish an income-tax exemption/i);
assert.match(converter, /Hypothetical comparison only/i);
assert.match(converter, /www\.sbp\.org\.pk\/circulars\/fe-circular-no-05-of-2022/);
assert.match(converter, /www\.fbr\.gov\.pk\/Budget2026-27/);
assert.doesNotMatch(rates, /guarantees receipt of an|statutory proof of untaxed|certified precious metals/i);
assert.match(rates, /not a guarantee that the underlying income is tax-free/i);
assert.doesNotMatch(footer, /Sub-Second Live Feeds/i);
assert.doesNotMatch(offerings, /Certified precious metals pricing|zero-spread quotes/i);
assert.doesNotMatch(methodology, /Direct socket aggregation|sub-second delta updates/i);
console.log('[PASS] Public rate and tax copy identifies reference quotes, assumptions and tax limitations.');

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

console.log('All 3 AdSense content-claims regression groups passed.');
