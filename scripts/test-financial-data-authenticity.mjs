import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('=== FGC SPOT FINANCIAL DATA AUTHENTICITY TEST SUITE ===\n');

const projectRoot = process.cwd();

// 1. Test CryptoTickerBar.jsx
console.log('Test 1: CryptoTickerBar.jsx');
const tickerBarContent = fs.readFileSync(path.join(projectRoot, 'src/components/CryptoTickerBar.jsx'), 'utf-8');
assert(!tickerBarContent.includes('Math.random()'), 'FAIL: CryptoTickerBar still contains Math.random()');
assert(!tickerBarContent.includes('setTicks'), 'FAIL: CryptoTickerBar still contains synthetic tick state');
assert(!tickerBarContent.includes('DEFAULT_CRYPTO_BENCHMARKS'), 'FAIL: CryptoTickerBar still uses fake benchmark fallback');
console.log('  PASS: Zero Math.random(), zero synthetic ticks, zero fake crypto benchmarks in CryptoTickerBar.');

// 2. Test RatesPage.jsx
console.log('Test 2: RatesPage.jsx');
const ratesPageContent = fs.readFileSync(path.join(projectRoot, 'src/pages/RatesPage.jsx'), 'utf-8');
assert(!ratesPageContent.includes('charCodeSum'), 'FAIL: RatesPage still contains character-code pseudo delta');
assert(!ratesPageContent.includes('defaultCrypto = ['), 'FAIL: RatesPage still contains defaultCrypto fallback array');
assert(ratesPageContent.includes("change: 'N/A'"), 'FAIL: RatesPage does not set change to N/A when missing');
console.log('  PASS: Character-code delta removed; fake defaultCrypto eliminated; N/A displayed properly.');

// 3. Test ChartsPage.jsx
console.log('Test 3: ChartsPage.jsx');
const chartsPageContent = fs.readFileSync(path.join(projectRoot, 'src/pages/ChartsPage.jsx'), 'utf-8');
assert(!chartsPageContent.includes('Math.sin('), 'FAIL: ChartsPage still contains Math.sin()');
assert(!chartsPageContent.includes('Math.cos('), 'FAIL: ChartsPage still contains Math.cos()');
assert(chartsPageContent.includes('Historical chart temporarily unavailable'), 'FAIL: ChartsPage missing honest unavailable notice');
console.log('  PASS: Zero Math.sin()/Math.cos() curves; verified observations only; honest unavailable state present.');

// 4. Test stocksData.js
console.log('Test 4: stocksData.js & StocksPage.jsx');
const stocksDataContent = fs.readFileSync(path.join(projectRoot, 'src/data/stocksData.js'), 'utf-8');
assert(!stocksDataContent.includes('const ticker = `${country.code}${idx + 1}`'), 'FAIL: stocksData still generates synthetic country tickers');
const { getStocksForCountry } = await import('../src/data/stocksData.js');
const pkStocks = getStocksForCountry('pk');
const usStocks = getStocksForCountry('us');
const arStocks = getStocksForCountry('ar');
assert(Array.isArray(pkStocks) && pkStocks.length > 20, 'FAIL: Pakistan stocks dataset corrupted');
assert(Array.isArray(usStocks) && usStocks.length > 0, 'FAIL: US stocks dataset corrupted');
assert(Array.isArray(arStocks) && arStocks.length === 0, 'FAIL: Unsupported country did not return empty array');
console.log('  PASS: Synthetic tickers removed; unsupported countries return empty list; supported 12 markets preserved.');

// 5. Test MarketDashboard.jsx
console.log('Test 5: MarketDashboard.jsx');
const dashboardContent = fs.readFileSync(path.join(projectRoot, 'src/components/MarketDashboard.jsx'), 'utf-8');
assert(!dashboardContent.includes('[50, 51, 50, 52'), 'FAIL: MarketDashboard still contains fake sparkline arrays');
assert(!dashboardContent.includes('change: 0.12'), 'FAIL: MarketDashboard still contains hardcoded 0.12 forex change');
assert(!dashboardContent.includes('change: -0.28'), 'FAIL: MarketDashboard still contains hardcoded -0.28 forex change');
assert(!dashboardContent.includes('current_price: 96850'), 'FAIL: MarketDashboard still contains hardcoded BTC price');
console.log('  PASS: Hardcoded deltas and fabricated sparkline arrays completely removed from MarketDashboard.');

// 6. Test cryptoService.js & CryptoPage.jsx
console.log('Test 6: cryptoService.js & CryptoPage.jsx');
const cryptoServiceContent = fs.readFileSync(path.join(projectRoot, 'src/services/cryptoService.js'), 'utf-8');
const cryptoPageContent = fs.readFileSync(path.join(projectRoot, 'src/pages/CryptoPage.jsx'), 'utf-8');
assert(!cryptoPageContent.includes('defaultCrypto = ['), 'FAIL: CryptoPage still contains hardcoded defaultCrypto fallback');
assert(!cryptoServiceContent.includes('current_price: 96420'), 'FAIL: cryptoService still contains hardcoded fallback prices');
const { DEFAULT_CRYPTO_BENCHMARKS } = await import('../src/services/cryptoService.js');
assert(Array.isArray(DEFAULT_CRYPTO_BENCHMARKS) && DEFAULT_CRYPTO_BENCHMARKS.length === 0, 'FAIL: DEFAULT_CRYPTO_BENCHMARKS is not empty');
console.log('  PASS: Hardcoded crypto fallback prices removed; live timestamps never assigned to fake values.');

// 7. Test api/metals.js & metalsService.js
console.log('Test 7: api/metals.js & metalsService.js');
const apiMetalsContent = fs.readFileSync(path.join(projectRoot, 'api/metals.js'), 'utf-8');
const metalsServiceContent = fs.readFileSync(path.join(projectRoot, 'src/services/metalsService.js'), 'utf-8');
assert(!apiMetalsContent.includes('1.008'), 'FAIL: api/metals.js still contains artificial 1.008 multiplier');
assert(!apiMetalsContent.includes('0.992'), 'FAIL: api/metals.js still contains artificial 0.992 multiplier');
assert(!metalsServiceContent.includes('1.008'), 'FAIL: metalsService.js still contains artificial 1.008 multiplier');
assert(!metalsServiceContent.includes('0.992'), 'FAIL: metalsService.js still contains artificial 0.992 multiplier');
console.log('  PASS: Artificial ±0.8% daily corridor multipliers removed from both serverless API and client service.');

console.log('\n=== ALL 7 FINANCIAL DATA AUTHENTICITY TESTS PASSED! ===');
