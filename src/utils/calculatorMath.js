/** Shared bounds and pure calculations for the site's public calculators. */
export const CALCULATOR_LIMITS = Object.freeze({
  goldQuantity: 1_000_000,
  fiatAmount: 1_000_000_000,
  cryptoQuantity: 1_000_000,
  accountBalance: 1_000_000_000,
  riskPercent: 100,
  stopLossPips: 1_000_000
});

export const TROY_OUNCE_GRAMS = 31.1034768;
export const TOLA_GRAMS = 11.664;
export const GOLD_UNIT_GRAMS = Object.freeze({
  gram: 1,
  '10g': 10,
  tola: TOLA_GRAMS,
  oz: TROY_OUNCE_GRAMS
});
export const GOLD_PURITY = Object.freeze({
  '24K': 1,
  '22K': 22 / 24,
  '21K': 21 / 24,
  '18K': 18 / 24
});

/** Preserve an editable decimal string while rejecting negative, exponent and overflow inputs. */
export function boundedDecimalInput(raw, max) {
  const value = String(raw ?? '');
  if (value === '') return '';
  if (value === '.') return '0.';
  if (!/^\d+(?:\.\d*)?$/.test(value)) return '';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '';
  return amount > max ? String(max) : value;
}

export function readBoundedAmount(value, max) {
  if (value === '' || value === null || value === undefined) return 0;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 && amount <= max ? amount : null;
}

/** Calculate from the unrounded international ounce quote; round once at the end. */
export function calculateGoldEstimate({ spotUsdPerOunce, usdToPkr, quantity, unit = 'tola', purity = '24K', makingPercent = 0 }) {
  const amount = readBoundedAmount(quantity, CALCULATOR_LIMITS.goldQuantity);
  const unitGrams = GOLD_UNIT_GRAMS[unit];
  const purityFactor = GOLD_PURITY[purity];
  const valid = amount !== null && Number.isFinite(unitGrams) && Number.isFinite(purityFactor)
    && Number.isFinite(spotUsdPerOunce) && spotUsdPerOunce > 0
    && Number.isFinite(usdToPkr) && usdToPkr > 0
    && Number.isFinite(makingPercent) && makingPercent >= 0 && makingPercent <= 100;
  if (!valid) return { grams: null, basePkr: null, makingChargeAmount: null, totalPkr: null, totalUsd: null, perGramPkr: null };

  const grams = amount * unitGrams;
  const rawUsd = spotUsdPerOunce * (grams / TROY_OUNCE_GRAMS) * purityFactor;
  const rawPkr = rawUsd * usdToPkr;
  const totalPkr = Math.round(rawPkr * (1 + makingPercent / 100));
  const basePkr = Math.round(rawPkr);
  const totalUsd = Math.round(rawUsd * (1 + makingPercent / 100));
  if (![grams, totalPkr, basePkr, totalUsd].every(Number.isFinite) || !Number.isSafeInteger(totalPkr)) {
    return { grams: null, basePkr: null, makingChargeAmount: null, totalPkr: null, totalUsd: null, perGramPkr: null };
  }
  return {
    grams,
    basePkr,
    makingChargeAmount: totalPkr - basePkr,
    totalPkr,
    totalUsd,
    perGramPkr: Math.round(spotUsdPerOunce / TROY_OUNCE_GRAMS * usdToPkr * purityFactor)
  };
}

/** Quote-currency pip value converted to account currency (USD), no synthetic rates. */
export function calculateUsdForexRisk({ balance, riskPercent, stopPips, pair, rates }) {
  const equity = readBoundedAmount(balance, CALCULATOR_LIMITS.accountBalance);
  const percent = readBoundedAmount(riskPercent, CALCULATOR_LIMITS.riskPercent);
  const stop = readBoundedAmount(stopPips, CALCULATOR_LIMITS.stopLossPips);
  const moneyAtRisk = equity !== null && percent !== null ? equity * percent / 100 : null;
  const quote = String(pair || '').split('/')[1];
  const quotePerUsd = quote === 'USD' ? 1 : Number(rates?.[quote]);
  const pipSize = quote === 'JPY' ? 0.01 : 0.0001;
  const pipValuePerStandardLot = Number.isFinite(quotePerUsd) && quotePerUsd > 0
    ? 100_000 * pipSize / quotePerUsd
    : null;
  if (moneyAtRisk === null || stop === null || stop <= 0 || !quote || pipValuePerStandardLot === null) {
    return { moneyAtRisk, lots: null, units: null, pipValue: null, pipValuePerStandardLot };
  }
  const lots = moneyAtRisk / (stop * pipValuePerStandardLot);
  if (!Number.isFinite(lots) || lots * 100_000 > Number.MAX_SAFE_INTEGER) {
    return { moneyAtRisk, lots: null, units: null, pipValue: null, pipValuePerStandardLot };
  }
  return { moneyAtRisk, lots, units: lots * 100_000, pipValue: lots * pipValuePerStandardLot, pipValuePerStandardLot };
}
