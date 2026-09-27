import React, { useState } from 'react';
import { getCurrencyFlagUrl } from '../utils/currencyFlags';

/**
 * Universal Currency Flag Component
 * Renders FlagCDN high-res national flags with automatic country mapping.
 * Gracefully falls back to a clean stylized letter badge on rare error or missing flag.
 */
export default function CurrencyFlag({ 
  code, 
  className = "w-5 h-5", 
  alt = "" 
}) {
  const [hasError, setHasError] = useState(false);
  const flagUrl = getCurrencyFlagUrl(code);

  if (!flagUrl || hasError) {
    return (
      <span 
        className={`${className} rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 select-none shadow-xs`}
        title={code}
      >
        {(code || '').slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <img 
      src={flagUrl} 
      alt={alt || `${code} flag`} 
      className={`${className} rounded-full object-cover shrink-0 border border-slate-200 dark:border-white/10 shadow-xs`}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}
