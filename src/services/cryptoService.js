const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true';

// Deprecated: synthetic benchmark fallback eliminated for zero fake data compliance
export const DEFAULT_CRYPTO_BENCHMARKS = [];

export const CRYPTO_CACHE_KEY = 'fgc_spot_crypto_cache';
const CRYPTO_CACHE_TTL_MS = 120 * 1000; // 2 minutes fresh cache TTL

let inMemoryCryptoCache = null;

function getCachedCrypto() {
  if (inMemoryCryptoCache && (Date.now() - inMemoryCryptoCache.timestamp < CRYPTO_CACHE_TTL_MS)) {
    return inMemoryCryptoCache.data;
  }
  try {
    const raw = localStorage.getItem(CRYPTO_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data && (Date.now() - parsed.timestamp < CRYPTO_CACHE_TTL_MS)) {
        inMemoryCryptoCache = parsed;
        return parsed.data;
      }
    }
  } catch {}
  return null;
}

function saveCachedCrypto(data) {
  try {
    const record = { data, timestamp: Date.now() };
    inMemoryCryptoCache = record;
    localStorage.setItem(CRYPTO_CACHE_KEY, JSON.stringify(record));
  } catch {}
}

/**
 * Fetches real-time crypto prices, 24h changes, market caps, and volumes from CoinGecko.
 * Never fabricates synthetic prices or falsifies update timestamps on failure.
 */
export async function fetchLiveCryptoMarkets(forceFresh = false) {
  if (!forceFresh) {
    const cached = getCachedCrypto();
    if (cached) return cached;
  }

  const controller = new AbortController();
  // 3-second timeout safeguard
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(COINGECKO_URL, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (res.status === 429) {
      console.warn('Crypto API 429 rate limit reached');
      if (inMemoryCryptoCache && inMemoryCryptoCache.data) {
        return {
          ...inMemoryCryptoCache.data,
          isStale: true,
          source: `${inMemoryCryptoCache.data.source || 'CoinGecko'} (Cached)`
        };
      }
      return {
        success: false,
        data: [],
        isUnavailable: true,
        source: 'CoinGecko API (Rate Limited)',
        lastUpdated: null,
        message: 'Cryptocurrency market data is temporarily unavailable due to upstream rate limits.'
      };
    }

    if (!res.ok) {
      throw new Error(`Digital asset API returned HTTP status ${res.status}`);
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const result = {
        success: true,
        data: data.map(coin => ({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          image: coin.image,
          current_price: coin.current_price,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          high_24h: coin.high_24h,
          low_24h: coin.low_24h,
          total_volume: coin.total_volume,
          market_cap: coin.market_cap,
          market_cap_rank: coin.market_cap_rank,
          circulating_supply: coin.circulating_supply,
          sparkline_in_7d: coin.sparkline_in_7d
        })),
        lastUpdated: new Date().toLocaleTimeString(),
        source: 'CoinGecko Multi-Exchange Feeds (Live)'
      };
      saveCachedCrypto(result);
      return result;
    } else {
      throw new Error('Empty response from digital asset feed');
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Crypto feed unavailable or timed out:', err.message);
    if (inMemoryCryptoCache && inMemoryCryptoCache.data) {
      return {
        ...inMemoryCryptoCache.data,
        isStale: true,
        source: `${inMemoryCryptoCache.data.source || 'CoinGecko'} (Cached)`
      };
    }
    return {
      success: false,
      data: [],
      isUnavailable: true,
      source: 'CoinGecko API (Offline)',
      lastUpdated: null,
      message: 'Cryptocurrency market data is temporarily unavailable.'
    };
  }
}
