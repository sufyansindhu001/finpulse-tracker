// Editorial attribution is not a professional qualification. Keep legacy
// Supabase bylines readable without repeating AI-invented credentials.
export const DEFAULT_AUTHOR = 'Sufyan Sindhu';
export const DEFAULT_EDITOR_ROLE = 'Publisher & Editor';

export function displayAuthorName(value) {
  if (typeof value !== 'string' || !value.trim()) return DEFAULT_AUTHOR;

  const name = value.trim();
  // Older articles still contain the previous name and AI-invented titles.
  if (/^Sufyan (?:Saleem|Sindhu)\b/i.test(name)) return DEFAULT_AUTHOR;

  return name;
}
