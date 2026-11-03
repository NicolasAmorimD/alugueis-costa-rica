import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'http', hostname: 'localhost', port: '3000' },
      { protocol: 'http', hostname: 'localhost', port: '3001' },
    ],
  },
}

export default nextConfig
