/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'pdfjs-dist'],
    serverActions: {
      bodySizeLimit: '16mb'
    }
  }
}

module.exports = nextConfig
