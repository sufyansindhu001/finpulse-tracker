// api/track.js - High-Performance Centralized Telemetry & Real-Time Visitor Sync
// Vercel Serverless Function supporting distributed cross-device visitor counting.

const NAMESPACE = 'fgc_spot_tracker_v2';
const ABACUS_BASE = 'https://abacus.jasoncameron.dev';

// In-memory state across warm serverless function invocations
let memoryStore = {
  activeDevices: {}, // { [deviceToken]: timestamp }
  seenDailyDevices: {}, // { [dateKey]: Set<deviceToken> }
  recentEvents: [],
  inquiries: [],
  corridors: {}
};

function getTodayKey() {
  const d = new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}_${month}_${day}`;
}

function getTodayDateStandard() {
  const d = new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Atomic counter helpers
async function hitCounter(key) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${ABACUS_BASE}/hit/${NAMESPACE}/${key}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return 0;
    const json = await res.json();
    return typeof json.value === 'number' ? json.value : 0;
  } catch {
    return 0;
  }
}

async function getCounter(key) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${ABACUS_BASE}/get/${NAMESPACE}/${key}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return 0;
    const json = await res.json();
    return typeof json.value === 'number' ? json.value : 0;
  } catch {
    return 0;
  }
}

// Optional Vercel KV / Upstash Redis primary adapter
async function tryVercelKV(cmd, ...args) {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!kvUrl || !kvToken) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const endpoint = `${kvUrl}/${cmd}/${args.map(encodeURIComponent).join('/')}`;
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${kvToken}` },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = await res.json();
    return json.result;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  // Set CORS headers for global cross-origin access
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const dateKey = getTodayKey();
  const dateStd = getTodayDateStandard();

  // Extract client IP and device identifier
  const forwarded = req.headers['x-forwarded-for'];
  const rawIp = forwarded ? (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0]) : (req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown');
  
  // Parse request body
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  const visitorId = body.visitorId || 'anon';
  const deviceToken = `${rawIp}_${visitorId}`;

  // -------------------------------------------------------------------
  // HANDLE POST: Track Visit, Conversion, or Client Event
  // -------------------------------------------------------------------
  if (req.method === 'POST') {
    const action = body.action || 'page_view';
    const now = Date.now();

    // 1. Update active session device timestamp (alive within 2.5 minutes)
    memoryStore.activeDevices[deviceToken] = now;

    // 2. Handle Page View / Visit
    if (action === 'page_view' || action === 'visit') {
      const isNewDayForClient = body.isNewDayForClient === true;

      if (!memoryStore.seenDailyDevices[dateKey]) {
        memoryStore.seenDailyDevices[dateKey] = new Set();
      }

      // Increment Unique Visitor strictly once per device per calendar day
      // When a genuine device loads the site for the first time today, isNewDayForClient is true.
      if (isNewDayForClient && !memoryStore.seenDailyDevices[dateKey].has(deviceToken)) {
        memoryStore.seenDailyDevices[dateKey].add(deviceToken);

        // Try Vercel KV first, else fallback to distributed atomic counter
        const kvRes = await tryVercelKV('sadd', `fgc_spot:visitors:${dateKey}`, deviceToken);
        if (kvRes === null) {
          await hitCounter(`visitors_${dateKey}`);
        }
      }

      // Increment total impressions
      await tryVercelKV('incr', `fgc_spot:impressions:${dateKey}`);
      hitCounter(`impressions_${dateKey}`).catch(() => {});

      // Add to rolling micro-events stream
      const eventObj = {
        id: 'evt_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        type: 'PAGE_VIEW',
        description: `Route accessed: ${body.path || '/'} [Device: ${deviceToken.substring(0, 10)}...]`,
        category: 'Navigation'
      };
      memoryStore.recentEvents.unshift(eventObj);
      if (memoryStore.recentEvents.length > 40) {
        memoryStore.recentEvents = memoryStore.recentEvents.slice(0, 40);
      }
    }

    // 3. Handle Currency / Crypto Conversion
    if (action === 'conversion') {
      const pair = `${body.from || 'USD'}/${body.to || 'PKR'}`;
      memoryStore.corridors[pair] = (memoryStore.corridors[pair] || 0) + 1;

      await tryVercelKV('incr', `fgc_spot:conversions:${dateKey}`);
      hitCounter(`conversions_${dateKey}`).catch(() => {});

      const eventObj = {
        id: 'evt_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        type: 'FX_CONVERT',
        description: `${body.from} -> ${body.to} [Amount: ${body.amount} | Result: ${body.result} ${body.to}]`,
        category: 'Calculators'
      };
      memoryStore.recentEvents.unshift(eventObj);
      if (memoryStore.recentEvents.length > 40) {
        memoryStore.recentEvents = memoryStore.recentEvents.slice(0, 40);
      }
    }

    // 4. Handle Contact Inquiry Submission
    if (action === 'inquiry') {
      const inqObj = {
        id: 'inq_' + Date.now().toString(36),
        name: (body.name || 'Anonymous Guest').trim(),
        email: (body.email || 'no-reply@domain.com').trim(),
        subject: body.subject || 'General Inquiry',
        message: (body.message || '').trim(),
        timestamp: new Date().toISOString(),
        status: 'New'
      };
      memoryStore.inquiries.unshift(inqObj);
      if (memoryStore.inquiries.length > 50) {
        memoryStore.inquiries = memoryStore.inquiries.slice(0, 50);
      }

      hitCounter(`inquiries_${dateKey}`).catch(() => {});
      
      const eventObj = {
        id: 'evt_' + Date.now().toString(36),
        timestamp: new Date().toISOString(),
        type: 'CONTACT_SUBMIT',
        description: `Inquiry received from ${inqObj.name} [Subject: ${inqObj.subject}]`,
        category: 'Communications'
      };
      memoryStore.recentEvents.unshift(eventObj);
    }
  }

  // -------------------------------------------------------------------
  // AGGREGATE TOTALS (FOR BOTH GET & POST RESPONSES)
  // -------------------------------------------------------------------
  const now = Date.now();
  let activeSessionsCount = 0;
  for (const [token, ts] of Object.entries(memoryStore.activeDevices)) {
    if (now - ts < 150000) { // 2.5 minutes window
      activeSessionsCount++;
    } else {
      delete memoryStore.activeDevices[token];
    }
  }
  activeSessionsCount = Math.max(1, activeSessionsCount);

  // Fetch unique visitors from KV or atomic counter
  let todayVisitors = 0;
  const kvVisitors = await tryVercelKV('scard', `fgc_spot:visitors:${dateKey}`);
  if (typeof kvVisitors === 'number') {
    todayVisitors = kvVisitors;
  } else {
    todayVisitors = await getCounter(`visitors_${dateKey}`);
  }

  // Fetch today conversions
  let todayConversions = 0;
  const kvConversions = await tryVercelKV('get', `fgc_spot:conversions:${dateKey}`);
  if (kvConversions !== null && !isNaN(Number(kvConversions))) {
    todayConversions = Number(kvConversions);
  } else {
    todayConversions = await getCounter(`conversions_${dateKey}`);
  }

  // Fetch today impressions
  let todayImpressions = 0;
  const kvImpressions = await tryVercelKV('get', `fgc_spot:impressions:${dateKey}`);
  if (kvImpressions !== null && !isNaN(Number(kvImpressions))) {
    todayImpressions = Number(kvImpressions);
  } else {
    todayImpressions = await getCounter(`impressions_${dateKey}`);
  }

  // Top Corridor calculation
  let topPairToday = 'None yet';
  let maxCount = 0;
  for (const [pair, count] of Object.entries(memoryStore.corridors)) {
    if (count > maxCount) {
      maxCount = count;
      topPairToday = pair;
    }
  }

  // Corridor distribution list
  const totalCorridorCalculations = Object.values(memoryStore.corridors).reduce((a, b) => a + b, 0);
  const corridorsList = Object.entries(memoryStore.corridors)
    .sort((a, b) => b[1] - a[1])
    .map(([pair, count]) => ({
      pair,
      count,
      share: totalCorridorCalculations > 0 ? Math.round((count / totalCorridorCalculations) * 100) : 0
    }));

  return res.status(200).json({
    success: true,
    date: dateStd,
    todayVisitors: Math.max(0, todayVisitors),
    activeSessions: activeSessionsCount,
    todayConversions: Math.max(0, todayConversions),
    todayImpressions: Math.max(0, todayImpressions),
    topPairToday,
    corridors: corridorsList,
    recentEvents: memoryStore.recentEvents,
    inquiries: memoryStore.inquiries
  });
}
