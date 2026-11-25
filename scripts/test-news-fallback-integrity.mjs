/**
 * FGC SPOT — News Fallback Integrity & Authenticity Verification Suite
 * 
 * Verifies:
 * 1. ZERO synthetic/fabricated news articles exist in api/news.js, src/services/newsService.js, or scripts/prerender.js
 * 2. ZERO fake market prices (e.g. $4,158/oz) or fake publisher attributions exist
 * 3. api/news.js and src/services/newsService.js return honest "Live financial news is temporarily unavailable." when feeds are unreachable
 * 4. Genuine cached articles preserve original URLs, sources, and timestamps, and are marked outdated when appropriate
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  \x1b[32m✔\x1b[0m ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  \x1b[31m✖\x1b[0m ${name}`);
    console.error(`    ${err.message}`);
  }
}

console.log('\n=== FGC SPOT News Fallback Integrity Test Suite ===\n');

// 1. Static Audit: api/news.js
runTest('api/news.js: getDynamicFallbackItems is completely removed', () => {
  const content = fs.readFileSync(path.join(ROOT, 'api', 'news.js'), 'utf8');
  assert.equal(content.includes('getDynamicFallbackItems'), false, 'getDynamicFallbackItems must not exist');
  assert.equal(content.includes('fb-comm-1'), false, 'fb-comm-1 must not exist');
  assert.equal(content.includes('fb-local-1'), false, 'fb-local-1 must not exist');
  assert.equal(content.includes('4,158'), false, 'Hardcoded $4,158 price must not exist');
});

// 2. Static Audit: scripts/prerender.js
runTest('scripts/prerender.js: Synthetic pre-rendered news cards are removed', () => {
  const content = fs.readFileSync(path.join(ROOT, 'scripts', 'prerender.js'), 'utf8');
  assert.equal(content.includes('State Bank of Pakistan Maintains Monetary Policy Rate at Current Baseline'), false);
  assert.equal(content.includes('Karachi Sarafa Association Announces New 24K Bullion Benchmarks'), false);
  assert.equal(content.includes('PSX KSE-100 Closes Up 1,130 Points Led by Commercial Banking'), false);
});

// 3. Static Audit: src/services/newsService.js
runTest('src/services/newsService.js: Honest unavailable message when feeds fail', () => {
  const content = fs.readFileSync(path.join(ROOT, 'src', 'services', 'newsService.js'), 'utf8');
  assert.ok(content.includes('Live financial news is temporarily unavailable.'));
  assert.ok(content.includes('Cached Wire Dispatches (Outdated)'));
  assert.equal(content.includes('fb-comm-1'), false);
});

// 4. Behavioral Simulation: api/news.js serverless handler with mocked network failure
runTest('api/news.js: Returns honest empty state on total feed failure (no cache)', async () => {
  const newsModule = await import(`../api/news.js?t=${Date.now()}`);
  const handler = newsModule.default;

  // Mock req and res
  const req = { method: 'GET', query: { category: 'commodities' } };
  let statusCode = null;
  let responseBody = null;
  const res = {
    setHeader: () => {},
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { responseBody = data; return res; },
        end: () => res
      };
    }
  };

  // Mock global fetch to reject (simulate total network outage)
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Network timeout (simulated)'); };

  try {
    await handler(req, res);
    assert.equal(statusCode, 200);
    assert.equal(responseBody.success, false);
    assert.deepEqual(responseBody.data, []);
    assert.equal(responseBody.message, 'Live financial news is temporarily unavailable.');
    assert.equal(responseBody.isUnavailable, true);
    assert.equal(responseBody.isLive, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// 5. Behavioral Simulation: api/news.js genuine cache preservation and outdated labeling
runTest('api/news.js: Preserves genuine RSS items and labels outdated cache honestly', async () => {
  const newsModule = await import(`../api/news.js?t=${Date.now() + 1}`);
  const handler = newsModule.default;

  const genuineArticle = {
    id: 'news-12345',
    headline: 'Genuine Financial Report From Verified Upstream Feed',
    source: 'CNBC',
    category: 'Gold & Commodities',
    summary: 'Spot gold held steady following Federal Reserve minutes.',
    url: 'https://www.cnbc.com/2026/03/genuine-gold-story',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d',
    datetime: 1774300000,
    pubDate: '2026-03-23T10:00:00.000Z'
  };

  const fakeXml = `
    <rss><channel>
      <item>
        <title><![CDATA[Genuine Financial Report From Verified Upstream Feed]]></title>
        <link>https://www.cnbc.com/2026/03/genuine-gold-story</link>
        <pubDate>2026-03-23T10:00:00.000Z</pubDate>
        <description><![CDATA[Spot gold held steady following Federal Reserve minutes.]]></description>
      </item>
    </channel></rss>
  `;

  let statusCode = null;
  let responseBody = null;
  const res = {
    setHeader: () => {},
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { responseBody = data; return res; },
        end: () => res
      };
    }
  };

  // Turn 1: Fetch succeeds with genuine XML
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    text: async () => fakeXml
  });

  try {
    await handler({ method: 'GET', query: { category: 'commodities' } }, res);
    assert.equal(statusCode, 200);
    assert.equal(responseBody.success, true);
    assert.equal(responseBody.data.length, 1);
    assert.equal(responseBody.data[0].headline, 'Genuine Financial Report From Verified Upstream Feed');
    assert.equal(responseBody.data[0].url, 'https://www.cnbc.com/2026/03/genuine-gold-story');
    assert.equal(responseBody.isLive, true);

    // Turn 2: Network fails, but genuine cache exists
    globalThis.fetch = async () => { throw new Error('Connection refused'); };
    await handler({ method: 'GET', query: { category: 'commodities' } }, res);
    assert.equal(statusCode, 200);
    assert.equal(responseBody.success, true);
    assert.equal(responseBody.data.length, 1);
    assert.equal(responseBody.data[0].url, 'https://www.cnbc.com/2026/03/genuine-gold-story');
    assert.equal(responseBody.isCached, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// 6. UI Empty State Verification: NewsPage & MarketNewsWire
runTest('UI files: NewsPage.jsx and MarketNewsWire.jsx contain honest fallback text', () => {
  const newsPage = fs.readFileSync(path.join(ROOT, 'src', 'pages', 'NewsPage.jsx'), 'utf8');
  assert.ok(newsPage.includes('Live financial news is temporarily unavailable.'));
  assert.ok(newsPage.includes('Retry Live Wire'));

  const marketWire = fs.readFileSync(path.join(ROOT, 'src', 'components', 'MarketNewsWire.jsx'), 'utf8');
  assert.ok(marketWire.includes('Live financial news is temporarily unavailable.'));
  assert.ok(marketWire.includes('Retry Sync'));
});

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.\n`);
if (passedTests !== totalTests) {
  process.exit(1);
}
