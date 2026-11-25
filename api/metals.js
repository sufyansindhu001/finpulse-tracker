// Commodity reference endpoint: Yahoo futures, a PAXG token price, and FX-metal references.
// These sources do not provide official LBMA fixings or Karachi Sarafa retail rates.

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Never publish an old static price as a current quote.
  let goldPrice = null;
  let goldChange = null;
  let goldHigh = null;
  let goldLow = null;

  let silverPrice = null;
  let silverChange = null;
  let silverHigh = null;
  let silverLow = null;
  let goldSource = null;
  let silverSource = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const [paxgRes, cdnRes, yahooGoldRes, yahooSilverRes] = await Promise.allSettled([
      // 1. Binance PAXG 24hr (Gold spot + 24h metrics)
      fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=PAXGUSDT', {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      }).then(r => r.ok ? r.json() : null),

      // 2. Global Currency & Metals CDN (Gold XAU & Silver XAG)
      fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json', {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      }).then(r => r.ok ? r.json() : null),

      // 3. Yahoo Finance GC=F (Gold Futures)
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=2d', {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      }).then(r => r.ok ? r.json() : null),

      // 4. Yahoo Finance SI=F (Silver Futures)
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/SI=F?interval=1d&range=2d', {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      }).then(r => r.ok ? r.json() : null)
    ]);
    clearTimeout(timeout);

    const paxgData = paxgRes.status === 'fulfilled' ? paxgRes.value : null;
    const cdnData = cdnRes.status === 'fulfilled' ? cdnRes.value : null;
    const yGold = yahooGoldRes.status === 'fulfilled' ? yahooGoldRes.value : null;
    const ySilver = yahooSilverRes.status === 'fulfilled' ? yahooSilverRes.value : null;

    // --- Resolve Live Gold Spot ---
    if (yGold?.chart?.result?.[0]?.meta?.regularMarketPrice) {
      const meta = yGold.chart.result[0].meta;
      const parsed = Number(meta.regularMarketPrice);
      if (!isNaN(parsed) && parsed > 500) {
        goldPrice = Number(parsed.toFixed(2));
        goldSource = 'Yahoo Finance GC=F gold futures';
        const prev = Number(meta.chartPreviousClose);
        goldChange = (!isNaN(prev) && prev > 0) ? Number((((goldPrice - prev) / prev) * 100).toFixed(2)) : null;
        goldHigh = (typeof meta.regularMarketDayHigh === 'number' && meta.regularMarketDayHigh > 0) ? Number(meta.regularMarketDayHigh.toFixed(2)) : null;
        goldLow = (typeof meta.regularMarketDayLow === 'number' && meta.regularMarketDayLow > 0) ? Number(meta.regularMarketDayLow.toFixed(2)) : null;
      }
    } else if (paxgData?.lastPrice) {
      const parsed = parseFloat(paxgData.lastPrice);
      if (!isNaN(parsed) && parsed > 500) {
        goldPrice = Number(parsed.toFixed(2));
        goldSource = 'Binance PAXG/USDT token quote';
        const pChange = parseFloat(paxgData.priceChangePercent);
        goldChange = !isNaN(pChange) ? Number(pChange.toFixed(2)) : null;
        const pHigh = parseFloat(paxgData.highPrice);
        goldHigh = (!isNaN(pHigh) && pHigh > 0) ? Number(pHigh.toFixed(2)) : null;
        const pLow = parseFloat(paxgData.lowPrice);
        goldLow = (!isNaN(pLow) && pLow > 0) ? Number(pLow.toFixed(2)) : null;
      }
    } else if (cdnData?.usd?.xau && typeof cdnData.usd.xau === 'number' && cdnData.usd.xau > 0) {
      goldPrice = Number((1 / cdnData.usd.xau).toFixed(2));
      goldSource = 'Currency API USD/XAU reference';
      goldChange = null;
      goldHigh = null;
      goldLow = null;
    }

    // --- Resolve Live Silver Spot ---
    if (ySilver?.chart?.result?.[0]?.meta?.regularMarketPrice) {
      const meta = ySilver.chart.result[0].meta;
      const parsed = Number(meta.regularMarketPrice);
      if (!isNaN(parsed) && parsed > 5) {
        silverPrice = Number(parsed.toFixed(2));
        silverSource = 'Yahoo Finance SI=F silver futures';
        const prev = Number(meta.chartPreviousClose);
        silverChange = (!isNaN(prev) && prev > 0) ? Number((((silverPrice - prev) / prev) * 100).toFixed(2)) : null;
        silverHigh = (typeof meta.regularMarketDayHigh === 'number' && meta.regularMarketDayHigh > 0) ? Number(meta.regularMarketDayHigh.toFixed(2)) : null;
        silverLow = (typeof meta.regularMarketDayLow === 'number' && meta.regularMarketDayLow > 0) ? Number(meta.regularMarketDayLow.toFixed(2)) : null;
      }
    } else if (cdnData?.usd?.xag && typeof cdnData.usd.xag === 'number' && cdnData.usd.xag > 0) {
      silverPrice = Number((1 / cdnData.usd.xag).toFixed(2));
      silverSource = 'Currency API USD/XAG reference';
      silverChange = null;
      silverHigh = null;
      silverLow = null;
    }

    if (goldPrice === null && silverPrice === null) {
      return res.status(503).json({ success: false, message: 'Verified bullion quotes are temporarily unavailable.' });
    }

    return res.status(200).json({
      success: true,
      source: [goldSource, silverSource].filter(Boolean).join(' / '),
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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
      }
    });
  } catch (err) {
    console.warn('Metals endpoint feed failure:', err.message);
    return res.status(503).json({ success: false, message: 'Verified bullion quotes are temporarily unavailable.' });
  }
}
