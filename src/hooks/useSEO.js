import { useEffect } from 'react';
import { updateSEO, updateCanonical } from '../utils/seo';

/**
 * React hook to synchronize document title, description, canonical link tag, and OpenGraph metadata
 */
export function useSEO({ title, description, canonical, ogType, ogImage, robots } = {}) {
  useEffect(() => {
    try {
      updateSEO({ title, description, canonical, ogType, ogImage, robots });
    } catch (e) {
      console.warn('[useSEO] Hook warning:', e);
    }
  }, [title, description, canonical, ogType, ogImage, robots]);
}


export function useCanonical(pathOrUrl) {
  useEffect(() => {
    if (pathOrUrl) {
      updateCanonical(pathOrUrl);
    }
  }, [pathOrUrl]);
}

export default useSEO;
