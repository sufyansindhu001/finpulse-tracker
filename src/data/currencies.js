export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', popular: true },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', popular: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', popular: true },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰', popular: true },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', popular: true },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', popular: true },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦', popular: true },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦', popular: true },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'AU$', flag: '🇦🇺', popular: true },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', popular: true },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', popular: false },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', popular: true },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', popular: false },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', popular: false },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', popular: false },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', popular: false },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', popular: false },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', flag: '🇰🇼', popular: true },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', flag: '🇶🇦', popular: false },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', popular: false },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', flag: '🇲🇽', popular: false },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩', popular: false },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', popular: false },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭', popular: false },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩', popular: false },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬', popular: false },
  { code: 'OMR', name: 'Omani Rial', symbol: 'OMR', flag: '🇴🇲', popular: false },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', flag: '🇧🇭', popular: false },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬', popular: false },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', popular: false },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳', popular: false }
];

export const POPULAR_PAIRS = [
  { base: 'USD', target: 'PKR', label: 'USD / PKR' },
  { base: 'EUR', target: 'USD', label: 'EUR / USD' },
  { base: 'GBP', target: 'USD', label: 'GBP / USD' },
  { base: 'USD', target: 'AED', label: 'USD / AED' },
  { base: 'USD', target: 'SAR', label: 'USD / SAR' },
  { base: 'USD', target: 'INR', label: 'USD / INR' },
  { base: 'USD', target: 'CAD', label: 'USD / CAD' },
  { base: 'USD', target: 'JPY', label: 'USD / JPY' },
];

export function getCurrencyInfo(code) {
  const found = CURRENCIES.find(c => c.code === code);
  if (found) return found;
  return {
    code: code,
    name: code,
    symbol: code,
    flag: '🌐',
    popular: false
  };
}
