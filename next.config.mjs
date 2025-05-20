/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports
  output: 'export',
  
  // Transpile three.js and related modules
  transpilePackages: ['three', 'react-three-fiber', '@react-three/drei'],
  
  // Add any other necessary configuration
  reactStrictMode: true,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    unoptimized: true,
  },

  // Optimize for production
  poweredByHeader: false,

  // Set base path for GitHub Pages
  basePath: '/FatigueDesigner',
};

export default nextConfig;
