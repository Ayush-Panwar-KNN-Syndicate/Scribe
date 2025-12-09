import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Enable gzip compression for better performance
  compress: true,
  
  eslint: {
    // Disable ESLint during builds for deployment
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Disable problematic optimizations that cause manifest issues
    webpackBuildWorker: false,
  },
  webpack: (config, { isServer, dev }) => {
    // Exclude searchtermux-search-worker from Next.js build
    config.module.rules.forEach((rule: any) => {
      if (rule.test && rule.test.toString().includes('tsx?')) {
        rule.exclude = [
          ...(Array.isArray(rule.exclude) ? rule.exclude : rule.exclude ? [rule.exclude] : []),
          path.resolve(__dirname, 'tools/searchtermux-search-worker')
        ];
      }
    });

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
