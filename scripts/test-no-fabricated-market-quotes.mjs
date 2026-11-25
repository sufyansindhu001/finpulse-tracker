import assert from 'node:assert/strict';
import fs from 'node:fs';
import { convertCurrency, getExchangeRate, fetchLiveExchangeRates, DEFAULT_RATES } from '../src/services/forexService.js';
import { calculateGoldLocalMetrics, fetchLiveMetals, DEFAULT_METALS } from '../src/services/metalsService.js';
import metalsHandler from '../api/metals.js';

let passed = 0;
function test(name, check) {
  check();
  passed++;
  console.log(`PASS ${passed}: ${name}`);
}

test('FX baseline contains USD unit only, not guessed PKR/metal quotes', () => {
  assert.deepEqual(DEFAULT_RATES, { USD: 1 });
  assert.equal(DEFAULT_RATES.PKR, undefined);
});

test('Unsupported conversions and pairs are unavailable, not assumed 1:1', () => {
  assert(Number.isNaN(convertCurrency(100, 'USD', 'PKR')));
  assert(Number.isNaN(getExchangeRate('EUR', 'PKR')));
  assert.equal(convertCurrency(100, 'USD', 'USD'), 100);
  assert.equal(convertCurrency(100, 'EUR', 'PKR', { USD: 1, EUR: 0.8, PKR: 280 }), 35000);
});

test('Missing gold and forex sources yield no Sarafa estimates', () => {
  assert.equal(DEFAULT_METALS.gold.price, null);
  assert.equal(DEFAULT_METALS.silver.price, null);
  assert.equal(calculateGoldLocalMetrics(null, 280).pricePerTola24K, null);
  assert.equal(calculateGoldLocalMetrics(3500, null).pricePerTola24K, null);
});

const originalFetch = globalThis.fetch;
globalThis.fetch = async () => { throw new Error('Offline feed failure test'); };
try {
  const forex = await fetchLiveExchangeRates(true);
  test('FX outage exposes unavailable rates instead of fake live defaults', () => {
    assert.equal(forex.success, false);
    assert.equal(forex.rates.PKR, undefined);
    assert.equal(forex.lastUpdated, null);
  });

  const metals = await fetchLiveMetals(true);
  test('Gold outage exposes unavailable state without fake prices or timestamps', () => {
    assert.equal(metals.success, false);
    assert.equal(metals.gold.price, null);
    assert.equal(metals.silver.price, null);
    assert.equal(metals.lastUpdated, null);
  });

  let statusCode;
  let responseBody;
  const response = {
    setHeader: () => {},
    status(code) { statusCode = code; return this; },
    json(data) { responseBody = data; return this; }
  };
  await metalsHandler({ method: 'GET' }, response);
  test('Serverless bullion endpoint returns 503 rather than a fabricated live quote', () => {
    assert.equal(statusCode, 503);
    assert.equal(responseBody.success, false);
  });
} finally {
  globalThis.fetch = originalFetch;
}

test('Active UI files no longer embed known invented micro-ticks and fallback prices', () => {
  const active = [
    'src/components/LiveMarketPulseModal.jsx',
    'src/components/HeroSection.jsx',
    'src/components/MarketDashboard.jsx',
    'src/pages/GoldPage.jsx',
    'src/pages/ConverterPage.jsx',
    'src/pages/CryptoPage.jsx',
    'src/pages/ChartsPage.jsx'
  ].map(file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));
  const content = active.join('\n');
  for (const bogus of ['3898.90', '404640', '114850', '88450', 'pulseTick']) {
    assert(!content.includes(bogus), `Known invented quote/micro-tick still found: ${bogus}`);
  }
});

console.log(`\nALL ${passed} ADDITIONAL MARKET-INTEGRITY CHECKS PASSED`);
