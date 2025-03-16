const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Main function
async function buildStatic() {
  try {
    // Save original next.config.js
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    const originalConfig = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Create a temporary next.config.js for static export
    const staticConfig = `
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during production build
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
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
  // Exclude API routes from static export
  distDir: '.next-static',
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
    `;
    
    try {
      // Write the temporary config
      fs.writeFileSync(nextConfigPath, staticConfig);
      
      // Create a temporary src/app/api directory to exclude API routes
      const apiDir = path.join(process.cwd(), 'src/app/api');
      const tempApiDir = path.join(process.cwd(), 'src/app/api-temp');
      
      if (fs.existsSync(apiDir)) {
        // Rename the api directory to temporarily exclude it
        fs.renameSync(apiDir, tempApiDir);
      }
      
      try {
        // Run the Next.js build
        console.log('Running Next.js build for static export...');
        execSync('next build', { stdio: 'inherit' });
        
        // Create CNAME file
        console.log('Creating CNAME file...');
        fs.writeFileSync('out/CNAME', 'support.lightninghire.com');
        
        // Create .nojekyll file
        console.log('Creating .nojekyll file...');
        fs.writeFileSync('out/.nojekyll', '');
        
        console.log('Static build completed successfully!');
      } finally {
        // Restore the api directory
        if (fs.existsSync(tempApiDir)) {
          if (fs.existsSync(apiDir)) {
            fs.rmSync(apiDir, { recursive: true, force: true });
          }
          fs.renameSync(tempApiDir, apiDir);
        }
      }
    } finally {
      // Restore the original next.config.js
      fs.writeFileSync(nextConfigPath, originalConfig);
    }
  } catch (error) {
    console.error('Error during static build:', error);
    process.exit(1);
  }
}

// Run the build
buildStatic(); 