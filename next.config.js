/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  experimental: {
    esmExternals: true,
  },
};

module.exports = nextConfig;
