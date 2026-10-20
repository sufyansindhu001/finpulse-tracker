// app/sitemap.ts - Next.js / Google Search Console Metadata Route
// Dynamically provides verified sitemap URL mappings with current lastModified dates.

import { BLOG_POSTS } from '../src/data/blogPosts';

export const BASE_URL = 'https://www.fgcspot.com';

export interface SitemapEntry {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export default async function sitemap(): Promise<SitemapEntry[]> {
  const today = new Date();

  // Core Static Platform Routes
  const staticRoutes: SitemapEntry[] = [
    { url: `${BASE_URL}/`, lastModified: today, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/blog`, lastModified: today, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/stocks`, lastModified: today, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/rates`, lastModified: today, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE_URL}/converter`, lastModified: today, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/gold`, lastModified: today, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE_URL}/crypto`, lastModified: today, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE_URL}/charts`, lastModified: today, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/news`, lastModified: today, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: today, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: today, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: today, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/terms`, lastModified: today, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/disclaimer`, lastModified: today, changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Guaranteed Flagship Articles
  const flagshipSlugs = [
    'buying-gold-in-pakistan-tola-karat-making-charges-guide',
    'freelance-remittances-banking-in-pakistan-fbr-tax-regimes-pseb-registration-and-retention-accounts-explained'
  ];

  const seenSlugs = new Set<string>();
  const blogEntries: SitemapEntry[] = [];

  // 1. Add flagship priority guides first
  flagshipSlugs.forEach(slug => {
    seenSlugs.add(slug);
    blogEntries.push({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified: today,
      changeFrequency: 'daily',
      priority: 1.0,
    });
  });

  // 2. Add all remaining articles from the database
  if (Array.isArray(BLOG_POSTS)) {
    BLOG_POSTS.forEach(post => {
      const slug = post.slug || post.id;
      if (slug && !seenSlugs.has(slug)) {
        seenSlugs.add(slug);
        blogEntries.push({
          url: `${BASE_URL}/blog/${slug}`,
          lastModified: today,
          changeFrequency: 'daily',
          priority: 0.9,
        });
      }
    });
  }

  return [...staticRoutes, ...blogEntries];
}
