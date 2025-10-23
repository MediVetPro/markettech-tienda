/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'vercel.app', 'markettech.vercel.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  // Optimizaciones para desarrollo más rápido
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configuración optimizada para WebSocket HMR
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 500, // Reducido de 1000 a 500ms
        aggregateTimeout: 200, // Reducido de 300 a 200ms
        ignored: ['**/node_modules/**', '**/.git/**', '**/prisma/dev.db*']
      }
    }
    return config
  }
}

module.exports = nextConfig
