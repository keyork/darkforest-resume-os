/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ['pdf-parse'],
  experimental: {
    esmExternals: true,
  },
};

module.exports = nextConfig;
