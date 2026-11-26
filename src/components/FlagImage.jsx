import React, { useState } from 'react';

/** Retries independent flag image sources before showing a readable code badge. */
export default function FlagImage({
  urls = [],
  alt = '',
  fallbackLabel = '',
  className = 'w-5 h-4',
  roundedClassName = 'rounded-sm',
}) {
  const [failure, setFailure] = useState({ key: '', next: 0 });
  const key = urls.join('|');
  const attempt = failure.key === key ? failure.next : 0;

  if (!urls.length || attempt >= urls.length) {
    return (
      <span
        role="img"
        aria-label={alt || fallbackLabel}
        title={alt || fallbackLabel}
        className={`${className} ${roundedClassName} inline-flex shrink-0 items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-200 dark:bg-slate-800 text-[9px] font-black text-slate-700 dark:text-slate-300 select-none shadow-xs`}
      >
        {fallbackLabel.toUpperCase().slice(0, 3)}
      </span>
    );
  }

  return (
    <img
      key={`${key}:${attempt}`}
      src={urls[attempt]}
      alt={alt}
      title={alt}
      decoding="async"
      loading="lazy"
      className={`${className} ${roundedClassName} object-cover shrink-0 border border-slate-200 dark:border-white/10 shadow-xs`}
      onError={() => setFailure({ key, next: attempt + 1 })}
    />
  );
}
