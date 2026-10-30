import { createClient } from '@supabase/supabase-js';
import { BLOG_POSTS } from '../src/data/blogPosts.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ydroyycgjnbjcoprrrwk.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cfiOd9efKs6N71KzILP1KQ_lN8bCORq';

async function sync() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const activeSlugs = new Set(BLOG_POSTS.map(p => p.slug));

  console.log('1. Checking for rogue or purged articles in Supabase...');
  const { data: currentDbArticles, error: fetchErr } = await supabase.from('articles').select('id, slug');
  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    return;
  }

  for (const dbArt of currentDbArticles) {
    if (!activeSlugs.has(dbArt.slug)) {
      console.log(`Deleting unauthorized/purged article: ${dbArt.slug} (${dbArt.id})`);
      const { error: delErr } = await supabase.from('articles').delete().eq('id', dbArt.id);
      if (delErr) console.warn('Delete error:', delErr.message);
    }
  }

  console.log('\n2. Upserting exact 20 clean authoritative articles into Supabase...');
  for (const post of BLOG_POSTS) {
    const payload = {
      slug: post.slug,
      title: post.title,
      category: post.category,
      author: post.author,
      content: post.content,
      excerpt: post.excerpt || post.summary,
      image: post.image || post.coverImage,
      tags: post.tags,
      read_time: post.readTime,
      created_at: post.created_at || '2026-10-24T12:00:00Z'
    };

    const { data: existing } = await supabase.from('articles').select('id').eq('slug', post.slug).limit(1);

    if (existing && existing.length > 0) {
      const { error: updErr } = await supabase.from('articles').update(payload).eq('id', existing[0].id);
      if (updErr) console.warn(`Update failed for ${post.slug}:`, updErr.message);
      else console.log(`✓ Updated: ${post.slug}`);
    } else {
      const { error: insErr } = await supabase.from('articles').insert([{ id: post.id || post.slug, ...payload }]);
      if (insErr) console.warn(`Insert failed for ${post.slug}:`, insErr.message);
      else console.log(`+ Inserted: ${post.slug}`);
    }
  }

  // Verification
  const { data: finalArticles } = await supabase.from('articles').select('id, slug, title, author');
  console.log(`\nSynchronization Complete! Exact Count in Supabase: ${finalArticles.length}`);
  finalArticles.forEach((a, i) => console.log(`${i + 1}. [${a.slug}] ${a.title} (by ${a.author})`));
}

sync().catch(console.error);
