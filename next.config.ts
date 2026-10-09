import type { NextConfig } from 'next'

const convexUrl = new URL(
  process.env.NEXT_PUBLIC_CONVEX_URL ?? 'https://api.klimat22.com',
)

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: convexUrl.protocol.slice(0, -1) as 'http' | 'https',
        hostname: convexUrl.hostname,
        port: convexUrl.port,
        pathname: '/api/storage/**',
      },
    ],
  },
}

export default nextConfig
