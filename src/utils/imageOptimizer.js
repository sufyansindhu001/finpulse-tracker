/**
 * Image Optimization Utility for FGC Spot
 * Converts Unsplash and dynamic image sources to modern WebP format with responsive sizing,
 * preventing Cumulative Layout Shift (CLS) and reducing payload size by up to 90%.
 */

/**
 * Optimizes an image URL (particularly Unsplash URLs) to WebP format with exact dimensions and compression.
 * @param {string} url - Source image URL
 * @param {Object} options - Optimization options
 * @param {number} [options.width=600] - Target render width in pixels
 * @param {number} [options.height] - Optional target height in pixels
 * @param {number} [options.quality=75] - WebP compression quality (default 75)
 * @param {string} [options.format='webp'] - Target image format ('webp' | 'avif' | 'auto')
 * @returns {string} - Optimized URL
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url || typeof url !== 'string') return '';

  // Leave data URLs, SVGs, and blob URLs untouched
  if (url.startsWith('data:') || url.startsWith('blob:') || url.endsWith('.svg')) {
    return url;
  }

  const {
    width = 600,
    height,
    quality = 75,
    format = 'webp',
    fit = 'crop'
  } = options;

  try {
    // Unsplash dynamic image optimization
    if (url.includes('images.unsplash.com')) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', fit);
      urlObj.searchParams.set('fm', format);
      urlObj.searchParams.set('q', String(quality));
      urlObj.searchParams.set('w', String(width));
      if (height) {
        urlObj.searchParams.set('h', String(height));
      }
      return urlObj.toString();
    }

    // Pexels dynamic image optimization
    if (url.includes('images.pexels.com')) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'compress');
      urlObj.searchParams.set('cs', 'tinysrgb');
      urlObj.searchParams.set('w', String(width));
      if (height) {
        urlObj.searchParams.set('h', String(height));
      }
      return urlObj.toString();
    }

    // Cloudinary dynamic optimization
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
      const parts = url.split('/upload/');
      const transform = `f_${format},q_${quality},w_${width},c_${fit}`;
      return `${parts[0]}/upload/${transform}/${parts[1]}`;
    }
  } catch {
    // If URL parsing fails, return original
    return url;
  }

  return url;
}

/**
 * Generates a responsive srcset string with WebP formatting for high-DPI displays.
 * @param {string} url - Source image URL
 * @param {number[]} widths - List of widths (e.g. [400, 800, 1200])
 * @param {Object} options - Options
 * @returns {string} - srcset string
 */
export function getOptimizedSrcSet(url, widths = [400, 800, 1200], options = {}) {
  if (!url || typeof url !== 'string' || !url.includes('images.unsplash.com')) {
    return '';
  }

  return widths
    .map(w => `${getOptimizedImageUrl(url, { ...options, width: w })} ${w}w`)
    .join(', ');
}
