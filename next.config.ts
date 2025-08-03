import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds for deployment
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Disable webpack build worker optimization to fix manifest file issues
    config.parallelism = 1;
    return config;
  },
};

export default nextConfig;
