// api/stock-history.js - Real-Time Global Equities Historical Chart & Pricing Endpoint
// Connects live financial market exchange feeds (Yahoo Finance Global Equities Engine)
// supporting Pakistan PSX (.KA), US, UK (.L), Saudi (.SR), India (.NS), Europe, and worldwide.

const EXCHANGE_SUFFIX_MAP = {
  pk: '.KA', // Pakistan (PSX Karachi)
  us: '',    // United States (NASDAQ/NYSE)
  uk: '.L',   // United Kingdom (London LSE)
  sa: '.SR',  // Saudi Arabia (Tadawul)
  in: '.NS',  // India (NSE)
  de: '.DE',  // Germany (XETRA)
  fr: '.PA',  // France (Euronext Paris)
  ca: '.TO',  // Canada (Toronto TSX)
  jp: '.T',   // Japan (Tokyo TSE)
  au: '.AX',  // Australia (ASX)
  ae: '.AE',  // United Arab Emirates (DFM/ADX)
  cn: '.HK',  // China / Hong Kong (HKEX)
  hk: '.HK',  // Hong Kong
  br: '.SA',  // Brazil (B3)
  kr: '.KS',  // South Korea (KRX)
  sg: '.SI',  // Singapore (SGX)
  ch: '.SW',  // Switzerland (SIX)
  nl: '.AS',  // Netherlands (Euronext Amsterdam)
  es: '.MC',  // Spain (BME)
  it: '.MI',  // Italy (Borsa Italiana)
  se: '.ST',  // Sweden (Nasdaq Stockholm)
  tw: '.TW',  // Taiwan (TWSE)
  my: '.KL',  // Malaysia (Bursa Malaysia)
  id: '.JK',  // Indonesia (IDX)
  th: '.BK',  // Thailand (SET)
  ph: '.PS',  // Philippines (PSE)
  nz: '.NZ',  // New Zealand (NZX)
  tr: '.IS',  // Turkey (Borsa Istanbul)
  eg: '.CA',  // Egypt (EGX)
  qa: '.QA',  // Qatar (QSE)
  kw: '.KW',  // Kuwait (Boursa Kuwait)
  bh: '.BH',  // Bahrain (BHB)
  om: '.OM',  // Oman (MSX)
  mx: '.MX',  // Mexico (BMV)
  za: '.JO',  // South Africa (JSE)
  no: '.OL',  // Norway (Oslo)
  dk: '.CO',  // Denmark (Copenhagen)
  fi: '.HE',  // Finland (Helsinki)
  be: '.BR',  // Belgium (Brussels)
  at: '.VI',  // Austria (Vienna)
  pl: '.WA',  // Poland (Warsaw)
  ie: '.IR',  // Ireland (Euronext Dublin)
  pt: '.LS'   // Portugal (Lisbon)
};

const TIMEFRAME_CONFIG = {
  '1W': { range: '5d', interval: '15m', fallbackInterval: '1d', label: 'Past 5 Trading Days' },
  '1M': { range: '1mo', interval: '1d', fallbackInterval: '1d', label: 'Past 30 Days' },
  '6M': { range: '6mo', interval: '1d', fallbackInterval: '1wk', label: 'Past 6 Months' },
  '1Y': { range: '1y', interval: '1d', fallbackInterval: '1wk', label: 'Past 52 Weeks' }
};

/**
 * Format raw ticker into Yahoo Finance exchange symbol
 */
function resolveYahooTicker(rawSymbol, country = 'pk') {
  if (!rawSymbol || typeof rawSymbol !== 'string') return '';
  const clean = rawSymbol.trim().toUpperCase();

  // If already contains an exchange suffix (e.g. "OGDC.KA", "SHEL.L", "2222.SR")
  if (/\.[A-Z]{1,3}$/i.test(clean)) {
    return clean;
  }

  const suffix = EXCHANGE_SUFFIX_MAP[country.toLowerCase()] ?? '';
  return `${clean}${suffix}`;
}

function hasValidCloses(resObj) {
  const closes = resObj?.indicators?.quote?.[0]?.close;
  if (!Array.isArray(closes) || closes.length === 0) return false;
  return closes.some(v => typeof v === 'number' && !isNaN(v) && isFinite(v) && v > 0);
}

export default async function handler(req, res) {
  // CORS & CDN Caching Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const querySymbol = req.query?.symbol || req.query?.ticker || 'AAPL';
  const queryCountry = (req.query?.country || 'pk').toLowerCase();
  const queryTimeframe = (req.query?.timeframe || '1M').toUpperCase();

  const tfConfig = TIMEFRAME_CONFIG[queryTimeframe] || TIMEFRAME_CONFIG['1M'];
  const fullSymbol = resolveYahooTicker(querySymbol, queryCountry);

  const browserHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Referer': 'https://finance.yahoo.com'
  };

  const hosts = [
    'https://query1.finance.yahoo.com',
    'https://query2.finance.yahoo.com'
  ];

  let rawData = null;

  for (const host of hosts) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);

      const url = `${host}/v8/finance/chart/${encodeURIComponent(fullSymbol)}?interval=${tfConfig.interval}&range=${tfConfig.range}`;
      const resp = await fetch(url, {
        signal: controller.signal,
        headers: browserHeaders
      });
      clearTimeout(timeout);

      if (resp.ok) {
        const json = await resp.json();
        const resObj = json?.chart?.result?.[0];
        if (resObj?.meta && hasValidCloses(resObj)) {
          rawData = resObj;
          break;
        }
      }
    } catch {
      // Continue to next host
    }
  }

  // If primary interval had 0 points, try fallbackInterval
  if (!rawData && tfConfig.interval !== tfConfig.fallbackInterval) {
    for (const host of hosts) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const url = `${host}/v8/finance/chart/${encodeURIComponent(fullSymbol)}?interval=${tfConfig.fallbackInterval}&range=${tfConfig.range}`;
        const resp = await fetch(url, {
          signal: controller.signal,
          headers: browserHeaders
        });
        clearTimeout(timeout);

        if (resp.ok) {
          const json = await resp.json();
          const resObj = json?.chart?.result?.[0];
          if (resObj?.meta && hasValidCloses(resObj)) {
            rawData = resObj;
            break;
          }
        }
      } catch {}
    }
  }

  if (rawData) {
    try {
      const meta = rawData.meta || {};
      const quote = rawData.indicators?.quote?.[0] || {};
      const rawTimestamps = rawData.timestamp || [];
      const rawCloses = quote.close || [];

      // Filter valid points
      const points = [];
      const timestamps = [];

      for (let i = 0; i < rawCloses.length; i++) {
        const val = rawCloses[i];
        if (typeof val === 'number' && !isNaN(val) && isFinite(val) && val > 0) {
          points.push(Number(val.toFixed(2)));
          timestamps.push(rawTimestamps[i] ? rawTimestamps[i] * 1000 : Date.now());
        }
      }

      if (points.length > 0) {
        const currentPrice = typeof meta.regularMarketPrice === 'number' && meta.regularMarketPrice > 0
          ? Number(meta.regularMarketPrice.toFixed(2))
          : points[points.length - 1];

        const chartPreviousClose = typeof meta.chartPreviousClose === 'number'
          ? meta.chartPreviousClose
          : points[0];

        const periodStartPrice = points[0];
        const periodEndPrice = points[points.length - 1];

        const periodChange = Number((periodEndPrice - periodStartPrice).toFixed(2));
        const periodChangePercent = Number((((periodEndPrice - periodStartPrice) / periodStartPrice) * 100).toFixed(2));

        const dayChange = Number((currentPrice - chartPreviousClose).toFixed(2));
        const dayChangePercent = Number((((currentPrice - chartPreviousClose) / chartPreviousClose) * 100).toFixed(2));

        const minPrice = Math.min(...points);
        const maxPrice = Math.max(...points);

        return res.status(200).json({
          success: true,
          symbol: querySymbol,
          fullSymbol,
          country: queryCountry,
          timeframe: queryTimeframe,
          tfLabel: tfConfig.label,
          currentPrice,
          dayChange,
          dayChangePercent,
          periodChange,
          periodChangePercent,
          isPeriodPositive: periodChangePercent >= 0,
          minPrice,
          maxPrice,
          points,
          timestamps,
          high52: meta.fiftyTwoWeekHigh ? Number(meta.fiftyTwoWeekHigh.toFixed(2)) : null,
          low52: meta.fiftyTwoWeekLow ? Number(meta.fiftyTwoWeekLow.toFixed(2)) : null,
          volume: meta.regularMarketVolume || null,
          currency: meta.currency || (queryCountry === 'pk' ? 'PKR' : 'USD'),
          exchange: meta.fullExchangeName || meta.exchangeName || '',
          source: 'Live Exchange Feed (Yahoo Finance Institutional)',
          isLive: true,
          lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      }
    } catch (parseErr) {
      console.warn('Error parsing stock history payload:', parseErr.message);
    }
  }

  // Graceful response if live stream is temporarily unreachable
  return res.status(200).json({
    success: false,
    symbol: querySymbol,
    fullSymbol,
    country: queryCountry,
    timeframe: queryTimeframe,
    tfLabel: tfConfig.label,
    source: 'Market Feed Ingestion Pending',
    isLive: false,
    points: [],
    timestamps: []
  });
}
