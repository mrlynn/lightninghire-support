// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during production build
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  output: "export",  // Enable static exports
  images: {
    unoptimized: true,  // Required for static exports
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Add basePath for GitHub Pages
  basePath: '',
  // Disable trailing slashes to match GitHub Pages behavior
  trailingSlash: false,
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