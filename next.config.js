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
    domains: ['api.thegpdn.org', '1000wordphilosophy.com'],
  },
}

module.exports = nextConfig
