// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during production build
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config) => {
    // This is needed for working with MongoDB
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    }
    return config
  },
};

module.exports = nextConfig;