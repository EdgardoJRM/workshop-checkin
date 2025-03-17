/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  // Optimizaciones adicionales
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@aws-sdk/*', 'next-auth'],
  },
}

module.exports = nextConfig 