import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
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
