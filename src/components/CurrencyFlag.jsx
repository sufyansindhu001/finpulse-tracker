import React from 'react';
import { getCurrencyFlagUrls } from '../utils/currencyFlags';
import FlagImage from './FlagImage';

/**
 * Universal Currency Flag Component
 * Renders FlagCDN high-res national flags with automatic country mapping.
 * Gracefully falls back to a clean stylized letter badge on rare error or missing flag.
 */
export default function CurrencyFlag({ 
  code, 
  className = "w-5 h-5", 
  alt = "",
  shape = 'circle',
}) {
  const flagUrls = getCurrencyFlagUrls(code);

  const codeUpper = (code || '').toUpperCase();

  if (codeUpper === 'XAU') {
    return (
      <span 
        className={`${className} rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-slate-950 text-[9px] font-black flex items-center justify-center shrink-0 border border-amber-300 shadow-xs select-none`}
        title="Gold Spot (XAU)"
      >
        AU
      </span>
    );
  }

  if (codeUpper === 'XAG') {
    return (
      <span 
        className={`${className} rounded-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-950 text-[9px] font-black flex items-center justify-center shrink-0 border border-slate-300 shadow-xs select-none`}
        title="Silver Spot (XAG)"
      >
        AG
      </span>
    );
  }

  return (
    <FlagImage
      urls={flagUrls}
      alt={alt || `${code} currency flag`}
      fallbackLabel={code || ''}
      className={className}
      roundedClassName={shape === 'rect' ? 'rounded-sm' : 'rounded-full'}
    />
  );
}
