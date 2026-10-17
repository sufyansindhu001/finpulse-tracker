import { BLOG_POSTS } from '../data/blogPosts';

/**
 * Priority unindexed or cornerstone educational guides that require strong internal link signals
 * across the site to resolve Google Search Console's "Referring page: None detected".
 */
export const PRIORITY_UNINDEXED_SLUGS = [
  'buying-gold-in-pakistan-tola-karat-making-charges-guide',
  'freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained',
  'spotting-fake-gold-hallmarking-standards-the-complete-investor-guide-to-bullion-bars-vs-jewelry',
  'usd-to-pkr-interbank-vs-open-market-guide',
  'remittances-forex-spread-the-hidden-costs-of-sending-money-to-pakistan-and-how-to-get-real-rates',
  'storing-crypto-safely-exchanges-vs-wallets-guide',
];

/**
 * Returns 3 to 4 related articles for the given article, ensuring unindexed/cornerstone
 * posts are consistently linked as referring pages from other articles.
 *
 * @param {Object} current - The active article being rendered
 * @param {Array} allArticles - All available articles
 * @param {number} limit - Maximum number of related posts to return (default 4)
 * @returns {Array} List of related article objects
 */
export function getRelatedArticles(current, allArticles, limit = 4) {
  const pool = Array.isArray(allArticles) && allArticles.length > 0 ? allArticles : BLOG_POSTS;
  if (!current || !pool || pool.length <= 1) return [];

  const currentSlug = (current.slug || current.id || '').toLowerCase().trim();
  const currentCategory = (current.category || '').toLowerCase().trim();
  const currentTags = Array.isArray(current.tags)
    ? current.tags.map(t => String(t).toLowerCase().trim())
    : [];

  const candidates = pool.filter(a => {
    if (!a) return false;
    const s = (a.slug || a.id || '').toLowerCase().trim();
    return s && s !== currentSlug;
  });

  const selected = [];
  const selectedSlugs = new Set();

  function add(art) {
    if (!art) return false;
    const slug = (art.slug || art.id || '').toLowerCase().trim();
    if (!slug || slug === currentSlug || selectedSlugs.has(slug)) return false;
    selected.push(art);
    selectedSlugs.add(slug);
    return true;
  }

  function findBySlug(targetSlug) {
    const clean = targetSlug.toLowerCase().trim();
    return candidates.find(a => (a.slug || a.id || '').toLowerCase().trim() === clean);
  }

  const isGoldPost = currentCategory.includes('gold') || currentCategory.includes('precious') ||
    currentSlug.includes('gold') || currentTags.some(t => t.includes('gold'));

  const isRemittancePost = currentCategory.includes('personal') || currentCategory.includes('currency') ||
    currentSlug.includes('remittance') || currentSlug.includes('forex') || currentSlug.includes('pkr') ||
    currentTags.some(t => t.includes('remittance') || t.includes('pkr') || t.includes('tax') || t.includes('freelance'));

  // 1. Contextual injection of high-priority target articles:
  // Post A: 'buying-gold-in-pakistan-tola-karat-making-charges-guide'
  // Post B: 'freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained'
  if (isGoldPost) {
    add(findBySlug('buying-gold-in-pakistan-tola-karat-making-charges-guide'));
    add(findBySlug('spotting-fake-gold-hallmarking-standards-the-complete-investor-guide-to-bullion-bars-vs-jewelry'));
    add(findBySlug('freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained'));
  } else if (isRemittancePost) {
    add(findBySlug('freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained'));
    add(findBySlug('remittances-forex-spread-the-hidden-costs-of-sending-money-to-pakistan-and-how-to-get-real-rates'));
    add(findBySlug('buying-gold-in-pakistan-tola-karat-making-charges-guide'));
  } else {
    // Other Macro, Crypto, or Market articles: include both priority unindexed posts
    add(findBySlug('buying-gold-in-pakistan-tola-karat-making-charges-guide'));
    add(findBySlug('freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained'));
  }

  // 2. Add topic/category match from remaining candidates
  const sameCategory = candidates.filter(a => {
    const cat = (a.category || '').toLowerCase().trim();
    return cat === currentCategory && !selectedSlugs.has((a.slug || a.id || '').toLowerCase().trim());
  });
  if (sameCategory.length > 0 && selected.length < limit) {
    add(sameCategory[0]);
  }

  // 3. Add other priority unindexed guides if room remains
  for (const pSlug of PRIORITY_UNINDEXED_SLUGS) {
    if (selected.length >= limit) break;
    add(findBySlug(pSlug));
  }

  // 4. Fill remaining slots with ring rotation based on current article index
  const currentIndex = pool.findIndex(a => (a.slug || a.id || '').toLowerCase().trim() === currentSlug);
  const baseIdx = currentIndex >= 0 ? currentIndex : 0;
  for (let offset = 1; offset < pool.length && selected.length < limit; offset++) {
    const nextIdx = (baseIdx + offset) % pool.length;
    add(pool[nextIdx]);
  }

  return selected.slice(0, limit);
}

export default getRelatedArticles;
