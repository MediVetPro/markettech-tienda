/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración optimizada para Netlify
  images: {
    domains: ['localhost', 'netlify.app', 'smartesh.netlify.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Optimizaciones para Netlify
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configuración de headers para APIs
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
  // Optimizaciones para desarrollo más rápido
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
