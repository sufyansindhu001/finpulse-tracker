/** Offline regression: optional analytics must not collect before opt-in. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CONSENT_STORAGE_KEY, hasAnalyticsConsent } from '../src/utils/consent.js';
import { recordPageView, recordConversion, trackEvent, getVisitorId } from '../src/utils/telemetry.js';

const values = new Map();
globalThis.localStorage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: key => values.delete(key)
};

assert.equal(hasAnalyticsConsent(), false);
assert.equal(getVisitorId(), 'optional_analytics_disabled');
assert.equal(recordPageView('/'), undefined);
assert.equal(recordConversion('USD', 'PKR', 100, 27600), undefined);
assert.equal(trackEvent('PAGE_VIEW', 'test'), null);
assert.equal(values.size, 0, 'Declined analytics must not create tracking records');

values.set(CONSENT_STORAGE_KEY, 'accepted'); // Legacy malformed storage value
assert.equal(hasAnalyticsConsent(), false);
values.set(CONSENT_STORAGE_KEY, JSON.stringify({necessary:true, analytics:false, advertising:false}));
assert.equal(hasAnalyticsConsent(), false);
values.set(CONSENT_STORAGE_KEY, JSON.stringify({necessary:true, analytics:true, advertising:false}));
assert.equal(hasAnalyticsConsent(), true);

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const app = read('src/App.jsx');
const banner = read('src/components/CookieConsentBanner.jsx');
assert.match(app, /analyticsConsent && <Analytics \/>/);
assert.match(app, /analyticsConsent && <SpeedInsights \/>/);
assert.match(app, /if \(!analyticsConsent\) return;/);
assert.match(banner, /dispatchEvent\(new Event\('fgc_cookie_consent_changed'\)\)/);
assert.match(banner, /analytics: false,\s*advertising: false/);

delete globalThis.localStorage;
console.log('[PASS] Optional site analytics and external scripts wait for affirmative visitor consent.');
