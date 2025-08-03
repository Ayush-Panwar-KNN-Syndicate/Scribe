import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds for deployment
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Disable problematic optimizations that cause manifest issues
    webpackBuildWorker: false,
  },
  webpack: (config, { isServer, dev }) => {
    // Disable webpack build worker optimization to fix manifest file issues
    config.parallelism = 1;
    
    // Additional configuration for build stability
    if (!dev && isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
