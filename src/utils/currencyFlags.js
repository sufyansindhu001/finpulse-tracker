// src/utils/currencyFlags.js - Universal Currency-to-Flag Mapper Utility
// Automated currency-to-ISO-country mapping for 160+ global fiat currencies using FlagCDN.

// Custom overrides for non-standard 2-letter codes
export const currencyCountryOverrides = {
  EUR: 'eu',
  USD: 'us',
  GBP: 'gb',
  ANG: 'nl', // Sint Maarten / Curacao
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

export function getCurrencyFlagUrl(currencyCode) {
  if (!currencyCode) return null;
  const code = currencyCode.toUpperCase();

  // Check overrides first
  if (currencyCountryOverrides[code] !== undefined) {
    return currencyCountryOverrides[code] 
      ? `https://flagcdn.com/w40/${currencyCountryOverrides[code]}.png` 
      : null;
  }

  // Default standard: first two letters correspond to ISO 3166-1 alpha-2
  const countryCode = code.slice(0, 2).toLowerCase();
  return `https://flagcdn.com/w40/${countryCode}.png`;
}
