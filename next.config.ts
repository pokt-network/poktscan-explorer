import type { NextConfig } from "next";
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  productionBrowserSourceMaps: true, // Enable source maps for debugging
  /* config options here */
  typescript: {
    // JUST TEMPORARY BECAUSE OF ERRORS FROM THE GRAPHQL CODEGEN DUE TO HOW SUBQUERY GENERATES THE SCHEMA
    // TODO: FIX ASAP
    ignoreBuildErrors: true
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack: (config: NextConfig) => {
    config.module.rules.push(
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      }
    )
    return config
  },
};

export default nextConfig;
