import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BLOG_POSTS } from '../src/data/blogPosts.js';
import { ARTICLE_REFERENCES, getArticleReferences } from '../src/data/articleReferences.js';
import { publishedDateISO, modifiedDateISO } from '../src/utils/articleDates.js';
import { applyLegacyArticleCorrections } from '../src/utils/legacyArticleCorrections.js';
import { renderArticleHtml } from '../api/article-page.js';

assert.equal(BLOG_POSTS.length, 20);
assert.equal(Object.keys(ARTICLE_REFERENCES).length, BLOG_POSTS.length);
assert.equal(new Set(BLOG_POSTS.map(article => article.slug)).size, BLOG_POSTS.length);
for (const article of BLOG_POSTS) {
  const sources = getArticleReferences(article);
  assert.ok(sources.length >= 2, `${article.slug}: missing topical sources`);
  for (const { label, url } of sources) {
    assert.ok(label.length >= 12, `${article.slug}: vague source label`);
    const parsed = new URL(url);
    assert.equal(parsed.protocol, 'https:', `${article.slug}: invalid source protocol`);
    assert.ok(!parsed.hostname.includes('fgcspot'), `${article.slug}: sources must be independent`);
  }
  assert.equal(article.likes, undefined, `${article.slug}: seeded popularity`);
  assert.ok(publishedDateISO(article), `${article.slug}: missing publication date`);
  assert.ok(modifiedDateISO(article), `${article.slug}: missing modified date`);
}
console.log('PASS 1: 20 original guides have independent topic references and no seeded likes.');

const bySlug = slug => BLOG_POSTS.find(article => article.slug === slug);
const property = bySlug('stock-market-vs-real-estate-in-pakistan-which-asset-truly-builds-wealth-over-10-years');
assert.match(property.content, /Section 7E omitted under Finance Act 2026/);
assert.match(property.content, /T\+1 settlement/);
assert.doesNotMatch(property.content, /\*\*Section 7E \(1% Deemed Tax\)\*\*/);
const freelance = bySlug('freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained');
assert.match(freelance.content, /USD 5,000 per month or 50%/);
assert.doesNotMatch(freelance.content, /100% compliant financial standing/);
const carry = bySlug('understanding-the-carry-trade-how-japanese-yen-differentials-move-global-forex');
assert.match(carry.content, /\$579,710/);
assert.match(carry.content, /\$313,043/);
const spiva = bySlug('the-s-p-500-global-index-investing-why-90-of-active-fund-managers-fail-to-beat-the-market');
assert.match(spiva.title, /What SPIVA Says/);
assert.match(spiva.content, /79% underperformance/);
const savings = bySlug('beating-inflation-why-keeping-cash-in-a-savings-account-is-losing-you-money-and-better-alternatives');
assert.match(savings.content, /-4\.14%/);
assert.match(savings.content, /20% withholding/);
assert.doesNotMatch(savings.content, /\*\*-5\.67% \(Guaranteed Yield\)\*\*/);
const inflation = bySlug('hedging-against-inflation-cash-devaluation-purchasing-power-and-modern-wealth-preservation');
assert.match(inflation.content, /Qualitative Comparison/);
assert.doesNotMatch(inflation.content, /\+22\.4% Annualized/);
console.log('PASS 2: critical 2026 tax, PSX, SBP, SPIVA and financial math claims corrected.');

const oldRecord = {
  ...property,
  title: 'Outdated remote property headline',
  content: 'Outdated remote Section 7E claims',
  updated_at: '2026-10-24T12:00:00Z'
};
assert.equal(applyLegacyArticleCorrections(oldRecord).content, property.content);
const futureEdit = { ...oldRecord, updated_at: '2026-11-27T12:00:00Z', title: 'Owner mobile update' };
assert.equal(applyLegacyArticleCorrections(futureEdit), futureEdit);
const newArticle = { ...oldRecord, slug: 'a-new-article-from-mobile' };
assert.equal(applyLegacyArticleCorrections(newArticle), newArticle);
console.log('PASS 3: old Supabase guides receive corrections; future owner edits remain untouched.');

const html = renderArticleHtml(oldRecord);
assert.ok(html.includes('Section 7E omitted under Finance Act 2026'));
assert.ok(html.includes('Sources &amp; Further Reading'));
assert.ok(html.includes('https://www.fbr.gov.pk/Budget2026-27/'));
assert.ok(!html.includes('Outdated remote property headline'));
const newHtml = renderArticleHtml({
  slug: 'owner-new-article', title: 'Owner New Article', content: 'New owner text',
  author: 'Sufyan Sindhu', created_at: '2026-11-27T08:00:00Z'
});
assert.ok(newHtml.includes('Owner New Article'));
assert.ok(!newHtml.includes('Sources &amp; Further Reading'));
console.log('PASS 4: Vercel live article fallback uses corrected HTML and preserves new posts.');

const prerendered = readFileSync(new URL(`../dist/blog/${property.slug}/index.html`, import.meta.url), 'utf8');
assert.ok(prerendered.includes('Sources &amp; Further Reading'));
assert.ok(prerendered.includes('Section 7E omitted under Finance Act 2026'));
assert.ok(prerendered.includes('https://www.fbr.gov.pk/Budget2026-27/'));
assert.ok(!prerendered.includes('Outdated remote property headline'));
const parsedPubDate = publishedDateISO(property);
assert.ok(prerendered.includes(parsedPubDate));
console.log('PASS 5: static Google-visible article matches revised facts, dated schema, and source links.');

console.log('All 5 editorial integrity checks passed.');
