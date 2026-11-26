// Currency and country flag mapping. Multiple independent CDNs protect against
// transient network failures; one missing image must not blank all flags.

// Custom overrides for non-standard 2-letter codes
export const currencyCountryOverrides = {
  EUR: 'eu',
  USD: 'us',
  GBP: 'gb',
  ANG: 'cw', // Curaçao: representative territory for the historic shared ANG
  XAF: 'cm', // Central African CFA
  XOF: 'sn', // West African CFA
  XCD: 'ag', // East Caribbean
  XPF: 'pf', // CFP Franc (French Polynesia)
  BTC: null, // Cryptos handled with token SVGs
  ETH: null,
  USDT: null,
  BNB: null,
  SOL: null,
  XRP: null,
  DOGE: null,
  ADA: null,
  AVAX: null,
  DOT: null,
  LINK: null,
  XDR: null, // IMF SDR
  XAU: null, // Gold ounce
  XAG: null, // Silver ounce
  XPD: null, // Palladium
  XPT: null, // Platinum
};

/** Ordered, independent image sources for ISO 3166-1 flags and the EU flag. */
export function getCountryFlagUrls(countryCode) {
  if (!/^[a-z]{2}$/i.test(countryCode || '')) return [];
  const iso = countryCode.toLowerCase();
  return [
    `https://flagcdn.com/w40/${iso}.png`,
    `https://flagcdn.io/flags/4x3/${iso}.svg`,
    `https://flagsapi.com/${iso.toUpperCase()}/flat/64.png`,
  ];
}

export function getCurrencyFlagUrls(currencyCode) {
  if (!/^[a-z]{3}$/i.test(currencyCode || '')) return [];
  const code = currencyCode.toUpperCase();

  // Check overrides first
  if (currencyCountryOverrides[code] !== undefined) {
    return currencyCountryOverrides[code]
      ? getCountryFlagUrls(currencyCountryOverrides[code])
      : [];
  }

  // Standard ISO 4217 codes usually begin with their territory's ISO 3166 code.
  return getCountryFlagUrls(code.slice(0, 2));
}

// Keep this single-URL helper for code outside the shared flag component.
export function getCurrencyFlagUrl(currencyCode) {
  return getCurrencyFlagUrls(currencyCode)[0] || null;
}
