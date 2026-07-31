/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'api.dicebear.com'],
  },
  outputFileTracingRoot: require('path').join(__dirname, '../'),
};

module.exports = nextConfig;
