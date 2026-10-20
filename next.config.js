/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'www.google.com',
      's2.googleusercontent.com',
      'upload.wikimedia.org',
      'cdn.jsdelivr.net',
      'icons.duckduckgo.com',
      'financialmodelingprep.com',
      'autocomplete.clearbit.com',
      'assets.parqet.com'
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 's2.googleusercontent.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: 'icons.duckduckgo.com' },
      { protocol: 'https', hostname: 'financialmodelingprep.com' },
      { protocol: 'https', hostname: 'autocomplete.clearbit.com' },
      { protocol: 'https', hostname: 'assets.parqet.com' }
    ]
  }
};

export default nextConfig;
