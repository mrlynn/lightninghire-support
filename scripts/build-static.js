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
      
      // Backup files that need modification
      const backups = {};
      
      // List of files with import references to API routes
      const filesToFix = findFilesWithApiImports(path.join(process.cwd(), 'src'));
      console.log(`Found ${filesToFix.length} files with API route imports to fix`);
      
      // Fix imports in files
      for (const file of filesToFix) {
        backups[file] = fs.readFileSync(file, 'utf8');
        fixImportsInFile(file);
      }
      
      // Create a backup of the API directory if it exists
      const apiDir = path.join(process.cwd(), 'src/app/api');
      const tempApiDir = path.join(process.cwd(), 'src/app/api-temp');
      let apiDirExists = false;
      
      if (fs.existsSync(apiDir)) {
        apiDirExists = true;
        // Move the API directory to a temporary location
        fs.renameSync(apiDir, tempApiDir);
      }
      
      // Get all dynamic route directories
      const dynamicRoutes = findDynamicRoutes(path.join(process.cwd(), 'src/app'));
      
      // Create static params files for dynamic routes
      const createdFiles = createStaticParamsFiles(dynamicRoutes);
      
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
        // Clean up created static params files
        cleanupCreatedFiles(createdFiles);
        
        // Restore files with fixed imports
        for (const [file, content] of Object.entries(backups)) {
          fs.writeFileSync(file, content);
          console.log(`Restored: ${file}`);
        }
        
        // Restore the original API directory
        if (apiDirExists && fs.existsSync(tempApiDir)) {
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

// Function to find files with imports from API routes
function findFilesWithApiImports(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      findFilesWithApiImports(fullPath, fileList);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if file has imports from API routes
      if (content.includes('@/app/api/') || content.includes("'@/app/api/") || content.includes('"@/app/api/')) {
        fileList.push(fullPath);
      }
    }
  }
  
  return fileList;
}

// Function to fix imports in a file (mock the API imports)
function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Replace imports from API routes with mock implementations
  const newContent = content
    .replace(/import\s+.*\s+from\s+['"]@\/app\/api\/.*['"]/g, '// API import removed for static build')
    .replace(/import\s*{\s*.*\s*}\s*from\s+['"]@\/app\/api\/.*['"]/g, '// API import removed for static build');
  
  fs.writeFileSync(filePath, newContent);
  console.log(`Fixed imports in file: ${filePath}`);
}

// Function to find dynamic route directories (containing [param])
function findDynamicRoutes(dir) {
  const dynamicRoutes = [];
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (entry.name.includes('[') && entry.name.includes(']')) {
        // This is a dynamic route directory
        dynamicRoutes.push(fullPath);
      }
      
      // Skip the API directory if it exists
      if (entry.name === 'api') {
        continue;
      }
      
      // Recursively search in subdirectories
      dynamicRoutes.push(...findDynamicRoutes(fullPath));
    }
  }
  
  return dynamicRoutes;
}

// Function to create static params files for dynamic routes
function createStaticParamsFiles(routes) {
  const createdFiles = [];
  
  for (const routeDir of routes) {
    const pageFile = path.join(routeDir, 'page.js');
    const isClientComponent = fs.existsSync(pageFile) && 
      fs.readFileSync(pageFile, 'utf8').includes('use client');
    
    if (isClientComponent) {
      console.log(`Skipping client component: ${routeDir}`);
      continue;
    }
    
    const staticParamsPath = path.join(routeDir, 'generateStaticParams.js');
    
    // Skip if file already exists
    if (fs.existsSync(staticParamsPath)) {
      console.log(`Static params file already exists: ${staticParamsPath}`);
      continue;
    }
    
    // Extract the parameter name from the directory name
    const dirName = path.basename(routeDir);
    const paramMatch = dirName.match(/\[(.*?)\]/);
    const paramName = paramMatch ? paramMatch[1] : 'id';
    
    // Check if it's a catch-all route ([...param])
    const isCatchAll = dirName.includes('[...');
    
    // Create appropriate static params content
    let staticParamsContent;
    
    if (isCatchAll) {
      staticParamsContent = `export function generateStaticParams() {
  return [{ ${paramName}: ['placeholder'] }];
}`;
    } else {
      staticParamsContent = `export function generateStaticParams() {
  return [{ ${paramName}: 'placeholder' }];
}`;
    }
    
    // Write the file
    fs.writeFileSync(staticParamsPath, staticParamsContent);
    createdFiles.push(staticParamsPath);
    
    console.log(`Created static params file: ${staticParamsPath}`);
  }
  
  return createdFiles;
}

// Function to clean up created files
function cleanupCreatedFiles(files) {
  for (const file of files) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`Deleted: ${file}`);
    }
  }
}

// Run the build
buildStatic(); 