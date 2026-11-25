import { displayAuthorName } from '../src/utils/authorIdentity.js';

/**
 * Public, server-rendered page for articles published after the static build.
 * The Vercel rewrite reaches this function only when a pre-rendered file is
 * absent. This ensures links shared from any device work without redeploying.
 */
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ydroyycgjnbjcoprrrwk.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cfiOd9efKs6N71KzILP1KQ_lN8bCORq';
const SITE_URL = 'https://www.fgcspot.com';

export function escapeHtml(value = '') {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeUrl(value) {
  if (typeof value !== 'string') return '';
  try {
    const parsed = new URL(value);
    return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : '';
  } catch { return ''; }
}

function safeCoverImage(value) {
  const remote = safeUrl(value);
  if (remote) return remote;
  // Existing mobile uploads are compressed image data URLs stored with the
  // article. Restrict to passive raster formats, never HTML or SVG data URLs.
  if (typeof value === 'string' && value.length <= 2_000_000 &&
      /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    return value;
  }
  return '';
}

function renderInline(raw) {
  const safe = escapeHtml(raw);
  return safe
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_all, label, href) => `<a rel="noopener noreferrer" target="_blank" href="${escapeHtml(href)}">${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

/** Minimal Markdown renderer; all author-provided text is escaped first. */
export function renderMarkdown(content = '') {
  const blocks = String(content).replace(/\r\n?/g, '\n').split(/\n\s*\n/);
  return blocks.map(block => {
    const lines = block.trim().split('\n');
    if (!block.trim()) return '';
    if (lines.length >= 2 && lines.every(line => /^\s*\|.*\|\s*$/.test(line)) && /^\s*\|[\s|:-]+\|\s*$/.test(lines[1])) {
      const cells = line => line.trim().slice(1, -1).split('|').map(cell => `<span>${renderInline(cell.trim())}</span>`);
      const head = cells(lines[0]).map(cell => `<th>${cell}</th>`).join('');
      const body = lines.slice(2).map(line => `<tr>${cells(line).map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
      return `<div class="table-scroll"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
    }
    if (lines.every(line => /^\s*[-*]\s/.test(line))) {
      return `<ul>${lines.map(line => `<li>${renderInline(line.replace(/^\s*[-*]\s/, ''))}</li>`).join('')}</ul>`;
    }
    if (lines.every(line => /^\s*\d+\.\s/.test(line))) {
      return `<ol>${lines.map(line => `<li>${renderInline(line.replace(/^\s*\d+\.\s/, ''))}</li>`).join('')}</ol>`;
    }
    const heading = block.trim().match(/^(#{1,4})\s+(.+)$/s);
    if (heading && !heading[2].includes('\n')) {
      const level = Math.max(2, heading[1].length);
      return `<h${level}>${renderInline(heading[2])}</h${level}>`;
    }
    if (lines.every(line => /^>\s?/.test(line))) {
      return `<blockquote>${lines.map(line => renderInline(line.replace(/^>\s?/, ''))).join('<br>')}</blockquote>`;
    }
    return `<p>${lines.map(line => renderInline(line)).join('<br>')}</p>`;
  }).filter(Boolean).join('\n');
}

export function renderArticleHtml(article) {
  const title = escapeHtml(article.title || 'Financial Research Article');
  const desc = escapeHtml(article.excerpt || article.summary || String(article.content || '').slice(0, 155));
  const category = escapeHtml(article.category || 'Financial Research');
  const authorName = displayAuthorName(article.author);
  const author = escapeHtml(authorName);
  const slug = encodeURIComponent(article.slug);
  const canonical = `${SITE_URL}/blog/${slug}`;
  const cover = safeCoverImage(article.image || article.cover_image || '');
  const shareImage = safeUrl(cover);
  const published = article.created_at && !Number.isNaN(Date.parse(article.created_at)) ? new Date(article.created_at).toISOString() : null;
  const updated = article.updated_at && !Number.isNaN(Date.parse(article.updated_at)) ? new Date(article.updated_at).toISOString() : published;
  const schema = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article',
    headline: article.title, description: article.excerpt || article.summary || '',
    mainEntityOfPage: canonical, author: { '@type': 'Person', name: authorName, url: `${SITE_URL}/author/sufyan-sindhu` },
    publisher: { '@type': 'Organization', name: 'FGC Spot', url: SITE_URL },
    ...(published ? { datePublished: published } : {}),
    ...(updated ? { dateModified: updated } : {}),
    ...(shareImage ? { image: shareImage } : {})
  }).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} | FGC Spot</title><meta name="description" content="${desc}">
<meta name="robots" content="index, follow"><link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:type" content="article"><meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}"><meta property="og:url" content="${escapeHtml(canonical)}">
${shareImage ? `<meta property="og:image" content="${escapeHtml(shareImage)}">` : ''}
<script type="application/ld+json">${schema}</script>
<style>
  :root{color-scheme:dark;font-family:Inter,system-ui,-apple-system,sans-serif;background:#06111f;color:#d1dce8}
  *{box-sizing:border-box}body{margin:0;line-height:1.75}a{color:#00e676}a:hover{text-decoration:underline}
  header{border-bottom:1px solid #1e3345;background:#071525}nav{max-width:1000px;margin:auto;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
  nav .brand{color:#fff;font-weight:850;text-decoration:none;font-size:1.25rem}nav .links{display:flex;gap:18px;flex-wrap:wrap}
  main{max-width:860px;padding:38px 22px 70px;margin:0 auto}.crumbs{font-size:.85rem;margin-bottom:24px}
  article{background:#0a1a2c;border:1px solid #1e3345;border-radius:18px;padding:clamp(20px,5vw,48px)}
  .tag{color:#00e676;font-size:.8rem;letter-spacing:.09em;text-transform:uppercase;font-weight:750}
  h1{color:white;line-height:1.22;font-size:clamp(1.7rem,4vw,2.9rem)}h2,h3,h4{color:white;line-height:1.35;margin:1.7em 0 .65em}
  .byline{color:#a0afc1;font-size:.85rem;margin-bottom:24px}.cover{width:100%;max-height:430px;object-fit:cover;border-radius:12px}
  .summary{border-left:4px solid #00e676;padding:16px 20px;background:#0d2c2a;border-radius:5px;margin:26px 0}
  .body{overflow-wrap:anywhere}.body p,.body ul,.body ol{margin:1.25em 0}.body li{margin:.4em 0}
  .body blockquote{border-left:3px solid #00e676;padding-left:18px;margin-left:0;color:#d4e1eb}
  .table-scroll{max-width:100%;overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:.88rem}th,td{border:1px solid #294156;padding:9px 13px;text-align:left}th{background:#123248;color:#fff}
  code{color:#00e676;background:#142c40;padding:2px 4px;border-radius:3px}footer{border-top:1px solid #1e3345;text-align:center;padding:32px;font-size:.85rem;color:#9aaabe}
  @media(max-width:500px){nav{padding:14px 18px}.links{gap:12px;font-size:.9rem}main{padding:24px 12px 60px}article{border-radius:12px}}
</style></head><body>
<header><nav><a class="brand" href="/">FGC Spot <span style="font-size:.6em;color:#00e676">● LIVE</span></a>
<div class="links"><a href="/">Home</a><a href="/rates">Rates</a><a href="/gold">Gold</a><a href="/blog">Research</a></div></nav></header>
<main><div class="crumbs"><a href="/">Home</a> / <a href="/blog">Research</a> / ${title}</div>
<article><span class="tag">${category}</span><h1>${title}</h1>
<p class="byline">By ${author}${published ? ` · Published <time datetime="${published}">${published.slice(0,10)}</time>` : ''}${updated && updated !== published ? ` · Updated ${updated.slice(0,10)}` : ''}</p>
${cover ? `<img class="cover" src="${escapeHtml(cover)}" alt="${title}" loading="eager">` : ''}
${desc ? `<div class="summary">${desc}</div>` : ''}
<div class="body">${renderMarkdown(article.content || '')}</div>
</article><p><a href="/blog">← More financial research from FGC Spot</a></p></main>
<footer>© FGC Spot · Independent financial research · <a href="/editorial-policy">Editorial policy</a> · <a href="/disclaimer">Disclaimer</a></footer>
</body></html>`;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).end();

  const slug = typeof req.query?.slug === 'string' ? req.query.slug : '';
  if (!/^[a-z0-9][a-z0-9-]{0,198}[a-z0-9]$/.test(slug)) {
    return res.status(404).send('Article not found');
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/articles?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`, {
      signal: AbortSignal.timeout(7000),
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`Article source responded ${response.status}`);
    const records = await response.json();
    if (!Array.isArray(records) || records.length === 0 || records[0]?.is_published === false) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send('<!doctype html><html><head><title>Article not found | FGC Spot</title><meta name="robots" content="noindex, follow"></head><body><h1>Article not found</h1><a href="/blog">Back to research</a></body></html>');
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(req.method === 'HEAD' ? '' : renderArticleHtml(records[0]));
  } catch (error) {
    console.error('[article-page] Public article lookup failed:', error?.message);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(503).send('Article service temporarily unavailable. Please retry shortly.');
  }
}

