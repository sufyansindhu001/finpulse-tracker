import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://ydroyycgjnbjcoprrrwk.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cfiOd9efKs6N71KzILP1KQ_lN8bCORq';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Standardize article attributes between Supabase column schema and React UI props.
 * Supabase uses snake_case (read_time, created_at) while JSX often uses camelCase (readTime, date).
 */
export function normalizeArticle(raw) {
  if (!raw) return null;
  const createdAt = raw.created_at ? new Date(raw.created_at) : new Date();
  const dateFormatted = raw.date || (isNaN(createdAt.getTime())
    ? 'September 28, 2026'
    : createdAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }));
  const readTimeStr = raw.readTime || raw.read_time || `${Math.max(1, Math.ceil(((raw.content || '').split(' ').length) / 200))} min read`;

  return {
    ...raw,
    id: raw.id || raw.slug,
    slug: raw.slug || raw.id,
    title: raw.title || 'Untitled Financial Guide',
    category: raw.category || 'Market Updates',
    author: raw.author || 'Sufyan Saleem (Financial Research Desk)',
    readTime: readTimeStr,
    read_time: readTimeStr,
    date: dateFormatted,
    created_at: raw.created_at || new Date().toISOString(),
    summary: raw.summary || raw.excerpt || '',
    excerpt: raw.excerpt || raw.summary || '',
    content: raw.content || '',
    image: raw.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&fm=webp&q=75',
    tags: Array.isArray(raw.tags)
      ? raw.tags
      : (typeof raw.tags === 'string' ? raw.tags.split(',').map(t => t.trim()).filter(Boolean) : ['Market'])
  };
}

export default supabase;
