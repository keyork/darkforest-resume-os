/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ['pdf-parse', '@napi-rs/canvas'],
  experimental: {
    esmExternals: true,
  },
};

module.exports = nextConfig;
