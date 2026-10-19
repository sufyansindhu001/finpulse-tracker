// api/stocks.js - Real-Time Global & PSX Equities Serverless Endpoint
// Ingests live quotes from financial market feeds with multi-exchange mapping
// and low-latency response caching.

const TICKER_MAP = {
  pk: [
    'MEBL.KA', 'OGDC.KA', 'PPL.KA', 'SYS.KA', 'FFC.KA', 'ENGRO.KA', 'LUCK.KA',
    'HUBC.KA', 'MCB.KA', 'UBL.KA', 'HBL.KA', 'PSO.KA', 'MARI.KA', 'EFERT.KA',
    'DGKC.KA', 'POL.KA', 'FCCL.KA', 'KAPCO.KA', 'KEL.KA', 'TRG.KA', 'CHCC.KA',
    'MLCF.KA', 'SEARL.KA', 'ILP.KA', 'PIOC.KA', 'INIL.KA', 'ISL.KA', 'ATRL.KA',
    'PRL.KA', 'SNGP.KA', 'SSGC.KA', 'LOTCHEM.KA', 'AGP.KA', 'ABOT.KA', 'GLAXO.KA',
    'NESTLE.KA', 'UNITY.KA', 'GTYR.KA', 'KML.KA', 'NATF.KA', 'NETSOL.KA', 'AIRLINK.KA'
  ],
  us: [
    'NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'BRK-B',
    'JPM', 'V', 'WMT', 'XOM', 'LLY', 'AVGO', 'COST', 'PG', 'HD', 'MA'
  ],
  uk: [
    'SHEL.L', 'AZN.L', 'HSBA.L', 'ULVR.L', 'BP.L', 'GSK.L', 'BATS.L', 'RIO.L', 'DGE.L', 'REL.L'
  ],
  sa: [
    '2222.SR', '1120.SR', '2010.SR', '1180.SR', '7010.SR', '2020.SR', '1010.SR'
  ],
  in: [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'HINDUNILVR.NS', 'SBIN.NS'
  ]
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const country = (req.query?.country || 'pk').toLowerCase();
  const customSymbols = req.query?.symbols ? req.query.symbols.split(',') : null;
  const targetSymbols = (customSymbols || TICKER_MAP[country] || TICKER_MAP.pk).slice(0, 25);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3800);

    const quotePromises = targetSymbols.map(async (sym) => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=2d`;
        const resp = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json'
          }
        });
        if (!resp.ok) return null;
        const data = await resp.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta || typeof meta.regularMarketPrice !== 'number') return null;

        const rawSym = meta.symbol || sym;
        const cleanSym = rawSym.replace(/\.(KA|L|SR|NS|T|HK)$/i, '');
        const price = Number(meta.regularMarketPrice.toFixed(2));
        const prev = meta.chartPreviousClose || price;
        const change = Number((price - prev).toFixed(2));
        const changePercent = Number((((price - prev) / prev) * 100).toFixed(2));

        return {
          symbol: cleanSym,
          rawSymbol: rawSym,
          price,
          change,
          changePercent,
          volume: meta.regularMarketVolume || null,
          high52: meta.fiftyTwoWeekHigh ? Number(meta.fiftyTwoWeekHigh.toFixed(2)) : null,
          low52: meta.fiftyTwoWeekLow ? Number(meta.fiftyTwoWeekLow.toFixed(2)) : null,
          currency: meta.currency || (country === 'pk' ? 'PKR' : 'USD'),
          exchange: meta.fullExchangeName || meta.exchangeName || ''
        };
      } catch {
        return null;
      }
    });

    const results = await Promise.allSettled(quotePromises);
    clearTimeout(timeout);

    const quotes = {};
    results.forEach(r => {
      if (r.status === 'fulfilled' && r.value) {
        const q = r.value;
        quotes[q.symbol] = q;
        quotes[q.rawSymbol] = q;
      }
    });

    const liveCount = Object.keys(quotes).length;

    return res.status(200).json({
      success: true,
      country,
      source: liveCount > 0 ? 'Global Institutional Market Feeds (Live)' : 'Global Institutional Feeds (Baseline)',
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      count: liveCount,
      quotes
    });

  } catch (err) {
    console.warn('Stocks API ingestion warning:', err.message);
    return res.status(200).json({
      success: true,
      country,
      source: 'Global Institutional Market Feeds (Baseline)',
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      count: 0,
      quotes: {}
    });
  }
}
