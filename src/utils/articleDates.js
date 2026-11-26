/**
 * Treat a publisher-supplied publication date as distinct from the database
 * record's creation timestamp. Old imported guides can have earlier DB rows.
 * Keep the human-visible date and JSON-LD datePublished consistent.
 */
export function publishedDateISO(article) {
  const label = typeof article?.date === 'string' ? article.date.trim() : '';
  if (/^[A-Za-z]+\s+\d{1,2},\s+\d{4}$/.test(label)) {
    const parsed = new Date(`${label} 12:00:00 GMT`);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  const recorded = article?.created_at;
  if (typeof recorded === 'string') {
    const parsed = new Date(recorded);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return null;
}

export function modifiedDateISO(article) {
  const published = publishedDateISO(article);
  if (typeof article?.updated_at !== 'string') return published;
  const parsed = new Date(article.updated_at);
  if (Number.isNaN(parsed.getTime())) return published;
  return published && parsed.getTime() < Date.parse(published) ? published : parsed.toISOString();
}
