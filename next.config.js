// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // The `experimental.serverExternalPackages` option is no longer needed in Next.js 15
  // as the handling of external packages has been improved
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