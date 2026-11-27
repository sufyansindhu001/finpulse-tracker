/** Shared, read-only check for optional visitor analytics permission. */
export const CONSENT_STORAGE_KEY = 'fgc_cookie_consent';

export function hasAnalyticsConsent() {
  if (typeof localStorage === 'undefined') return false;
  try {
    const saved = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) || 'null');
    return saved?.analytics === true;
  } catch {
    // Legacy or corrupt consent must not silently turn optional analytics on.
    return false;
  }
}
