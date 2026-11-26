import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CALCULATOR_LIMITS, TOLA_GRAMS, TROY_OUNCE_GRAMS,
  boundedDecimalInput, readBoundedAmount,
  calculateGoldEstimate, calculateUsdForexRisk
} from '../src/utils/calculatorMath.js';

let checks = 0;
const check = (description, test) => {
  test();
  console.log(`[PASS] ${description}`);
  checks += 1;
};
const almost = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
const spot = 3600;
const usdToPkr = 280;
const gold = (extra = {}) => calculateGoldEstimate({ spotUsdPerOunce: spot, usdToPkr, quantity: 1, unit: 'tola', purity: '24K', ...extra });

check('Gold: original ounce spot converted to 1 tola (final rounding only)', () => {
  assert.equal(gold().totalPkr, Math.round(spot * usdToPkr * TOLA_GRAMS / TROY_OUNCE_GRAMS));
  assert.equal(gold().totalUsd, Math.round(spot * TOLA_GRAMS / TROY_OUNCE_GRAMS));
});
check('Gold: equivalent gram, tola and troy-ounce inputs match', () => {
  assert.equal(gold().totalPkr, gold({ quantity: TOLA_GRAMS, unit: 'gram' }).totalPkr);
  assert.equal(gold({ quantity: 1, unit: 'oz' }).totalPkr, Math.round(spot * usdToPkr));
  assert.equal(gold({ quantity: TROY_OUNCE_GRAMS, unit: 'gram' }).totalPkr, Math.round(spot * usdToPkr));
});
check('Gold: proportional karat purity and illustrative making charge', () => {
  const twentyTwo = gold({ purity: '22K' });
  assert.equal(twentyTwo.totalPkr, Math.round(spot * usdToPkr * TOLA_GRAMS / TROY_OUNCE_GRAMS * 22 / 24));
  const ninePercent = gold({ makingPercent: 9 });
  assert.equal(ninePercent.totalPkr, Math.round(spot * usdToPkr * TOLA_GRAMS / TROY_OUNCE_GRAMS * 1.09));
  assert.equal(ninePercent.makingChargeAmount, ninePercent.totalPkr - ninePercent.basePkr);
});
check('Limits: oversized values clamp, invalid/negative/exponent values rejected', () => {
  assert.equal(boundedDecimalInput('1000000000000', CALCULATOR_LIMITS.goldQuantity), '1000000');
  assert.equal(boundedDecimalInput('-1', CALCULATOR_LIMITS.fiatAmount), '');
  assert.equal(boundedDecimalInput('1e20', CALCULATOR_LIMITS.fiatAmount), '');
  assert.equal(boundedDecimalInput('0.125', CALCULATOR_LIMITS.goldQuantity), '0.125');
  assert.equal(readBoundedAmount(1e12, CALCULATOR_LIMITS.goldQuantity), null);
});
check('Gold: unavailable feeds, bad inputs, and unsafe totals return N/A values', () => {
  assert.equal(gold({ spotUsdPerOunce: null }).totalPkr, null);
  assert.equal(gold({ usdToPkr: 0 }).totalPkr, null);
  assert.equal(gold({ quantity: -4 }).totalPkr, null);
  assert.equal(gold({ quantity: 1e12 }).totalPkr, null);
  assert.equal(gold({ spotUsdPerOunce: 1e14, quantity: 1e6 }).totalPkr, null);
});
check('Risk: USD quote pip standard lot = $10 and sizing = 0.2 lots', () => {
  const risk = calculateUsdForexRisk({ balance: 10_000, riskPercent: 0.5, stopPips: 25, pair: 'EUR/USD', rates: { USD: 1 } });
  almost(risk.pipValuePerStandardLot, 10);
  almost(risk.lots, 0.2);
  almost(risk.units, 20_000);
  almost(risk.pipValue, 2);
});
check('Risk: JPY and CAD quoted pairs convert pip values using live quotes', () => {
  const jpy = calculateUsdForexRisk({ balance: 10_000, riskPercent: 0.5, stopPips: 25, pair: 'USD/JPY', rates: { JPY: 150 } });
  almost(jpy.pipValuePerStandardLot, 1000 / 150);
  almost(jpy.lots, 0.3);
  const cad = calculateUsdForexRisk({ balance: 10_000, riskPercent: 0.5, stopPips: 25, pair: 'USD/CAD', rates: { CAD: 1.35 } });
  almost(cad.pipValuePerStandardLot, 10 / 1.35);
  almost(cad.lots, 0.27);
});
check('Risk: invalid inputs and missing feed do not manufacture quotes', () => {
  const invalid = calculateUsdForexRisk({ balance: 10_000, riskPercent: 1, stopPips: 25, pair: 'USD/JPY', rates: { USD: 1 } });
  assert.equal(invalid.lots, null);
  const zero = calculateUsdForexRisk({ balance: 10_000, riskPercent: 1, stopPips: 0, pair: 'EUR/USD', rates: { USD: 1 } });
  assert.equal(zero.lots, null);
  assert.equal(zero.moneyAtRisk, 100);
});
check('UI: calculator inputs bounded and results responsive in every calculator', () => {
  for (const file of ['src/pages/GoldPage.jsx', 'src/components/HeroSection.jsx', 'src/components/ToolsSuite.jsx', 'src/pages/ConverterPage.jsx', 'src/components/CurrencyConverter.jsx', 'src/components/ForexTerminal.jsx', 'src/components/CryptoConverterModal.jsx']) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.match(source, /boundedDecimalInput/);
    assert.match(source, /overflow-wrap:anywhere/);
  }
  const tools = readFileSync(new URL('../src/components/ToolsSuite.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(tools, /96_850|153\.2|pipValueForPosition|riskCalculations\.lotSize/);
});

console.log(`\nAll ${checks} calculator integrity checks passed.`);
