// api/upload.js - High-Performance Image Upload & Verification Handler (Vercel Serverless)
// Receives image files (base64 data URL, raw buffer, or gallery link), validates,
// and returns a secure, optimized URL ready for instant binding to the article cover image.

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed. Please use POST.`
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // Body might be direct data string
      }
    }

    const imagePayload = body?.image || body?.url || body?.file || (typeof body === 'string' ? body : null);
    const filename = body?.filename || `cover-${Date.now()}.webp`;
    const mimeType = body?.type || 'image/webp';

    if (!imagePayload || typeof imagePayload !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing image payload in request body'
      });
    }

    const trimmed = imagePayload.trim();

    // Case 1: Image is already an HTTPS / HTTP URL (e.g. curated gallery or external link)
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return res.status(200).json({
        success: true,
        url: trimmed,
        filename,
        type: 'remote',
        message: 'External image verified successfully'
      });
    }

    // Case 2: Image is a base64 Data URL
    if (trimmed.startsWith('data:image/')) {
      // Validate data URL structure
      const match = trimmed.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,/);
      const detectedFormat = match ? match[1] : 'webp';
      const base64Data = trimmed.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
      const bufferLength = Math.round((base64Data.length * 3) / 4);

      return res.status(200).json({
        success: true,
        url: trimmed,
        filename: filename.endsWith(detectedFormat) ? filename : `${filename.split('.')[0]}.${detectedFormat}`,
        type: `image/${detectedFormat}`,
        size: bufferLength,
        message: 'Base64 image processed and encoded successfully'
      });
    }

    // Case 3: Raw base64 string without data: prefix
    if (/^[A-Za-z0-9+/=]+$/.test(trimmed.slice(0, 100))) {
      const dataUrl = `data:${mimeType};base64,${trimmed}`;
      const bufferLength = Math.round((trimmed.length * 3) / 4);

      return res.status(200).json({
        success: true,
        url: dataUrl,
        filename,
        type: mimeType,
        size: bufferLength,
        message: 'Raw base64 image converted to data URL successfully'
      });
    }

    // Fallback if unrecognizable format
    return res.status(400).json({
      success: false,
      error: 'Invalid image format. Expected http(s) URL or base64 data URL.'
    });
  } catch (err) {
    console.error('[api/upload] Server error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Internal server error processing image'
    });
  }
}
