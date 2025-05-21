/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile three.js and related modules
  transpilePackages: ['three', 'react-three-fiber', '@react-three/drei'],
  
  // Add any other necessary configuration
  reactStrictMode: true,
  
  // Disable server components for this app since it relies heavily on client-side libraries
  experimental: {
    appDir: true,
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
};

export default nextConfig;
