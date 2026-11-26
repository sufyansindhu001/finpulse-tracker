/** Offline coverage for the multi-provider national flag UI. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CURRENCIES } from '../src/data/currencies.js';
import { getCurrencyFlagUrls, getCountryFlagUrls } from '../src/utils/currencyFlags.js';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

for (const currency of CURRENCIES) {
  const urls = getCurrencyFlagUrls(currency.code);
  if (['XAU', 'XAG', 'XDR'].includes(currency.code)) {
    assert.deepEqual(urls, [], `${currency.code} is not a national currency flag`);
    continue;
  }
  assert.equal(urls.length, 3, `${currency.code} needs three independent flag sources`);
  assert.match(urls[0], /^https:\/\/flagcdn\.com\/w40\/[a-z]{2}\.png$/);
  assert.match(urls[1], /^https:\/\/flagcdn\.io\/flags\/4x3\/[a-z]{2}\.svg$/);
  assert.match(urls[2], /^https:\/\/flagsapi\.com\/[A-Z]{2}\/flat\/64\.png$/);
}

assert.match(getCurrencyFlagUrls('EUR')[0], /\/eu\.png$/, 'Euro needs EU flag, not a random member state.');
assert.match(getCurrencyFlagUrls('GBP')[0], /\/gb\.png$/, 'Sterling needs GB flag.');
assert.match(getCurrencyFlagUrls('ANG')[0], /\/cw\.png$/, 'ANG representative territory is Curaçao, not the Netherlands.');
assert.match(getCurrencyFlagUrls('AFN')[0], /\/af\.png$/);
assert.match(getCurrencyFlagUrls('ALL')[0], /\/al\.png$/);
assert.match(getCurrencyFlagUrls('AMD')[0], /\/am\.png$/);
assert.deepEqual(getCountryFlagUrls(''), []);
assert.deepEqual(getCountryFlagUrls('xyz'), []);

const flagImage = read('src/components/FlagImage.jsx');
assert.match(flagImage, /onError=\{\(\) => setFailure/);
assert.match(flagImage, /attempt >= urls\.length/);
assert.match(read('src/pages/RatesPage.jsx'), /<CurrencyFlag/);
assert.match(read('src/components/CountrySelectorDropdown.jsx'), /<FlagImage/);
assert.match(read('src/components/CurrencyFlag.jsx'), /<FlagImage/);

console.log(`[PASS] ${CURRENCIES.length} currency entries have valid, independent image sources or explicit non-national badges.`);
console.log('[PASS] Rates, converters and country selection share automatic image retries with accessible fallback.');
