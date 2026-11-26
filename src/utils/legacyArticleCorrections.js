import { BLOG_POSTS } from '../data/blogPosts.js';

/**
 * The 20 original articles were bundled into the static site and independently
 * imported into Supabase. Until the owner next edits a legacy article, show
 * its corrected editorial copy even if an older database record is cached.
 *
 * Future articles and edits after this review remain the database's source of
 * truth, preserving instant cross-device publishing without redeployments.
 */
const LEGACY_REVIEW_CUTOFF = Date.parse('2026-11-26T19:00:00Z');
const reviewedBySlug = new Map(BLOG_POSTS.map(article => [article.slug, article]));

export function applyLegacyArticleCorrections(article) {
  if (!article || typeof article !== 'object') return article;
  const curated = reviewedBySlug.get(String(article.slug || ''));
  if (!curated) return article;

  const remoteModified = Date.parse(article.updated_at || article.created_at || '');
  // Never shadow a later owner-authored update, including one published from
  // the mobile admin interface after these corrections were prepared.
  if (Number.isFinite(remoteModified) && remoteModified > LEGACY_REVIEW_CUTOFF) {
    return article;
  }

  return {
    ...article,
    title: curated.title,
    content: curated.content,
    summary: curated.summary || curated.excerpt,
    excerpt: curated.excerpt || curated.summary,
    date: curated.date,
    updated_at: curated.updated_at
  };
}
