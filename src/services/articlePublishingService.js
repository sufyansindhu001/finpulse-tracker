/**
 * Saves a public article only after Supabase confirms the write.
 * Browser-local storage is a reading cache, never a publishing destination.
 */
export async function savePublishedArticle(supabase, { article, existing = null }) {
  if (!article || !article.title?.trim() || !article.content?.trim()) {
    throw new Error('Add an article title and body before publishing.');
  }

  let query;
  if (existing) {
    const id = existing.id;
    const slug = existing.slug;
    if (!id && !slug) throw new Error('Cannot update an article without a saved identifier.');
    query = supabase.from('articles').update(article);
    query = id ? query.eq('id', id) : query.eq('slug', slug);
  } else {
    if (!article.slug) throw new Error('The article needs a URL slug.');
    query = supabase.from('articles').insert([article]);
  }

  // Returning the row is important: a successful HTTP response with zero
  // affected rows must not be presented as a successful publication.
  const { data, error } = await query.select('id,slug').maybeSingle();
  if (error) throw new Error(error.message || 'Supabase rejected the article.');
  if (!data?.id || !data?.slug) {
    throw new Error('The server did not confirm publication. Nothing was published.');
  }
  return data;
}

/**
 * Check the same anonymous public endpoint that visitors use. An authenticated
 * admin being able to read their own row does not prove public visibility.
 * Failure here does not undo an already-confirmed database write.
 */
export async function verifyPublicArticle(slug, requester = fetch) {
  if (typeof slug !== 'string' || !slug) return false;
  try {
    const response = await requester(`/api/articles?slug=${encodeURIComponent(slug)}&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return false;
    const json = await response.json();
    return json?.success === true && json?.data?.slug === slug;
  } catch {
    return false;
  }
}
