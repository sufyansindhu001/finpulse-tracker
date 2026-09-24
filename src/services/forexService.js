export const DEFAULT_RATES = {
  USD: 1.0,
  PKR: 278.09, // Reliable baseline requested: defaults to 1 USD = 278.09 PKR
  EUR: 0.92,
  GBP: 0.79,
  INR: 84.85,
  AED: 3.6725,
  SAR: 3.75,
  CAD: 1.39,
  AUD: 1.54,
  JPY: 153.20,
  CHF: 0.88,
  CNY: 7.24,
  TRY: 35.80,
  SGD: 1.34,
  MYR: 4.45,
  BRL: 5.85,
  ZAR: 18.20,
  KWD: 0.308,
  QAR: 3.64,
  NZD: 1.70,
  MXN: 20.35,
  IDR: 15950.0,
  THB: 34.60,
  PHP: 58.70,
  BDT: 120.40,
  EGP: 49.50,
  OMR: 0.385,
  BHD: 0.377,
  NGN: 1650.0,
  KRW: 1390.0,
  VND: 25400.0
};

const OPEN_EXCHANGE_URL = 'https://open.er-api.com/v6/latest/USD';

/**
 * Robust live exchange rates fetcher:
 * 1. Uses https://open.er-api.com/v6/latest/USD directly with standard fetch()
 * 2. Proper async/await and try/catch error handling
 * 3. Gracefully merges data.rates with reliable DEFAULT_RATES (PKR = 278.09)
 *    so the calculator and Forex Corridors NEVER crash to Rs 0.00 or break
 */
export async function fetchLiveExchangeRates() {
  try {
    const res = await fetch(OPEN_EXCHANGE_URL);
    if (!res.ok) {
      throw new Error(`Exchange rate API responded with status ${res.status}`);
    }

    const data = await res.json();
    if (data && data.rates && typeof data.rates === 'object') {
      return {
        success: true,
        rates: {
          ...DEFAULT_RATES,
          ...data.rates // Overwrite with live open.er-api rates
        },
        base: data.base_code || 'USD',
        lastUpdated: data.time_last_update_utc || new Date().toUTCString(),
        source: 'Open Exchange Rates (Live)'
      };
    } else {
      throw new Error('data.rates not found in response');
    }
  } catch (err) {
    console.warn('Live forex fetch warning (using default rates baseline):', err.message);
    return {
      success: false,
      rates: DEFAULT_RATES,
      base: 'USD',
      lastUpdated: 'Live Feed Standby',
      source: 'Default Market Rates'
    };
  }
}

/**
 * Calculates currency conversions dynamically using the rates dictionary.
 * Accesses rates[fromCurrency] and rates[toCurrency] directly.
 * Formula: Amount in Target = (Amount / Rate of Base relative to USD) * Rate of Target relative to USD
 */
export function convertCurrency(amount, fromCurrency, toCurrency, rates = DEFAULT_RATES) {
  const currentRates = rates && Object.keys(rates).length > 0 ? rates : DEFAULT_RATES;
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) return 0;
  if (fromCurrency === toCurrency) return num;

  const rateFrom = currentRates[fromCurrency] || DEFAULT_RATES[fromCurrency] || 1;
  const rateTo = currentRates[toCurrency] || DEFAULT_RATES[toCurrency] || 1;

  return (num / rateFrom) * rateTo;
}

/**
 * Direct exchange rate of 1 fromCurrency in toCurrency
 */
export function getExchangeRate(fromCurrency, toCurrency, rates = DEFAULT_RATES) {
  const currentRates = rates && Object.keys(rates).length > 0 ? rates : DEFAULT_RATES;
  if (fromCurrency === toCurrency) return 1;

  const rateFrom = currentRates[fromCurrency] || DEFAULT_RATES[fromCurrency] || 1;
  const rateTo = currentRates[toCurrency] || DEFAULT_RATES[toCurrency] || 1;

  return rateTo / rateFrom;
}
