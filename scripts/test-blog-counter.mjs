// scripts/test-blog-counter.mjs
// Rigorous verification of BlogPage counter, pagination, and deduplication logic

import assert from 'assert';
import { BLOG_POSTS } from '../src/data/blogPosts.js';

console.log(`Loaded ${BLOG_POSTS.length} authoritative articles from src/data/blogPosts.js.`);

// Replicate BlogPage's exact logic
function simulateBlogPage({
  articlesList,
  selectedCategory = 'All',
  searchQuery = '',
  visibleCount = 6
}) {
  const parseTags = (tags) => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const filteredPosts = articlesList.filter(post => {
    if (!post) return false;
    const matchCat = selectedCategory === 'All' || (post.category || '') === selectedCategory;
    const tagsList = parseTags(post.tags);
    const title = post.title || '';
    const summary = post.summary || post.excerpt || '';
    const matchSearch =
      !searchQuery ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tagsList.some(t => (t || '').toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const featuredPost = articlesList[0] || null;
  const isShowingFeatured = selectedCategory === 'All' && !searchQuery && Boolean(featuredPost);

  const gridPosts = (isShowingFeatured && featuredPost)
    ? filteredPosts.filter(p => p.id !== featuredPost.id && (p.slug ? p.slug !== featuredPost.slug : true))
    : filteredPosts;

  const displayedPosts = gridPosts.slice(0, visibleCount);

  // The EXACT corrected counter formula
  const displayedCount = displayedPosts.length + (isShowingFeatured && featuredPost ? 1 : 0);
  const totalCount = filteredPosts.length;
  const counterText = `Showing ${displayedCount} of ${totalCount} articles`;

  // Check for duplicates between featured and grid
  const renderedSlugs = new Set();
  let duplicateFound = false;

  if (isShowingFeatured && featuredPost) {
    renderedSlugs.add(featuredPost.slug);
  }

  for (const post of displayedPosts) {
    if (renderedSlugs.has(post.slug)) {
      duplicateFound = true;
    }
    renderedSlugs.add(post.slug);
  }

  const remaining = gridPosts.length - displayedPosts.length;
  const hasLoadMore = displayedPosts.length < gridPosts.length;

  return {
    isShowingFeatured,
    featuredSlug: featuredPost ? featuredPost.slug : null,
    totalFiltered: filteredPosts.length,
    gridLength: gridPosts.length,
    displayedGridLength: displayedPosts.length,
    displayedCount,
    totalCount,
    counterText,
    remaining,
    hasLoadMore,
    renderedSlugsCount: renderedSlugs.size,
    duplicateFound
  };
}

// -------------------------------------------------------------
// Test 1: Initial Load (All categories, no search, visibleCount = 6)
// -------------------------------------------------------------
console.log('\n--- Scenario 1: Initial Load ---');
const s1 = simulateBlogPage({ articlesList: BLOG_POSTS, selectedCategory: 'All', searchQuery: '', visibleCount: 6 });
console.log(s1);
assert.strictEqual(s1.totalCount, 20, 'Total articles must be 20');
assert.strictEqual(s1.displayedCount, 7, 'Displayed count must be 7 (6 grid + 1 featured)');
assert.strictEqual(s1.counterText, 'Showing 7 of 20 articles');
assert.strictEqual(s1.duplicateFound, false, 'No duplicate articles rendered');
assert.strictEqual(s1.hasLoadMore, true, 'Load More button should be present');
assert.strictEqual(s1.remaining, 13, '13 remaining in grid');
console.log('PASS: Scenario 1 Initial load shows 7 of 20 articles without duplicates.');

// -------------------------------------------------------------
// Test 2: First Load More (visibleCount = 12)
// -------------------------------------------------------------
console.log('\n--- Scenario 2: Load More (visibleCount = 12) ---');
const s2 = simulateBlogPage({ articlesList: BLOG_POSTS, selectedCategory: 'All', searchQuery: '', visibleCount: 12 });
console.log(s2);
assert.strictEqual(s2.displayedCount, 13, 'Displayed count must be 13 (12 grid + 1 featured)');
assert.strictEqual(s2.counterText, 'Showing 13 of 20 articles');
assert.strictEqual(s2.duplicateFound, false, 'No duplicate articles rendered');
assert.strictEqual(s2.hasLoadMore, true, 'Load More button should be present');
assert.strictEqual(s2.remaining, 7, '7 remaining in grid');
console.log('PASS: Scenario 2 Load More 1 shows 13 of 20 articles.');

// -------------------------------------------------------------
// Test 3: Second Load More (visibleCount = 18)
// -------------------------------------------------------------
console.log('\n--- Scenario 3: Load More (visibleCount = 18) ---');
const s3 = simulateBlogPage({ articlesList: BLOG_POSTS, selectedCategory: 'All', searchQuery: '', visibleCount: 18 });
console.log(s3);
assert.strictEqual(s3.displayedCount, 19, 'Displayed count must be 19 (18 grid + 1 featured)');
assert.strictEqual(s3.counterText, 'Showing 19 of 20 articles');
assert.strictEqual(s3.duplicateFound, false, 'No duplicate articles rendered');
assert.strictEqual(s3.hasLoadMore, true, 'Load More button should be present');
assert.strictEqual(s3.remaining, 1, '1 remaining in grid');
console.log('PASS: Scenario 3 Load More 2 shows 19 of 20 articles.');

// -------------------------------------------------------------
// Test 4: All Loaded (visibleCount = 24)
// -------------------------------------------------------------
console.log('\n--- Scenario 4: All Loaded (visibleCount = 24) ---');
const s4 = simulateBlogPage({ articlesList: BLOG_POSTS, selectedCategory: 'All', searchQuery: '', visibleCount: 24 });
console.log(s4);
assert.strictEqual(s4.displayedCount, 20, 'Displayed count must be 20 (19 grid + 1 featured)');
assert.strictEqual(s4.totalCount, 20, 'Total count must be 20');
assert.strictEqual(s4.counterText, 'Showing 20 of 20 articles');
assert.strictEqual(s4.duplicateFound, false, 'No duplicate articles rendered');
assert.strictEqual(s4.hasLoadMore, false, 'Load More button must be hidden when all loaded');
assert.strictEqual(s4.remaining, 0, '0 remaining in grid');
assert.strictEqual(s4.renderedSlugsCount, 20, 'Exactly 20 unique slugs rendered across featured and grid');
console.log('PASS: Scenario 4 All loaded shows 20 of 20 articles, Load More hidden.');

// -------------------------------------------------------------
// Test 5: Category Filtering
// -------------------------------------------------------------
console.log('\n--- Scenario 5: Category Filtering ---');
const categories = [...new Set(BLOG_POSTS.map(a => a.category).filter(Boolean))];
console.log('Found categories:', categories);
const testCat = categories[0];
const expectedInCat = BLOG_POSTS.filter(a => a.category === testCat).length;
const s5 = simulateBlogPage({ articlesList: BLOG_POSTS, selectedCategory: testCat, searchQuery: '', visibleCount: 6 });
console.log(s5);
assert.strictEqual(s5.isShowingFeatured, false, 'Featured banner must NOT be shown during category filtering');
assert.strictEqual(s5.totalCount, expectedInCat, `Total count must match articles in category ${testCat}`);
assert.strictEqual(s5.displayedCount, Math.min(6, expectedInCat), 'Displayed count must match grid displayed count');
assert.strictEqual(s5.duplicateFound, false, 'No duplicates in category filter');
console.log(`PASS: Scenario 5 Category filter (${testCat}) correctly shows ${s5.displayedCount} of ${s5.totalCount} articles.`);

// -------------------------------------------------------------
// Test 6: Search Filtering
// -------------------------------------------------------------
console.log('\n--- Scenario 6: Search Filtering ---');
const s6 = simulateBlogPage({ articlesList: BLOG_POSTS, selectedCategory: 'All', searchQuery: 'gold', visibleCount: 6 });
console.log(s6);
assert.strictEqual(s6.isShowingFeatured, false, 'Featured banner must NOT be shown during search filtering');
assert.strictEqual(s6.counterText, `Showing ${s6.displayedCount} of ${s6.totalCount} articles`);
assert.strictEqual(s6.duplicateFound, false, 'No duplicates in search filtering');
console.log(`PASS: Scenario 6 Search filter for 'gold' shows ${s6.displayedCount} of ${s6.totalCount} articles.`);

// -------------------------------------------------------------
// Test 7: Zero Search Results
// -------------------------------------------------------------
console.log('\n--- Scenario 7: Zero Search Results ---');
const s7 = simulateBlogPage({ articlesList: BLOG_POSTS, selectedCategory: 'All', searchQuery: 'xyznonexistent123', visibleCount: 6 });
console.log(s7);
assert.strictEqual(s7.isShowingFeatured, false, 'Featured banner disabled');
assert.strictEqual(s7.totalCount, 0, 'Total count 0');
assert.strictEqual(s7.displayedCount, 0, 'Displayed count 0');
assert.strictEqual(s7.counterText, 'Showing 0 of 0 articles');
console.log('PASS: Scenario 7 Zero search results shows 0 of 0 articles.');

console.log('\n=============================================');
console.log('ALL 7 COUNTER VERIFICATION TESTS PASSED!');
console.log('=============================================');
