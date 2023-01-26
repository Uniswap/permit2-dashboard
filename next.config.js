/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['https:/token-icons.s3.amazonaws.com'],
  },
  swcMinify: false,
}

module.exports = nextConfig
