/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.thegpdn.org/api/:path*',
      },
    ];
  },
  images: {
    domains: ['api.thegpdn.org', '1000wordphilosophy.com', 'pub-33c4155a02fd4f2aae817c77076bde04.r2.dev'],
  },
}

module.exports = nextConfig
