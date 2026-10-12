import { useEffect } from 'react';
import { updateSEO, updateCanonical } from '../utils/seo';

/**
 * React hook to synchronize document title, description, canonical link tag, and OpenGraph metadata
 */
export function useSEO({ title, description, canonical, ogType, ogImage } = {}) {
  useEffect(() => {
    updateSEO({ title, description, canonical, ogType, ogImage });
  }, [title, description, canonical, ogType, ogImage]);
}

export function useCanonical(pathOrUrl) {
  useEffect(() => {
    if (pathOrUrl) {
      updateCanonical(pathOrUrl);
    }
  }, [pathOrUrl]);
}

export default useSEO;
