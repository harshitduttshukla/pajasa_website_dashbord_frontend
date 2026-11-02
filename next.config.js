/** @type {import('next').NextConfig} */
const cfDomain = (process.env.CLOUDFRONT_DOMAIN || process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || '').replace(/^https?:\/\//, '').split('/')[0].trim();

const remotePatterns = [
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '8000',
    pathname: '/uploads/**',
  },
  {
    protocol: 'http',
    hostname: '127.0.0.1',
    port: '8000',
    pathname: '/uploads/**',
  },
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '8001',
    pathname: '/uploads/**',
  },
  {
    protocol: 'http',
    hostname: '127.0.0.1',
    port: '8001',
    pathname: '/uploads/**',
  },
  {
    protocol: 'https',
    hostname: '*.cloudfront.net',
  },
  {
    protocol: 'https',
    hostname: 'www.pajasaapartments.com',
  },
  {
    protocol: 'https',
    hostname: 'pajasaapartments.com',
  },
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
];

if (cfDomain && !remotePatterns.some(p => p.hostname === cfDomain)) {
  remotePatterns.push({
    protocol: 'https',
    hostname: cfDomain,
  });
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
    unoptimized: true,
  },
};

module.exports = nextConfig;
