/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove eslint configuration from here
  typescript: {
    ignoreBuildErrors: false, // Set to true only if needed
  },
  images: {
    domains: ['img.clerk.com', 'images.clerk.dev'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@clerk/nextjs'],
  },
}

module.exports = nextConfig
