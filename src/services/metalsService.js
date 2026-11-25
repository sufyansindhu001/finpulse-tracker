/**
 * FGC Spot Precious Metals Service (Gold XAU & Silver XAG)
 * Ingests live commodity quotes from /api/metals and international bullion benchmarks.
 * Provides dynamic local benchmark pricing formulas (PKR per Tola, 10g & Gram).
 */

// Global constant conversion factors
export const TROY_OUNCE_TO_GRAMS = 31.1034768;
export const TOLA_TO_GRAMS = 11.664; // Standard Sarafa Association tola weight (11.664 grams)

// No unverified Sarafa premium is inserted into the reference conversion.
// Actual retail or association rate cards require separately sourced observations.
export const SARAFA_BASE_MULTIPLIER = 1;

export const DEFAULT_METALS = {
  gold: {
    symbol: 'XAU/USD',
    name: 'Gold Spot (Troy Ounce)',
    price: null,
    change: null,
    high: null,
    low: null,
    unit: 'troy oz'
  },
  silver: {
    symbol: 'XAG/USD',
    name: 'Silver Spot (Troy Ounce)',
    price: null,
    change: null,
    high: null,
    low: null,
    unit: 'troy oz'
  },
  source: 'Awaiting verified commodity quotes',
  lastUpdated: null
};

const NO_METRICS = Object.freeze({
  pricePerOunceLocal: null, pricePerGram24K: null, pricePerTola24K: null,
  pricePer10Gram24K: null, pricePer10Gram22K: null, pricePerTola22K: null,
  pricePerGram22K: null, pricePer10Gram21K: null, pricePerTola21K: null,
  pricePerGram21K: null, pricePer10Gram18K: null, pricePerTola18K: null,
  pricePerGram18K: null, sarafaAdjustment: null
});

/**
 * Calculates dynamic local gold benchmarks (e.g. in PKR, AED, SAR, INR).
 * 1 Troy Ounce = 31.1034768 grams
 * 1 Tola = 11.664 grams
 * 
 * As international spot ($/oz) and interbank USD/PKR fluctuate, domestic rates move dynamically in exact real-time parity.
 * Automatically derives 22K, 21K, and 18K purity grades using exact proportional multipliers.
 */
export function calculateGoldLocalMetrics(goldPriceUsd, localRateAgainstUsd, isPakistan = true) {
  try {
    if (!Number.isFinite(goldPriceUsd) || goldPriceUsd <= 0 || !Number.isFinite(localRateAgainstUsd) || localRateAgainstUsd <= 0) {
      return NO_METRICS;
    }
    const cleanGoldUsd = goldPriceUsd;
    const cleanRate = localRateAgainstUsd;

    const multiplier = isPakistan ? SARAFA_BASE_MULTIPLIER : 1.0;

    // 24K Pure Bullion Calculations
    const pricePerOunceLocal = Math.round(cleanGoldUsd * cleanRate);
    const pricePerTola24K = Math.round((cleanGoldUsd / TROY_OUNCE_TO_GRAMS) * cleanRate * TOLA_TO_GRAMS * multiplier);
    const pricePer10Gram24K = Math.round((pricePerTola24K / TOLA_TO_GRAMS) * 10);
    const pricePerGram24K = Math.round(pricePerTola24K / TOLA_TO_GRAMS);

    // 22K Jewelry Standard (22/24 exact proportional multiplier)
    const pricePerTola22K = Math.round(pricePerTola24K * (22 / 24));
    const pricePer10Gram22K = Math.round(pricePer10Gram24K * (22 / 24));
    const pricePerGram22K = Math.round(pricePerGram24K * (22 / 24));

    // 21K Middle East Standard (21/24 exact proportional multiplier)
    const pricePerTola21K = Math.round(pricePerTola24K * (21 / 24));
    const pricePer10Gram21K = Math.round(pricePer10Gram24K * (21 / 24));
    const pricePerGram21K = Math.round(pricePerGram24K * (21 / 24));

    // 18K Modern Fine Gold (18/24 exact proportional multiplier)
    const pricePerTola18K = Math.round(pricePerTola24K * (18 / 24));
    const pricePer10Gram18K = Math.round(pricePer10Gram24K * (18 / 24));
    const pricePerGram18K = Math.round(pricePerGram24K * (18 / 24));

    const rawUnadjustedTola24K = (cleanGoldUsd / TROY_OUNCE_TO_GRAMS) * cleanRate * TOLA_TO_GRAMS;
    const sarafaAdjustment = Math.round(pricePerTola24K - rawUnadjustedTola24K);

    return {
      pricePerOunceLocal,
      pricePerGram24K,
      pricePerTola24K,
      pricePer10Gram24K,
      pricePer10Gram22K,
      pricePerTola22K,
      pricePerGram22K,
      pricePer10Gram21K,
      pricePerTola21K,
      pricePerGram21K,
      pricePer10Gram18K,
      pricePerTola18K,
      pricePerGram18K,
      sarafaAdjustment
    };
  } catch (err) {
    console.warn('[metalsService] calculateGoldLocalMetrics error:', err);
    return NO_METRICS;
  }
}

export const METALS_CACHE_KEY = 'fgc_spot_verified_metals_cache_v2';
const METALS_CACHE_TTL_MS = 60 * 1000; // 1 minute fresh cache TTL

let inMemoryMetalsCache = null;

function getCachedMetals() {
  if (inMemoryMetalsCache && (Date.now() - inMemoryMetalsCache.timestamp < METALS_CACHE_TTL_MS)) {
    return inMemoryMetalsCache.data;
  }
  try {
    const raw = localStorage.getItem(METALS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data && (Date.now() - parsed.timestamp < METALS_CACHE_TTL_MS)) {
        inMemoryMetalsCache = parsed;
        return parsed.data;
      }
    }
  } catch {}
  return null;
}

function saveCachedMetals(data) {
  try {
    const record = { data, timestamp: Date.now() };
    inMemoryMetalsCache = record;
    localStorage.setItem(METALS_CACHE_KEY, JSON.stringify(record));
  } catch {}
}

/**
 * Fetches real-time Gold and Silver spot rates with fallback to public CDN & Binance feeder
 */
export async function fetchLiveMetals(forceFresh = false) {
  if (!forceFresh) {
    const cached = getCachedMetals();
    if (cached) return cached;
  }

  // 1. Try serverless /api/metals route
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('/api/metals', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success === true && data.gold && data.silver &&
          ((Number.isFinite(data.gold.price) && data.gold.price > 500) ||
           (Number.isFinite(data.silver.price) && data.silver.price > 5))) {
        const result = {
          success: true,
          gold: data.gold,
          silver: data.silver,
          rates: data.rates || {
            ...(data.gold.price > 0 ? { XAU: 1 / data.gold.price } : {}),
            ...(data.silver.price > 0 ? { XAG: 1 / data.silver.price } : {})
          },
          source: data.source || 'Commodity reference feed',
          lastUpdated: data.lastUpdated || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        saveCachedMetals(result);
        return result;
      }
    }
  } catch {
    // Continue to direct public fallbacks
  }

  // 2. Direct public sources: Binance PAXG 24hr + jsdelivr Currency-API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const [paxgRes, cdnRes] = await Promise.allSettled([
      fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=PAXGUSDT', { signal: controller.signal }).then(r => r.ok ? r.json() : null),
      fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json', { signal: controller.signal }).then(r => r.ok ? r.json() : null)
    ]);
    clearTimeout(timeoutId);

    const paxg = paxgRes.status === 'fulfilled' ? paxgRes.value : null;
    const cdn = cdnRes.status === 'fulfilled' ? cdnRes.value : null;

    let goldPrice = null;
    let goldChange = DEFAULT_METALS.gold.change;
    let goldHigh = DEFAULT_METALS.gold.high;
    let goldLow = DEFAULT_METALS.gold.low;

    let silverPrice = null;
    let silverChange = DEFAULT_METALS.silver.change;
    let silverHigh = DEFAULT_METALS.silver.high;
    let silverLow = DEFAULT_METALS.silver.low;

    if (paxg?.lastPrice) {
      const parsed = parseFloat(paxg.lastPrice);
      if (!isNaN(parsed) && parsed > 500) {
        goldPrice = Number(parsed.toFixed(2));
        const pChange = parseFloat(paxg.priceChangePercent);
        goldChange = !isNaN(pChange) ? Number(pChange.toFixed(2)) : null;
        const pHigh = parseFloat(paxg.highPrice);
        goldHigh = (!isNaN(pHigh) && pHigh > 0) ? Number(pHigh.toFixed(2)) : null;
        const pLow = parseFloat(paxg.lowPrice);
        goldLow = (!isNaN(pLow) && pLow > 0) ? Number(pLow.toFixed(2)) : null;
      }
    } else if (cdn?.usd?.xau && typeof cdn.usd.xau === 'number' && cdn.usd.xau > 0) {
      goldPrice = Number((1 / cdn.usd.xau).toFixed(2));
      goldChange = null;
      goldHigh = null;
      goldLow = null;
    }

    if (cdn?.usd?.xag && typeof cdn.usd.xag === 'number' && cdn.usd.xag > 0) {
      silverPrice = Number((1 / cdn.usd.xag).toFixed(2));
      silverChange = null;
      silverHigh = null;
      silverLow = null;
    }

    if (goldPrice === null && silverPrice === null) throw new Error('No verified metal quote returned');
    const result = {
      success: true,
      gold: {
        symbol: 'XAU/USD',
        name: 'Gold Commodity Reference (Troy Ounce)',
        price: goldPrice,
        change: goldChange,
        high: goldHigh,
        low: goldLow,
        unit: 'troy oz'
      },
      silver: {
        symbol: 'XAG/USD',
        name: 'Silver Commodity Reference (Troy Ounce)',
        price: silverPrice,
        change: silverChange,
        high: silverHigh,
        low: silverLow,
        unit: 'troy oz'
      },
      rates: {
        ...(goldPrice !== null ? { XAU: 1 / goldPrice } : {}),
        ...(silverPrice !== null ? { XAG: 1 / silverPrice } : {})
      },
      source: paxg?.lastPrice ? 'Binance PAXG/USDT token quote' : 'Currency API metal reference',
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    saveCachedMetals(result);
    return result;
  } catch {}

  // 3. Honest unavailable state (never give a static quote a fresh timestamp).
  return {
    success: false,
    gold: DEFAULT_METALS.gold,
    silver: DEFAULT_METALS.silver,
    rates: {},
    source: DEFAULT_METALS.source,
    lastUpdated: DEFAULT_METALS.lastUpdated
  };
}
