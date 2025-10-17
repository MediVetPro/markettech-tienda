/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  output: 'export',
  trailingSlash: true,
  distDir: 'dist',
  basePath: process.env.NODE_ENV === 'production' ? '/markettech-tienda' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/markettech-tienda' : ''
}

module.exports = nextConfig
