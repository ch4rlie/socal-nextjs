/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.socalprerunner.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'lsiyvdtbwluyrbwciayc.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'lsiyvdtbwluyrbwciayc.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'files.cdn.printful.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'files.printful.com',
        pathname: '/**',
      }
    ],
  },
}

module.exports = nextConfig
