import { lazy } from 'react';

/**
 * Bulletproof dynamic import wrapper for React.lazy.
 * Automatically recovers from stale chunk errors during production deployments
 * (e.g. "Failed to fetch dynamically imported module: ChartsPage-*.js")
 * by refreshing the application shell with the latest deployed build assets.
 */
export function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const sessionKey = 'fgc_chunk_reload_lock';
    try {
      const module = await componentImport();
      try {
        sessionStorage.removeItem(sessionKey);
      } catch {}
      return module;
    } catch (error) {
      console.warn('[lazyWithRetry] Dynamic chunk import failed:', error?.message);

      const isChunkError =
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('error loading dynamically imported module') ||
        error?.message?.includes('Loading chunk') ||
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('MIME type') ||
        error?.message?.includes('syntax error');

      let hasReloaded = false;
      try {
        hasReloaded = sessionStorage.getItem(sessionKey) === 'true';
      } catch {}

      if (isChunkError && !hasReloaded && typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(sessionKey, 'true');
        } catch {}

        // Immediate reload to fetch the latest deployment HTML and matching chunk hashes
        const url = new URL(window.location.href);
        url.searchParams.set('_v', Date.now().toString());
        window.location.replace(url.toString());
        return new Promise(() => {}); // Suspend cleanly while browser redirects
      }

      // If reload already attempted or non-chunk error, bubble up to GlobalErrorBoundary
      throw error;
    }
  });
}

export default lazyWithRetry;
