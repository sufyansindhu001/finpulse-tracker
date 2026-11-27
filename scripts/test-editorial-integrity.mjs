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
  assert.equal(article.author, 'Sufyan Sindhu', `${article.slug}: inconsistent author byline`);
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

const forex = bySlug('forex-risk-management-why-most-retail-traders-blow-up-accounts-and-how-to-prevent-it');
assert.match(forex.content, /0\.20 Standard Lots \(2\.0 Mini Lots\)/);
assert.match(forex.content, /0\.12 standard lots \(1\.2 mini lots\)/);
assert.doesNotMatch(forex.content, /Probability of Account Survival|0\.20 Mini Lots|0\.12 mini lot/);
const rda = bySlug('understanding-roshan-digital-account-rda-naya-pakistan-certificates-repatriation-rules-tax-shields');
assert.match(rda.content, /10% at source on NPC profit/);
assert.doesNotMatch(rda.content, /\*\*15\.00%\*\*|\*\*7\.20%\*\*|completely exempt from filing/);
assert.match(rda.content, /RDA Repatriation: Eligible Funds and Bank Processing/);
assert.doesNotMatch(rda.content, /legal guarantee of \*\*unrestricted capital repatriation\*\*/);
const equity = bySlug('pakistan-stock-exchange-psx-vs-global-equities-kse-100-valuation-dividend-yields-sp500-guide');
assert.match(equity.content, /1,762,342/);
assert.doesNotMatch(equity.content, /Commercial Banks \(30%\)|20\.0x - 26\.0x/);
const assay = bySlug('spotting-fake-gold-hallmarking-standards-the-complete-investor-guide-to-bullion-bars-vs-jewelry');
assert.match(assay.content, /Limited penetration cannot establish/);
assert.doesNotMatch(assay.content, /Flawless for Bullion/);
assert.doesNotMatch(assay.content, /guarantee full FBR compliance/);
const orderTypes = bySlug('the-architecture-of-forex-order-types-how-limit-stop-and-trailing-orders-protect-capital');
assert.match(orderTypes.content, /0\.50 standard lots \(5 mini lots\)/);
assert.match(orderTypes.content, /\/ Pip Size\)/);
assert.doesNotMatch(orderTypes.content, /0\.50 Mini Lots|guaranteeing that the trade will close/);
const wire = bySlug('remittances-forex-spread-the-hidden-costs-of-sending-money-to-pakistan-and-how-to-get-real-rates');
assert.match(wire.content, /an in-app receipt is not always an SBP e-PRC/);
assert.doesNotMatch(wire.content, /\*\*0\.20% - 0\.50%\*\*/);
const spivaFactCheck = bySlug('the-s-p-500-global-index-investing-why-90-of-active-fund-managers-fail-to-beat-the-market');
assert.doesNotMatch(spivaFactCheck.content, /\*\*94\.8%\*\*|\*\*92\.2%\*\*/);
const cryp = bySlug('storing-crypto-safely-exchanges-vs-wallets-guide');
assert.doesNotMatch(cryp.content, /Absolute Zero|Core Long-Term Wealth \(> 90%\)/);
const carryFactCheck = bySlug('understanding-the-carry-trade-how-japanese-yen-differentials-move-global-forex');
assert.doesNotMatch(carryFactCheck.content, /\*\*4\.50%\*\* \| \*\*\+4\.00%\*\*/);
console.log('PASS 3: unsupported finance rates, custody absolutes, synthetic percentages and lot arithmetic corrected.');

for (const path of [
  '../src/components/FeaturedResearchSection.jsx',
  '../src/components/Footer.jsx',
  '../src/components/MarketIntelligenceMethodology.jsx',
  '../src/pages/StocksPage.jsx',
  '../src/pages/AuthorPage.jsx'
]) {
  const page = readFileSync(new URL(path, import.meta.url), 'utf8');
  assert.doesNotMatch(page, /sub-5\.0x|sub-5\.0x P\/E|11\.8%.*dividend|10\.5% and 14\.5%/i, `${path}: stale market statistic`);
  if (path.endsWith('/AuthorPage.jsx')) assert.doesNotMatch(page, /Comprehensive empirical analyses/);
}
console.log('PASS 4: homepage, stock terminal and author promotional copy avoids unsupported fixed market ratios.');

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
console.log('PASS 5: old Supabase guides receive corrections; future owner edits remain untouched.');

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
console.log('PASS 6: Vercel live article fallback uses corrected HTML and preserves new posts.');

const prerendered = readFileSync(new URL(`../dist/blog/${property.slug}/index.html`, import.meta.url), 'utf8');
assert.ok(prerendered.includes('Sources &amp; Further Reading'));
assert.ok(prerendered.includes('Section 7E omitted under Finance Act 2026'));
assert.ok(prerendered.includes('https://www.fbr.gov.pk/Budget2026-27/'));
assert.ok(!prerendered.includes('Outdated remote property headline'));
const parsedPubDate = publishedDateISO(property);
assert.ok(prerendered.includes(parsedPubDate));
const forexRendered = readFileSync(new URL(`../dist/blog/${forex.slug}/index.html`, import.meta.url), 'utf8');
assert.ok(forexRendered.includes('0.20 Standard Lots'));
assert.ok(!forexRendered.includes('Probability of Account Survival'));
console.log('PASS 7: static Google-visible articles match revised facts, dated schema, and source links.');

console.log('All 7 editorial integrity checks passed.');
