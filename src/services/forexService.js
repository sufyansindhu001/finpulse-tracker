// USD is the definition of the USD-base reference, not a market quote.
// Missing exchange rates must stay missing until a real feed responds.
export const DEFAULT_RATES = { USD: 1 };

export const RATES_CACHE_KEY = 'fgc_spot_verified_forex_rates_v2';
export const CACHE_TTL_MS = 120 * 1000; // 2 minutes live fresh client-side cache TTL
export const SWR_MAX_AGE_MS = 600 * 1000; // 10 minutes stale-while-revalidate TTL

const OPEN_EXCHANGE_URL = 'https://open.er-api.com/v6/latest/USD';
const JSDELIVR_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';
const CLOUDFLARE_PAGES_URL = 'https://latest.currency-api.pages.dev/v1/currencies/usd.json';
const FLOATRATES_URL = 'https://www.floatrates.com/daily/usd.json';

let inMemoryRatesCache = null;
let inFlightForexPromise = null;

/**
 * Retrieves valid cached rates from in-memory cache or localStorage.
 * Automatically invalidates if older than 10 minutes or corrupted.
 */
export function getCachedRates(allowStale = false) {
  if (inMemoryRatesCache && typeof inMemoryRatesCache.timestamp === 'number') {
    const age = Date.now() - inMemoryRatesCache.timestamp;
    if (age <= CACHE_TTL_MS || (allowStale && age <= SWR_MAX_AGE_MS)) {
      return inMemoryRatesCache;
    }
  }

  try {
    const raw = localStorage.getItem(RATES_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.rates || typeof parsed.timestamp !== 'number') {
      localStorage.removeItem(RATES_CACHE_KEY);
      return null;
    }

    const age = Date.now() - parsed.timestamp;
    if (age > SWR_MAX_AGE_MS) {
      return null;
    }
    if (!allowStale && age > CACHE_TTL_MS) {
      return null;
    }

    inMemoryRatesCache = parsed;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Saves fresh rates to memory and localStorage with timestamp.
 */
export function saveRatesToCache(data) {
  try {
    const record = {
      rates: data.rates,
      base: data.base || 'USD',
      lastUpdated: data.lastUpdated || new Date().toISOString(),
      source: data.source || 'Public FX Reference Feeds',
      timestamp: Date.now()
    };
    inMemoryRatesCache = record;
    localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(record));
  } catch {}
}

/**
 * Robust live exchange rates fetcher:
 * 1. Checks memory & localStorage cache (bypassed if forceFresh is true).
 * 2. Fetches open.er-api.com and floatrates.com concurrently with SWR deduplication.
 * 3. Incorporates low-latency mid-market rates when supplied by providers.
 * 4. Never substitutes hardcoded market quotes on upstream failure.
 */
export async function fetchLiveExchangeRates(forceFresh = false) {
  if (!forceFresh) {
    const freshCached = getCachedRates(false);
    if (freshCached) {
      return {
        success: true,
        rates: freshCached.rates,
        base: freshCached.base || 'USD',
        lastUpdated: freshCached.lastUpdated,
        source: `${freshCached.source} (Cache Active)`
      };
    }

    // If stale cache exists, return it immediately and trigger background sync
    const staleCached = getCachedRates(true);
    if (staleCached) {
      // Background revalidation
      fetchLiveExchangeRates(true).catch(() => {});
      return {
        success: true,
        rates: staleCached.rates,
        base: staleCached.base || 'USD',
        lastUpdated: staleCached.lastUpdated,
        source: `${staleCached.source} (SWR Active)`
      };
    }
  }

  // Deduplicate concurrent in-flight requests
  if (inFlightForexPromise) {
    return inFlightForexPromise;
  }

  inFlightForexPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);

      const [forexRes, jsDelivrRes, cloudflareRes, floatRes, metalsRes] = await Promise.allSettled([
        fetch(OPEN_EXCHANGE_URL, { signal: controller.signal, headers: { 'Accept': 'application/json' } }).then(r => r.ok ? r.json() : null),
        fetch(JSDELIVR_URL, { signal: controller.signal, headers: { 'Accept': 'application/json' } }).then(r => r.ok ? r.json() : null),
        fetch(CLOUDFLARE_PAGES_URL, { signal: controller.signal, headers: { 'Accept': 'application/json' } }).then(r => r.ok ? r.json() : null),
        fetch(FLOATRATES_URL, { signal: controller.signal, headers: { 'Accept': 'application/json' } }).then(r => r.ok ? r.json() : null),
        fetch('/api/metals', { signal: controller.signal, headers: { 'Accept': 'application/json' } }).then(r => r.ok ? r.json() : null)
      ]);
      clearTimeout(timeout);

    const erData = forexRes.status === 'fulfilled' ? forexRes.value : null;
    const jsData = (jsDelivrRes.status === 'fulfilled' && jsDelivrRes.value) ? jsDelivrRes.value : (cloudflareRes.status === 'fulfilled' ? cloudflareRes.value : null);
    const floatData = floatRes.status === 'fulfilled' ? floatRes.value : null;
    const metals = metalsRes.status === 'fulfilled' ? metalsRes.value : null;

    if (!erData?.rates && !jsData?.usd && !floatData) {
      throw new Error('All verified forex feeds are unavailable');
    }

    const mergedRates = {
      ...DEFAULT_RATES,
      ...(erData?.rates || {})
    };

    // Enrich with 160+ fiat currency feeds from jsdelivr/cloudflare if missing (filtered strictly to 3-letter fiat codes)
    if (jsData?.usd && typeof jsData.usd === 'object') {
      Object.entries(jsData.usd).forEach(([code, val]) => {
        if (typeof code === 'string' && code.length === 3 && /^[a-zA-Z]{3}$/.test(code)) {
          const upper = code.toUpperCase();
          if (typeof val === 'number' && !isNaN(val) && isFinite(val) && val > 0 && !mergedRates[upper]) {
            mergedRates[upper] = val;
          }
        }
      });
    }

    // Use provider reference rates for selected currencies when available.
    if (floatData && typeof floatData === 'object') {
      if (floatData.pkr?.rate) {
        const pkrVal = parseFloat(floatData.pkr.rate);
        if (!isNaN(pkrVal) && isFinite(pkrVal) && pkrVal > 200) {
          mergedRates.PKR = pkrVal;
        }
      }
      if (floatData.eur?.rate) {
        const eurVal = parseFloat(floatData.eur.rate);
        if (!isNaN(eurVal) && isFinite(eurVal) && eurVal > 0) mergedRates.EUR = eurVal;
      }
      if (floatData.gbp?.rate) {
        const gbpVal = parseFloat(floatData.gbp.rate);
        if (!isNaN(gbpVal) && isFinite(gbpVal) && gbpVal > 0) mergedRates.GBP = gbpVal;
      }
      if (floatData.aed?.rate) {
        const aedVal = parseFloat(floatData.aed.rate);
        if (!isNaN(aedVal) && isFinite(aedVal) && aedVal > 0) mergedRates.AED = aedVal;
      }
      if (floatData.sar?.rate) {
        const sarVal = parseFloat(floatData.sar.rate);
        if (!isNaN(sarVal) && isFinite(sarVal) && sarVal > 0) mergedRates.SAR = sarVal;
      }
    }

    if (metals?.rates && typeof metals.rates === 'object') {
      if (typeof metals.rates.XAU === 'number' && metals.rates.XAU > 0) mergedRates.XAU = metals.rates.XAU;
      if (typeof metals.rates.XAG === 'number' && metals.rates.XAG > 0) mergedRates.XAG = metals.rates.XAG;
    } else {
      if (jsData?.usd?.xau && typeof jsData.usd.xau === 'number' && jsData.usd.xau > 0) {
        mergedRates.XAU = jsData.usd.xau;
      }
      if (jsData?.usd?.xag && typeof jsData.usd.xag === 'number' && jsData.usd.xag > 0) {
        mergedRates.XAG = jsData.usd.xag;
      }
    }

    const result = {
      success: true,
      rates: mergedRates,
      base: erData?.base_code || 'USD',
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      source: 'Public FX Reference Feeds'
    };

    saveRatesToCache(result);
    return result;
  } catch (err) {
    console.warn('Live forex fetch unavailable:', err?.message);
    return {
      success: false,
      rates: DEFAULT_RATES,
      base: 'USD',
      lastUpdated: null,
      source: 'Verified FX quotes temporarily unavailable'
    };
  }
  })();

  try {
    return await inFlightForexPromise;
  } finally {
    inFlightForexPromise = null;
  }
}

/**
 * Calculates currency conversions dynamically using the rates dictionary.
 * Accesses rates[fromCurrency] and rates[toCurrency] directly.
 * Formula: Amount in Target = (Amount / Rate of Base relative to USD) * Rate of Target relative to USD
 */
export function convertCurrency(amount, fromCurrency, toCurrency, rates = DEFAULT_RATES) {
  try {
    const currentRates = (rates && typeof rates === 'object' && Object.keys(rates).length > 0) ? rates : DEFAULT_RATES;
    const num = parseFloat(amount);
    if (isNaN(num) || !isFinite(num) || num <= 0) return 0;
    if (fromCurrency === toCurrency) return num;

    const rateFrom = Number(currentRates[fromCurrency]);
    const rateTo = Number(currentRates[toCurrency]);
    if (!Number.isFinite(rateFrom) || rateFrom <= 0 || !Number.isFinite(rateTo) || rateTo <= 0) return Number.NaN;

    const res = (num / rateFrom) * rateTo;
    return isFinite(res) && !isNaN(res) ? res : Number.NaN;
  } catch {
    return Number.NaN;
  }
}

/**
 * Direct exchange rate of 1 fromCurrency in toCurrency
 */
export function getExchangeRate(fromCurrency, toCurrency, rates = DEFAULT_RATES) {
  try {
    const currentRates = (rates && typeof rates === 'object' && Object.keys(rates).length > 0) ? rates : DEFAULT_RATES;
    if (fromCurrency === toCurrency) return 1;

    const rateFrom = Number(currentRates[fromCurrency]);
    const rateTo = Number(currentRates[toCurrency]);
    if (!Number.isFinite(rateFrom) || rateFrom <= 0 || !Number.isFinite(rateTo) || rateTo <= 0) return Number.NaN;

    const rate = rateTo / rateFrom;
    return isFinite(rate) && !isNaN(rate) ? rate : Number.NaN;
  } catch {
    return Number.NaN;
  }
}

