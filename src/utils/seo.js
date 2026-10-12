export const BASE_SITE_URL = 'https://www.fgcspot.com';
export const DEFAULT_TITLE = 'FGC Spot — Live Forex, Gold & Crypto Terminals';
export const DEFAULT_DESCRIPTION = 'Institutional-grade real-time market rates, live analytics, and financial terminal tracking for Forex, Gold, and Digital Assets.';

/**
 * Normalizes any route, subpath, or URL to a clean canonical absolute URL.
 * - Root path '/' becomes 'https://www.fgcspot.com/'
 * - Subpaths like '/rates', '/blog', '/blog/my-post' become 'https://www.fgcspot.com/rates', 'https://www.fgcspot.com/blog', etc.
 * - Strips query parameters, hashes, and any trailing slashes on subpaths.
 */
export function getCanonicalUrl(pathOrUrl) {
  if (!pathOrUrl) return `${BASE_SITE_URL}/`;

  try {
    if (typeof pathOrUrl === 'string') {
      // If absolute URL
      if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
        const parsed = new URL(pathOrUrl);
        let pathname = parsed.pathname || '/';
        if (pathname !== '/' && pathname.endsWith('/')) {
          pathname = pathname.replace(/\/+$/, '');
        }
        return `${BASE_SITE_URL}${pathname}`;
      }

      // Relative path
      let cleanPath = pathOrUrl.split('?')[0].split('#')[0].trim();
      if (!cleanPath.startsWith('/')) {
        cleanPath = `/${cleanPath}`;
      }
      if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
        cleanPath = cleanPath.replace(/\/+$/, '');
      }
      return `${BASE_SITE_URL}${cleanPath}`;
    }
    return `${BASE_SITE_URL}/`;
  } catch {
    return `${BASE_SITE_URL}/`;
  }
}

/**
 * Updates or creates the <link rel="canonical"> element in the document <head>,
 * and synchronizes open graph & twitter URL metadata.
 */
export function updateCanonical(pathOrUrl) {
  if (typeof document === 'undefined') return '';

  const canonicalUrl = getCanonicalUrl(pathOrUrl);

  // 1. <link rel="canonical">
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);

  // 2. <meta property="og:url">
  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  ogUrl.setAttribute('content', canonicalUrl);

  // 3. <meta property="twitter:url">
  let twitterUrl = document.querySelector('meta[property="twitter:url"]');
  if (!twitterUrl) {
    twitterUrl = document.createElement('meta');
    twitterUrl.setAttribute('property', 'twitter:url');
    document.head.appendChild(twitterUrl);
  }
  twitterUrl.setAttribute('content', canonicalUrl);

  return canonicalUrl;
}

/**
 * Updates dynamic SEO meta tags (title, description, canonical, OpenGraph, Twitter).
 */
export function updateSEO({ title, description, canonical, ogType = 'website', ogImage } = {}) {
  if (typeof document === 'undefined') return;

  // Title
  if (title) {
    document.title = title;

    let metaTitle = document.querySelector('meta[name="title"]');
    if (metaTitle) metaTitle.setAttribute('content', title);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    let twTitle = document.querySelector('meta[property="twitter:title"]');
    if (!twTitle) {
      twTitle = document.createElement('meta');
      twTitle.setAttribute('property', 'twitter:title');
      document.head.appendChild(twTitle);
    }
    twTitle.setAttribute('content', title);
  }

  // Description
  if (description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);

    let twDesc = document.querySelector('meta[property="twitter:description"]');
    if (!twDesc) {
      twDesc = document.createElement('meta');
      twDesc.setAttribute('property', 'twitter:description');
      document.head.appendChild(twDesc);
    }
    twDesc.setAttribute('content', description);
  }

  // Canonical URL
  if (canonical) {
    updateCanonical(canonical);
  }

  // OG Type
  if (ogType) {
    let ogTypeMeta = document.querySelector('meta[property="og:type"]');
    if (!ogTypeMeta) {
      ogTypeMeta = document.createElement('meta');
      ogTypeMeta.setAttribute('property', 'og:type');
      document.head.appendChild(ogTypeMeta);
    }
    ogTypeMeta.setAttribute('content', ogType);
  }

  // OG Image
  if (ogImage) {
    let ogImgMeta = document.querySelector('meta[property="og:image"]');
    if (!ogImgMeta) {
      ogImgMeta = document.createElement('meta');
      ogImgMeta.setAttribute('property', 'og:image');
      document.head.appendChild(ogImgMeta);
    }
    ogImgMeta.setAttribute('content', ogImage);

    let twImgMeta = document.querySelector('meta[property="twitter:image"]');
    if (!twImgMeta) {
      twImgMeta = document.createElement('meta');
      twImgMeta.setAttribute('property', 'twitter:image');
      document.head.appendChild(twImgMeta);
    }
    twImgMeta.setAttribute('content', ogImage);
  }
}
