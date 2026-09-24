const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false';

/**
 * Fetches real-time crypto prices, 24h changes, market caps, and volumes
 * directly from the CoinGecko public API endpoint.
 * Zero static or hardcoded fallback prices.
 */
export async function fetchLiveCryptoMarkets() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(COINGECKO_URL, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (res.status === 429) {
      throw new Error('CoinGecko public rate limit exceeded (HTTP 429). Please click "Refresh Rates" in a few seconds.');
    }

    if (!res.ok) {
      throw new Error(`CoinGecko API returned HTTP status ${res.status}`);
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
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
          circulating_supply: coin.circulating_supply
        })),
        lastUpdated: new Date().toLocaleTimeString(),
        source: 'CoinGecko Live API'
      };
    } else {
      throw new Error('Empty or invalid response from CoinGecko');
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Failed to fetch live crypto data:', err.message);
    throw new Error(err.message || 'Failed to connect to CoinGecko live feed');
  }
}
