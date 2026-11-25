import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { DEFAULT_AUTHOR, displayAuthorName } from '../src/utils/authorIdentity.js';
import { renderArticleHtml } from '../api/article-page.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

assert.equal(displayAuthorName(null), DEFAULT_AUTHOR);
assert.equal(displayAuthorName('Sufyan Saleem, Lead Financial Analyst & Macro Strategist'), 'Sufyan Sindhu');
assert.equal(displayAuthorName('Sufyan Sindhu, Publisher & Editor'), DEFAULT_AUTHOR);
assert.equal(displayAuthorName('Sufyan Saleem (Financial Research Desk)'), DEFAULT_AUTHOR);
assert.equal(displayAuthorName('Another Contributor'), 'Another Contributor');

const dynamicHtml = renderArticleHtml({
  slug: 'author-attribution-check',
  title: 'Test financial explainer',
  author: 'Sufyan Saleem, Lead Financial Analyst & Macro Strategist',
  content: 'Test content'
});
assert.match(dynamicHtml, /By Sufyan Sindhu/);
assert.doesNotMatch(dynamicHtml, /Sufyan Saleem|Lead Financial Analyst/);

for (const route of [
  'author/sufyan-sindhu/index.html',
  'about/index.html',
  'blog/index.html'
]) {
  const html = readFileSync(resolve(projectRoot, 'dist', route), 'utf8');
  assert.doesNotMatch(html, /Lead Financial Analyst|Macro Strategist|Institutional Peer Review Verified|fintech engineers/i);
  assert.doesNotMatch(html, /Sufyan Saleem/i);
}

console.log('PASS: editorial bylines are truthful in data normalization and prerendered pages.');
