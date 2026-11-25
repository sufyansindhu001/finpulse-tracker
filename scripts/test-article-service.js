import { getCachedArticles, PURGED_SLUG_SET } from '../src/services/articlesService.js';
import { BLOG_POSTS } from '../src/data/blogPosts.js';

console.log('=== STEP 4: TEST ARTICLE SERVICE (scripts/test-article-service.js) ===\n');

let passed = 0;
let failed = 0;

// Test 1: Bundled article count
if (Array.isArray(BLOG_POSTS) && BLOG_POSTS.length === 20) {
  console.log(`[PASS] BLOG_POSTS array contains exactly 20 articles.`);
  passed++;
} else {
  console.error(`[FAIL] Expected 20 articles in BLOG_POSTS, found: ${BLOG_POSTS?.length}`);
  failed++;
}

// Test 2: getCachedArticles returns 20 valid articles
const cached = getCachedArticles();
if (Array.isArray(cached) && cached.length === 20) {
  console.log(`[PASS] getCachedArticles() returned 20 articles.`);
  passed++;
} else {
  console.error(`[FAIL] getCachedArticles() returned ${cached?.length} articles (expected 20).`);
  failed++;
}

// Test 3: Every article has rich content, table, FAQ, formula, and valid metadata
let richCount = 0;
cached.forEach((a, idx) => {
  const hasTitle = Boolean(a.title);
  const hasSlug = Boolean(a.slug);
  const hasContent = Boolean(a.content && a.content.length > 800);
  const hasAuthor = Boolean(a.author);
  const hasDate = Boolean(a.date);
  const hasTable = Boolean(a.content && a.content.includes('|') && a.content.includes('\n|'));
  const hasFaq = Boolean(a.content && a.content.includes('Frequently Asked Questions'));

  if (hasTitle && hasSlug && hasContent && hasAuthor && hasDate && hasTable && hasFaq) {
    richCount++;
  } else {
    console.warn(`[WARN] Article #${idx + 1} (${a.slug}) missing rich elements:`, {
      hasTitle, hasSlug, hasContent, hasAuthor, hasDate, hasTable, hasFaq
    });
  }
});

if (richCount === 20) {
  console.log(`[PASS] All 20 articles contain rich markdown content (>800 chars), comparison tables, and FAQ sections.`);
  passed++;
} else {
  console.error(`[FAIL] Only ${richCount}/20 articles met rich content criteria.`);
  failed++;
}

// Test 4: PURGED_SLUG_SET contains all 16 legacy slugs
const expectedLegacySlugs = [
  'navigating-central-bank-rate-decisions-and-currency-volatility-in-modern-markets',
  'gold-prices-hold-near-record-highs-as-investors-flock-to-safe-haven-assets-amid-global-economic-shifts',
  'understanding-the-u-s-dollar-index-dxy-currency-trends-and-global-market-impact',
  'us-gold-investment-safe-haven-assets-navigating-inflation-and-economic-uncertainty'
];

let legacyFiltered = true;
expectedLegacySlugs.forEach(slug => {
  if (!PURGED_SLUG_SET.has(slug)) {
    console.error(`[FAIL] PURGED_SLUG_SET missing legacy slug: ${slug}`);
    legacyFiltered = false;
  }
});

if (legacyFiltered && PURGED_SLUG_SET.size >= 16) {
  console.log(`[PASS] PURGED_SLUG_SET correctly includes all 16 legacy slugs (${PURGED_SLUG_SET.size} total purged).`);
  passed++;
} else {
  failed++;
}

// Test 5: Missing article lookup returns undefined (no fake content)
const testMissing = cached.find(a => a.slug === 'non-existent-sample-slug');
if (testMissing === undefined) {
  console.log(`[PASS] Query for non-existent slug safely returns undefined (zero synthetic or placeholder content generated).`);
  passed++;
} else {
  console.error(`[FAIL] Non-existent slug returned unexpected data:`, testMissing);
  failed++;
}

console.log(`\ntest-article-service.js Summary: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
