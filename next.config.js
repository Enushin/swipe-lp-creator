/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Cloudflare Pages
  output: "export",

  // Images configuration for static export
  images: {
    unoptimized: true,
  },

  // Strict mode for React
  reactStrictMode: true,

  // TypeScript errors should fail the build
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint errors should fail the build
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
