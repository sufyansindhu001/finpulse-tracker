/**
 * FinPulse Institutional Telemetry & Analytics Engine
 * Tracks page impressions, unique visitors, tool interactions, conversions,
 * research engagement, and contact inquiries with daily archival rollup & CSV export.
 */

const STORAGE_KEYS = {
  EVENTS: 'finpulse_telemetry_events',
  DAILY: 'finpulse_telemetry_daily',
  INQUIRIES: 'finpulse_inquiries',
  VISITOR_ID: 'finpulse_visitor_id',
  SESSION_ID: 'finpulse_session_id'
};

// Generate UUID-like unique identifier
function generateId() {
  return 'fp_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Get or assign persistent visitor identifier
function getVisitorId() {
  try {
    let vid = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
    if (!vid) {
      vid = generateId();
      localStorage.setItem(STORAGE_KEYS.VISITOR_ID, vid);
    }
    return vid;
  } catch {
    return 'anon_guest';
  }
}

// Format current date as YYYY-MM-DD
function getTodayKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate realistic seed inquiries if storage is empty
function getInitialInquiries() {
  const now = new Date();
  return [
    {
      id: 'inq_101',
      name: 'Tariq Mansoor',
      email: 'tariq.m@habibbank-global.com',
      subject: 'Exchange Rate Correction',
      message: 'Noticed interbank parity for USD/PKR had a slight 0.25 spread discrepancy at market open compared to SBP telegraphic transfer rates. Could you verify your feed provider latency?',
      timestamp: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
      status: 'New'
    },
    {
      id: 'inq_102',
      name: 'Elena Rostova',
      email: 'e.rostova@zurich-quant.ch',
      subject: 'AdSense / Advertising',
      message: 'We are looking to place institutional sponsorship banners on your Digital Asset Arbitrage terminal for high-net-worth European traders. Please share your Q3 media kit and rate card.',
      timestamp: new Date(now.getTime() - 1000 * 60 * 180).toISOString(),
      status: 'Read'
    },
    {
      id: 'inq_103',
      name: 'Ahmad Al-Falasi',
      email: 'falasi.ventures@dubai-fin.ae',
      subject: 'General Inquiry',
      message: 'Excellent platform responsiveness. Do you offer an enterprise REST webhook to stream live AED and SAR pegged corridor data directly into our treasury management system?',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
      status: 'Followed Up'
    },
    {
      id: 'inq_104',
      name: 'David Chen',
      email: 'dchen@apex-capital.sg',
      subject: 'Editorial & Press',
      message: 'We would like to reference FinPulse’s cross-border remittance spreads in our upcoming Singapore Fintech Macro report. Are there any citation guidelines?',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(),
      status: 'Followed Up'
    }
  ];
}

// Generate realistic seed daily rollup for the past 30 days
function getInitialDailyRecords() {
  const records = {};
  const today = new Date();
  const topPairsPool = ['USD/PKR', 'EUR/USD', 'GBP/USD', 'USD/AED', 'USD/SAR', 'USD/INR'];

  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    // Realistic business curves with weekday peaks
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const baseMult = isWeekend ? 0.72 : 1.15;
    
    const visitors = Math.floor((1200 + Math.sin(i * 0.5) * 280 + Math.random() * 150) * baseMult);
    const impressions = Math.floor(visitors * (2.8 + Math.random() * 0.6));
    const conversions = Math.floor(visitors * (1.9 + Math.random() * 0.5));
    const inquiries = isWeekend ? Math.floor(Math.random() * 2) : Math.floor(1 + Math.random() * 4);
    
    const minutes = Math.floor(3 + Math.random() * 2);
    const seconds = Math.floor(10 + Math.random() * 45);
    const avgDuration = `${minutes}m ${seconds}s`;
    
    const topPair = topPairsPool[Math.floor(Math.random() * (i % 2 === 0 ? 3 : topPairsPool.length))];

    records[dateKey] = {
      date: dateKey,
      impressions,
      uniqueVisitors: visitors,
      conversions,
      topPair: i === 0 ? 'USD/PKR' : topPair,
      inquiries,
      avgSessionDuration: avgDuration,
      pairCounts: {
        'USD/PKR': Math.floor(conversions * 0.45),
        'EUR/USD': Math.floor(conversions * 0.25),
        'GBP/USD': Math.floor(conversions * 0.15),
        'USD/AED': Math.floor(conversions * 0.10),
        'USD/SAR': Math.floor(conversions * 0.05)
      }
    };
  }
  return records;
}

// Generate initial recent micro-events
function getInitialRecentEvents() {
  const now = Date.now();
  return [
    {
      id: 'evt_1',
      timestamp: new Date(now - 12000).toISOString(),
      type: 'FX_CONVERT',
      description: 'USD -> PKR [Amount: 1,500 | Result: 417,135.00 PKR]',
      category: 'Calculators'
    },
    {
      id: 'evt_2',
      timestamp: new Date(now - 48000).toISOString(),
      type: 'PAGE_VIEW',
      description: 'Route accessed: /forex (Forex Exchange Terminal)',
      category: 'Navigation'
    },
    {
      id: 'evt_3',
      timestamp: new Date(now - 92000).toISOString(),
      type: 'RESEARCH_READ',
      description: 'Article opened: "Digital Asset Reserves in 2026"',
      category: 'Editorial'
    },
    {
      id: 'evt_4',
      timestamp: new Date(now - 145000).toISOString(),
      type: 'TIMEFRAME_TOGGLE',
      description: 'Hero Market Depth timeline set to 24H [High Resolution]',
      category: 'Interactive'
    },
    {
      id: 'evt_5',
      timestamp: new Date(now - 210000).toISOString(),
      type: 'FX_CONVERT',
      description: 'EUR -> USD [Amount: 500 | Result: 543.25 USD]',
      category: 'Calculators'
    },
    {
      id: 'evt_6',
      timestamp: new Date(now - 320000).toISOString(),
      type: 'PAIR_SELECTED',
      description: 'Direct corridor switched to USD/AED [Parity: 3.6725]',
      category: 'Market Matrix'
    },
    {
      id: 'evt_7',
      timestamp: new Date(now - 480000).toISOString(),
      type: 'CRYPTO_CONVERT',
      description: 'BTC -> USD [Amount: 0.25 | Result: 16,845.50 USD]',
      category: 'Digital Assets'
    }
  ];
}

// Safe localStorage getters and setters
function getStoredDaily() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY);
    if (!raw) {
      const initial = getInitialDailyRecords();
      localStorage.setItem(STORAGE_KEYS.DAILY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialDailyRecords();
  }
}

function saveStoredDaily(data) {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY, JSON.stringify(data));
  } catch (e) {
    console.warn('[Telemetry] Unable to save daily rollup:', e);
  }
}

export function getInquiries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    if (!raw) {
      const initial = getInitialInquiries();
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialInquiries();
  }
}

export function saveInquiries(inquiries) {
  try {
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
  } catch (e) {
    console.warn('[Telemetry] Unable to save inquiries:', e);
  }
}

export function getRecentEvents(limit = 40) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      const initial = getInitialRecentEvents();
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(initial));
      return initial.slice(0, limit);
    }
    const events = JSON.parse(raw);
    return Array.isArray(events) ? events.slice(0, limit) : [];
  } catch {
    return getInitialRecentEvents().slice(0, limit);
  }
}

function appendEvent(eventObj) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    let events = raw ? JSON.parse(raw) : getInitialRecentEvents();
    if (!Array.isArray(events)) events = [];
    events.unshift(eventObj);
    // Keep last 150 events
    if (events.length > 150) {
      events = events.slice(0, 150);
    }
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (e) {
    console.warn('[Telemetry] Event write failure:', e);
  }
}

// -------------------------------------------------------------
// PUBLIC API: Track Specific Telemetry Actions
// -------------------------------------------------------------

/**
 * Log a generic micro-event
 */
export function trackEvent(type, description, category = 'General') {
  const event = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    type,
    description,
    category
  };
  appendEvent(event);
  return event;
}

/**
 * Record a route impression
 */
export function recordPageView(path) {
  const todayKey = getTodayKey();
  const daily = getStoredDaily();
  
  if (!daily[todayKey]) {
    daily[todayKey] = {
      date: todayKey,
      impressions: 1,
      uniqueVisitors: 1,
      conversions: 0,
      topPair: 'USD/PKR',
      inquiries: 0,
      avgSessionDuration: '3m 24s',
      pairCounts: { 'USD/PKR': 1 }
    };
  } else {
    daily[todayKey].impressions = (daily[todayKey].impressions || 0) + 1;
    // Check if new session
    const isNewSession = !sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (isNewSession) {
      sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, generateId());
      daily[todayKey].uniqueVisitors = (daily[todayKey].uniqueVisitors || 0) + 1;
    }
  }

  saveStoredDaily(daily);
  trackEvent('PAGE_VIEW', `Route accessed: ${path}`, 'Navigation');
}

/**
 * Record currency or crypto conversion execution
 */
export function recordConversion(fromCurrency, toCurrency, amount, convertedValue) {
  const todayKey = getTodayKey();
  const daily = getStoredDaily();
  const pairKey = `${fromCurrency}/${toCurrency}`;

  if (!daily[todayKey]) {
    daily[todayKey] = {
      date: todayKey,
      impressions: 1,
      uniqueVisitors: 1,
      conversions: 1,
      topPair: pairKey,
      inquiries: 0,
      avgSessionDuration: '3m 45s',
      pairCounts: { [pairKey]: 1 }
    };
  } else {
    daily[todayKey].conversions = (daily[todayKey].conversions || 0) + 1;
    if (!daily[todayKey].pairCounts) daily[todayKey].pairCounts = {};
    daily[todayKey].pairCounts[pairKey] = (daily[todayKey].pairCounts[pairKey] || 0) + 1;

    // Recalculate top pair
    let maxCount = 0;
    let top = daily[todayKey].topPair || pairKey;
    for (const [p, count] of Object.entries(daily[todayKey].pairCounts)) {
      if (count > maxCount) {
        maxCount = count;
        top = p;
      }
    }
    daily[todayKey].topPair = top;
  }

  saveStoredDaily(daily);

  const formattedAmount = Number(amount || 0).toLocaleString();
  const formattedResult = typeof convertedValue === 'number' 
    ? convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
    : convertedValue;

  trackEvent(
    'FX_CONVERT',
    `${fromCurrency} -> ${toCurrency} [Amount: ${formattedAmount} | Result: ${formattedResult} ${toCurrency}]`,
    'Calculators'
  );
}

/**
 * Record pair selection or corridor switch
 */
export function recordPairSelected(pair) {
  trackEvent('PAIR_SELECTED', `Corridor focus switched to ${pair}`, 'Market Matrix');
}

/**
 * Record chart timeframe toggles
 */
export function recordTimeframeSelected(tf) {
  trackEvent('TIMEFRAME_TOGGLE', `Interactive chart timeframe changed to ${tf}`, 'Interactive');
}

/**
 * Record Research/Blog reads
 */
export function recordResearchRead(articleTitle) {
  trackEvent('RESEARCH_READ', `Research brief opened: "${articleTitle}"`, 'Editorial');
}

/**
 * Record article upvotes
 */
export function recordResearchVote(articleTitle) {
  trackEvent('RESEARCH_UPVOTE', `Analytical endorsement added for: "${articleTitle}"`, 'Editorial');
}

/**
 * Record a contact form submission
 */
export function recordInquiry({ name, email, subject, message }) {
  const inquiries = getInquiries();
  const newInq = {
    id: generateId(),
    name: (name || 'Anonymous Guest').trim(),
    email: (email || 'no-reply@domain.com').trim(),
    subject: subject || 'General Inquiry',
    message: (message || '').trim(),
    timestamp: new Date().toISOString(),
    status: 'New'
  };

  inquiries.unshift(newInq);
  saveInquiries(inquiries);

  // Increment today's inquiries counter in daily record
  const todayKey = getTodayKey();
  const daily = getStoredDaily();
  if (daily[todayKey]) {
    daily[todayKey].inquiries = (daily[todayKey].inquiries || 0) + 1;
    saveStoredDaily(daily);
  }

  trackEvent('CONTACT_SUBMIT', `Inquiry received from ${newInq.name} [Subject: ${newInq.subject}]`, 'Communications');
  return newInq;
}

/**
 * Update Inquiry Status (New, Read, Followed Up)
 */
export function updateInquiryStatus(id, newStatus) {
  const inquiries = getInquiries();
  const updated = inquiries.map(item => {
    if (item.id === id) {
      return { ...item, status: newStatus };
    }
    return item;
  });
  saveInquiries(updated);
  trackEvent('INQUIRY_STATUS_CHANGE', `Inquiry #${id} marked as "${newStatus}"`, 'Management');
  return updated;
}

/**
 * Delete an Inquiry
 */
export function deleteInquiry(id) {
  const inquiries = getInquiries();
  const filtered = inquiries.filter(item => item.id !== id);
  saveInquiries(filtered);
  trackEvent('INQUIRY_DELETED', `Inquiry #${id} permanently purged`, 'Management');
  return filtered;
}

// -------------------------------------------------------------
// ANALYTICS & ARCHIVAL REPORTING AGGREGATION
// -------------------------------------------------------------

/**
 * Fetch top high-tier KPIs for Admin Dashboard Header
 */
export function getLiveKPIs() {
  const todayKey = getTodayKey();
  const daily = getStoredDaily();
  const inquiries = getInquiries();

  const todayRecord = daily[todayKey] || {
    impressions: 1480,
    uniqueVisitors: 840,
    conversions: 1920,
    topPair: 'USD/PKR',
    inquiries: inquiries.filter(i => i.status === 'New').length
  };

  // Find yesterday for delta percentage calculation
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  const yesterdayRecord = daily[yesterdayKey] || {
    uniqueVisitors: Math.max(1, Math.floor(todayRecord.uniqueVisitors * 0.88)),
    conversions: Math.max(1, Math.floor(todayRecord.conversions * 0.91))
  };

  const visitorDelta = Math.round(((todayRecord.uniqueVisitors - yesterdayRecord.uniqueVisitors) / (yesterdayRecord.uniqueVisitors || 1)) * 100);
  const conversionDelta = Math.round(((todayRecord.conversions - yesterdayRecord.conversions) / (yesterdayRecord.conversions || 1)) * 100);

  const newInquiriesCount = inquiries.filter(i => i.status === 'New').length;

  return {
    activeSessions: 14 + Math.floor(Math.random() * 5),
    todayVisitors: todayRecord.uniqueVisitors,
    visitorDelta: visitorDelta >= 0 ? `+${visitorDelta}%` : `${visitorDelta}%`,
    todayConversions: todayRecord.conversions,
    conversionDelta: conversionDelta >= 0 ? `+${conversionDelta}%` : `${conversionDelta}%`,
    newInquiriesCount,
    topPairToday: todayRecord.topPair || 'USD/PKR',
    systemStatus: {
      status: 'Nominal',
      latencyMs: 84,
      uptime: '99.98%'
    }
  };
}

/**
 * Fetch daily historical records with range filtering (7d, 30d, all)
 */
export function getDailyAuditReports(range = '7d') {
  const daily = getStoredDaily();
  const sortedDates = Object.keys(daily).sort().reverse();

  let limit = sortedDates.length;
  if (range === '7d') limit = 7;
  else if (range === '30d') limit = 30;

  const targetDates = sortedDates.slice(0, limit);

  return targetDates.map(dateKey => {
    const item = daily[dateKey];
    return {
      date: item.date,
      impressions: item.impressions || 0,
      uniqueVisitors: item.uniqueVisitors || 0,
      conversions: item.conversions || 0,
      topPair: item.topPair || 'USD/PKR',
      inquiries: item.inquiries || 0,
      avgSessionDuration: item.avgSessionDuration || '3m 12s'
    };
  });
}

/**
 * Generate and trigger download of CSV audit report
 */
export function exportAuditReportsCSV(reports) {
  if (!reports || reports.length === 0) return;

  const headers = [
    'Date (YYYY-MM-DD)',
    'Total Impressions',
    'Unique Visitors',
    'Conversions Executed',
    'Top Currency Pair',
    'Inquiries Received',
    'Avg Session Duration'
  ];

  const rows = reports.map(r => [
    `"${r.date}"`,
    r.impressions,
    r.uniqueVisitors,
    r.conversions,
    `"${r.topPair}"`,
    r.inquiries,
    `"${r.avgSessionDuration}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `FinPulse_EOD_Telemetry_Audit_${getTodayKey()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
