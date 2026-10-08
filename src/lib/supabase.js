import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://ydroyycgjnbjcoprrrwk.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cfiOd9efKs6N71KzILP1KQ_lN8bCORq';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Strips raw AI grounding/citation markers (e.g., [span_3](start_span), [citation:1])
 * and stray markdown tokens, returning a clean tag string.
 */
export function cleanTag(rawTag) {
  if (!rawTag || typeof rawTag !== 'string') return '';
  return rawTag
    // 1. Remove markdown links / span annotations like [span_3](start_span), [span_0](end_span)
    .replace(/\[[^\]]*span[^\]]*\](?:\([^)]*\))?/gi, '')
    // 2. Remove generic markdown links [text](url) -> keep text if not a span
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // 3. Remove citation tokens like [cite:1], [citation:1], [1]
    .replace(/\[(?:cite|citation|\d+)[^\]]*\]/gi, '')
    // 4. Remove inline span / start_span / end_span text
    .replace(/\b(?:start_span|end_span|span_\d+)\b/gi, '')
    // 5. Remove leading '#' symbols since UI already prefixes '#'
    .replace(/^#+/, '')
    // 6. Remove any leftover brackets, asterisks, backticks, quotes
    .replace(/[[\]*`"'()]/g, '')
    // 7. Clean whitespace
    .trim();
}

/**
 * Normalizes raw tag inputs (array or comma-separated string) into clean, unique tokens.
 */
export function parseTags(rawTags) {
  if (!rawTags) return ['Market'];
  const list = Array.isArray(rawTags)
    ? rawTags
    : (typeof rawTags === 'string' ? rawTags.split(',') : []);

  const cleaned = [];
  const seen = new Set();

  for (const item of list) {
    if (typeof item === 'string') {
      for (const subItem of item.split(',')) {
        const c = cleanTag(subItem);
        if (c && c.length > 0 && !seen.has(c.toLowerCase())) {
          seen.add(c.toLowerCase());
          cleaned.push(c);
        }
      }
    }
  }

  return cleaned.length > 0 ? cleaned : ['Market'];
}

function stripSpanMarkup(text) {
  if (!text || typeof text !== 'string') return text || '';
  return text
    .replace(/\[[^\]]*span[^\]]*\](?:\([^)]*\))?/gi, '')
    .replace(/\b(?:start_span|end_span|span_\d+)\b/gi, '')
    .trim();
}

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
    title: stripSpanMarkup(raw.title) || 'Untitled Financial Guide',
    category: raw.category || 'Market Updates',
    author: raw.author || 'Sufyan Saleem (Financial Research Desk)',
    readTime: readTimeStr,
    read_time: readTimeStr,
    date: dateFormatted,
    created_at: raw.created_at || new Date().toISOString(),
    summary: stripSpanMarkup(raw.summary || raw.excerpt) || '',
    excerpt: stripSpanMarkup(raw.excerpt || raw.summary) || '',
    content: raw.content || '',
    likes: typeof raw.likes === 'number' ? raw.likes : (raw.likes ? parseInt(raw.likes, 10) : undefined),
    image: raw.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&fm=webp&q=75',
    tags: parseTags(raw.tags)
  };
}

export default supabase;
