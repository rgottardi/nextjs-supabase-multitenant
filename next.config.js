/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      process.env.NEXT_PUBLIC_ROOT_DOMAIN,
    ],
  },
  experimental: {
    serverActions: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite everything to `/_sites/[site]` internally
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: `(?!(?:www).)(.+).${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`,
            },
          ],
          destination: '/_sites/:1/:path*',
        },
        // Don't rewrite API routes
        {
          source: '/api/:path*',
          destination: '/api/:path*',
        },
      ],
    }
  },
}

module.exports = nextConfig