/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile three.js and related modules
  transpilePackages: ['three', 'react-three-fiber', '@react-three/drei'],
  
  // Add any other necessary configuration
  reactStrictMode: true,
  
  // Remove deprecated appDir option
  experimental: {
    // Add any other experimental features if needed
  },
  
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
  swcMinify: true,
  poweredByHeader: false,
};

export default nextConfig;
