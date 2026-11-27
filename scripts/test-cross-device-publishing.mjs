import assert from 'node:assert/strict';
import fs from 'node:fs';
import { savePublishedArticle, verifyPublicArticle } from '../src/services/articlePublishingService.js';
import articlePage, { renderArticleHtml, renderMarkdown } from '../api/article-page.js';
import liveSitemap, { renderLiveSitemap } from '../api/live-sitemap.js';

let checks = 0;
function test(name, action) {
  return Promise.resolve().then(action).then(() => {
    checks++;
    console.log(`PASS ${checks}: ${name}`);
  });
}

function db(result) {
  const calls = [];
  const chain = {
    insert: data => { calls.push(['insert', data]); return chain; },
    update: data => { calls.push(['update', data]); return chain; },
    eq: (...args) => { calls.push(['eq', args]); return chain; },
    select: (...args) => { calls.push(['select', args]); return chain; },
    maybeSingle: async () => result,
  };
  return { client: { from: table => { calls.push(['from', table]); return chain; } }, calls };
}

function mockRes() {
  return {
    statusCode: 200, headers: {}, body: null,
    setHeader(key, value) { this.headers[key] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    send(value) { this.body = value; return this; },
    end() { this.body = ''; return this; },
  };
}

const valid = { title: 'Fresh market analysis', content: 'Long original article', slug: 'fresh-market-analysis' };

await test('new article is confirmed by the database', async () => {
  const { client, calls } = db({ data: { id: '123', slug: valid.slug }, error: null });
  const result = await savePublishedArticle(client, { article: valid });
  assert.equal(result.slug, valid.slug);
  assert.equal(calls[1][0], 'insert');
});

await test('edit is confirmed and targets its existing ID', async () => {
  const { client, calls } = db({ data: { id: '123', slug: 'original-slug' }, error: null });
  await savePublishedArticle(client, { article: { title: valid.title, content: valid.content }, existing: { id: '123' } });
  assert.deepEqual(calls.find(call => call[0] === 'eq')[1], ['id', '123']);
});

await test('Supabase permission or offline failures cannot claim success', async () => {
  const { client } = db({ data: null, error: { message: 'permission denied' } });
  await assert.rejects(savePublishedArticle(client, { article: valid }), /permission denied/);
});

await test('zero affected database rows cannot claim success', async () => {
  const { client } = db({ data: null, error: null });
  await assert.rejects(savePublishedArticle(client, { article: valid }), /did not confirm/);
});

await test('blank content fails before a network call', async () => {
  const { client, calls } = db({ data: null });
  await assert.rejects(savePublishedArticle(client, { article: { ...valid, content: ' ' } }), /title and body/);
  assert.equal(calls.length, 0);
});

await test('anonymous visitor endpoint confirms genuinely public posts', async () => {
  const visible = await verifyPublicArticle(valid.slug, async () => ({
    ok: true, json: async () => ({ success: true, data: { id: '123', slug: valid.slug } })
  }));
  assert.equal(visible, true);
});

await test('published status is withheld when anonymous users cannot read', async () => {
  const visible = await verifyPublicArticle(valid.slug, async () => ({
    ok: true, json: async () => ({ success: true, data: [] })
  }));
  assert.equal(visible, false);
});

await test('Markdown rendering prevents HTML and script injection', () => {
  const html = renderMarkdown('## Hello <script>alert(1)</script>\n\n[Read](javascript:alert(1))\n\n- normal');
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('href="javascript:'));
});

await test('financial comparison tables render as accessible HTML', () => {
  const html = renderMarkdown('| Market | Rate |\n| --- | --- |\n| USD/PKR | 280 |');
  assert.ok(html.includes('<table>'));
  assert.ok(html.includes('<th><span>Market</span></th>'));
  assert.ok(html.includes('<td><span>280</span></td>'));
});

await test('dynamic page has canonical, Article JSON-LD and escaped metadata', () => {
  const html = renderArticleHtml({ ...valid, title: 'Stocks & <ETF>', excerpt: 'Trusted <quotes>', created_at: '2026-11-25T12:00:00Z' });
  assert.ok(html.includes('<link rel="canonical" href="https://www.fgcspot.com/blog/fresh-market-analysis">'));
  assert.ok(html.includes('"@type":"Article"'));
  assert.ok(html.includes('&lt;ETF&gt;'));
  assert.ok(!html.includes('<ETF>'));
  assert.ok(!html.includes('<quotes>'));
});

await test('mobile photo data URL shows without allowing unsafe SVG data URLs', () => {
  const photo = renderArticleHtml({ ...valid, image: 'data:image/webp;base64,aGVsbG8=' });
  const unsafe = renderArticleHtml({ ...valid, image: 'data:image/svg+xml;base64,aGVsbG8=' });
  assert.ok(photo.includes('src="data:image/webp;base64,aGVsbG8="'));
  assert.ok(!unsafe.includes('<img class="cover"'));
});

await test('a new public article URL serves HTTP 200 from Supabase', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => [{ ...valid, created_at: '2026-11-25' }] });
  try {
    const res = mockRes();
    await articlePage({ method: 'GET', query: { slug: valid.slug } }, res);
    assert.equal(res.statusCode, 200);
    assert.ok(res.body.includes('Fresh market analysis'));
    assert.equal(res.headers['Content-Type'], 'text/html; charset=utf-8');
  } finally { globalThis.fetch = original; }
});

await test('unknown article URL is genuine HTTP 404, not homepage', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => [] });
  try {
    const res = mockRes();
    await articlePage({ method: 'GET', query: { slug: 'not-a-real-article' } }, res);
    assert.equal(res.statusCode, 404);
    assert.ok(res.body.includes('noindex'));
  } finally { globalThis.fetch = original; }
});

await test('an unpublished draft never renders as a public article', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => [{ ...valid, is_published: false }] });
  try {
    const res = mockRes();
    await articlePage({ method: 'GET', query: { slug: valid.slug } }, res);
    assert.equal(res.statusCode, 404);
  } finally { globalThis.fetch = original; }
});

await test('upstream failure gives honest HTTP 503', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('offline'); };
  try {
    const res = mockRes();
    await articlePage({ method: 'GET', query: { slug: valid.slug } }, res);
    assert.equal(res.statusCode, 503);
  } finally { globalThis.fetch = original; }
});

await test('dynamic sitemap includes fresh articles and true modified dates', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => [
    { slug: valid.slug, created_at: '2026-11-22', updated_at: '2026-11-25' },
    { slug: valid.slug, created_at: '2026-11-22' }
  ] });
  try {
    const res = mockRes();
    await liveSitemap({ method: 'GET' }, res);
    assert.equal(res.statusCode, 200);
    assert.equal((res.body.match(/<url>/g) || []).length, 1);
    assert.ok(res.body.includes('<lastmod>2026-11-25</lastmod>'));
  } finally { globalThis.fetch = original; }
});

await test('dynamic sitemap remains valid XML when the article provider is offline', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('offline'); };
  try {
    const res = mockRes();
    await liveSitemap({ method: 'GET' }, res);
    assert.equal(res.statusCode, 200);
    assert.ok(res.body.startsWith('<?xml version="1.0"'));
    assert.ok(res.body.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
    assert.ok(res.body.includes('/blog/buying-gold-in-pakistan-tola-karat-making-charges-guide'));
    assert.ok(!res.body.includes('Article sitemap temporarily unavailable'));
  } finally { globalThis.fetch = original; }
});

await test('bad article slugs are excluded from the sitemap', () => {
  const xml = renderLiveSitemap([{ slug: '<evil>' }, { slug: '../foo' }, { slug: valid.slug }]);
  assert.ok(!xml.includes('<evil>'));
  assert.equal((xml.match(/<url>/g) || []).length, 1);
});

await test('rewrites preserve static research pages and provide dynamic fallback', () => {
  const config = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url)));
  const rewrite = config.rewrites.find(entry => entry.source === '/blog/:slug');
  assert.equal(rewrite.destination, '/api/article-page');
  assert.ok(fs.readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8').includes('/api/live-sitemap'));
});

console.log(`All ${checks} offline cross-device publishing checks passed.`);
