/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  output: 'export',
  trailingSlash: true,
  distDir: 'dist'
}

module.exports = nextConfig
