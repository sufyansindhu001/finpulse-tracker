import React, { useState } from 'react';
import { getOptimizedImageUrl, getOptimizedSrcSet } from '../utils/imageOptimizer';

/**
 * Next.js-grade Optimized Image Component for Vite/React SPA.
 * Automatically transforms Unsplash & external images into modern WebP format,
 * handles responsive sizing, lazy loading, async decoding, and prevents Cumulative Layout Shift (CLS).
 */
export default function OptimizedImage({
  src,
  alt = '',
  width = 600,
  height,
  quality = 75,
  priority = false,
  className = '',
  style = {},
  fallbackSrc,
  onError,
  sizes,
  ...rest
}) {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(() => 
    getOptimizedImageUrl(src, { width, height, quality, format: 'webp' })
  );

  // Re-sync if src changes
  React.useEffect(() => {
    setHasError(false);
    setCurrentSrc(getOptimizedImageUrl(src, { width, height, quality, format: 'webp' }));
  }, [src, width, height, quality]);

  const handleError = (e) => {
    if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
    if (typeof onError === 'function') {
      onError(e);
    }
  };

  const srcSet = !hasError && src && src.includes('images.unsplash.com')
    ? getOptimizedSrcSet(src, [Math.round(width * 0.75), width, Math.round(width * 1.5)], { quality })
    : undefined;

  return (
    <img
      src={currentSrc}
      srcSet={srcSet}
      sizes={sizes || (width ? `(max-width: 768px) 100vw, ${width}px` : undefined)}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onError={handleError}
      className={className}
      style={{
        ...style,
        ...(height && width ? { aspectRatio: `${width} / ${height}` } : {})
      }}
      {...rest}
    />
  );
}

// Export both default and named Image for drop-in next/image compatibility
export { OptimizedImage, OptimizedImage as Image };
